import { faceData, type FaceData } from "./face-data";
import { PushField, DEFAULT_CONFIG, type PushConfig } from "./physics";

const ACCENT: [number, number, number] = [255, 122, 24];

/** Mount the hero face — thin wrapper kept for the existing AsciiFace component. */
export function mountAsciiFace(canvas: HTMLCanvasElement): void {
  mountAscii(canvas, faceData);
}

/** Mount any ASCII data (face or a project screenshot) with the push physics. */
export function mountAscii(
  canvas: HTMLCanvasElement,
  data: FaceData,
  config: Partial<PushConfig> = {},
): void {
  const { w, h, rows, bright } = data;
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { cellW, cellH } = cfg;
  canvas.width = w * cellW; canvas.height = h * cellH;
  const ctx = canvas.getContext("2d")!;
  const field = new PushField(data, cfg);

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
  function loop() { field.step(performance.now() / 1000); paint(true); raf = requestAnimationFrame(loop); }
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
