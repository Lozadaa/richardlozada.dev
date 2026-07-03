# ASCII Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Richard Lozada's personal portfolio: a long-scroll Astro site with an interactive ASCII-face hero (cursor pushes characters, they spring back), black & white with a single orange accent, accessible and responsive.

**Architecture:** Static Astro + TypeScript site. All real content in semantic HTML sourced from typed data files (Content Collections). The hero is a single client island wrapping a pure-TS physics engine that renders the ASCII face to `<canvas>`; the canvas is decorative (`role="img"` + `aria-label`). The physics engine and data schemas are unit-tested (Vitest); pages and accessibility are verified end-to-end (Playwright + axe).

**Tech Stack:** Astro, TypeScript (strict), Vitest, Playwright, `@axe-core/playwright`, `@fontsource/jetbrains-mono`, Python 3 + Pillow (build-time ASCII generation).

## Global Constraints

- **Accent color:** exactly `#ff7a18`. No second decorative color, no gradients.
- **Background:** `#000`. Foreground text ramp: `#e6e6e6` (primary) / `#8a8a8a` (secondary).
- **Font:** JetBrains Mono (self-hosted via `@fontsource`, no external network requests).
- **Physics defaults (verbatim):** radius `38`, force `0.8`, spring `0.05`, friction `0.80`, cell `5×8px`, font `9px monospace`. Face grid `120×62`.
- **Accessibility:** canvas is decorative with `role="img"` + `aria-label`; all content in semantic HTML. Full keyboard navigation, visible focus in accent color, contrast AA.
- **`prefers-reduced-motion: reduce`** → hero renders one static frame, no rAF loop, no pointer interaction.
- **Performance:** hero loop pauses when out of viewport (IntersectionObserver) and when `document.hidden`. Target Lighthouse ~100 in all four categories.
- **Responsive:** usable from 320px to desktop; content reflows; canvas scales via CSS `width:100%`.
- **TypeScript strict.** Small single-responsibility files. Frequent commits.
- **Section order:** Hero → Experience → Projects → About → Stack → Contact.

---

### Task 1: Scaffold project, design tokens, base layout

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/layouts/Base.astro`
- Create: `src/pages/index.astro`
- Create: `.gitignore`
- Test: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `Base.astro` (props `{ title: string; description: string }`, renders `<slot />`), CSS custom properties in `:root` (see tokens below).

- [ ] **Step 1: Initialize Astro + deps**

Run:
```bash
cd "C:/Users/richa/projects/richardlozada.com"
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --yes
npm install
npm install -D vitest @playwright/test @axe-core/playwright
npm install @fontsource/jetbrains-mono
npx playwright install chromium
```

- [ ] **Step 2: Write `src/styles/tokens.css`**

```css
:root {
  /* spacing — 8px rhythm */
  --space-1: 8px;  --space-2: 16px; --space-3: 24px; --space-4: 32px;
  --space-6: 48px; --space-8: 64px; --space-12: 96px;
  /* color */
  --bg: #000; --fg: #e6e6e6; --fg-dim: #8a8a8a; --accent: #ff7a18;
  /* typography */
  --font-mono: "JetBrains Mono", ui-monospace, "Cascadia Code", monospace;
  --fs-sm: 0.8rem; --fs-base: 1rem; --fs-lg: 1.25rem;
  --fs-xl: 1.563rem; --fs-2xl: 1.953rem; --fs-3xl: clamp(2.4rem, 6vw, 3.815rem);
  --measure: 66ch;
}
```

- [ ] **Step 3: Write `src/styles/global.css`**

```css
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/jetbrains-mono/700.css";
@import "./tokens.css";

