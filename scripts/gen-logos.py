# -*- coding: utf-8 -*-
import hashlib, json, math, sys
sys.stdout.reconfigure(encoding='utf-8')
try:
    from PIL import Image
    HAVE_PIL = True
except Exception:
    HAVE_PIL = False

RAMP = " .:-=+*#%@"
PAL = r"/\|-=+*#~xo><"

def img_to_ascii(path, W=26, dead=0.4):
    img = Image.open(path).convert("RGB"); px = img.load(); w,h = img.size
    corners=[px[0,0],px[w-1,0],px[0,h-1],px[w-1,h-1]]
    bg=tuple(sum(c[i] for c in corners)//4 for i in range(3))
    H=max(1,int(W*(h/w)*0.5)); s=img.resize((W,H),Image.LANCZOS); sp=s.load()
    dist=[[math.dist(sp[x,y],bg) for x in range(W)] for y in range(H)]
    mx=max(max(r) for r in dist) or 1; out=[]
    for y in range(H):
        line=""
        for x in range(W):
            t=dist[y][x]/mx; t=0 if t<dead else (t-dead)/(1-dead)
            line+=RAMP[min(9,int(t*10))]
        out.append(line.rstrip())
    while out and not out[0].strip(): out.pop(0)
    while out and not out[-1].strip(): out.pop()
    return out

def sigil(name, cols=5, H=9):
    hsh=hashlib.sha256(name.encode()).digest(); W=cols*2-1
    g=[[" "]*W for _ in range(H)]; bit=0
    for y in range(H):
        for x in range(cols):
            b=hsh[bit%len(hsh)]; bit+=1
            ch=PAL[(b>>1)%len(PAL)] if (b&1) else " "
            g[y][x]=ch; g[y][W-1-x]=ch
    body=["".join(r) for r in g]; w=len(body[0])
    return ["┌"+"─"*(w+2)+"┐"]+[f"│ {r} │" for r in body]+["└"+"─"*(w+2)+"┘"]

def globant_arrow(H=11, MAXW=15):
    mid=(H-1)/2; out=[]
    for y in range(H):
        wdt=max(1,round((1-abs(y-mid)/(mid+1))*MAXW))
        out.append("  "+"#"*wdt)
    return out

PIC=r"C:\Users\richa\Pictures"
logos={}
if HAVE_PIL:
    logos["openbank"]=img_to_ascii(PIC+r"\channels4_profile.jpg",26,0.42)
    logos["witi"]=img_to_ascii(PIC+r"\witichile_logo.jpg",46,0.35)
logos["globant"]=globant_arrow()
for key,name in [("nala","Nala"),("triplea","TripleA Smart Solutions"),("streetrip","Streetrip"),
                 ("freelance","Freelance"),("bbr","BBR SpA"),("abstract","Abstract Ltda"),
                 ("sinergia","Sinergia Internacional"),("fermat","Fermat")]:
    logos[key]=sigil(name)

json.dump(logos, open("src/content/logos.json","w",encoding="utf-8"), ensure_ascii=False, indent=0)
print("wrote src/content/logos.json with", len(logos), "marks\n")
for k in ["openbank","witi","globant","nala","fermat"]:
    if k in logos:
        print(f"--- {k} ---"); print("\n".join(logos[k])); print()
