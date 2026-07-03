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