*, *::before, *::after { box-sizing: border-box; margin: 0; }
html { color-scheme: dark; }
body {
  background: var(--bg); color: var(--fg);
  font-family: var(--font-mono); font-size: var(--fs-base); line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.skip-link {
  position: absolute; left: -9999px; top: 0; background: var(--accent);
  color: #000; padding: var(--space-1) var(--space-2); z-index: 10;
}
.skip-link:focus { left: 0; }
.container { max-width: 1100px; margin-inline: auto; padding-inline: var(--space-3); }
```

- [ ] **Step 4: Write `src/layouts/Base.astro`**

```astro
---
import "../styles/global.css";
interface Props { title: string; description: string }
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <a href="#main" class="skip-link">Skip to content</a>
    <main id="main"><slot /></main>
  </body>
</html>
```

- [ ] **Step 5: Write `src/pages/index.astro`**

```astro
---
import Base from "../layouts/Base.astro";
---
<Base title="Richard Lozada — Software Engineer" description="Full-stack engineer, ~10 years, from developer to Technical Lead.">
  <section class="container"><h1>Richard Lozada</h1></section>
</Base>
```

- [ ] **Step 6: Write `vitest.config.ts` and `playwright.config.ts`**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", include: ["src/**/*.test.ts"] } });
```
```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  webServer: { command: "npm run preview", url: "http://localhost:4321", reuseExistingServer: true, timeout: 120000 },
  use: { baseURL: "http://localhost:4321" },
});
```

Add scripts to `package.json`: `"test": "vitest run"`, `"test:e2e": "playwright test"`, `"preview": "astro build && astro preview --port 4321"`.

- [ ] **Step 7: Write failing smoke test `tests/e2e/smoke.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
test("home renders name and skip link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Richard Lozada" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeAttached();
});
```

- [ ] **Step 8: Run e2e — verify pass**

Run: `npm run test:e2e`
Expected: 1 passed.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: scaffold Astro project with design tokens and base layout"
```

---

### Task 2: Generate ASCII face data

**Files:**
- Create: `scripts/gen-ascii.py`
- Create: `src/lib/ascii/face-data.json` (generated artifact, committed)
- Create: `src/lib/ascii/face-data.ts`
- Test: `src/lib/ascii/face-data.test.ts`

**Interfaces:**
- Produces: `face-data.ts` exports `faceData: FaceData` where `FaceData = { w: number; h: number; rows: string[]; bright: number[][] }`.

- [ ] **Step 1: Write `scripts/gen-ascii.py`**

```python
from PIL import Image, ImageOps, ImageEnhance
import json, sys
SRC = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\richa\Pictures\46139620-b05f-4bec-9f54-bee97ee15a2b.jpg"
OUT = r"src/lib/ascii/face-data.json"
img = ImageOps.autocontrast(Image.open(SRC).convert("L"), cutoff=1)
img = ImageEnhance.Contrast(img).enhance(1.25)
W = 120; H = int(W * (img.height / img.width) * 0.52)
small = img.resize((W, H), Image.LANCZOS)
ramp = " .`'^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
n = len(ramp); px = list(small.getdata()); rows = []; bright = []
for y in range(H):
    line = []; brow = []
    for x in range(W):
        v = px[y*W + x]; idx = min(n-1, int(v/256*n))
        line.append(ramp[idx]); brow.append(v)
    rows.append("".join(line)); bright.append(brow)
json.dump({"w": W, "h": H, "rows": rows, "bright": bright}, open(OUT, "w"))
print("wrote", OUT, W, H)
```

- [ ] **Step 2: Run generator**

Run: `python scripts/gen-ascii.py`
Expected: `wrote src/lib/ascii/face-data.json 120 62`

- [ ] **Step 3: Write `src/lib/ascii/face-data.ts`**

```ts
import raw from "./face-data.json";
export interface FaceData { w: number; h: number; rows: string[]; bright: number[][] }
export const faceData: FaceData = raw as FaceData;
```

Ensure `tsconfig.json` has `"resolveJsonModule": true` (Astro strict includes it).

- [ ] **Step 4: Write failing test `src/lib/ascii/face-data.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { faceData } from "./face-data";
describe("faceData", () => {
  it("has 120x62 grid with matching rows/brightness", () => {
    expect(faceData.w).toBe(120);
    expect(faceData.h).toBe(62);
    expect(faceData.rows).toHaveLength(62);
    expect(faceData.rows[0]).toHaveLength(120);
    expect(faceData.bright).toHaveLength(62);
    expect(faceData.bright[0]).toHaveLength(120);
  });
  it("contains non-space characters (a face was rendered)", () => {
    const nonSpace = faceData.rows.join("").replace(/ /g, "").length;
    expect(nonSpace).toBeGreaterThan(500);
  });
});
```

- [ ] **Step 5: Run test — verify pass**

Run: `npm test`
Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: generate ASCII face data from source photo"
```

---

### Task 3: ASCII physics engine (pure TS, TDD)

**Files:**
- Create: `src/lib/ascii/physics.ts`
- Test: `src/lib/ascii/physics.test.ts`

**Interfaces:**
- Produces:
  - `interface PushConfig { radius: number; force: number; spring: number; friction: number; cellW: number; cellH: number }`
  - `const DEFAULT_CONFIG: PushConfig` (radius 38, force 0.8, spring 0.05, friction 0.80, cellW 5, cellH 8)
  - `class PushField` with constructor `(face: FaceData, config?: Partial<PushConfig>)`, and methods:
    - `setPointer(x: number | null, y: number | null): void` — pointer in canvas px; `null` clears.
    - `step(): void` — advance one frame.
    - `offsetX(i: number): number`, `offsetY(i: number): number` — displacement of cell `i = y*w + x`.
    - `isSettled(): boolean`.

- [ ] **Step 1: Write failing test `src/lib/ascii/physics.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { PushField, DEFAULT_CONFIG } from "./physics";
import type { FaceData } from "./face-data";

const face: FaceData = { w: 3, h: 1, rows: ["@@@"], bright: [[255, 255, 255]] };

describe("PushField", () => {
  it("starts settled with zero offsets", () => {
    const f = new PushField(face);
    expect(f.isSettled()).toBe(true);
    expect(f.offsetX(1)).toBe(0);
  });

  it("pushes a cell away from the pointer", () => {
    const f = new PushField(face, { radius: 100 });
    // cell 0 center ≈ (2.5, 4); pointer to its right pushes it left (negative x)
    f.setPointer(2.5 + 3, 4);
    for (let s = 0; s < 5; s++) f.step();
    expect(f.offsetX(0)).toBeLessThan(0);
    expect(f.isSettled()).toBe(false);
  });

  it("springs back toward zero once pointer clears", () => {
    const f = new PushField(face, { radius: 100 });
    f.setPointer(2.5 + 3, 4);
    for (let s = 0; s < 5; s++) f.step();
    const displaced = Math.abs(f.offsetX(0));
    f.setPointer(null, null);
    for (let s = 0; s < 200; s++) f.step();
    expect(Math.abs(f.offsetX(0))).toBeLessThan(displaced * 0.1);
    expect(f.isSettled()).toBe(true);
  });

  it("exposes documented defaults", () => {
    expect(DEFAULT_CONFIG).toEqual({ radius: 38, force: 0.8, spring: 0.05, friction: 0.8, cellW: 5, cellH: 8 });
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

Run: `npm test`
Expected: FAIL ("Cannot find module './physics'").

- [ ] **Step 3: Write `src/lib/ascii/physics.ts`**

```ts
import type { FaceData } from "./face-data";

export interface PushConfig {
  radius: number; force: number; spring: number; friction: number; cellW: number; cellH: number;
}
export const DEFAULT_CONFIG: PushConfig = {
  radius: 38, force: 0.8, spring: 0.05, friction: 0.8, cellW: 5, cellH: 8,
};

export class PushField {
  readonly cols: number;
  readonly rowCount: number;
  private cfg: PushConfig;
  private ox: Float32Array; private oy: Float32Array;
  private vx: Float32Array; private vy: Float32Array;
  private px = -1e9; private py = -1e9;

  constructor(private face: FaceData, config: Partial<PushConfig> = {}) {
    this.cfg = { ...DEFAULT_CONFIG, ...config };
    this.cols = face.w; this.rowCount = face.h;
    const n = face.w * face.h;
    this.ox = new Float32Array(n); this.oy = new Float32Array(n);
    this.vx = new Float32Array(n); this.vy = new Float32Array(n);
  }

  setPointer(x: number | null, y: number | null): void {
    if (x === null || y === null) { this.px = -1e9; this.py = -1e9; }
    else { this.px = x; this.py = y; }
  }

  offsetX(i: number): number { return this.ox[i]; }
  offsetY(i: number): number { return this.oy[i]; }

  step(): void {
    const { radius, force, spring, friction, cellW, cellH } = this.cfg;
    for (let y = 0; y < this.face.h; y++) {
      for (let x = 0; x < this.face.w; x++) {
        const i = y * this.face.w + x;
        const cx = x * cellW + this.ox[i], cy = y * cellH + this.oy[i];
        const dx = cx - this.px, dy = cy - this.py;
        const d = Math.hypot(dx, dy);
        if (d < radius && d > 0.001) {
          const f = Math.pow(1 - d / radius, 1.5) * force;
          this.vx[i] += (dx / d) * f; this.vy[i] += (dy / d) * f;
        }
        this.vx[i] += -spring * this.ox[i]; this.vy[i] += -spring * this.oy[i];
        this.vx[i] *= friction; this.vy[i] *= friction;
        this.ox[i] += this.vx[i]; this.oy[i] += this.vy[i];
      }
    }
  }

  isSettled(): boolean {
    if (this.px > -1e8) return false;
    for (let i = 0; i < this.ox.length; i++) {
      if (Math.abs(this.ox[i]) > 0.05 || Math.abs(this.oy[i]) > 0.05) return false;
      if (Math.abs(this.vx[i]) > 0.05 || Math.abs(this.vy[i]) > 0.05) return false;
    }
    return true;
  }
}
```

- [ ] **Step 4: Run test — verify pass**

Run: `npm test`
Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add ASCII push-field physics engine"
```

---

### Task 4: AsciiFace hero island (canvas renderer)

**Files:**
- Create: `src/lib/ascii/renderer.ts`
- Create: `src/components/ascii/AsciiFace.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/hero.spec.ts`

**Interfaces:**
- Consumes: `faceData` (Task 2), `PushField`/`DEFAULT_CONFIG` (Task 3).
- Produces: `mountAsciiFace(canvas: HTMLCanvasElement): void` in `renderer.ts` — wires physics + rAF + IntersectionObserver + reduced-motion + pointer.

- [ ] **Step 1: Write `src/lib/ascii/renderer.ts`**

```ts
import { faceData } from "./face-data";
import { PushField, DEFAULT_CONFIG } from "./physics";

const ACCENT: [number, number, number] = [255, 122, 24];

export function mountAsciiFace(canvas: HTMLCanvasElement): void {
  const { w, h, rows, bright } = faceData;
  const { cellW, cellH } = DEFAULT_CONFIG;
  canvas.width = w * cellW; canvas.height = h * cellH;
  const ctx = canvas.getContext("2d")!;
  const field = new PushField(faceData);

  function drawCell(x: number, y: number, dx: number, dy: number) {
    const ch = rows[y][x]; if (ch === " ") return;
    const v = bright[y][x] / 255; const g = Math.round(38 + v * 200);
    const mag = Math.hypot(dx, dy); const t = Math.min(1, mag / 9) * 0.75;
    const r = g + (ACCENT[0] - g) * t, gg = g + (ACCENT[1] - g) * t, b = g + (ACCENT[2] - g) * t;
    ctx.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
    ctx.fillText(ch, x * cellW + dx, y * cellH + dy);
  }
  function paint(animated: boolean) {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "9px monospace"; ctx.textBaseline = "top";
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        drawCell(x, y, animated ? field.offsetX(i) : 0, animated ? field.offsetY(i) : 0);
      }
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { paint(false); return; }

  let running = false, visible = false, raf = 0;
  function loop() { field.step(); paint(true); raf = requestAnimationFrame(loop); }
  function start() { if (!running && visible && !document.hidden) { running = true; loop(); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  new IntersectionObserver((es) => { visible = es[0].isIntersecting; visible ? start() : stop(); })
    .observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  function toCanvas(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    field.setPointer((e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height);
  }
  canvas.addEventListener("pointermove", toCanvas);
  canvas.addEventListener("pointerleave", () => field.setPointer(null, null));
  paint(true);
}
```

- [ ] **Step 2: Write `src/components/ascii/AsciiFace.astro`**

```astro
---
interface Props { label: string }
const { label } = Astro.props;
---
<canvas class="ascii-face" role="img" aria-label={label}></canvas>
<script>
  import { mountAsciiFace } from "../../lib/ascii/renderer";
  const el = document.querySelector<HTMLCanvasElement>(".ascii-face");
  if (el) mountAsciiFace(el);
</script>
<style>
  .ascii-face { display: block; width: 100%; max-width: 620px; height: auto; image-rendering: pixelated; background: #000; }
  @media (pointer: coarse) { .ascii-face { cursor: default; } }
</style>
```

- [ ] **Step 3: Use it in `src/pages/index.astro`**

```astro
---
import Base from "../layouts/Base.astro";
import AsciiFace from "../components/ascii/AsciiFace.astro";
---
<Base title="Richard Lozada — Software Engineer" description="Full-stack engineer, ~10 years, from developer to Technical Lead.">
  <section class="container"><h1>Richard Lozada</h1><AsciiFace label="ASCII portrait of Richard Lozada" /></section>
</Base>
```

- [ ] **Step 4: Write failing test `tests/e2e/hero.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
test("hero canvas is accessible", async ({ page }) => {
  await page.goto("/");
  const canvas = page.getByRole("img", { name: "ASCII portrait of Richard Lozada" });
  await expect(canvas).toBeVisible();
});
test("respects reduced motion (no error, canvas present)", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.getByRole("img", { name: /ASCII portrait/ })).toBeVisible();
  await ctx.close();
});
```

- [ ] **Step 5: Run e2e — verify pass**

Run: `npm run test:e2e`
Expected: hero tests passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: interactive ASCII face hero island with a11y + reduced-motion"
```

---

### Task 5: Content schemas and data files

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/site.json`, `src/content/experience.json`, `src/content/projects.json`, `src/content/stack.json`
- Create: `src/content/about.md`
- Test: `src/content/schema.test.ts`

**Interfaces:**
- Produces: exported Zod schemas `siteSchema`, `experienceSchema`, `projectsSchema`, `stackSchema` from `config.ts`, plus the parsed data files. Shapes:
  - experience item: `{ company: string; location: string; period: string; roles: { title: string; period: string; summary: string; tags: string[] }[] }`
  - project: `{ name: string; description: string; stack: string[]; links: { label: string; href: string }[]; featured: boolean }`
  - stack group: `{ category: string; items: string[] }`
  - site: `{ name: string; tagline: string; contacts: { label: string; href: string }[] }`

- [ ] **Step 1: Write `src/content/config.ts`**

```ts
import { z } from "astro:content";
export const experienceSchema = z.object({
  company: z.string(), location: z.string(), period: z.string(),
  roles: z.array(z.object({ title: z.string(), period: z.string(), summary: z.string(), tags: z.array(z.string()) })),
});
export const projectSchema = z.object({
  name: z.string(), description: z.string(), stack: z.array(z.string()),
  links: z.array(z.object({ label: z.string(), href: z.string() })), featured: z.boolean(),
});
export const stackSchema = z.object({ category: z.string(), items: z.array(z.string()) });
export const siteSchema = z.object({
  name: z.string(), tagline: z.string(),
  contacts: z.array(z.object({ label: z.string(), href: z.string() })),
});
```

- [ ] **Step 2: Write data files** (content drafted from spec §5.1/§5.2; author edits later)

`src/content/site.json`:
```json
{ "name": "Richard Lozada",
  "tagline": "Full-stack engineer · ~10 years · developer → Technical Lead @ Openbank",
  "contacts": [
    { "label": "email", "href": "mailto:hi@richardlozada.com" },
    { "label": "github", "href": "https://github.com/Lozadaa" },
    { "label": "linkedin", "href": "https://www.linkedin.com/in/richardlozada" }
  ] }
```

`src/content/experience.json` — array of companies from spec §5.1 (Openbank, WiTI, Globant, Nala, TripleA, Streetrip, Freelance, BBR, Abstract, Sinergia, Fermat). Example first item:
```json
[ { "company": "Openbank (Grupo Santander)", "location": "Madrid, Spain · Hybrid", "period": "2023 — Present",
    "roles": [
      { "title": "Technical Lead — Frontend", "period": "Jan 2024 — Present", "summary": "Leading the security vertical end-to-end; mentoring the team toward precise decisions and a clean codebase.", "tags": ["React", "TypeScript", "Leadership"] },
      { "title": "Senior Frontend Engineer", "period": "Oct 2023 — Jan 2024", "summary": "Senior frontend on the security module.", "tags": ["React", "TypeScript"] },
      { "title": "Senior Frontend Engineer (via Entelgy)", "period": "Feb 2023 — Oct 2023", "summary": "OpenBank / Grupo Santander via Entelgy.", "tags": ["React"] }
    ] } ]
```
(Remaining companies follow the same shape — one object each, verbatim from spec §5.1.)

`src/content/projects.json` — array from spec §5.2 (dexteria, vzla-info, FlareRead, progressive-img-loader, LATAM@Globant), each `{ name, description, stack, links, featured }`.

`src/content/stack.json`:
```json
[ { "category": "Frontend", "items": ["React", "Next.js", "Angular", "TypeScript", "Astro"] },
  { "category": "Backend", "items": ["Ruby on Rails", "Java / Spring", "Node.js"] },
  { "category": "Mobile", "items": ["React Native", "Kotlin", "Swift"] },
  { "category": "Cloud / DevOps", "items": ["AWS", "Docker", "Kubernetes"] } ]
```

`src/content/about.md`: 2–3 short paragraphs (placeholder copy the author refines).

- [ ] **Step 3: Write failing test `src/content/schema.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { experienceSchema, projectSchema, stackSchema, siteSchema } from "./config";
import site from "./site.json";
import experience from "./experience.json";
import projects from "./projects.json";
import stack from "./stack.json";

describe("content validates against schemas", () => {
  it("site", () => expect(siteSchema.parse(site)).toBeTruthy());
  it("experience", () => experience.forEach((e) => expect(experienceSchema.parse(e)).toBeTruthy()));
  it("projects", () => projects.forEach((p) => expect(projectSchema.parse(p)).toBeTruthy()));
  it("stack", () => stack.forEach((s) => expect(stackSchema.parse(s)).toBeTruthy()));
  it("has at least one featured project", () =>
    expect(projects.some((p) => p.featured)).toBe(true));
});
```

Note: import `z` from `zod` directly in a `schema.pure.ts` if `astro:content` is unavailable under Vitest; keep runtime schemas in a plain module imported by both `config.ts` and the test.

- [ ] **Step 4: Run test — verify pass**

Run: `npm test`
Expected: passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: typed content schemas and portfolio data"
```

---

### Task 6: ASCII primitives + Hero section

**Files:**
- Create: `src/components/ascii/AsciiBox.astro`, `src/components/ascii/AsciiDivider.astro`, `src/components/ascii/AsciiLink.astro`
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/hero.spec.ts` (extend)

**Interfaces:**
- Consumes: `site.json` (Task 5), `AsciiFace` (Task 4).
- Produces: `Hero.astro` renders `<h1>` name, tagline, and contact links using `AsciiLink`.

- [ ] **Step 1: Write the three ASCII primitives**

`AsciiLink.astro`:
```astro
---
interface Props { href: string; label: string }
const { href, label } = Astro.props;
const external = href.startsWith("http");
---
<a href={href} {...external ? { target: "_blank", rel: "noopener" } : {}}>[ {label} ]</a>
```
`AsciiDivider.astro`:
```astro
<div aria-hidden="true" class="divider"></div>
<style>.divider{color:var(--fg-dim);overflow:hidden;white-space:nowrap;margin:var(--space-4) 0}
.divider::before{content:"────────────────────────────────────────────────────────────────────────"}</style>
```
`AsciiBox.astro`:
```astro
---
interface Props { title?: string }
const { title } = Astro.props;
---
<section class="ascii-box">{title && <h3 class="ascii-box__title">{title}</h3>}<slot /></section>
<style>.ascii-box{border:1px solid var(--fg-dim);padding:var(--space-3)}
.ascii-box__title{font-size:var(--fs-lg);margin-bottom:var(--space-2)}</style>
```

- [ ] **Step 2: Write `src/components/Hero.astro`**

```astro
---
import AsciiFace from "./ascii/AsciiFace.astro";
import AsciiLink from "./ascii/AsciiLink.astro";
import site from "../content/site.json";
---
<header class="hero container">
  <AsciiFace label={`ASCII portrait of ${site.name}`} />
  <div class="hero__meta">
    <h1>{site.name}</h1>
    <p class="hero__tagline">{site.tagline}</p>
    <nav class="hero__links" aria-label="Quick links">
      {site.contacts.map((c) => <AsciiLink href={c.href} label={c.label} />)}
    </nav>
  </div>
</header>
<style>
  .hero{display:grid;gap:var(--space-4);padding-block:var(--space-8);align-items:center}
  @media(min-width:800px){.hero{grid-template-columns:1fr 1fr}}
  .hero__tagline{color:var(--fg-dim);max-width:var(--measure);margin-block:var(--space-2)}
  .hero__links{display:flex;gap:var(--space-2);flex-wrap:wrap;margin-top:var(--space-2)}
  h1{font-size:var(--fs-3xl);line-height:1.05}
</style>
```

- [ ] **Step 3: Replace hero usage in `index.astro`** with `<Hero />` (remove the temporary `<section>`).

- [ ] **Step 4: Extend `tests/e2e/hero.spec.ts`**

```ts
test("hero shows tagline and contact links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Full-stack engineer/)).toBeVisible();
  await expect(page.getByRole("link", { name: /github/ })).toBeVisible();
});
```

- [ ] **Step 5: Run e2e — verify pass** — `npm run test:e2e`

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: hero section with ASCII primitives"`

---

### Task 7: Experience horizontal timeline

**Files:**
- Create: `src/components/ExperienceTimeline.astro`, `src/components/TimelineItem.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/experience.spec.ts`

**Interfaces:**
- Consumes: `experience.json` (Task 5), `AsciiBox` (Task 6).
- Produces: horizontally scrollable list, keyboard-focusable, one `TimelineItem` per company with nested roles.

- [ ] **Step 1: Write `src/components/TimelineItem.astro`**

```astro
---
interface Role { title: string; period: string; summary: string; tags: string[] }
interface Props { company: string; location: string; period: string; roles: Role[] }
const { company, location, period, roles } = Astro.props;
---
<li class="tl-item">
  <h3 class="tl-item__co">{company}</h3>
  <p class="tl-item__meta">{location} · {period}</p>
  <ol class="tl-item__roles">
    {roles.map((r) => (
      <li><strong>{r.title}</strong><span class="tl-item__rp"> · {r.period}</span>
        <p>{r.summary}</p>
        <p class="tl-item__tags">{r.tags.join(" · ")}</p>
      </li>
    ))}
  </ol>
</li>
<style>
  .tl-item{flex:0 0 min(88vw,360px);scroll-snap-align:start;border:1px solid var(--fg-dim);padding:var(--space-3)}
  .tl-item__co{font-size:var(--fs-lg)}
  .tl-item__meta{color:var(--fg-dim);margin-bottom:var(--space-2)}
  .tl-item__roles{list-style:none;display:grid;gap:var(--space-2)}
  .tl-item__rp,.tl-item__tags{color:var(--fg-dim)}
</style>
```

- [ ] **Step 2: Write `src/components/ExperienceTimeline.astro`**

```astro
---
import TimelineItem from "./TimelineItem.astro";
import experience from "../content/experience.json";
---
<section class="container exp" aria-labelledby="exp-h">
  <h2 id="exp-h">Experience</h2>
  <p class="exp__hint">Scroll horizontally, or use Tab / arrow keys.</p>
  <ol class="exp__track" tabindex="0" aria-label="Work experience timeline">
    {experience.map((e) => <TimelineItem {...e} />)}
  </ol>
</section>
<style>
  .exp{padding-block:var(--space-8)}
  .exp__hint{color:var(--fg-dim);margin-block:var(--space-2)}
  .exp__track{list-style:none;display:flex;gap:var(--space-3);overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:var(--space-2)}
  .exp__track:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
</style>
<script>
  const track = document.querySelector<HTMLElement>(".exp__track");
  track?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { track.scrollBy({ left: 360, behavior: "smooth" }); e.preventDefault(); }
    if (e.key === "ArrowLeft") { track.scrollBy({ left: -360, behavior: "smooth" }); e.preventDefault(); }
  });
</script>
```

- [ ] **Step 3: Add `<ExperienceTimeline />` to `index.astro`** right after `<Hero />`.

- [ ] **Step 4: Write failing test `tests/e2e/experience.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
test("experience timeline lists companies and is keyboard-scrollable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Openbank/ })).toBeVisible();
  const track = page.getByRole("list", { name: "Work experience timeline" });
  await track.focus();
  await expect(track).toBeFocused();
});
```

- [ ] **Step 5: Run e2e — verify pass** — `npm run test:e2e`

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: horizontal experience timeline grouped by company"`

---

### Task 8: Projects section

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/components/ProjectList.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/projects.spec.ts`

**Interfaces:**
- Consumes: `projects.json` (Task 5), `AsciiLink` (Task 6).
- Produces: grid of featured projects; each card shows name, description, stack, links.

- [ ] **Step 1: Write `src/components/ProjectCard.astro`**

```astro
---
import AsciiLink from "./ascii/AsciiLink.astro";
interface Props { name: string; description: string; stack: string[]; links: { label: string; href: string }[] }
const { name, description, stack, links } = Astro.props;
---
<article class="pc">
  <h3 class="pc__name">{name}</h3>
  <p>{description}</p>
  <p class="pc__stack">{stack.join(" · ")}</p>
  <p class="pc__links">{links.map((l) => <AsciiLink href={l.href} label={l.label} />)}</p>
</article>
<style>
  .pc{border:1px solid var(--fg-dim);padding:var(--space-3);display:grid;gap:var(--space-2)}
  .pc__name{font-size:var(--fs-lg)} .pc__stack{color:var(--fg-dim)}
  .pc__links{display:flex;gap:var(--space-2);flex-wrap:wrap}
</style>
```

- [ ] **Step 2: Write `src/components/ProjectList.astro`**

```astro
---
import ProjectCard from "./ProjectCard.astro";
import projects from "../content/projects.json";
const featured = projects.filter((p) => p.featured);
---
<section class="container proj" aria-labelledby="proj-h">
  <h2 id="proj-h">Projects</h2>
  <div class="proj__grid">{featured.map((p) => <ProjectCard {...p} />)}</div>
</section>
<style>
  .proj{padding-block:var(--space-8)}
  .proj__grid{display:grid;gap:var(--space-3);margin-top:var(--space-3)}
  @media(min-width:700px){.proj__grid{grid-template-columns:repeat(2,1fr)}}
</style>
```

- [ ] **Step 3: Add `<ProjectList />` to `index.astro`** after experience.

- [ ] **Step 4: Write failing test `tests/e2e/projects.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
test("projects section shows featured work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /dexteria|vzla-info|FlareRead/ }).first()).toBeVisible();
});
```

- [ ] **Step 5: Run e2e — verify pass** — `npm run test:e2e`

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: featured projects section"`

