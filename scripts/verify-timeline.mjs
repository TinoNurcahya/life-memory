// Browser acceptance against an isolated Chromium instance on port 9333.
// TIMELINE_AUDIT_URL defaults to http://localhost:3000. --production skips
// temporary fixture routes; --fixtures-only skips the production page matrix.
// All POST requests are intercepted before the network; no backend is mutated.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.TIMELINE_AUDIT_URL || "http://localhost:3000";
const debug = process.env.TIMELINE_AUDIT_CDP || "http://127.0.0.1:9333";
const production = process.argv.includes("--production");
const fixturesOnly = process.argv.includes("--fixtures-only");
const fixtureState = process.argv.find(argument => argument.startsWith("--fixture-state="))?.split("=")[1];
assert.ok(!(production && fixturesOnly), "Choose either --production or --fixtures-only");
assert.ok(!fixtureState || fixturesOnly, "--fixture-state requires --fixtures-only");
const reportDir = path.join(root, "reports", "timeline");
const fixtureDir = path.join(root, "app", "timeline", "audit-preview");
const results = [];
const errors = [];
const relatedErrors = [];
const intercepted = [];
const lastClicks = [];
let failureDiagnostics = null;
let routeScope = "timeline";
let completed = false;
let failure = null;
let fixtureCreated = false;
let target;
let ws;
let serial = 0;
let mockResponse = null;
const pending = new Map();
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const record = (name, details = true) => { results.push({ name, details }); console.log("PASS", name, JSON.stringify(details)); };
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++serial;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error("CDP timeout: " + method)); }, method === "Page.navigate" ? 60000 : 20000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression, description, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await pause(100);
  }
  throw new Error("Timed out: " + description);
}
async function navigate(route, selector = ".timeline-page") {
  routeScope = route.startsWith("/timeline") ? "timeline" : route;
  await send("Page.navigate", { url: base + route });
  await until(`document.readyState === "complete" && !!document.querySelector(${JSON.stringify(selector)})`, route);
  await evaluate("document.fonts.ready.then(() => true)");
  await pause(400);
}
async function viewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  await evaluate('document.querySelector(".overflow-y-auto.overscroll-y-contain")?.scrollTo(0,0)');
  await pause(180);
}
async function click(selector) {
  const point = await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) throw new Error("Missing target: " + ${JSON.stringify(selector)}); e.scrollIntoView({block:"center"}); const r=e.getBoundingClientRect(); const x=r.x+r.width/2,y=r.y+r.height/2; const hit=document.elementFromPoint(x,y); return {x,y,disabled:!!e.disabled,hit:hit?.outerHTML.slice(0,500),reachesTarget:!!hit&&(e===hit||e.contains(hit))}; })()`);
  lastClicks.push({selector,...point});
  if(lastClicks.length>8) lastClicks.shift();
  assert.equal(point.reachesTarget,true,"Pointer target obscured: "+JSON.stringify(lastClicks.at(-1)));
  assert.equal(point.disabled,false,"Pointer target disabled: "+selector);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
}
async function clickText(selector, text) {
  const id = "audit-click-" + (++serial);
  await evaluate(`(() => { const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.textContent.trim()===${JSON.stringify(text)}); if (!e) throw new Error("Missing text: " + ${JSON.stringify(text)}); e.setAttribute("data-audit-click",${JSON.stringify(id)}); })()`);
  await click(`[data-audit-click="${id}"]`);
}
async function key(key, code, modifiers = 0, windowsVirtualKeyCode) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, modifiers, windowsVirtualKeyCode });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, modifiers, windowsVirtualKeyCode });
}
async function setValue(selector, value) {
  await evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if (!e) throw new Error("Missing input"); const p=e.tagName==="SELECT"?HTMLSelectElement.prototype:e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(p,"value").set.call(e,${JSON.stringify(value)}); e.dispatchEvent(new Event("input",{bubbles:true})); e.dispatchEvent(new Event("change",{bubbles:true})); })()`);
  await pause(160);
}
async function screenshot(name) {
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await fs.writeFile(path.join(reportDir, name + ".png"), Buffer.from(shot.data, "base64"));
}
async function theme(dark) {
  const current = await evaluate('document.documentElement.classList.contains("dark")');
  if (current !== dark) {
    await click('header button[aria-label="Switch to ' + (dark ? "dark" : "light") + ' mode"]');
    await until('document.documentElement.classList.contains("dark") === ' + dark, "theme toggle");
    await pause(800);
  }
}
async function interceptRequest(params) {
  const { requestId, request } = params;
  if (request.method !== "POST") {
    try {
      return await send("Fetch.continueRequest", { requestId });
    } catch (error) {
      // A navigation may cancel a paused GET before Chromium accepts continue.
      // Ignore only that exact stale-id response; never suppress POST failures.
      let protocolError;
      try { protocolError = JSON.parse(error.message); } catch { /* Preserve other failures below. */ }
      if (request.method === "GET" && protocolError?.code === -32602 && protocolError.message === "Invalid InterceptionId.") return;
      throw error;
    }
  }
  const isAction = Object.keys(request.headers).some(name => name.toLowerCase() === "next-action");
  const isExtract = new URL(request.url).pathname === "/api/extract";
  const response = mockResponse || { success: false, error: "Audit blocked an unexpected write.", code: "AUDIT_BLOCKED" };
  intercepted.push({ path: new URL(request.url).pathname, kind: isAction ? "server-action" : isExtract ? "extraction" : "other", response });
  if (!mockResponse) errors.push("Unexpected POST blocked: " + new URL(request.url).pathname);
  // This minimal RSC payload matches the installed Next action reducer: result a,
  // empty flight patch f. No build id means no deployment mismatch handling.
  const body = isAction ? '0:{"a":"$@1","f":""}\n1:' + JSON.stringify(response) + "\n" : JSON.stringify(response);
  await pause(650); // Make pending feedback observable without reaching a backend.
  return send("Fetch.fulfillRequest", { requestId, responseCode: isExtract && !response.success ? 500 : 200,
    responseHeaders: [{ name: "content-type", value: isAction ? "text/x-component" : "application/json" }], body: Buffer.from(body).toString("base64") });
}
async function entryCount() { return evaluate('document.querySelectorAll(".timeline-entry").length'); }
async function clearFilters() {
  await setValue('.timeline-search input', "");
  await setValue('.timeline-category select', "all");
}
async function assertNoOverflow() {
  assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth || document.querySelector(".timeline-page").scrollWidth>document.querySelector(".timeline-page").clientWidth'), false);
}
async function assertControls() {
  const undersized = await evaluate(`(() => [...document.querySelectorAll('.timeline-page a,.timeline-page button,.timeline-page input,.timeline-page select')].filter(e=>e.getClientRects().length && !e.closest('[role="dialog"]')).map(e=>({label:e.getAttribute('aria-label')||e.textContent.trim(),r:e.getBoundingClientRect()})).filter(({r})=>r.width<43.5||r.height<43.5).map(({label,r})=>({label,width:r.width,height:r.height})))()`);
  assert.deepEqual(undersized, [], "Visible timeline controls must be at least 44px");
}

