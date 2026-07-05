import { faceData, type FaceData } from "./face-data";
import { PushField, DEFAULT_CONFIG, type PushConfig } from "./physics";

const ACCENT: [number, number, number] = [255, 122, 24];
const FONT = "9px monospace";

/** Mount the hero face — thin wrapper kept for the existing AsciiFace component. */
export function mountAsciiFace(canvas: HTMLCanvasElement): void {
  mountAscii(canvas, faceData);
}

/**
 * Mount ASCII data with the push physics.
 *
 * Face (default): every glyph is redrawn each frame with the push + ambient physics.
 *
 * `wave` (project thumbnails): the high-detail image is rendered ONCE to an offscreen
 * buffer, and ambient motion is a cheap per-strip horizontal ripple of that buffer —
 * so detail is effectively free and many thumbnails can drift at once on any hardware.
 * On hover, that canvas switches to the full per-glyph render so the orange push shows.
 * `fps` caps the ambient framerate.
 */
export function mountAscii(
  canvas: HTMLCanvasElement,
  data: FaceData,
  config: Partial<PushConfig> & { fps?: number; wave?: boolean } = {},
): void {
  const { fps = 0, wave = false, ...pushConfig } = config;
  const frameInterval = fps > 0 ? 1000 / fps : 0;
  const { w, h, rows, bright } = data;
  const cfg = { ...DEFAULT_CONFIG, ...pushConfig };
  const { cellW, cellH } = cfg;
  canvas.width = w * cellW; canvas.height = h * cellH;
  const ctx = canvas.getContext("2d")!;
  const field = new PushField(data, cfg);

  // Full per-glyph render (fillText + push accent). Used by the face and a hovered thumbnail.
  function renderGlyphs(target: CanvasRenderingContext2D, animated: boolean) {
    target.fillStyle = "#000"; target.fillRect(0, 0, canvas.width, canvas.height);
    target.font = FONT; target.textBaseline = "top";
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const ch = rows[y][x]; if (ch === " ") continue;
        const dx = animated ? field.offsetX(y * w + x) : 0, dy = animated ? field.offsetY(y * w + x) : 0;
        const v = bright[y][x] / 255; const g = Math.round(38 + v * 200);
        const t = Math.min(1, Math.hypot(dx, dy) / 9) * 0.75;
        const r = g + (ACCENT[0] - g) * t, gg = g + (ACCENT[1] - g) * t, b = g + (ACCENT[2] - g) * t;
        target.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
        target.fillText(ch, x * cellW + dx, y * cellH + dy);
      }
  }

  // Cheap ambient ripple: shift a pre-rendered static buffer in horizontal strips.
  const STRIP = 3;
  const nStrips = Math.ceil(canvas.height / STRIP);
  let base: HTMLCanvasElement | null = null;
  const amp = new Float32Array(nStrips), phase = new Float32Array(nStrips), freq = new Float32Array(nStrips);
  function prepareWave() {
    base = document.createElement("canvas");
    base.width = canvas.width; base.height = canvas.height;
    renderGlyphs(base.getContext("2d")!, false); // static high-detail render, once
    for (let s = 0; s < nStrips; s++) {
      amp[s] = 2 + Math.random() * 4;               // buffer px (downscales to a subtle drift)
      phase[s] = Math.random() * Math.PI * 2;
      freq[s] = 0.10 + Math.random() * 0.10;
    }
  }
  function paintWave(t: number) {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = base!;
    for (let s = 0, sy = 0; sy < canvas.height; s++, sy += STRIP) {
      const dx = amp[s] * Math.sin(t * 1.5 + s * freq[s] + phase[s]);
      const hgt = Math.min(STRIP, canvas.height - sy);
      ctx.drawImage(img, 0, sy, canvas.width, hgt, dx, sy, canvas.width, hgt);
    }
  }

  if (wave) prepareWave();
  const paintFrame = (t: number, hovered: boolean) =>
    (wave && !hovered) ? paintWave(t) : renderGlyphs(ctx, true);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { renderGlyphs(ctx, false); return; }

  let running = false, visible = false, raf = 0, pointerActive = false, last = 0;
  function loop() {
    const now = performance.now();
    if (!frameInterval || now - last >= frameInterval) {
      last = now;
      field.step(now / 1000);
      paintFrame(now / 1000, pointerActive);
    }
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!running && visible && !document.hidden) { running = true; loop(); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  new IntersectionObserver((es) => { visible = es[0].isIntersecting; visible ? start() : stop(); })
    .observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  function toCanvas(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    field.setPointer((e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height);
  }
  canvas.addEventListener("pointermove", (e) => { pointerActive = true; toCanvas(e); });
  canvas.addEventListener("pointerleave", () => { pointerActive = false; field.setPointer(null, null); });
  paintFrame(0, false);
}