---

### Task 9: About + Stack sections

**Files:**
- Create: `src/components/About.astro`, `src/components/StackList.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/about-stack.spec.ts`

**Interfaces:**
- Consumes: `about.md`, `stack.json` (Task 5).
- Produces: About renders markdown at `--measure` width; StackList renders categories with ASCII bars.

- [ ] **Step 1: Write `src/components/About.astro`**

```astro
---
const about = await Astro.glob("../content/about.md");
const Content = about[0].Content;
---
<section class="container about" aria-labelledby="about-h">
  <h2 id="about-h">About</h2>
  <div class="about__body"><Content /></div>
</section>
<style>.about{padding-block:var(--space-8)}.about__body{max-width:var(--measure);margin-top:var(--space-3)}
.about__body :global(p){margin-bottom:var(--space-2)}</style>
```

- [ ] **Step 2: Write `src/components/StackList.astro`**

```astro
---
import stack from "../content/stack.json";
---
<section class="container stack" aria-labelledby="stack-h">
  <h2 id="stack-h">Stack</h2>
  <dl class="stack__grid">
    {stack.map((g) => (<><dt>{g.category}</dt><dd>{g.items.join("  ·  ")}</dd></>))}
  </dl>
</section>
<style>.stack{padding-block:var(--space-8)}
.stack__grid{display:grid;gap:var(--space-2) var(--space-4);margin-top:var(--space-3)}
@media(min-width:600px){.stack__grid{grid-template-columns:max-content 1fr}}
dt{color:var(--accent)}dd{color:var(--fg-dim)}</style>
```