const fixturePage = `import Fixture from "./client";
export default async function Audit({searchParams}:{searchParams:Promise<{state?:string}>}) {
  const {state="search"}=await searchParams;
  return <Fixture state={state}/>;
}
`;
const fixtureClient = `"use client";
import {useState} from "react";
import {TimelineFeed} from "@/components/timeline/TimelineFeed";
import {VaultShell} from "@/components/layout/VaultShell";
import {JIMMY_DEMO_ITEMS} from "@/lib/demo/jimmy";
import type {TimelineItem} from "@/lib/queries/activities";
const image="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="240" height="180" fill="#8d9d8c"/><circle cx="125" cy="85" r="45" fill="#e9d7ad"/></svg>');
const template=JIMMY_DEMO_ITEMS[0];
function item(id:string,overrides:Partial<TimelineItem>={}):TimelineItem {
  return {...template,id,activityId:id,summary:"Quiet afternoon in the archive.",rawText:"A short original memory.",sourceText:null,occurredAt:"2026-10-20",category:"other",status:"RESOLVED",eventStatus:"completed",isFirstTime:false,needsReview:false,reviewReasons:[],people:[],places:[],topics:[],imageUrls:[],...overrides};
}
const entity=(id:string,name:string)=>({id,user_id:"audit",name,normalized_name:name.toLowerCase(),aliases:[],created_at:"2026-10-20",updated_at:"2026-10-20"});
function itemsFor(state:string):TimelineItem[] {
  if(state==="empty"||state==="error") return [];
  if(state==="statuses") return [
    item("audit-pending",{status:"PENDING"}),item("audit-failed",{status:"FAILED"}),
    item("audit-review",{needsReview:true,reviewReasons:["Uncertain date"]}),
    item("audit-planned",{eventStatus:"planned"}),item("audit-cancelled",{eventStatus:"cancelled"}),
    item("audit-first",{isFirstTime:true})];
  if(state==="long") return [item("audit-long",{summary:"A long account of a walk, and everything we wanted to remember about that afternoon. ".repeat(30),people:[entity("audit-long-person","A very long person's name ".repeat(7))],imageUrls:[image,image]}),item("audit-short")];
  if(state==="editor") return [item("audit-editor",{category:"career",people:[entity("audit-person","Audit Person")],places:[entity("audit-place","Audit Place")],topics:[entity("audit-topic","Audit Topic")],imageUrls:[image,image]})];
  if(state==="retry") return [item("audit-retry",{status:"FAILED"})];
  if(state==="photos") return [...Array.from({length:10},(_,index)=>item("audit-before-photo-"+index)),item("audit-photos",{imageUrls:[image,image]}),item("audit-no-photo")];
  return [
    item("audit-summary",{summary:"Silverfin appeared beside the river.",category:"career",occurredAt:"2026-10-22"}),
    item("audit-raw",{rawText:"The original text included Copperleaf.",category:"health",occurredAt:"2026-10-21"}),
    item("audit-people",{people:[entity("audit-search-person","Amberwick")],category:"social"}),
    item("audit-places",{places:[entity("audit-search-place","Birchhaven")],category:"leisure"}),
    item("audit-topics",{topics:[entity("audit-search-topic","Cedarstone")],category:"learning"}),
    item("audit-null",{category:null,occurredAt:"2026-10-19"}),
    item("audit-other",{category:"other",occurredAt:"2026-10-18"})];
}
export default function Fixture({state}:{state:string}) {
  const [items,setItems]=useState(()=>itemsFor(state));
  const error=state==="error"||state==="partial-error"?"Could not load all memories. Please try again.":null;
  return <VaultShell title="Your timeline" isDemo items={items}>
    {(state==="search"||state==="editor")&&<button data-audit-refresh style={{position:"fixed",bottom:8,right:8,zIndex:60}} onClick={event=>{
      const {auditKind,auditOperation}=event.currentTarget.dataset;
      setItems(previous=>previous.map(memory=>{
        if(memory.id==="audit-summary") return {...memory,summary:"Silverfin returned after refreshing the server props."};
        if(memory.id!=="audit-editor") return memory;
        if(auditKind==="people"||auditKind==="places"||auditKind==="topics") return {...memory,[auditKind]:auditOperation==="remove"?[]:[entity("audit-added-"+auditKind,"Added "+auditKind)]};
        return {...memory,category:"health"};
      }));
    }}>Refresh fixture props</button>}
    <main className="timeline-page"><TimelineFeed initialItems={items} demo={state!=="editor"&&state!=="retry"} error={error}/></main>
  </VaultShell>;
}
`;

