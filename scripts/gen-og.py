# -*- coding: utf-8 -*-
"""Generate public/og.png — the social share card, on-brand with the site."""
import json, sys
from PIL import Image, ImageDraw, ImageFont
sys.stdout.reconfigure(encoding="utf-8")

W, H = 1200, 630
BG, FG, DIM, ACCENT = (0, 0, 0), (230, 230, 230), (138, 138, 138), (255, 122, 24)

face = json.load(open("src/lib/ascii/face-data.json", encoding="utf-8"))["rows"]

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

mono = lambda size, bold=False: ImageFont.truetype(
    r"C:\Windows\Fonts\consolab.ttf" if bold else r"C:\Windows\Fonts\consola.ttf", size)

# ASCII face on the left
face_font = mono(11)
line_h = 9
x0, y0 = 48, (H - len(face) * line_h) // 2
for i, row in enumerate(face):
    d.text((x0, y0 + i * line_h), row, font=face_font, fill=DIM)

# name / tagline / url on the right
tx = 660
d.text((tx, 240), "Richard", font=mono(72, bold=True), fill=FG)
d.text((tx, 320), "Lozada", font=mono(72, bold=True), fill=FG)
d.text((tx, 420), "Full-stack engineer", font=mono(26), fill=DIM)
d.text((tx, 456), "~10y · Technical Lead", font=mono(26), fill=DIM)
d.text((tx, 520), "richardlozada.dev", font=mono(28, bold=True), fill=ACCENT)

img.save("public/og.png")
print("wrote public/og.png", img.size)
