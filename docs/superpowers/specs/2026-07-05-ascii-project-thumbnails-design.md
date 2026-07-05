# ASCII Project Thumbnails — Design

**Date:** 2026-07-05
**Status:** Approved (pending spec review)
**Branch:** `feat/ascii-project-thumbnails`

## Goal

Give each portfolio project the same treatment the hero face gets: a screenshot of the
project's live page, converted to ASCII and rendered on an interactive canvas with the existing
push-the-characters physics (orange-on-black, idle drift, pointer push). The result appears as a
thumbnail at the top of each project card.

## Context (existing pipeline)

The face already works like this:

- `scripts/gen-ascii.py` — Pillow: image → grayscale + autocontrast → resize to `W=120` chars →
  brightness ramp → writes `src/lib/ascii/face-data.json` as `{ w, h, rows[], bright[][] }`.
- `src/lib/ascii/physics.ts` — `PushField` class. **Already generic**: its constructor takes any
  `{ w, h }` data and drives the push/idle/twitch simulation. Not face-specific.
- `src/lib/ascii/renderer.ts` — `mountAsciiFace(canvas)`. **Hardcoded** to import `faceData`.
- `src/components/ascii/AsciiFace.astro` — canvas + `mountAsciiFace(el)`.
- `src/components/ProjectCard.astro` — renders name/description/stack/links. No ASCII today.
- `src/content/projects.json` — 6 featured projects, each with a first `web →` link.

