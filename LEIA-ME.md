# Landing page da Volts Training Studio

React + Vite + TypeScript, rolagem suave com Lenis e a camisa oficial em 3D com three.js.

## Rodar no computador
```bash
npm --prefix site install
npm --prefix site run dev
```
Abre em http://127.0.0.1:5173 (ou na porta da configuração "volts" do launch.json: 5230).

- `?revisao` no endereço destaca tudo que ainda precisa ser confirmado pela Volts.
- As animações ficam sempre ligadas, inclusive com "Efeitos de animação" desligado no Windows
  (decisão do projeto). O salão 3D baixa a própria resolução sozinho se o aparelho não sustentar 60 quadros/s.

## Onde mudar o conteúdo
- `site/src/dados/volts.ts`: contato, endereço, horários, programas, diferenciais, perguntas, depoimentos, camisa.
- `site/src/camisa/modelos.ts`: modelos e cores da camisa (as cores do 3D também saem daqui).
- `PENDENCIAS.md`: lista do que a Volts ainda precisa enviar ou confirmar.

## Componentes de bibliotecas (21st.dev, shadcn)
Ficam em `site/src/components/ui/` (o caminho padrão do shadcn), separados dos componentes próprios
do site (`site/src/componentes/`). Assim um componente novo copiado dessas bibliotecas entra sem
mudar os imports. O projeto não usa Tailwind: as classes do componente original são convertidas
para um CSS ao lado dele (ex.: `circular-gallery.tsx` + `circular-gallery.css`, o anel 3D da seção
"Aqui você encontra").

## Ferramentas (`ferramentas/`)
- `imagens.py`: recorta e exporta as fotos reais (de `material-instagram/`) em WebP para `site/public/img/`.
- `render-camisa.mjs`: gera as imagens estáticas da camisa a partir do 3D (com o servidor de desenvolvimento rodando).
- `og.html` + `og.mjs`: imagem de compartilhamento `og-volts.jpg`.
- `shot.mjs`, `teste-troca.mjs`, `teste-navegacao.mjs`, `teste-troca-prod.mjs`: capturas e testes automáticos com o Chrome.
- `varrer.mjs` + `folha.py`: várias capturas numa visita (`#secao+1.2` = topo da seção + 1,2 tela) e folha de contato.
- `historia.mjs`: capturas do ato 1 em pontos do progresso; `poster.mjs`: gera `img/salao3d-poster.webp`.
- `teste-toque.mjs`: no celular, confere o deslize dos carrosséis e que a rolagem vertical nunca fica presa.
- `fluidez.mjs`, `custo-rolagem.mjs`, `custo3d.mjs`, `rastro.mjs`: medem quadros por segundo na rolagem,
  o custo de cada efeito do 3D e as tarefas longas (use depois de mexer em animação).

## Publicar
```bash
npm --prefix site run build
```
A pasta `site/dist` é o site pronto, com caminhos relativos: funciona em qualquer hospedagem
estática (HostGator, GitHub Pages, Netlify), inclusive em subpasta. `material-instagram/` e
`ferramentas/` nunca são publicados.
