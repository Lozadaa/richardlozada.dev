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


def monogram(text, W=None):
    """Companies without a logo get their initials set big in ASCII.

    The letters are drawn with a bold monospace font and rasterized through
    the same ramp as the real logos, so both families of marks share one
    texture.
    """
    from PIL import ImageDraw, ImageFont
    font = ImageFont.truetype(r"C:\Windows\Fonts\consolab.ttf", 220)
    probe = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    l, t, r, b = probe.textbbox((0, 0), text, font=font)
    pad = 28
    img = Image.new("RGB", (r - l + pad * 2, b - t + pad * 2), (255, 255, 255))
    ImageDraw.Draw(img).text((pad - l, pad - t), text, font=font, fill=(0, 0, 0))
    if W is None:
        W = min(54, 18 + 14 * len(text))
    return img_to_ascii_img(img, W=W, dead=0.22, gamma=0.45)


def img_to_ascii_img(img, W, dead, gamma):
    """Same pipeline as img_to_ascii but starting from a PIL image."""
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


def globant_chevron(H=13, T=7, SLOPE=2):
    """Globant's mark is a bold ">" — two diagonal strokes meeting at a point."""
    mid = (H - 1) // 2
    out = []
    for y in range(H):
        x0 = (y if y <= mid else H - 1 - y) * SLOPE
        out.append(" " * x0 + "=" + "@" * T + "=")
    return out


PIC = r"C:\Users\richa\Pictures"
logos = {}
if HAVE_PIL:
    # flat logo on white — near-binary ink with a thin antialiased edge
    logos["openbank"] = img_to_ascii(PIC + r"\channels4_profile.jpg", W=56, dead=0.22, gamma=0.45)
    # crop tight to the globe icon — the "WiTI" wordmark below is dropped
    logos["witi"] = img_to_ascii(PIC + r"\witichile_logo.jpg", W=50, dead=0.24, gamma=0.6, crop=(22, 4, 180, 122))
logos["globant"] = globant_chevron()
if HAVE_PIL:
    for key, initials in [("nala", "N"), ("triplea", "3A"), ("streetrip", "S"),
                          ("freelance", "RL"), ("bbr", "BBR"), ("abstract", "A"),
                          ("sinergia", "SI"), ("fermat", "F")]:
        logos[key] = monogram(initials)

json.dump(logos, open("src/content/logos.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("wrote src/content/logos.json with", len(logos), "marks\n")
for k in logos:
    print(f"--- {k} ---"); print("\n".join(logos[k])); print()
