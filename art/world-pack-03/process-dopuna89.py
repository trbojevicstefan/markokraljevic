from PIL import Image
import sys

src, dst = sys.argv[1:3]
im = Image.open(src).convert('RGBA')
px = im.load()
w, h = im.size

def key(r, g, b):
    return r > 180 and b > 120 and g < 125 and (r + b - 2*g) > 220

# Flood-fill only chroma pixels connected to the canvas boundary, preserving
# any accidental magenta-like detail inside painted objects.
seen = bytearray(w * h)
stack = []
for x in range(w):
    stack.extend(((x, 0), (x, h - 1)))
for y in range(h):
    stack.extend(((0, y), (w - 1, y)))
while stack:
    x, y = stack.pop()
    i = y * w + x
    if seen[i]:
        continue
    seen[i] = 1
    r, g, b, a = px[x, y]
    if not key(r, g, b):
        continue
    px[x, y] = (r, g, b, 0)
    if x: stack.append((x - 1, y))
    if x + 1 < w: stack.append((x + 1, y))
    if y: stack.append((x, y - 1))
    if y + 1 < h: stack.append((x, y + 1))

# Remove any remaining strong chroma pixels, including isolated fringe pixels.
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a and key(r, g, b):
            px[x, y] = (r, g, b, 0)

im.save(dst, 'PNG')
alpha = im.getchannel('A')
bbox = alpha.getbbox()
print(f'{w}x{h} bbox={bbox} opaque={sum(1 for v in alpha.getdata() if v)}')
