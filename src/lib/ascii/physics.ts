import type { FaceData } from "./face-data";

export interface PushConfig {
  radius: number; force: number; spring: number; friction: number; cellW: number; cellH: number;
  /** ambient wobble so the face feels alive without pointer input */
  idleAmp: number; idleSpeed: number;
}
export const DEFAULT_CONFIG: PushConfig = {
  radius: 38, force: 0.8, spring: 0.05, friction: 0.8, cellW: 5, cellH: 8,
  idleAmp: 0.035, idleSpeed: 1.4,
};

export class PushField {
  readonly cols: number;
  readonly rowCount: number;
  private cfg: PushConfig;
  private ox: Float32Array; private oy: Float32Array;
  private vx: Float32Array; private vy: Float32Array;
  private ph: Float32Array; private fq: Float32Array; private am: Float32Array;
  private px = -1e9; private py = -1e9;

  constructor(private face: FaceData, config: Partial<PushConfig> = {}) {
    this.cfg = { ...DEFAULT_CONFIG, ...config };
    this.cols = face.w; this.rowCount = face.h;
    const n = face.w * face.h;
    this.ox = new Float32Array(n); this.oy = new Float32Array(n);
    this.vx = new Float32Array(n); this.vy = new Float32Array(n);
    // per-cell random character so the idle drift never looks mechanical
    this.ph = new Float32Array(n); this.fq = new Float32Array(n); this.am = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      this.ph[i] = Math.random() * Math.PI * 2;
      this.fq[i] = 0.6 + Math.random();
      this.am[i] = 0.5 + Math.random() * 1.1;
    }
  }

  setPointer(x: number | null, y: number | null): void {
    if (x === null || y === null) { this.px = -1e9; this.py = -1e9; }
    else { this.px = x; this.py = y; }
  }

  offsetX(i: number): number { return this.ox[i]; }
  offsetY(i: number): number { return this.oy[i]; }

  step(t = 0): void {
    const { radius, force, spring, friction, cellW, cellH, idleAmp, idleSpeed } = this.cfg;
    const it = t * idleSpeed;
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
        // ambient drift: loose waves + per-cell random phase/frequency/amplitude
        const a = idleAmp * this.am[i];
        this.vx[i] += Math.sin(it * this.fq[i] + x * 0.11 + this.ph[i]) * a;
        this.vy[i] += Math.cos(it * this.fq[i] * 0.83 + y * 0.13 + this.ph[i]) * a;
        this.vx[i] += -spring * this.ox[i]; this.vy[i] += -spring * this.oy[i];
        this.vx[i] *= friction; this.vy[i] *= friction;
        this.ox[i] += this.vx[i]; this.oy[i] += this.vy[i];
      }
    }
    // random twitches: brief impulses on a small cluster, like tics of life
    if (Math.random() < 0.04) {
      const tx = (Math.random() * this.face.w) | 0, ty = (Math.random() * this.face.h) | 0;
      const ang = Math.random() * Math.PI * 2, kick = 0.9 + Math.random() * 1.4;
      for (let dy2 = -2; dy2 <= 2; dy2++) {
        for (let dx2 = -2; dx2 <= 2; dx2++) {
          const nx = tx + dx2, ny = ty + dy2;
          if (nx < 0 || ny < 0 || nx >= this.face.w || ny >= this.face.h) continue;
          const j = ny * this.face.w + nx;
          const fall = 1 - Math.hypot(dx2, dy2) / 3.2;
          this.vx[j] += Math.cos(ang) * kick * fall;
          this.vy[j] += Math.sin(ang) * kick * fall;
        }
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
