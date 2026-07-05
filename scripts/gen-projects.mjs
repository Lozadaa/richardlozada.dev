// gen-projects.mjs — screenshot each featured project's live page, convert to ASCII
// (reusing scripts/gen-ascii.py), and write src/lib/ascii/projects-data.json keyed by slug.
//
// Usage: npm run gen:projects
//
// playwright-core ships NO browsers. This tries, in order: the shared ms-playwright
// cache (populated by `npx playwright install chromium`), then system Chrome, then Edge.
// If none is found it exits with a clear message. Requires Python + Pillow for gen-ascii.py.
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { slugify } from "../src/lib/ascii/slug.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
// Served as a static asset (fetched at runtime), NOT bundled into JS — keeps the
// ~0.5MB of ASCII data out of the client bundle so it doesn't hurt bootup/TBT.
const OUT = join(ROOT, "public/ascii/projects-data.json");
const WIDTH = 240; // high detail; ambient is fps-capped so multiple canvases stay affordable
const FACTOR = "0.625"; // = cellW/cellH, so the ASCII matches the source aspect (no stretch)
const VIEWPORT = { width: 1280, height: 800 };
// centered 16:9 band of the above-the-fold — "show the center, crop the rest"
const CLIP = { x: 0, y: 40, width: 1280, height: 720 };

const projects = JSON.parse(readFileSync(join(ROOT, "src/content/projects.json"), "utf8"));
const webLink = (p) => (p.links || []).find((l) => /^web/i.test(l.label));

async function launch() {
  const tries = [{}, { channel: "chrome" }, { channel: "msedge" }];
  for (const opts of tries) {
    try { return await chromium.launch({ headless: true, ...opts }); } catch { /* next */ }
  }
  throw new Error("No Chromium/Chrome/Edge found. Run: npx playwright install chromium");
}

function pythonAscii(png, outJson) {
  for (const cmd of ["python", "py"]) {
    const r = spawnSync(cmd, ["scripts/gen-ascii.py", png, outJson, "--width", String(WIDTH), "--factor", FACTOR],
      { cwd: ROOT, encoding: "utf8" });
    if (r.error && r.error.code === "ENOENT") continue; // interpreter not found, try next
    if (r.status === 0) return;
    throw new Error((r.stderr || r.stdout || "gen-ascii.py failed").trim().split("\n").pop());
  }
  throw new Error("Python not found (need python + Pillow for gen-ascii.py)");
}

const existing = (() => { try { return JSON.parse(readFileSync(OUT, "utf8")); } catch { return {}; } })();
const out = { ...existing };
const generated = [], skipped = [], failed = [];

const tmp = mkdtempSync(join(tmpdir(), "ascii-proj-"));
const browser = await launch();
const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });

for (const p of projects.filter((x) => x.featured)) {
  const link = webLink(p);
  const slug = slugify(p.name);
  if (!link) { skipped.push(p.name); continue; }
  const png = join(tmp, `${slug}.png`);
  const outJson = join(tmp, `${slug}.json`);
  try {
    const page = await context.newPage();
    await page.goto(link.href, { waitUntil: "load", timeout: 25000 });
    await page.waitForTimeout(1200); // let fonts + hero animations settle
    await page.screenshot({ path: png, clip: CLIP }); // centered 16:9 band of the above-the-fold
    await page.close();
    pythonAscii(png, outJson);
    out[slug] = JSON.parse(readFileSync(outJson, "utf8"));
    generated.push(p.name);
  } catch (e) {
    failed.push(`${p.name} — ${e.message}`); // keep any previous entry for this slug
  }
}

await browser.close();
rmSync(tmp, { recursive: true, force: true });
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out) + "\n");

console.log("\n=== gen:projects ===");
console.log("generated:", generated.join(", ") || "(none)");
if (skipped.length) console.log("skipped (no web link):", skipped.join(", "));
if (failed.length) console.log("failed (kept previous):\n  - " + failed.join("\n  - "));
console.log(`wrote ${OUT} — ${Object.keys(out).length} entries`);
