"""Crop the Connect logo and create a transparent variant for dark backgrounds."""
import sys
import numpy as np
from PIL import Image

src, out_dir = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(float)
ink = a.min(axis=2) < 215
ys, xs = np.where(ink)
pad = 8
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, im.width), min(ys.max() + pad, im.height))
crop = im.crop(box)
crop = crop.resize((crop.width * 4, crop.height * 4), Image.LANCZOS)
crop.save(f"{out_dir}/connect-logo.png")

# transparent version: white -> alpha, dark tagline -> white
c = np.asarray(crop).astype(float)
alpha = np.clip((255 - c.min(axis=2)) / 200.0, 0, 1)
sat = c.max(axis=2) - c.min(axis=2)
green = sat > 60
rgb = np.zeros_like(c)
rgb[green] = (61, 220, 44)
rgb[~green] = (255, 255, 255)
out = np.dstack([rgb, alpha * 255]).astype("uint8")
Image.fromarray(out, "RGBA").save(f"{out_dir}/connect-logo-light.png")
print(box, crop.size, a[ink].mean(axis=0))
