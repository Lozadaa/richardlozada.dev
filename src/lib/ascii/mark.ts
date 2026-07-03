import { PushField } from "./physics";
import type { FaceData } from "./face-data";

const RAMP = " .':-=+*#%@";
const ACCENT = "255,122,24";

export interface LiveMark { setAccent(on: boolean): void }

/** Replace a static ASCII <pre> mark with a canvas driven by the same
 *  physics as the hero face: ambient wobble, twitches, pointer push. */
export function mountAsciiMark(pre: HTMLPreElement): LiveMark | null {
  const lines = (pre.textContent ?? "").replace(/\s+$/, "").split("\n");
  const h = lines.length;
  const w = Math.max(...lines.map((l) => l.length));
  if (!h || !w) return null;

  const cellW = 6, cellH = 10;
  const canvas = document.createElement("canvas");
  canvas.className = pre.className;
  canvas.setAttribute("aria-hidden", "true");
  canvas.width = w * cellW;
  canvas.height = h * cellH;
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  pre.replaceWith(canvas);

  const rows = lines.map((l) => l.padEnd(w, " "));
  const bright = rows.map((l) =>
    Array.from(l, (ch) => {
      const idx = RAMP.indexOf(ch);
      return idx < 0 ? 220 : Math.round((idx / (RAMP.length - 1)) * 255);
    }),
  );
  const data: FaceData = { w, h, rows, bright };
  const field = new PushField(data, {
    cellW, cellH, radius: 30, force: 0.7, idleAmp: 0.045, idleSpeed: 1.2,
  });

  const ctx = canvas.getContext("2d")!;
  let accent = false;

  function paint(t: number) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "10px monospace";
    ctx.textBaseline = "top";
    // a slow glint band sweeps across, echoing the CSS scan on static marks
    const span = canvas.width + 160;
    const band = ((t * 55) % span) - 80;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const ch = rows[y][x];
        if (ch === " ") continue;
        const i = y * w + x;
        const v = bright[y][x] / 255;
        if (accent) {
          ctx.fillStyle = `rgba(${ACCENT},${(0.4 + v * 0.6).toFixed(2)})`;
        } else {
          let g = 84 + v * 96;
          const d = Math.abs(x * cellW - band);
          if (d < 46) g += (1 - d / 46) * 70;
          ctx.fillStyle = `rgb(${g | 0},${g | 0},${g | 0})`;
        }
        ctx.fillText(ch, x * cellW + field.offsetX(i), y * cellH + field.offsetY(i));
      }
    }
  }

  let running = false, visible = false, raf = 0;
  function loop() {
    field.step(performance.now() / 1000);
    paint(performance.now() / 1000);
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!running && visible && !document.hidden) { running = true; loop(); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  new IntersectionObserver((es) => { visible = es[0].isIntersecting; visible ? start() : stop(); })
    .observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    field.setPointer((e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height);
  });
  canvas.addEventListener("pointerleave", () => field.setPointer(null, null));

  paint(0);
  return { setAccent(on: boolean) { accent = on; } };
}