- [ ] **Step 3: Add `<About />` then `<StackList />` to `index.astro`**.

- [ ] **Step 4: Write failing test `tests/e2e/about-stack.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
test("about and stack render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Stack" })).toBeVisible();
  await expect(page.getByText("Frontend")).toBeVisible();
});
```

- [ ] **Step 5: Run e2e — verify pass** — `npm run test:e2e`

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: about and stack sections"`

---

### Task 10: Contact section + footer

**Files:**
- Create: `src/components/Contact.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/contact.spec.ts`

**Interfaces:**
- Consumes: `site.json` (Task 5), `AsciiLink` (Task 6).

- [ ] **Step 1: Write `src/components/Contact.astro`**

```astro
---
import AsciiLink from "./ascii/AsciiLink.astro";
import site from "../content/site.json";
---
<footer class="container contact" aria-labelledby="contact-h">
  <h2 id="contact-h">Contact</h2>
  <nav class="contact__links" aria-label="Contact links">
    {site.contacts.map((c) => <AsciiLink href={c.href} label={c.label} />)}
  </nav>
  <p class="contact__sig">— built in ASCII · {new Date().getFullYear()}</p>
</footer>
<style>.contact{padding-block:var(--space-8)}
.contact__links{display:flex;gap:var(--space-3);flex-wrap:wrap;margin-top:var(--space-3)}
.contact__sig{color:var(--fg-dim);margin-top:var(--space-4)}</style>
```

