from PIL import Image, ImageOps, ImageEnhance
import json, sys

# Usage: python gen-ascii.py [SRC] [OUT] [--width N]
#   SRC   input image (default: the face photo)
#   OUT   output json  (default: src/lib/ascii/face-data.json)
#   --width N   ramp width in chars (default 120 — keeps the face invocation unchanged)
#   --factor F  row-aspect factor (default 0.52, tuned for the face's 9px font). Screenshots
#               pass 0.625 (= cellW/cellH) so the ASCII matches the source aspect, not stretched.
positional = [a for a in sys.argv[1:] if not a.startswith("--")]
SRC = positional[0] if len(positional) > 0 else r"C:\Users\richa\Pictures\46139620-b05f-4bec-9f54-bee97ee15a2b.jpg"
OUT = positional[1] if len(positional) > 1 else r"src/lib/ascii/face-data.json"
W = 120
FACTOR = 0.52
for i, a in enumerate(sys.argv):
    if a == "--width" and i + 1 < len(sys.argv):
        W = int(sys.argv[i + 1])
    if a == "--factor" and i + 1 < len(sys.argv):
        FACTOR = float(sys.argv[i + 1])

img = ImageOps.autocontrast(Image.open(SRC).convert("L"), cutoff=1)
img = ImageEnhance.Contrast(img).enhance(1.25)
H = int(W * (img.height / img.width) * FACTOR)
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
