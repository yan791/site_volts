import sys
from PIL import Image
nome, step, escala = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
im = Image.open(f"shots/{nome}.png"); w, h = im.size
for i, y in enumerate(range(0, h, step)):
    c = im.crop((0, y, w, min(y + step, h)))
    c = c.resize((int(w * escala), int(c.height * escala)))
    c.convert("RGB").save(f"shots/{nome}-{i:02d}.jpg", quality=82)
print(nome, w, h, "fatias:", (h + step - 1) // step)