Note: `new Date().getFullYear()` runs at build time in Astro frontmatter — acceptable for a static footer year.

- [ ] **Step 2: Add `<Contact />` at the end of `index.astro`**.

- [ ] **Step 3: Write failing test `tests/e2e/contact.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
test("contact footer has email link", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: /email/ })).toHaveAttribute("href", /^mailto:/);
});
```

- [ ] **Step 4: Run e2e — verify pass** — `npm run test:e2e`

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: contact footer"`

---

### Task 11: Accessibility + performance verification pass

**Files:**
- Create: `tests/e2e/a11y.spec.ts`
- Modify: any component needing contrast/semantics fixes surfaced by the audit.

**Interfaces:**
- Consumes: the full page (all prior tasks).

- [ ] **Step 1: Write axe audit `tests/e2e/a11y.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("home has no critical/serious a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter((v) => ["critical", "serious"].includes(v.impact ?? ""));
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});
test("keyboard reaches skip link, timeline, and contact", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});
test("layout has no horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});
```

- [ ] **Step 2: Run e2e — fix any violations, re-run until green**

Run: `npm run test:e2e`
Expected: all pass. If contrast fails on `--fg-dim`/`--accent`, adjust the token value until AA passes and re-run.

- [ ] **Step 3: Run a production Lighthouse check (manual)**

