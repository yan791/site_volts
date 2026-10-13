import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { Foto } from '../componentes/Foto'
import { Icone } from '../componentes/Icone'
import { linkWhatsApp, mensagens, programas } from '../dados/volts'
import { asset } from '../lib/utilidades'
import { aberturaConcluida } from '../lib/efeitos'
import type { Salao3D } from './salao3d'
import './Historia.css'

/*
 * Ato 1: uma seção alta com um palco fixo. O progresso do scroll (0 a 1) comanda a câmera
 * no salão 3D, a carga dos quadros, as faixas de texto e a foto real no final.
 */

type R = readonly [number, number]
const T = {
  b1: [0, 0.135] as R,
  b2a: [0.158, 0.222] as R,
  b2b: [0.208, 0.27] as R,
  b2c: [0.256, 0.322] as R,
  b3: [0.352, 0.54] as R,
  b4: [0.566, 0.74] as R,
  b5: [0.79, 1] as R,
  foto: [0.775, 0.875] as R,
  rotulos: { ini: 0.385, passo: 0.03, fim: 0.535 },
}
const CAPITULOS = [
  { n: '01', nome: 'Ligar', p: 0 },
  { n: '02', nome: 'Treino', p: 0.15 },
  { n: '03', nome: 'Programas', p: 0.345 },
  { n: '04', nome: 'Marca', p: 0.56 },
  { n: '05', nome: 'Volts', p: 0.78 },
]

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a))
const suave = (t: number) => t * t * (3 - 2 * t)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
function faixa(p: number, a: number, b: number, rampa: number, primeira = false, ultima = false) {
  const entra = primeira ? 1 : suave(inv(a, a + rampa, p))
  const sai = ultima ? 1 : 1 - suave(inv(b - rampa, b, p))
  return entra * sai
}

// gerador com semente: os deslocamentos "aleatórios" das letras são iguais em toda visita
function rng(semente: number) {
  let s = semente >>> 0
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
}

