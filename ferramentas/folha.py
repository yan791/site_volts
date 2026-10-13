# Junta capturas numa folha de contato: python folha.py saida.png colunas largura_celula img1 img2 ...
import sys
from PIL import Image, ImageDraw
saida, cols, larg = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
imgs = [Image.open(p).convert('RGB') for p in sys.argv[4:]]
alt = max(int(i.height * larg / i.width) for i in imgs)
linhas = (len(imgs) + cols - 1) // cols
folha = Image.new('RGB', (cols * larg + (cols - 1) * 6, linhas * alt + (linhas - 1) * 6), (255, 0, 255))
d = ImageDraw.Draw(folha)
for k, (im, nome) in enumerate(zip(imgs, sys.argv[4:])):
    im = im.resize((larg, int(im.height * larg / im.width)))
    x, y = (k % cols) * (larg + 6), (k // cols) * (alt + 6)
    folha.paste(im, (x, y))
    d.text((x + 6, y + 4), nome.split('/')[-1], fill=(255, 0, 255))
folha.save(saida)