Because the physics is already generic, this feature is mostly: (1) a generation script, and
(2) generalizing the renderer so any data can be mounted.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Placement | Thumbnail canvas at the top of each `ProjectCard`, ~140px tall, interactive push effect |
| Trigger | Manual: `npm run gen:projects` (author runs, commits output) — mirrors the face workflow |
| Capture | Above-the-fold viewport, 1280×800, cropped to the thumbnail aspect |
| Conversion | Reuse `gen-ascii.py` (generalized) so the ASCII treatment is identical to the face |
| Width | `W ≈ 100` chars for project thumbnails (lighter than the face's 120) |
| Scope | All 6 featured projects that have a `web →` link |

## Architecture

### 1. Generation process — `scripts/gen-projects.mjs` (Node, ESM)

1. Read `src/content/projects.json`. For each project, take the first `links[]` entry whose
   `label` starts with `web` (the live URL). Skip projects with no web link.
2. Launch a browser with `playwright-core` and screenshot each URL:
   - viewport `1280×800`, `waitUntil: "networkidle"` with a bounded timeout (e.g. 20s),
   - capture the **viewport** (not full page), write a temp PNG.
   - Browser resolution: `playwright-core` does not bundle browsers. Launch chromium with
     `channel: "chrome"` (use the system Chrome/Edge). Document the `npx playwright install
     chromium` fallback in the script header if no channel browser is found.
3. For each PNG, run `python scripts/gen-ascii.py <png> <out.json> --width 100` and collect the
   resulting `{ w, h, rows, bright }`.
4. Merge all results into a single `src/lib/ascii/projects-data.json` keyed by slug.

Slug = kebab-case of the project `name` (e.g. `"Vzla Terremoto Info"` → `vzla-terremoto-info`).
The same slug function is used by the generator and the component so lookups always match.

### 2. Generalized converter — `scripts/gen-ascii.py`

Parameterize the currently-hardcoded script:

- `argv[1]` = input image (already supported),
- `argv[2]` = output JSON path (currently hardcoded to `face-data.json`),
- `--width N` = ramp width (default 120, so the face's existing invocation is unchanged).

Everything else (grayscale, autocontrast cutoff=1, contrast 1.25, LANCZOS resize, the ramp, the
`0.52` character-aspect factor, the `{w,h,rows,bright}` shape) stays identical. This guarantees the
project ASCII looks like the face ASCII.

### 3. Data storage — `src/lib/ascii/projects-data.json`

```json
{
  "skillsmith":   { "w": 100, "h": 32, "rows": ["..."], "bright": [[...]] },
  "juegamundial": { "w": 100, "h": 32, "rows": ["..."], "bright": [[...]] }
}
```

A single keyed file (not per-project files) so the component imports one module and looks up by
slug. Committed to git like `face-data.json` is.

### 4. Renderer generalization — `src/lib/ascii/renderer.ts`

- Add `mountAscii(canvas: HTMLCanvasElement, data: AsciiData, config?: Partial<PushConfig>): void`
  containing the current body of `mountAsciiFace`, but reading `data` instead of the imported
  `faceData`. The `ACCENT`, `drawCell`, IntersectionObserver, visibility, pointer, and
  reduced-motion logic are unchanged.
- Keep `mountAsciiFace(canvas)` as a one-line wrapper: `mountAscii(canvas, faceData)`. The hero is
  untouched behaviorally.
- `AsciiData` type = `{ w:number; h:number; rows:string[]; bright:number[][] }` (matches `FaceData`).

### 5. Component — `src/components/ascii/AsciiProject.astro`

- Props: `slug: string`, `label: string`.
- Renders `<canvas class="ascii-project" role="img" aria-label={label}>`.
- Client script imports `projects-data.json`, looks up `data[slug]`; if present, calls
  `mountAscii(canvas, data[slug])`. If absent, removes/leaves the canvas empty (card renders
  text-only).
- Styles mirror `AsciiFace` (black bg, `image-rendering: pixelated`, `width:100%`, capped height).

### 6. ProjectCard integration — `src/components/ProjectCard.astro`

- Add a `slug` prop (computed by the parent `ProjectList` from `name`, or computed inline).
- When ASCII data exists for `slug`, render `<AsciiProject slug={slug} label={`${name} preview`} />`
  above `<h3 class="pc__name">`. Otherwise render the card exactly as today.
- `ProjectList.astro` passes the slug through.

## Error handling & degradation

- **Dead / slow URL:** on navigation failure or timeout, log a warning, **do not overwrite** any
  existing entry for that slug (keep the last good ASCII), and continue to the next project.
- **No browser available:** the script fails fast with a clear message pointing to
  `npx playwright install chromium` or installing Chrome; it does not silently produce empty data.
- **Missing data at render time:** `AsciiProject` renders nothing (no canvas); the card degrades to
  the current text-only layout. No layout shift beyond the absent thumbnail.
- **End-of-run summary:** the script prints `generated: [...]`, `skipped (no web link): [...]`,
  `failed (kept previous): [...]`.

## Performance & accessibility

- Each canvas animates only while on-screen (existing `IntersectionObserver`) and pauses on
  `visibilitychange`, so six thumbnails never all run at once.
- `prefers-reduced-motion: reduce` → single static paint (existing behavior in the renderer).
- The card's real content (name link, description, stack, links) stays as text/anchors; the canvas
  is decorative-but-labeled (`role="img"` + `aria-label`), so screen readers and SEO are unaffected.
- `W=100` keeps each canvas small (≈100×32 cells) to bound per-frame work.

## Testing / verification

1. `python scripts/gen-ascii.py <sample.png> /tmp/out.json --width 100` → valid JSON with the
   `{w,h,rows,bright}` shape; and confirm the face still generates unchanged with the default width.
2. `npm run gen:projects` with the live URLs up → `projects-data.json` populated for reachable
   projects; verify the skip/fail summary behaves for a deliberately bad URL.
3. `npm run dev` → each card shows an interactive ASCII thumbnail; pointer push, idle drift, and
   orange accent match the hero; reduced-motion renders static.
4. `astro check` passes (types for the new `mountAscii`, `AsciiProject` props, `slug` prop).

## Out of scope (YAGNI)

- Automatic/scheduled regeneration (CI, on-build) — manual script only.
- Full-page or square-crop capture modes.
- Per-project physics tuning or custom accents.
- Thumbnails for non-featured projects.

## Files touched

- `scripts/gen-ascii.py` — parameterize output path + `--width`.
- `scripts/gen-projects.mjs` — **new** orchestrator (screenshot + convert + merge).
- `package.json` — add `"gen:projects"` script.
- `src/lib/ascii/projects-data.json` — **new** generated data.
- `src/lib/ascii/renderer.ts` — add `mountAscii`, keep `mountAsciiFace` wrapper.
- `src/components/ascii/AsciiProject.astro` — **new** component.
- `src/components/ProjectCard.astro` — render thumbnail when data exists.
- `src/components/ProjectList.astro` — pass slug through.