/** Divide o texto em letras com deslocamentos para a entrada em dispersão. */
function Disperso({ texto, semente }: { texto: string; semente: number }) {
  const r = useMemo(() => rng(semente), [semente])
  const palavras = texto.split(' ')
  return (
    <>
      {palavras.map((w, i) => (
        <span key={i}>
          <span className="hs-palavra">
          {[...w].map((c, j) => {
            const estilo = {
              '--th': (r() * 0.55).toFixed(3),
              '--jx': `${((r() - 0.5) * 120).toFixed(0)}px`,
              '--jy': `${((r() - 0.5) * 90).toFixed(0)}px`,
              '--jr': `${((r() - 0.5) * 28).toFixed(0)}deg`,
            } as CSSProperties
            return (
              <span key={j} className="hs-c" style={estilo}>
                {c}
              </span>
            )
          })}
          </span>
          {i < palavras.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

/** Palavras com limiar em ordem de leitura (entrada palavra por palavra). */
function Palavras({ texto, espalha = 0.45, desde = 0 }: { texto: string; espalha?: number; desde?: number }) {
  const ws = texto.split(' ')
  return (
    <>
      {ws.map((w, i) => (
        <span key={i}>
          <span className="hs-w" style={{ '--th': (desde + (i / Math.max(1, ws.length - 1)) * espalha).toFixed(3) } as CSSProperties}>
            {w}
          </span>
          {i < ws.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

const cache = new WeakMap<Element, Record<string, string>>()
function css(el: HTMLElement | SVGElement | null | undefined, prop: string, val: string) {
  if (!el) return
  let c = cache.get(el)
  if (!c) cache.set(el, (c = {}))
  if (c[prop] === val) return
  c[prop] = val
  if (prop.startsWith('--')) el.style.setProperty(prop, val)
  else (el.style as unknown as Record<string, string>)[prop] = val
}
const f3 = (n: number) => (Math.round(n * 1000) / 1000).toString()
const px = (n: number) => `${Math.round(n * 10) / 10}px`

export function Historia() {
  const raizRef = useRef<HTMLElement>(null)
  const palcoRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const raiz = raizRef.current!
    const palco = palcoRef.current!
    const canvas = canvasRef.current!
    const $ = <E extends Element = HTMLElement>(s: string) => palco.querySelector(s) as E
    const $$ = <E extends Element = HTMLElement>(s: string) => Array.from(palco.querySelectorAll(s)) as E[]
    const el = {
      poster: $('.hs-poster'),
      faixas: $$('[data-faixa]'),
      foto: $('.hs-foto'),
      fotoImg: $('.hs-foto img'),
      corte: $('.hs-foto-corte'),
      rotulos: $$('.hs-rotulo'),
      capitulos: $$('.hs-cap li'),
      capBarra: $('.hs-cap .barra i'),
      cap: $('.hs-cap'),
      dica: $('.hs-dica'),
      vinheta: $('.hs-vinheta'),
    }

    let cena: Salao3D | null = null
    const lentos: { p: number; apply: number; render: number; troca: boolean }[] = []
    let descartado = false
    let pronto = false
    const movel = window.matchMedia('(max-width: 767px)').matches
    // o motor 3D chega em paralelo; o palco já funciona com o pôster antes dele
    document.fonts
      .load('900 200px "Archivo Variable"')
      .catch(() => null)
      .then(() => import('./salao3d'))
      .then(({ Salao3D }) => {
        if (descartado) return
        try {
          cena = new Salao3D(canvas, { movel })
          if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__salao = cena
          layout()
          pronto = true
          palco.classList.add('hs--3d')
        } catch {
          palco.classList.add('hs--sem3d')
        }
      })
      .catch(() => palco.classList.add('hs--sem3d'))

    // ---------- layout ----------
    let vw = 1
    let vh = 1
    function layout() {
      vw = palco.clientWidth
      vh = palco.clientHeight
      cena?.resize(vw, vh, window.devicePixelRatio || 1)
    }

    // ---------- progresso ----------
    const progresso = () => {
      const r = raiz.getBoundingClientRect()
      const curso = raiz.offsetHeight - window.innerHeight
      return curso > 0 ? clamp(-r.top / curso) : 0
    }
    let alvo = progresso()
    let mostrado = alvo
    const aoRolar = () => {
      alvo = progresso()
    }
    window.addEventListener('scroll', aoRolar, { passive: true })

    const faixas = el.faixas.map((f) => {
      const id = f.dataset.faixa as keyof typeof T
      const [a, b] = T[id] as R
      return { el: f, a, b, primeira: id === 'b1', ultima: id === 'b5', rampa: id.startsWith('b2') ? 0.012 : 0.02 }
    })

    function aplicar(p: number, tempo: number) {
      // faixas de texto
      for (const f of faixas) {
        let op = faixa(p, f.a, f.b, f.rampa, f.primeira, f.ultima)
        if (f.primeira) op *= Math.max(ligar, 0.0001)
        const k = f.primeira ? ligar : clamp((p - f.a) / Math.max(0.03, (f.b - f.a) * 0.4))
        css(f.el, 'opacity', f3(op))
        css(f.el, '--k', f3(k))
        css(f.el, 'visibility', op < 0.002 ? 'hidden' : 'visible')
      }

      // capítulos
      let cap = 0
      CAPITULOS.forEach((c, i) => p >= c.p && (cap = i))
      el.capitulos.forEach((li, i) => css(li, '--on', i === cap ? '1' : '0'))
      css(el.capBarra, 'transform', `scaleY(${f3(p)})`)
      css(el.cap, 'opacity', f3(ligar * (1 - suave(inv(0.96, 1, p)))))
      css(el.dica, 'opacity', f3(ligar * (1 - suave(inv(0.01, 0.05, p)))))

      // ato 3: rótulos dentro dos quadros do teto
      const destaque: { i: number; k: number }[] = []
      el.rotulos.forEach((r, i) => {
        const ini = T.rotulos.ini + i * T.rotulos.passo
        const op = faixa(p, ini, T.rotulos.fim, 0.016)
        const k = easeOut(inv(ini, ini + 0.03, p))
        const q = cena?.quadros[[4, 5, 6, 7][i]]
        destaque.push({ i: [4, 5, 6, 7][i], k: op })
        css(r, 'opacity', f3(op))
        css(r, 'visibility', op < 0.002 ? 'hidden' : 'visible')
        css(r, '--k', f3(k))
        if (q && cena) {
          const pt = cena.projetar(q.centro, vw, vh)
          css(r, 'transform', `translate3d(${px(pt.x)},${px(pt.y)},0) translate(-50%,-50%)`)
        }
      })

      // ato 5: a foto real corta a tela na diagonal
      const fk = easeOut(inv(T.foto[0], T.foto[1], p))
      const corte = lerp(110, movel ? 0 : 0, fk)
      css(el.foto, 'visibility', fk > 0.001 ? 'visible' : 'hidden')
      css(el.foto, '--corte', f3(corte))
      css(el.foto, '--fk', f3(fk))
      css(el.fotoImg, 'transform', `scale(${f3(lerp(1.25, 1, fk))})`)
      css(el.vinheta, 'opacity', f3(0.35 + 0.4 * fk))

      if (cena) {
        const t0 = import.meta.env.DEV ? performance.now() : 0
        cena.apply(p, tempo, ligar, destaque)
        const t1 = import.meta.env.DEV ? performance.now() : 0
        const trocasAntes = cena.trocas
        cena.render()
        if (import.meta.env.DEV) {
          const t2 = performance.now()
          if (t2 - t0 > 30) lentos.push({ p: +p.toFixed(3), apply: +(t1 - t0).toFixed(1), render: +(t2 - t1).toFixed(1), troca: cena.trocas !== trocasAntes })
        }
        if (pronto) {
          css(el.poster, 'opacity', '0')
        }
      }
    }

    // ---------- loop ----------
    let raf = 0
    let rodando = false
    let ultimo = 0
    let ligar = 0
    let t0 = Infinity
    aberturaConcluida.then(() => (t0 = performance.now()))
    function tick(agora: number) {
      raf = 0
      const dt = Math.min(64, agora - (ultimo || agora))
      ultimo = agora
      ligar = clamp((agora - t0 - 120) / 1900)
      if (!Number.isFinite(mostrado)) mostrado = alvo
      mostrado += (alvo - mostrado) * (1 - Math.pow(1 - 0.18, dt / 16.67))
      if (Math.abs(alvo - mostrado) < 0.00005) mostrado = alvo
      aplicar(mostrado, agora / 1000)
      if (rodando) raf = requestAnimationFrame(tick)
    }
    const iniciar = () => {
      if (rodando) return
      rodando = true
      ultimo = 0
      raf = requestAnimationFrame(tick)
    }
    const parar = () => {
      rodando = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? iniciar() : parar()), { rootMargin: '100px 0px' })
    io.observe(raiz)
    const aoVis = () => (document.hidden ? parar() : raiz.getBoundingClientRect().bottom > 0 && iniciar())
    document.addEventListener('visibilitychange', aoVis)
    const ro = new ResizeObserver(() => {
      layout()
      alvo = progresso()
    })
    ro.observe(palco)
    layout()
    iniciar()
    if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__historia = { get: () => ({ alvo, mostrado, pronto, resolucao: cena?.resolucao, trocas: cena?.trocas, lentos }) }

    return () => {
      descartado = true
      parar()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', aoVis)
      window.removeEventListener('scroll', aoRolar)
      cena?.dispose()
    }
  }, [])

  return (
    <section ref={raizRef} className="historia" id="inicio" aria-labelledby="hs-titulo">
      <div ref={palcoRef} className="hs-palco">
        <img className="hs-poster" src={asset('img/salao3d-poster.webp')} alt="" aria-hidden="true" fetchPriority="high" />
        <canvas ref={canvasRef} className="hs-canvas" aria-hidden="true" />
        <div className="hs-vinheta" aria-hidden="true" />

        {/* ato 5: a foto real */}
        <div className="hs-foto">
          <Foto nome="salao" alt="O salão real da Volts, com o teto de quadros de neon e o logotipo na parede" sizes="(max-width: 767px) 100vw, 46vw" posicao="50% 34%" />
          <span className="hs-foto-corte" aria-hidden="true" />
          <span className="hs-foto-selo" aria-hidden="true">
            <Icone nome="raio" tamanho={14} /> Foto real do salão
          </span>
        </div>

        {/* faixa 1: a primeira dobra */}
        <div className="hs-faixa hs-f1" data-faixa="b1">
          <p className="rotulo hs-rot">Volts Training Studio · Olinda, PE</p>
          <h1 id="hs-titulo" className="hs-titulo">
            <span className="sr-only">Volts Training Studio: energia para todo ritmo.</span>
            <span className="hs-l1 display" aria-hidden="true">
              <Palavras texto="Energia" espalha={0} />
            </span>
            <span className="hs-l2 condensada" aria-hidden="true">
              <Palavras texto="para todo" espalha={0.15} desde={0.2} />{' '}
              <span className="hs-w hs-em" style={{ '--th': '0.42' } as CSSProperties}>
                ritmo.
              </span>
            </span>
          </h1>
          <p className="hs-sub">Treino funcional, corrida e treinamento personalizado em grupos reduzidos, com professores acompanhando cada aluno de perto.</p>
          <div className="hs-acoes">
            <a className="botao botao--grande botao--corrente" href={linkWhatsApp(mensagens.experimental)} target="_blank" rel="noopener" data-cursor="Agendar">
              Agendar aula experimental <Icone nome="seta" className="seta" />
            </a>
            <a className="botao botao--fantasma botao--grande" href="#programas">
              Conhecer os programas
            </a>
          </div>
        </div>

        {/* faixa 2: staccato */}
        <p className="hs-faixa hs-choque" data-faixa="b2a" aria-hidden="true">
          <span>Treino funcional.</span>
        </p>
        <p className="hs-faixa hs-choque hs-choque--2" data-faixa="b2b" aria-hidden="true">
          <span>Corrida.</span>
        </p>
        <p className="hs-faixa hs-choque hs-choque--3" data-faixa="b2c" aria-hidden="true">
          <span>Treinamento personalizado.</span>
        </p>

        {/* faixa 3: os programas no teto */}
        <div className="hs-faixa hs-f3" data-faixa="b3">
          <p className="rotulo">
            <span className="indice">04</span> programas
          </p>
          <h2 className="hs-t3 display">
            <Palavras texto="Quatro programas." espalha={0.2} />
            <br />
            <span className="destaque">
              <Palavras texto="Um só propósito." espalha={0.2} desde={0.25} />
            </span>
          </h2>
        </div>
        {programas.map((pr, i) => (
          <div key={pr.id} className="hs-rotulo" aria-hidden="true">
            <span className="hs-rotulo-num">0{i + 1}</span>
            <span className="hs-rotulo-nome">
              {pr.nome[0]}
              <em>{pr.nome[1]}</em>
            </span>
            <span className="hs-rotulo-tipo">{pr.tipo}</span>
          </div>
        ))}

        {/* faixa 4: o V monta */}
        <h2 className="hs-faixa hs-f4 display" data-faixa="b4">
          <span className="sr-only">Do primeiro treino à próxima prova.</span>
          <span aria-hidden="true">
            <Disperso texto="Do primeiro treino" semente={7} />
            <br />
            <span className="destaque">
              <Disperso texto="à próxima prova." semente={19} />
            </span>
          </span>
        </h2>

        {/* faixa 5: aqui é a Volts */}
        <div className="hs-faixa hs-f5" data-faixa="b5">
          <h2 className="hs-t5">
            <span className="hs-metade hs-metade--a display">Aqui é</span>
            <span className="hs-metade hs-metade--b condensada">
              a <span className="destaque">Volts.</span>
            </span>
          </h2>
          <ul className="hs-fatos" aria-label="A Volts em números">
            <li>
              <b className="condensada">4</b> programas para objetivos diferentes
            </li>
            <li>
              <b className="condensada">Até 4</b> alunos por horário na VoltsClass
            </li>
            <li>
              <b className="condensada">50+</b> treino dedicado no Ativa+
            </li>
          </ul>
          <a className="botao botao--grande botao--corrente" href={linkWhatsApp(mensagens.experimental)} target="_blank" rel="noopener" data-cursor="Agendar">
            Agendar aula experimental <Icone nome="seta" className="seta" />
          </a>
        </div>

        <nav className="hs-cap" aria-hidden="true">
          <span className="barra">
            <i />
          </span>
          <ol>
            {CAPITULOS.map((c) => (
              <li key={c.n}>
                <span className="n">{c.n}</span>
                <span className="t">{c.nome}</span>
              </li>
            ))}
          </ol>
        </nav>

        <div className="hs-dica" aria-hidden="true">
          <span className="hs-dica-desk">Role para ligar o salão</span>
          {/* no celular: setas subindo, como o gesto de arrastar a tela para cima */}
          <span className="hs-dica-setas">
            <b />
            <b />
          </span>
          <span className="hs-dica-movel">Arraste para cima</span>
          <i />
        </div>
      </div>
    </section>
  )
}
