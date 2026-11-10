"""Vectorise the Rothe Mühle crest (red on white JPG) into SVG path data."""
import json, sys
import numpy as np
from PIL import Image, ImageFilter
from contourpy import contour_generator

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
S = 3
im = im.resize((im.width * S, im.height * S), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.6))
a = np.asarray(im).astype(float)
red = 1 - (a[:, :, 1] / 255.0)          # green channel: white=0, red=~0.87
ys, xs = np.where(red > 0.4)
x0, x1, y0, y1 = xs.min() - 6, xs.max() + 6, ys.min() - 6, ys.max() + 6
red = red[y0:y1, x0:x1]
lines = contour_generator(z=red).lines(0.43)

def simplify(p, eps):
    # Ramer-Douglas-Peucker
    if len(p) < 3: return p
    d = p[-1] - p[0]; n = np.hypot(*d)
    dist = np.abs(d[0] * (p - p[0])[:, 1] - d[1] * (p - p[0])[:, 0]) / n if n > 0 else np.hypot(*(p - p[0]).T)
    i = int(dist.argmax())
    if dist[i] > eps:
        return np.vstack([simplify(p[: i + 1], eps)[:-1], simplify(p[i:], eps)])
    return np.vstack([p[0], p[-1]])

def path(ls):
    out = []
    for l in ls:
        if len(l) < 12: continue
        h = len(l) // 2
        q = np.vstack([simplify(l[: h + 1], 0.9)[:-1], simplify(l[h:], 0.9)[:-1]]) / S
        out.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in q) + "Z")
    return "".join(out)

w, h = (x1 - x0) / S, (y1 - y0) / S
# split: wheel only (contours whose bbox lies inside the wheel area) vs whole crest
cx, cy = (522 * S - x0) / S, (383 * S - y0) / S
wheel = [l for l in lines if np.all(np.hypot(l[:, 0] / S - cx, l[:, 1] / S - cy) < 185)]
json.dump({"w": float(w), "h": float(h), "cx": float(cx), "cy": float(cy), "crest": path(lines), "wheel": path(wheel)}, open(out, "w"))
print(w, h, cx, cy, len(lines), len(wheel), len(path(lines)))
