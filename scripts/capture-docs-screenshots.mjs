import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "doc", "screenshot");
const baseUrl = process.env.SCREENSHOT_BASE_URL || "http://localhost:3000";
const debugPort = 9446;

const ROUTES = [
  {
    name: "landing",
    path: "/",
    waitSelector: "#hero",
    waitForNoSelector: "[data-intro-loader]",
    delayMs: 1200,
  },
  {
    name: "dashboard-entrance",
    path: "/dashboard?demo=jimmy",
    waitSelector: "[data-dashboard-entrance]",
    waitExpr: `document.querySelector("[data-dashboard-entrance]")?.textContent?.includes("04 / 04")`,
    delayMs: 320,
  },
  {
    name: "dashboard",
    path: "/dashboard?demo=jimmy&view=main",
    waitSelector: ".dashboard-page",
    skipEntrance: true,
    waitForNoSelector: "[data-dashboard-entrance]",
    delayMs: 600,
  },
  { name: "timeline", path: "/timeline?demo=jimmy", waitSelector: "main", delayMs: 600 },
  { name: "calendar", path: "/calendar?demo=jimmy", waitSelector: "[data-calendar-page]", delayMs: 600 },
  { name: "people", path: "/people?demo=jimmy", waitSelector: "[data-people-page]", delayMs: 600 },
  { name: "places", path: "/places?demo=jimmy", waitSelector: "[data-places-page]", delayMs: 600 },
  { name: "topics", path: "/topics?demo=jimmy", waitSelector: "[data-topics-page]", delayMs: 600 },
  { name: "chat", path: "/chat?demo=jimmy", waitSelector: "[data-chat-page]", delayMs: 700 },
  { name: "insights", path: "/insights?demo=jimmy", waitSelector: "[data-insights-page]", delayMs: 600 },
  { name: "reflection", path: "/reflection?demo=jimmy", waitSelector: "[data-reflection-page]", delayMs: 600 },
  { name: "forgot-this", path: "/forgot-this?demo=jimmy", waitSelector: "[data-forgotten-page]", delayMs: 600 },
  { name: "settings", path: "/settings?demo=jimmy", waitSelector: "main", delayMs: 500 },
  { name: "faq", path: "/faq", waitSelector: "main", delayMs: 500 },
  { name: "about", path: "/about", waitSelector: "main", delayMs: 500 },
  { name: "sitemap", path: "/sitemap", waitSelector: "main", delayMs: 500 },
  { name: "login", path: "/login", waitSelector: "main", delayMs: 500 },
  { name: "register", path: "/register", waitSelector: "main", delayMs: 500 },
];

const VIEWPORTS = [
  { label: "desktop", width: 1440, height: 900, mobile: false, dpr: 1 },
  { label: "mobile", width: 390, height: 844, mobile: true, dpr: 2 },
];

const THEMES = ["light", "dark"];

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function isServerUp(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    return res.status < 500;
  } catch {
    return false;
  }
}

function findBrowserExecutable() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error("Could not find Chrome or Edge executable");
}

