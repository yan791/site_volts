"""Recorta, trata e exporta as fotos reais da Volts para o site.

Uso: python ferramentas/imagens.py [--preview]
Fonte: volts/material-instagram (bruto, fora da pasta publicada)
Saída: volts/site/public/img/<nome>-<largura>.webp
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

RAIZ = Path(__file__).resolve().parents[1]
BRUTO = RAIZ / "material-instagram"
SAIDA = RAIZ / "site" / "public" / "img"

# caixa = (esquerda, topo, direita, base) em fração da imagem original
FOTOS = {
    "salao": dict(src="quadros/salao-643.jpg", box=(0, 0, 1, 1), larguras=[480, 720], grade="neon"),
    "fachada-raio": dict(src="quadros/fachada-raio-a.jpg", box=(0, 0.04, 0.70, 0.92), larguras=[420, 560], grade="leve"),
    "fachada": dict(src="quadros/fachada-ext-a.jpg", box=(0, 0.13, 1, 0.56), larguras=[480, 720], grade="leve"),
    "equipamentos": dict(src="quadros/equip-a.jpg", box=(0, 0.02, 1, 0.66), larguras=[480, 720], grade="neon"),
    # cabeças inteiras: o recorte sobe até acima do cabelo; o fim do texto do post ("...ÇÃO") que
    # entraria no canto é coberto com o próprio fundo preto da arte (apagar = caixas em fração da original)
    "professores": dict(src="Dcvn-bJunIQ_hd.jpg", box=(0.31, 0.415, 1, 1), apagar=[(0.30, 0.40, 0.456, 0.47), (0.30, 0.46, 0.35, 0.50)], larguras=[480, 860], grade="leve"),
    "ativa": dict(src="Dd4ffYTxktp_hd.jpg", box=(0.14, 0.095, 0.96, 0.52), larguras=[600, 1100], grade="leve"),
    "corrida": dict(src="DdFMBo1tWF0_hd.jpg", box=(0.495, 0.15, 0.885, 0.98), larguras=[480, 720], grade="leve"),
    "meia-maratona": dict(src="DdeB0bGuG2c_hd.jpg", box=(0, 0.10, 1, 0.43), larguras=[720, 1400], grade="leve"),
    "dia-do-cliente": dict(src="DdT9ww-OLA4_hd.jpg", box=(0, 0.515, 1, 0.765), larguras=[720, 1400], grade="leve"),
    "evento": dict(src="DdgsPZkjkLE_2.jpg", box=(0.59, 0.06, 1, 0.97), larguras=[480, 800], grade="leve"),
}


def tratar(im: Image.Image, grade: str) -> Image.Image:
    """Leva a foto para o mundo da marca: pretos mais fundos, neon preservado."""
    if grade == "neon":
        im = ImageEnhance.Contrast(im).enhance(1.16)
        im = ImageEnhance.Color(im).enhance(0.9)
        im = ImageEnhance.Brightness(im).enhance(0.9)
        r, g, b = im.split()
        r = r.point(lambda v: v * 0.96)
        b = b.point(lambda v: v * 0.84)
        im = Image.merge("RGB", (r, g, b))
    else:
        im = ImageEnhance.Contrast(im).enhance(1.06)
    return im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))


def main(preview: bool) -> None:
    SAIDA.mkdir(parents=True, exist_ok=True)
    meta = {}
    for nome, cfg in FOTOS.items():
        im = Image.open(BRUTO / cfg["src"]).convert("RGB")
        w, h = im.size
        for al, at, ar, ab in cfg.get("apagar", []):
            caixa = (round(al * w), round(at * h), round(ar * w), round(ab * h))
            # cor do fundo: mediana dos pixels escuros da própria área (ignora as letras)
            escuros = sorted(px for px in im.crop(caixa).getdata() if sum(px) < 90)
            fundo = escuros[len(escuros) // 2] if escuros else (0, 0, 0)
            im.paste(fundo, caixa)
        l, t, r, b = cfg["box"]
        im = im.crop((round(l * w), round(t * h), round(r * w), round(b * h)))
        im = tratar(im, cfg["grade"])
        meta[nome] = {"w": im.width, "h": im.height, "larguras": []}
        for lw in cfg["larguras"]:
            lw = min(lw, im.width)
            alt = round(im.height * lw / im.width)
            out = im.resize((lw, alt), Image.LANCZOS)
            arq = SAIDA / f"{nome}-{lw}.webp"
            out.save(arq, "WEBP", quality=80, method=6)
            meta[nome]["larguras"].append(lw)
            print(f"{arq.name:28s} {lw}x{alt}  {arq.stat().st_size // 1024} KB")
        if preview:
            im.save(RAIZ / "ferramentas" / "preview" / f"{nome}.jpg", quality=80)
    (RAIZ / "site" / "src" / "dados").mkdir(parents=True, exist_ok=True)
    (RAIZ / "site" / "src" / "dados" / "imagens.json").write_text(json.dumps(meta, indent=2))


if __name__ == "__main__":
    prev = "--preview" in sys.argv
    if prev:
        (RAIZ / "ferramentas" / "preview").mkdir(parents=True, exist_ok=True)
    main(prev)