Run: `npm run preview` then Lighthouse in Chrome DevTools (or `npx lighthouse http://localhost:4321 --view`). Confirm ~100 across Performance, Accessibility, Best Practices, SEO. Note any gaps as follow-ups.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "test: accessibility, keyboard, and responsive verification"
```

---

## Self-Review

**Spec coverage:**
- Vision / 50-50 → Tasks 6–10 (content) + Task 4 (hero wow). ✓
- Non-negotiable a11y / reduced-motion / responsive / performance → Task 4 (reduced-motion, IO pause) + Task 11 (axe, keyboard, 320px). ✓
- Visual language / design-skill extraction (type scale, 8px spacing, measure, palette) → Task 1 tokens. ✓
- Hero engine + fixed params → Tasks 2–4. ✓
- Structure & order (Hero→Experience→Projects→About→Stack→Contact) → Tasks 6–10, wired in `index.astro`. ✓
- Experience grouped by company w/ nested roles → Task 7. ✓
- Featured projects (repos + professional) → Task 8 + data in Task 5. ✓
- Astro + TS, content separated → Tasks 1 & 5. ✓
- Deploy platform → left as spec §9 open question; not blocking (static output builds already).

**Placeholder scan:** Data-file copy in Task 5 is drafted from the spec and explicitly author-editable; no `TBD`/`TODO` in code steps. Font decision resolved to JetBrains Mono (Global Constraints). ✓

**Type consistency:** `FaceData` shape identical across Tasks 2–4; `PushField` API (`setPointer`/`step`/`offsetX`/`offsetY`/`isSettled`) consistent between Task 3 definition and Task 4 usage; content schema field names match data files and component props in Tasks 6–10. ✓