async function waitForHttp(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerUp(url)) return;
    await pause(400);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  let devServer = null;
  if (!(await isServerUp(baseUrl))) {
    console.log("Starting local Next.js dev server...");
    devServer = spawn("cmd", ["/c", "npm", "run", "dev"], {
      cwd: root,
      stdio: "ignore",
      env: { ...process.env, PORT: "3000" },
    });
    await waitForHttp(baseUrl, 60000);
    console.log("Next.js dev server is ready at " + baseUrl);
  } else {
    console.log("Using running server at " + baseUrl);
  }

  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "lm-screenshots-"));
  const browserExe = findBrowserExecutable();
  console.log("Launching headless browser:", browserExe);

  const chrome = spawn(
    browserExe,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "--window-size=1440,900",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let ws = null;
  try {
    await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`, 15000);
    const targetsRes = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === "page");
    if (!pageTarget?.webSocketDebuggerUrl) {
      throw new Error("No page target found in headless browser");
    }

    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });

    let serial = 0;
    const pending = new Map();
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id && pending.has(msg.id)) {
        const entry = pending.get(msg.id);
        clearTimeout(entry.timer);
        pending.delete(msg.id);
        if (msg.error) entry.reject(new Error(msg.error.message));
        else entry.resolve(msg.result);
      }
    });

    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++serial;
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error("CDP timeout: " + method));
        }, 45000);
        pending.set(id, { resolve, reject, timer });
        ws.send(JSON.stringify({ id, method, params }));
      });

    const evaluate = async (expression) => {
      const res = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      return res?.result?.value;
    };

    await send("Page.enable");
    await send("Runtime.enable");

    const onlyArg = process.argv.find((a) => a.startsWith("--only="));
    const onlySet = onlyArg
      ? new Set(onlyArg.slice("--only=".length).split(",").map((s) => s.trim()))
      : null;
    const activeRoutes = onlySet ? ROUTES.filter((r) => onlySet.has(r.name)) : ROUTES;

    let count = 0;
    for (const vp of VIEWPORTS) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.dpr,
        mobile: vp.mobile,
      });

      for (const theme of THEMES) {
        // Inject script before document load so theme is immediately applied
        const scriptIdRes = await send("Page.addScriptToEvaluateOnNewDocument", {
          source: `
            try {
              localStorage.setItem("lm-theme", ${JSON.stringify(theme)});
              if (${JSON.stringify(theme)} === "dark") {
                document.documentElement.classList.add("dark");
              } else {
                document.documentElement.classList.remove("dark");
              }
            } catch {}
          `,
        });

        for (const route of activeRoutes) {
          const url = baseUrl + route.path;
          const fileName = `${route.name}-${vp.label}-${theme}.png`;
          console.log(`[${++count}/${activeRoutes.length * VIEWPORTS.length * THEMES.length}] Capturing ${fileName} ...`);

          await send("Page.navigate", { url });

          // Wait for readyState complete and selector
          const deadline = Date.now() + 25000;
          while (Date.now() < deadline) {
            const ready = await evaluate(`
              document.readyState === "complete" &&
              Boolean(document.querySelector(${JSON.stringify(route.waitSelector)}))
            `);
            if (ready) break;
            await pause(80);
          }

          // Enforce theme class & hide Next.js dev indicator badges
          await evaluate(`
            (() => {
              try {
                localStorage.setItem("lm-theme", ${JSON.stringify(theme)});
              } catch {}
              document.documentElement.classList.toggle("dark", ${JSON.stringify(theme)} === "dark");
              const style = document.createElement("style");
              style.textContent = "nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog-overlay] { display: none !important; opacity: 0 !important; visibility: hidden !important; }";
              document.head.appendChild(style);
              window.scrollTo(0, 0);
            })()
          `);

          await evaluate(`document.fonts ? document.fonts.ready.then(() => true) : true`);

          if (route.skipEntrance) {
            // Wait up to 2s for entrance portal to mount, then skip it until gone
            const mountDeadline = Date.now() + 2000;
            while (Date.now() < mountDeadline) {
              const mounted = await evaluate(`Boolean(document.querySelector("[data-dashboard-entrance]"))`);
              if (mounted) break;
              await pause(60);
            }
            const clearDeadline = Date.now() + 5000;
            while (Date.now() < clearDeadline) {
              const gone = await evaluate(`
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                document.querySelector("[data-dashboard-entrance]")?.click();
                !document.querySelector("[data-dashboard-entrance]")
              `);
              if (gone) break;
              await pause(100);
            }
          }

          if (route.waitExpr) {
            const exprDeadline = Date.now() + 8000;
            while (Date.now() < exprDeadline) {
              const matched = await evaluate(`Boolean(${route.waitExpr})`);
              if (matched) break;
              await pause(30);
            }
          }

          if (route.waitForNoSelector) {
            const noDeadline = Date.now() + 10000;
            while (Date.now() < noDeadline) {
              const gone = await evaluate(`!document.querySelector(${JSON.stringify(route.waitForNoSelector)})`);
              if (gone) break;
              await pause(120);
            }
          }

          // Wait for visible images to finish loading
          const imgDeadline = Date.now() + 5000;
          while (Date.now() < imgDeadline) {
            const imgsLoaded = await evaluate(`
              Array.from(document.images).every((img) => {
                if (img.loading === "lazy") img.loading = "eager";
                return img.complete && img.naturalWidth > 0;
              })
            `);
            if (imgsLoaded) break;
            await pause(120);
          }

          await pause(route.delayMs);

          const shot = await send("Page.captureScreenshot", {
            format: "png",
            captureBeyondViewport: false,
          });
          await fs.writeFile(path.join(outDir, fileName), Buffer.from(shot.data, "base64"));
        }

        await send("Page.removeScriptToEvaluateOnNewDocument", {
          identifier: scriptIdRes.identifier,
        });
      }
    }

    console.log(`All screenshots saved to ${outDir}`);
  } finally {
    try {
      ws?.close();
    } catch {}
    try {
      chrome.kill();
    } catch {}
    try {
      devServer?.kill();
    } catch {}
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