try {
  await fs.mkdir(reportDir, { recursive: true });
  if (!production) {
    await fs.mkdir(fixtureDir, { recursive: false }); // Refuse to overwrite any existing route.
    fixtureCreated = true;
    await fs.writeFile(path.join(fixtureDir, "page.tsx"), fixturePage, { flag: "wx" });
    await fs.writeFile(path.join(fixtureDir, "client.tsx"), fixtureClient, { flag: "wx" });
  }
  target = await (await fetch(debug + "/json/new?about:blank", { method: "PUT" })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id);
      if (!task) return;
      clearTimeout(task.timer); pending.delete(message.id);
      if (message.error) task.reject(new Error(JSON.stringify(message.error))); else task.resolve(message.result);
    } else if (message.method === "Runtime.exceptionThrown") {
      const error = message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text;
      (routeScope === "timeline" ? errors : relatedErrors).push({ route: routeScope, error });
    } else if (message.method === "Fetch.requestPaused") {
      interceptRequest(message.params).catch(error => errors.push("Request interception failed: " + error.message));
    }
  };
  for (const domain of ["Page", "Runtime", "DOM", "CSS"]) await send(domain + ".enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  await viewport(1440,900);
  if (!fixturesOnly) {
    await navigate("/timeline?demo=jimmy");
    await evaluate("sessionStorage.removeItem('extra_demo_memories'); localStorage.removeItem('lm_sidebar_collapsed')");
    await navigate("/timeline?demo=jimmy");
    const initialCount = await entryCount();
    assert.ok(initialCount > 5);
    for (const [width,height] of [[1440,900],[768,1024],[390,844]]) {
      await viewport(width,height);
      for (const dark of [false,true]) {
        await theme(dark);
        const metrics = await evaluate(`(() => { const stories=[...document.querySelectorAll('.timeline-entry__story')].map(e=>e.getBoundingClientRect()); const entries=[...document.querySelectorAll('.timeline-entry')].map(e=>e.getBoundingClientRect()); const search=document.querySelector('.timeline-search input').getBoundingClientRect(); return {firstStory:stories[0].top,secondBottom:entries[1].bottom,searchWidth:search.width,entryCount:entries.length,editorClosed:!document.querySelector('.timeline-entry button[aria-expanded="true"]')}; })()`);
        await assertNoOverflow(); await assertControls();
        assert.equal(metrics.editorClosed,true);
        if (width===1440) { assert.ok(metrics.firstStory<=320,JSON.stringify(metrics)); assert.ok(metrics.secondBottom<=900); }
        if (width===390) assert.ok(metrics.firstStory<=420,JSON.stringify(metrics));
        if (width===768) assert.ok(metrics.searchWidth>=300,"Tablet search must have a usable full row");
        record("layout " + width + " " + (dark?"dark":"light"),metrics);
        await screenshot("timeline-"+width+"-"+(dark?"dark":"light"));
      }
    }
    const dom=await send("DOM.getDocument");
    for (const [selector,expected] of [[".timeline-intro h1","Inter"],[".timeline-entry__story","Newsreader"]]) {
      const {nodeId}=await send("DOM.querySelector",{nodeId:dom.root.nodeId,selector});
      const {fonts}=await send("CSS.getPlatformFontsForNode",{nodeId});
      assert.ok(fonts.some(font=>font.isCustomFont&&font.familyName.includes(expected)),JSON.stringify(fonts));
      record("rendered font "+expected,fonts.map(font=>font.familyName));
    }
    await theme(false);
    await viewport(1440,900);
    const newest=await evaluate("document.querySelector('.timeline-day').dataset.date");
    await click(".timeline-sort");
    const oldest=await evaluate("document.querySelector('.timeline-day').dataset.date");
    assert.ok(oldest<newest);
    assert.ok(await evaluate("document.querySelector('.timeline-sort').textContent.includes('Oldest first')"));
    await click(".timeline-sort");
    await setValue(".timeline-search input","zzzz-not-found-in-archive");
    await until("!!document.querySelector('.timeline-empty')","no search results");
    await clickText(".timeline-empty button","Clear filters");
    assert.equal(await entryCount(),initialCount);
    record("chronological sort and clear search filters");
    await evaluate("document.querySelector('.timeline-search input').focus()");
    await key("Tab","Tab",0,9);
    assert.equal(await evaluate("document.activeElement.getAttribute('aria-label')"),"Filter by category");
    assert.ok(await evaluate("parseFloat(getComputedStyle(document.activeElement).outlineWidth)>=2"));
    record("keyboard order and visible focus");
    assert.ok(await evaluate("document.querySelector('.timeline-intro a[href=\"/calendar?demo=jimmy\"]')!==null"));
    const extra={id:"audit-saved-demo",activityId:"audit-saved-demo",rawText:"Remembered after reload.",summary:"Remembered after reload.",sourceText:null,occurredAt:"2026-10-22",category:"other",status:"RESOLVED",eventStatus:"completed",timeOfDay:null,timeHint:null,isFirstTime:false,needsReview:false,reviewReasons:[],people:[],places:[],topics:[],imageUrls:[]};
    await evaluate("sessionStorage.setItem('extra_demo_memories',"+JSON.stringify(JSON.stringify([extra]))+");localStorage.setItem('lm_sidebar_collapsed','true')");
    await navigate("/timeline?demo=jimmy");
    await until("document.querySelector('.timeline-page').textContent.includes('Remembered after reload.')","stored demo memory hydration");
    assert.equal(await entryCount(),initialCount+1);
    assert.deepEqual(errors,[],"Demo hydration and saved sidebar state");
    await click('button[aria-label="Expand sidebar"]');
    await evaluate("sessionStorage.removeItem('extra_demo_memories')");
    await navigate("/timeline?demo=jimmy");
    record("saved demo memory and collapsed sidebar hydrate without mismatch");
    await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.timeline-sort')).transitionDuration"),"0s");
    await send("Emulation.setEmulatedMedia",{features:[]});
    record("reduced motion");
  }

  if (!production) {
    for (const state of fixtureState ? [fixtureState] : ["empty","error","partial-error","statuses","long","photos","search","editor","retry"]) {
      await navigate("/timeline/audit-preview?demo=jimmy&state="+state);
      await viewport(390,844); await theme(false);
      if (state==="empty") {
        assert.equal(await entryCount(),0);
        assert.ok(await evaluate("!!document.querySelector('.timeline-empty a[href^=\"/dashboard\"]')"));
      } else if (state==="error"||state==="partial-error") {
        assert.ok(await evaluate("document.querySelector('.timeline-error').textContent.includes('Could not load')"));
        assert.ok(await evaluate("[...document.querySelectorAll('.timeline-error button')].some(e=>e.textContent.includes('Try again'))"));
        assert.equal(await evaluate("!!document.querySelector('.timeline-empty a[href^=\"/dashboard\"]')"),false);
        if(state==="partial-error") assert.ok(await entryCount()>0);
      } else if (state==="statuses") {
        const content=await evaluate("document.querySelector('.timeline-page').textContent");
        for(const label of ["Extracting","Extraction failed","Needs review","Planned","Cancelled","First time"]) assert.ok(content.toLowerCase().includes(label.toLowerCase()),label);
        assert.equal(await evaluate("document.querySelectorAll('.timeline-day').length"),1);
        assert.equal(await entryCount(),6);
      } else if (state==="photos") {
        assert.equal(await evaluate("document.querySelectorAll('.memory-image-compact').length"),1);
        assert.ok(await evaluate("document.querySelector('.memory-image-compact').textContent.includes('2')"));
        await click(".memory-image-compact");
        await until("!!document.querySelector('[role=\"dialog\"][aria-label=\"Memory Photo Lightbox\"]')","photo lightbox");
        await pause(250);
        const geometry=await evaluate(`(() => { const dialog=document.querySelector('[role="dialog"][aria-label="Memory Photo Lightbox"]'); const r=dialog.getBoundingClientRect(); const image=dialog.querySelector('img').getBoundingClientRect(); return {top:r.top,left:r.left,width:r.width,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight,imageTop:image.top,imageBottom:image.bottom,scrolled:[...document.querySelectorAll('div')].some(e=>e.scrollTop>100),focusInside:dialog.contains(document.activeElement)}; })()`);
        assert.equal(geometry.scrolled,true,"Photo must be opened after scrolling the timeline");
        assert.ok(Math.abs(geometry.top)<1&&Math.abs(geometry.left)<1,JSON.stringify(geometry));
        assert.ok(Math.abs(geometry.width-geometry.viewportWidth)<1&&Math.abs(geometry.height-geometry.viewportHeight)<1,JSON.stringify(geometry));
        assert.ok(geometry.imageTop>=0&&geometry.imageBottom<=geometry.viewportHeight,JSON.stringify(geometry));
        assert.equal(geometry.focusInside,true,"Opening the compact lightbox moves focus inside");
        for(const label of ["Close photo","Previous photo","Next photo"]) assert.ok(await evaluate("!!document.querySelector("+JSON.stringify('[role="dialog"] button[aria-label="'+label+'"]')+")"),"English lightbox label: "+label);
        assert.ok(await evaluate("!!document.querySelector('[role=\"dialog\"] a[title=\"Open full image\"]')"),"English full-image label");
        const smallLightboxControls=await evaluate(`(() => [...document.querySelectorAll('[role="dialog"] a,[role="dialog"] button')].map(e=>({label:e.getAttribute('aria-label')||e.title,rect:e.getBoundingClientRect()})).filter(({rect})=>rect.width<43.5||rect.height<43.5).map(({label,rect})=>({label,width:rect.width,height:rect.height})))()`);
        assert.deepEqual(smallLightboxControls,[],"Compact lightbox controls are at least 44px");
        const focusableCount=await evaluate(`(() => { const dialog=document.querySelector('[role="dialog"][aria-label="Memory Photo Lightbox"]'); const controls=[...dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(e=>e.getClientRects().length); controls[0].setAttribute('data-audit-focus-boundary','first'); controls.at(-1).setAttribute('data-audit-focus-boundary','last'); controls.at(-1).focus(); return controls.length; })()`);
        assert.ok(focusableCount>=2,"Lightbox has keyboard controls");
        await key("Tab","Tab",0,9);
        assert.equal(await evaluate("document.activeElement.getAttribute('data-audit-focus-boundary')"),"first","Tab wraps from last to first lightbox control");
        await key("Tab","Tab",8,9);
        assert.equal(await evaluate("document.activeElement.getAttribute('data-audit-focus-boundary')"),"last","Shift+Tab wraps from first to last lightbox control");
        record("scrolled compact photo opens a viewport-sized lightbox",geometry);
        await key("ArrowRight","ArrowRight",0,39);
        assert.ok(await evaluate("document.querySelector('[role=\"dialog\"]').textContent.includes('2 / 2')"));
        await key("Escape","Escape",0,27);
        await until("!document.querySelector('[role=\"dialog\"]')","lightbox Escape");
        assert.equal(await evaluate("document.activeElement.matches('.memory-image-compact')"),true,"Escape returns to the photo trigger");
        record("compact lightbox focus entry, Tab containment and Escape focus return");
        await evaluate('document.querySelector(".overflow-y-auto.overscroll-y-contain")?.scrollTo(0,0)');
      } else if (state==="search") {
        for(const word of ["Silverfin","Copperleaf","Amberwick","Birchhaven","Cedarstone"]) {
          await setValue(".timeline-search input",word);
          assert.equal(await entryCount(),1,"Search field "+word);
        }
        await clearFilters();
        await setValue(".timeline-category select","other");
        assert.equal(await entryCount(),2,"Null category and explicit other use the same filter");
        assert.ok(await evaluate("[...document.querySelectorAll('.timeline-category option')].find(e=>e.value==='other').textContent.includes('2')"));
        await clearFilters();
        await setValue(".timeline-search input","Silverfin");
        await setValue(".timeline-category select","career");
        await click(".timeline-sort");
        await click("[data-audit-refresh]");
        await until("document.querySelector('.timeline-entry__story').textContent.includes('refreshing the server props')","fresh server props reflected");
        assert.equal(await evaluate("document.querySelector('.timeline-search input').value"),"Silverfin");
        assert.equal(await evaluate("document.querySelector('.timeline-category select').value"),"career");
        assert.ok(await evaluate("document.querySelector('.timeline-sort').textContent.includes('Oldest first')"));
        record("all five search fields, normalized categories, refreshed props preserve filters");
      } else if (state==="editor") {
        assert.equal(await evaluate("document.querySelector('.timeline-entry button[aria-expanded]').getAttribute('aria-expanded')"),"false");
        await clickText(".timeline-entry button","Edit details");
        await until("!!document.querySelector('.timeline-entry [aria-label=\"Edit memory details\"] select')","editor opens");
        await assertControls();
        await evaluate("document.querySelector('.timeline-entry [aria-label=\"Edit memory details\"] select').focus()");
        await key("Escape","Escape",0,27);
        assert.equal(await evaluate("document.activeElement.textContent.trim()"),"Edit details");
        await clickText(".timeline-entry button","Edit details");
        await click(".memory-image-compact");
        await until("!!document.querySelector('[role=\"dialog\"][aria-label=\"Memory Photo Lightbox\"]')","editor photo opens");
        await key("Escape","Escape",0,27);
        await until("!document.querySelector('[role=\"dialog\"]')","photo Escape while editor is open");
        assert.ok(await evaluate("!!document.querySelector('.timeline-entry [aria-label=\"Edit memory details\"]')"),"Photo Escape leaves the editor open");
        assert.equal(await evaluate("document.activeElement.matches('.memory-image-compact')"),true,"Photo Escape returns focus to its trigger while editor stays open");
        record("photo Escape does not close an open editor");
        mockResponse={success:false,error:"Audit category change failed.",code:"DATABASE_ERROR"};
        await setValue('.timeline-entry [aria-label="Edit memory details"] select',"social");
        await until("document.querySelector('.timeline-entry [aria-label=\"Edit memory details\"]').getAttribute('aria-busy')==='true' && document.querySelector('.timeline-entry').textContent.includes('Saving details…')","category pending feedback");
        assert.equal(await evaluate("document.querySelector('.timeline-entry [aria-label=\"Edit memory details\"] select').value"),"social","Pending category appears optimistically");
        assert.equal(await evaluate("document.querySelector('.timeline-entry [aria-label=\"Edit memory details\"] select').disabled"),true);
        await until("document.querySelector('.timeline-entry').textContent.includes('Audit category change failed.')","category failure feedback");
        assert.equal(await evaluate("document.querySelector('.timeline-entry [aria-label=\"Edit memory details\"] select').value"),"career");
        mockResponse={success:true};
        await setValue('.timeline-entry [aria-label="Edit memory details"] select',"health");
        await until("document.querySelector('.timeline-entry').textContent.includes('Category updated.')","category success feedback");
        await click("[data-audit-refresh]");
        await until("document.querySelector('.timeline-entry [aria-label=\"Edit memory details\"] select').value==='health'","category from refreshed server props");
        await until("[...document.querySelectorAll('.timeline-category option')].find(e=>e.value==='health').textContent.includes('(1)')","refreshed category counts");
        assert.ok(await evaluate("[...document.querySelectorAll('.timeline-category option')].find(e=>e.value==='career').textContent.includes('(0)')"));
        assert.ok(await evaluate("[...document.querySelectorAll('.timeline-category option')].find(e=>e.value==='health').textContent.includes('(1)')"));
        record("editor keyboard behavior, pending state, mocked category rollback, refreshed counts");
        for(const [kind,name] of [["people","Audit Person"],["places","Audit Place"],["topics","Audit Topic"]]) {
          const removeSelector='.timeline-entry button[aria-label="Remove '+name+'"]';
          mockResponse={success:false,error:"Audit removal failed.",code:"DATABASE_ERROR"};
          await click(removeSelector);
          await until("document.querySelector('.timeline-entry').textContent.includes('Saving details…')","removal pending feedback");
          assert.equal(await evaluate("document.querySelector("+JSON.stringify(removeSelector)+").disabled"),true);
          await until("document.querySelector('.timeline-entry').textContent.includes('Audit removal failed.')","removal failure feedback");
          assert.ok(await evaluate("!!document.querySelector("+JSON.stringify(removeSelector)+")"),"Failed removal retains the entity");
          mockResponse={success:true};
          await click(removeSelector);
          await until("document.querySelector('.timeline-entry').textContent.includes("+JSON.stringify("Removed "+name+".")+")","removal success feedback");
          await evaluate("Object.assign(document.querySelector('[data-audit-refresh]').dataset,"+JSON.stringify({auditKind:kind,auditOperation:"remove"})+")");
          await click("[data-audit-refresh]");
          await until("!document.querySelector("+JSON.stringify(removeSelector)+")","refreshed entity removal");
          assert.equal(await evaluate("[...document.querySelectorAll('.timeline-entry a')].some(e=>e.textContent==="+JSON.stringify(name)+")"),false);
          await setValue('.timeline-entry form select',kind);
          await setValue('.timeline-entry form input',"Added "+kind);
          mockResponse={success:false,error:"Audit addition failed.",code:"DATABASE_ERROR"};
          await click('.timeline-entry form button[type="submit"]');
          await until("document.querySelector('.timeline-entry form').textContent.includes('Adding detail…')","addition pending feedback");
          assert.equal(await evaluate("document.querySelector('.timeline-entry form input').disabled"),true);
          assert.equal(await evaluate("document.querySelector('.timeline-entry [aria-label=\"Edit memory details\"] select').disabled"),true,"Adding an entity disables concurrent category changes");
          await until("document.querySelector('.timeline-entry form').textContent.includes('Audit addition failed.')","addition failure feedback");
          assert.equal(await evaluate("document.querySelector('.timeline-entry form input').value"),"Added "+kind,"Failed addition retains input for retry");
          mockResponse={success:true};
          await click('.timeline-entry form button[type="submit"]');
          await until("document.querySelector('.timeline-entry form').textContent.includes("+JSON.stringify("Added Added "+kind+".")+")","addition success feedback");
          assert.equal(await evaluate("document.querySelector('.timeline-entry form input').value"),"");
          await evaluate("Object.assign(document.querySelector('[data-audit-refresh]').dataset,"+JSON.stringify({auditKind:kind,auditOperation:"add"})+")");
          await click("[data-audit-refresh]");
          await until("!!document.querySelector("+JSON.stringify('.timeline-entry a[href="/'+kind+'/audit-added-'+kind+'"]')+")","refreshed entity link");
          assert.ok(await evaluate("!!document.querySelector("+JSON.stringify('.timeline-entry button[aria-label="Remove Added '+kind+'"]')+")"),"Refreshed entity is available in the editor");
          record("mocked "+kind+" addition/removal success, failure, pending feedback and refreshed props");
        }
        mockResponse=null;
      } else if (state==="retry") {
        mockResponse={success:false,error:"Audit extraction failed."};
        await clickText(".timeline-entry button","Retry extraction");
        await until("document.querySelector('.timeline-entry').textContent.includes('Audit extraction failed.')","retry failure feedback");
        mockResponse={success:true};
        await clickText(".timeline-entry button","Retry extraction");
        await until("![...document.querySelectorAll('.timeline-entry button')].some(e=>e.disabled)","retry done");
        mockResponse=null;
        record("mocked extraction retry success and failure");
      }
      await assertNoOverflow();
      await screenshot("state-"+state);
      record("fixture "+state);
    }
  }
  if(production) {
    await viewport(1440,900);
    await navigate("/dashboard?demo=jimmy",".dashboard-page");
    assert.equal(await evaluate("!!document.querySelector('.timeline-page')"),false);
    assert.equal(await evaluate("document.querySelectorAll('.dashboard-trace').length"),5);
    await screenshot("dashboard-unaffected");
    record("dashboard retains its separate content");
    await navigate("/calendar?demo=jimmy","main h1");
    assert.equal(await evaluate("document.querySelector('main h1').textContent"),"Visual Calendar");
    assert.equal(await evaluate("!!document.querySelector('.timeline-page')"),false);
    await screenshot("calendar-unaffected");
    record("calendar retains its separate content");
  }
  assert.deepEqual(errors,[],"Timeline runtime exceptions");
  record("no timeline runtime exceptions");
  completed=true;
} catch(error) {
  failure=error.stack||String(error);
  if(ws?.readyState===WebSocket.OPEN) {
    await screenshot("failure-"+(fixtureState||"latest")).catch(()=>{});
    failureDiagnostics=await evaluate(`(() => ({url:location.href,activeElement:document.activeElement?.outerHTML.slice(0,1000),entry:document.querySelector('.timeline-entry')?.outerHTML,fixtureButton:document.querySelector('[data-audit-refresh]')?.outerHTML}))()`).catch(()=>null);
  }
  throw error;
} finally {
  if(ws?.readyState===WebSocket.OPEN) ws.close();
  if(target?.id) await fetch(debug+"/json/close/"+target.id).catch(()=>{});
  if(fixtureCreated) {
    await fs.unlink(path.join(fixtureDir,"client.tsx")).catch(()=>{});
    await fs.unlink(path.join(fixtureDir,"page.tsx")).catch(()=>{});
    await fs.rmdir(fixtureDir).catch(()=>{});
    await fs.unlink(path.join(root,".next","dev","types","app","timeline","audit-preview","page.ts")).catch(()=>{});
  }
  await fs.mkdir(reportDir,{recursive:true});
  await fs.writeFile(path.join(reportDir,production?"results-production.json":fixturesOnly?"results-fixtures"+(fixtureState?"-"+fixtureState:"")+".json":"results-development.json"),JSON.stringify({status:completed?"passed":"failed",results,errors,relatedErrors,intercepted,failure,failureDiagnostics,lastClicks:completed?undefined:lastClicks},null,2));
}
