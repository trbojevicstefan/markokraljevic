# Indoor gate for the cellar: Codex's stone gatehouse (prolaz-kamen-otvoren) without the winch house, dome and roof,
# which make no sense under a vault. Only the two pillars and the crenellated lintel stay. No new drawing is ordered.
#   python make-indoor-gate.py
from PIL import Image
import numpy as np
src = Image.open('dist/assets/world/prolaz-kamen-otvoren.webp').convert('RGBA')
a = np.array(src)
CUT, FADE = 503, 3             # rows above CUT go; a short fade hides the cut line behind the merlons
a[:CUT - FADE, :, 3] = 0
for i in range(FADE):
    y = CUT - FADE + i
    a[y, :, 3] = (a[y, :, 3].astype(np.float32) * (i + 1) / (FADE + 1)).astype(np.uint8)
Image.fromarray(a).save('dist/assets/world/prolaz-podrum-otvoren.webp', quality=92, method=6)
print('prolaz-podrum-otvoren.webp', Image.fromarray(a).getbbox())
