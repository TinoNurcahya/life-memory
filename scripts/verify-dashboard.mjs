// Browser acceptance checks against a local Next development server.
// Start an isolated Chromium instance with --remote-debugging-port=9333 first.
// This creates a temporary fixture route and removes it in finally.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.DASHBOARD_AUDIT_URL || "http://localhost:3000";
const production = process.argv.includes("--production");
const fixturesOnly = process.argv.includes("--fixtures-only");
const debug = process.env.DASHBOARD_AUDIT_CDP || "http://127.0.0.1:9333";
const reportDir = path.join(root, "reports", "dashboard");
const fixtureDir = path.join(root, "app", "dashboard", "audit-preview");
const fixturePath = path.join(fixtureDir, "page.tsx");
const results = [];
const errors = [];
const relatedRouteErrors = [];
let routeScope = "dashboard";
let completed = false;
let failure = null;
let createdFixture = false;
let target;
let ws;
let serial = 0;
const pending = new Map();
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
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
  const limit = Date.now() + timeout;
  while (Date.now() < limit) {
    if (await evaluate(expression)) return;
    await pause(120);
  }
  throw new Error("Timed out: " + description);
}
async function navigate(route) {
  await send("Page.navigate", { url: base + route });
  await until('document.readyState === "complete" && !!document.querySelector(".dashboard-page")', route);
  await evaluate("document.fonts.ready.then(() => true)");
  // React client readiness is verified through actual interactions below.
  await pause(500);
}
async function viewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  await pause(200);
  await evaluate("document.querySelector(\".overflow-y-auto.overscroll-y-contain\").scrollTop = 0");
}
async function click(selector) {
  const point = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error("Missing target: " + ${JSON.stringify(selector)});
    element.scrollIntoView({ block: "nearest" }); const r = element.getBoundingClientRect();
    return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", ...point, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", ...point, button: "left", clickCount: 1 });
}
async function key(key, code, modifiers = 0, windowsVirtualKeyCode) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, modifiers, windowsVirtualKeyCode });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, modifiers, windowsVirtualKeyCode });
}
async function setValue(selector, value) {
  await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)});
    const prototype = element.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, ${JSON.stringify(value)});
    element.dispatchEvent(new Event("input", {bubbles:true}));
    element.dispatchEvent(new Event("change", {bubbles:true})); })()`);
  await pause(150);
}
async function screenshot(name) {
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await fs.writeFile(path.join(reportDir, name + ".png"), Buffer.from(shot.data, "base64"));
}
async function theme(dark) {
  const current = await evaluate("document.documentElement.classList.contains(\"dark\")");
  if (current !== dark) {
    await click('header button[aria-label="Switch to ' + (dark ? "dark" : "light") + ' mode"]');
    await until('document.documentElement.classList.contains("dark") === ' + dark, "theme toggle");
    await pause(800);
  }
}
const fixture = `import DashboardClient from "@/components/dashboard/DashboardClient";
import { JIMMY_DEMO_ITEMS, JIMMY_DEMO_STATS } from "@/lib/demo/jimmy";
import type { ArchiveData, TimelineItem } from "@/lib/queries/activities";
export default async function DashboardAudit({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  let items: TimelineItem[] = [...JIMMY_DEMO_ITEMS].sort((a,b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0,5);
  if (state === "empty" || state === "error") items = [];
  if (state === "statuses") {
    items = items.map((item,i) => ({
      ...item, occurredAt: items[0].occurredAt, imageUrls: i % 2 ? [] : item.imageUrls,
      status: i === 0 ? "PENDING" : i === 1 ? "FAILED" : "RESOLVED",
      needsReview: i === 2, eventStatus: i === 3 ? "planned" : i === 4 ? "cancelled" : item.eventStatus,
    }));
  }
  if (state === "long") items = items.map((item,i) => ({
    ...item, summary: i === 0 ? "A long memory with many details about the people we met and the places we visited. ".repeat(12) : item.summary,
    imageUrls: i % 2 ? [] : item.imageUrls,
    people: item.people.map(person => ({...person, name: "A very long person name ".repeat(8)})),
  }));
  const initialData: ArchiveData = { items, stats: items.length ? JIMMY_DEMO_STATS : {activities:0,people:0,places:0,topics:0,firstTimes:0},
    error: state === "error" ? "Could not load your memories. Please try again." : null };
  return <DashboardClient initialData={initialData} isDemo={state !== "error"} userName="Test reader" />;
}
`;

try {
  await fs.mkdir(reportDir, { recursive: true });
  // Never overwrite a pre-existing route.
  if (!production) {
    await fs.mkdir(fixtureDir, { recursive: false });
    createdFixture = true;
    await fs.writeFile(fixturePath, fixture, { flag: "wx" });
  }
  target = await (await fetch(debug + "/json/new?about:blank", { method: "PUT" })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id);
      if (!task) return;
      clearTimeout(task.timer);
      pending.delete(message.id);
      if (message.error) task.reject(new Error(JSON.stringify(message.error))); else task.resolve(message.result);
    } else if (message.method === "Runtime.exceptionThrown") {
      const error = message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text;
      if (routeScope === "dashboard") errors.push(error);
      else relatedRouteErrors.push({ route: routeScope, error });
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");
  await send("CSS.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  if (!fixturesOnly) {
  await navigate("/dashboard?demo=jimmy");
  await evaluate("sessionStorage.clear(); localStorage.removeItem('lm_sidebar_collapsed')");
  await navigate("/dashboard?demo=jimmy");

  await evaluate("localStorage.setItem('lm_sidebar_collapsed', 'true')");
  await navigate("/dashboard?demo=jimmy");
  await until("!!document.querySelector('button[aria-label=\"Expand sidebar\"]')", "restore collapsed sidebar");
  assert.deepEqual(errors, [], "Persisted sidebar must hydrate without mismatches");
  await click('button[aria-label="Expand sidebar"]');
  record("persisted collapsed sidebar hydrates and expands");

  for (const [width, height] of [[1440,900], [768,1024], [390,844]]) {
    await viewport(width, height);
    for (const dark of [false, true]) {
      await theme(dark);
      const metrics = await evaluate(`(() => {
        const rows=[...document.querySelectorAll(".dashboard-trace")].map(e=>e.getBoundingClientRect());
        const save=[...document.querySelectorAll("button")].find(e=>e.textContent==="Save memory").getBoundingClientRect();
        const main=document.querySelector(".dashboard-page");
        const controls=[...main.querySelectorAll("a,button,input:not([type=file])")].filter(e=>e.getClientRects().length);
        return {first:rows[0].top,secondBottom:rows[1].bottom,saveBottom:save.bottom,
          overflow:main.scrollWidth>main.clientWidth || document.documentElement.scrollWidth>innerWidth,
          undersized:controls.filter(e=>{const r=e.getBoundingClientRect();return r.height<43.5 || r.width<43.5;}).map(e=>e.textContent||e.ariaLabel),
          canvas:getComputedStyle(document.querySelector(".lm-vault-shell--dashboard")).getPropertyValue("--color-canvas").trim(),
          ideasClosed:document.querySelector('button[aria-expanded][aria-controls*="ideas"]').getAttribute("aria-expanded")==="false"};
      })()`);
      assert.equal(metrics.overflow, false);
      assert.equal(metrics.ideasClosed, true);
      assert.deepEqual(metrics.undersized, []);
      assert.ok(metrics.saveBottom < height);
      assert.ok(metrics.first < height);
      if (width === 1440) assert.ok(metrics.secondBottom < height);
      assert.equal(metrics.canvas, dark ? "#171a1d" : "#fbf9f5");
      record("layout " + width + " " + (dark ? "dark" : "light"), metrics);
      await screenshot("dashboard-" + width + "-" + (dark ? "dark" : "light"));
    }
  }

  const dom = await send("DOM.getDocument");
  for (const [selector, expected] of [["h1", "Inter"], [".dashboard-trace-summary a", "Newsreader"]]) {
    const { nodeId } = await send("DOM.querySelector", { nodeId: dom.root.nodeId, selector });
    const { fonts } = await send("CSS.getPlatformFontsForNode", { nodeId });
    assert.ok(fonts.some(font => font.isCustomFont && font.familyName.includes(expected)), JSON.stringify(fonts));
    record("rendered font " + expected, fonts.map(font=>font.familyName));
  }
  await theme(false);
  await click('button[aria-controls*="ideas"]');
  await until("document.querySelector('button[aria-controls*=\"ideas\"]').getAttribute(\"aria-expanded\")===\"true\"", "writing ideas open");
  await click('[id$="-ideas"] button');
  await until("document.querySelector(\"textarea\").value.includes(\"Morning coffee\")", "idea inserts text");
  assert.equal(await evaluate("document.activeElement.tagName"), "TEXTAREA");
  record("writing idea selection restores textarea focus");
  await key("Tab", "Tab", 8, 9);
  assert.equal(await evaluate("document.activeElement.getAttribute('aria-controls')?.includes('ideas')"), true);
  assert.equal(await evaluate("getComputedStyle(document.activeElement).outlineWidth"), "2px");
  await key("Tab", "Tab", 0, 9);
  assert.equal(await evaluate("document.activeElement.tagName"), "TEXTAREA");
  record("keyboard tab order and visible focus");

  await setValue("textarea", "A long entry. ".repeat(180));
  assert.ok(await evaluate("document.querySelector(\"textarea\").clientHeight > 100"));
  await setValue("textarea", "");
  assert.ok(await evaluate("document.querySelector(\"textarea\").clientHeight < 70"));
  record("composer grows and resets");

  await click('header button[aria-label="Search archive"]');
  await until("!!document.querySelector('[role=\"dialog\"] input')", "search open");
  await setValue('[role="dialog"] input', "capstone");
  await until("document.querySelectorAll('[role=\"dialog\"] a').length > 0", "search results");
  await setValue('[role="dialog"] input', "zzzz-no-matches");
  await until("document.querySelector('[role=\"dialog\"]').textContent.includes(\"No matching memory\")", "search empty");
  await key("Escape", "Escape", 0, 27);
  await until("!document.querySelector('[role=\"dialog\"]')", "close search");
  assert.equal(await evaluate("document.activeElement.getAttribute(\"aria-label\")"), "Search archive");
  record("search results, empty state, Escape and focus return");

  await click('button[aria-label="Open navigation"]');
  await until("!!document.querySelector('[role=\"dialog\"][aria-label=\"Navigation\"]')", "mobile navigation");
  await key("Escape", "Escape", 0, 27);
  await until("!document.querySelector('[role=\"dialog\"][aria-label=\"Navigation\"]')", "close mobile navigation");
  assert.equal(await evaluate("document.activeElement.getAttribute(\"aria-label\")"), "Open navigation");
  record("mobile navigation Escape and focus return");

  await viewport(1024,900);
  await click('button[aria-label="Collapse sidebar"]');
  await until("!!document.querySelector(\"button[aria-label=\\\"Expand sidebar\\\"]\")", "sidebar collapsed");
  await setValue("textarea", "A multiline note that must stay fully visible when the sidebar changes width. ".repeat(14));
  const wide = await evaluate('document.querySelector("textarea").getBoundingClientRect().width');
  await click('button[aria-label="Expand sidebar"]');
  await pause(300);
  const narrow = await evaluate('({width:document.querySelector("textarea").getBoundingClientRect().width,height:document.querySelector("textarea").clientHeight,scroll:document.querySelector("textarea").scrollHeight})');
  assert.ok(narrow.width < wide);
  assert.ok(narrow.height >= narrow.scroll);
  await setValue("textarea", "");
  record("composer autoresizes after sidebar expansion");

  await viewport(1440,900);
  await click('button[aria-label^="View evidence for"]');
  await until("!!document.querySelector(\".dashboard-evidence\")", "evidence drawer");
  assert.ok(await evaluate("getComputedStyle(document.querySelector(\".dashboard-evidence\")).fontFamily.includes(\"dashboardSans\")"));
  await click('button[aria-label="Close drawer"]');
  await until("!document.querySelector(\".dashboard-evidence\")", "close evidence drawer");
  record("evidence drawer opens, uses scoped fonts and closes");
  await click('button[aria-label="Dismiss rediscovered memory"]');
  await until("document.querySelector(\".dashboard-dismissed\") !== null", "dismiss memory");
  await click(".dashboard-dismissed button");
  await until("!!document.querySelector(\".dashboard-rediscovered blockquote\")", "restore memory");
  record("rediscovered memory dismiss and undo");

  const photo = path.join(reportDir, "upload-fixture.png");
  await fs.writeFile(photo, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aKOcAAAAASUVORK5CYII=", "base64"));
  const fileDom = await send("DOM.getDocument");
  const { nodeId: fileInput } = await send("DOM.querySelector", { nodeId: fileDom.root.nodeId, selector: 'input[type="file"]' });
  await send("DOM.setFileInputFiles", { nodeId: fileInput, files: [photo] });
  await until("!!document.querySelector('img[alt=\"Attached photo 1\"]')", "photo preview");
  await click('button[aria-label="Remove photo 1"]');
  await until("!document.querySelector('img[alt=\"Attached photo 1\"]')", "photo removed");
  await fs.unlink(photo);
  record("photo preview and touch-visible removal");

  await setValue('input[type="date"]', "2026-10-20");
  assert.equal(await evaluate("document.querySelector('input[type=\"date\"]').value"), "2026-10-20");
  const savedText = "Dashboard browser acceptance memory " + Date.now();
  await setValue("textarea", savedText);
  await evaluate("document.querySelector(\"textarea\").focus()");
  await key("Enter", "Enter", 2, 13);
  await until("document.querySelector(\"textarea\").value === \"\"", "shortcut clears composer");
  await until('JSON.parse(sessionStorage.getItem("extra_demo_memories") || "[]").some(i => i.summary === ' + JSON.stringify(savedText) + ')', "demo save");
  await pause(1400);
  const saved = await evaluate('JSON.parse(sessionStorage.getItem("extra_demo_memories")).find(i => i.summary === ' + JSON.stringify(savedText) + ')');
  assert.equal(saved.occurredAt, "2026-10-20");
  assert.equal(saved.status, "RESOLVED");
  record("date selection and Ctrl+Enter demo capture");
  await evaluate("sessionStorage.clear()");

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  assert.equal(await evaluate("getComputedStyle(document.querySelector(\".dashboard-index a\")).transitionDuration"), "0s");
  record("reduced motion");
  await send("Emulation.setEmulatedMedia", { features: [] });
  }

  for (const state of production ? [] : ["empty", "error", "statuses", "long"]) {
    await navigate("/dashboard/audit-preview?demo=jimmy&state=" + state);
    await viewport(390,844);
    if (state === "empty" || state === "error") {
      assert.equal(await evaluate("document.querySelector(\".dashboard-index\") === null && document.querySelector(\".dashboard-companion\") === null"), true);
      assert.ok(await evaluate("!!document.querySelector(\".dashboard-empty\")"));
      if (state === "error") assert.ok(await evaluate("document.querySelector(\".dashboard-error\").textContent.includes(\"Could not load\")"));
    } else if (state === "statuses") {
      const content = await evaluate("document.querySelector(\".dashboard-feed\").textContent");
      for (const status of ["Extracting", "Extraction failed", "Needs review", "planned", "cancelled"]) assert.ok(content.includes(status));
      assert.ok(await evaluate("!!document.querySelector(\".dashboard-trace--same-day\")"));
      assert.equal(await evaluate("document.querySelectorAll(\".dashboard-trace-thumbnail\").length"), 3);
    }
    assert.equal(await evaluate("document.querySelector(\".dashboard-page\").scrollWidth > document.querySelector(\".dashboard-page\").clientWidth"), false);
    await screenshot("state-" + state);
    record("fixture " + state);
  }

  if (production) {
  await send("Page.navigate", { url: base + "/timeline?demo=jimmy" });
  await until("!!document.querySelector(\".timeline-page__intro\")", "timeline");
  // The user intentionally unified the shared shell and sidebar during this task.
  // Verify the timeline still renders its own content with the current shared navigation.
  assert.equal(await evaluate("!!document.querySelector(\".dashboard-page\")"), false);
  assert.equal(await evaluate("!!document.querySelector('nav[aria-label=\"Main navigation\"] a[aria-current=\"page\"][href^=\"/timeline\"]')"), true);
  record("timeline content and shared navigation");
  await screenshot("timeline-current-shared-shell");
  for (const [route, selector] of [["/login", "#login-email"], ["/", "#archive-main"]]) {
    routeScope = route;
    await send("Page.navigate", { url: base + route });
    await until('!!document.querySelector(' + JSON.stringify(selector) + ')', route);
    await pause(800);
    assert.equal(await evaluate("!!document.querySelector('.dashboard-page, .lm-vault-shell--dashboard, .dashboard-evidence')"), false);
    record("dashboard layout absent on " + route);
  }
  }
  assert.deepEqual(errors, [], "Browser runtime exceptions");
  record("no dashboard or timeline browser runtime exceptions");
  completed = true;
} catch (error) {
  failure = error.stack || String(error);
  throw error;
} finally {
  if (ws?.readyState === WebSocket.OPEN) ws.close();
  if (target?.id) await fetch(debug + "/json/close/" + target.id).catch(() => {});
  if (createdFixture) {
    await fs.unlink(fixturePath).catch(() => {});
    await fs.rmdir(fixtureDir).catch(() => {});
  }
  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(path.join(reportDir, production ? "results-production.json" : fixturesOnly ? "results-fixtures.json" : "results-development.json"), JSON.stringify({ status: completed ? "passed" : "failed", results, errors, relatedRouteErrors, failure }, null, 2));
}
