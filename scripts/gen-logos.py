# -*- coding: utf-8 -*-
"""Generate ASCII marks for the Experience section.

Real logos are rasterized from source images; companies without a usable
logo get a deterministic "sigil" derived from a hash of their name.
"""
import hashlib, json, math, sys
sys.stdout.reconfigure(encoding="utf-8")
try:
    from PIL import Image
    HAVE_PIL = True
except Exception:
    HAVE_PIL = False

RAMP = " .':-=+*#%@"


def img_to_ascii(path, W=40, dead=0.35, gamma=0.85, crop=None):
    """Rasterize an image into ASCII.

    dead   — fraction of background-distance treated as empty
    gamma  — <1 lifts midtones so inner detail survives the ramp
    crop   — optional (l, t, r, b) box in source pixels
    """
    img = Image.open(path).convert("RGB")
    if crop:
        img = img.crop(crop)
    px = img.load(); w, h = img.size
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
    H = max(1, round(W * (h / w) * 0.5))
    s = img.resize((W, H), Image.LANCZOS); sp = s.load()
    dist = [[math.dist(sp[x, y], bg) for x in range(W)] for y in range(H)]
    mx = max(max(r) for r in dist) or 1
    out = []
    for y in range(H):
        line = ""
        for x in range(W):
            t = dist[y][x] / mx
            t = 0 if t < dead else ((t - dead) / (1 - dead)) ** gamma
            line += RAMP[min(len(RAMP) - 1, int(t * len(RAMP)))]
        out.append(line.rstrip())
    while out and not out[0].strip(): out.pop(0)
    while out and not out[-1].strip(): out.pop()
    return out


def sigil(name, W=25, H=13):
    """Deterministic organic emblem from a company name.

    A hash seeds a value field on the left half; two smoothing passes turn
    the noise into coherent lobes; a radial falloff (whose shape is itself
    hash-driven, so silhouettes differ per company) focuses the mass into a
    centered emblem; mirroring makes it read as a designed mark rather than
    static. Same name → same sigil, every time.
    """
    hsh = hashlib.sha256(name.encode()).digest()
    half = (W + 1) // 2
    field = [[hsh[(y * half + x) % len(hsh)] / 255 for x in range(half)] for y in range(H)]
    for _ in range(2):
        nxt = [[0.0] * half for _ in range(H)]
        for y in range(H):
            for x in range(half):
                s = c = 0
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < H and 0 <= nx < half:
                            s += field[ny][nx]; c += 1
                nxt[y][x] = s / c
        field = nxt
    lo = min(min(r) for r in field); hi = max(max(r) for r in field) or 1
    # hash-driven silhouette: exponent stretches the falloff, ax/ay squash it
    expo = 1.4 + (hsh[0] / 255) * 1.8
    ax = 0.75 + (hsh[1] / 255) * 0.5
    ay = 0.75 + (hsh[2] / 255) * 0.5
    cx, cy = (W - 1) / 2, (H - 1) / 2
    rows = []
    for y in range(H):
        line = ""
        for x in range(W):
            fx = x if x < half else W - 1 - x
            v = (field[y][fx] - lo) / (hi - lo)
            r = math.hypot((x - cx) / (cx + 1) * ax, (y - cy) / (cy + 1) * ay)
            v *= max(0.0, 1 - r ** expo)
            line += RAMP[min(len(RAMP) - 1, int(v * (len(RAMP) + 2)))]
        rows.append(line.rstrip())
    while rows and not rows[0].strip(): rows.pop(0)
    while rows and not rows[-1].strip(): rows.pop()
    return rows


def globant_arrow(H=13, MAXW=21):
    """Globant's chevron, with ramped edges instead of a hard block."""
    mid = (H - 1) / 2
    out = []
    for y in range(H):
        t = 1 - abs(y - mid) / (mid + 1)
        wdt = max(1, round(t * MAXW))
        core = "@" * max(0, wdt - 2)
        edge = "#=" if wdt > 2 else "="
        out.append("  " + core + edge[: min(2, wdt)])
    return out


PIC = r"C:\Users\richa\Pictures"
logos = {}
if HAVE_PIL:
    logos["openbank"] = img_to_ascii(PIC + r"\channels4_profile.jpg", W=42, dead=0.30, gamma=0.75)
    # crop to the globe only — the "WiTI" wordmark below is dropped
    logos["witi"] = img_to_ascii(PIC + r"\witichile_logo.jpg", W=42, dead=0.28, gamma=0.75, crop=(0, 0, 200, 118))
logos["globant"] = globant_arrow()
for key, name in [("nala", "Nala"), ("triplea", "TripleA Smart Solutions"), ("streetrip", "Streetrip"),
                  ("freelance", "Freelance"), ("bbr", "BBR SpA"), ("abstract", "Abstract Ltda"),
                  ("sinergia", "Sinergia Internacional"), ("fermat", "Fermat")]:
    logos[key] = sigil(name)

json.dump(logos, open("src/content/logos.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("wrote src/content/logos.json with", len(logos), "marks\n")
for k in logos:
    print(f"--- {k} ---"); print("\n".join(logos[k])); print()
