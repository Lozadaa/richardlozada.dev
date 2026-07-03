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
