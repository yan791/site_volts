import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CircularGallery, type GalleryItem } from '../components/ui/circular-gallery'
import { fonteFoto, type NomeFoto } from '../componentes/Foto'
import { Icone } from '../componentes/Icone'
import { diferenciais } from '../dados/volts'
import { gsap } from '../lib/rolagem'
import { useMidia } from '../lib/utilidades'
import './Diferenciais.css'

const pad = (n: number) => String(n).padStart(2, '0')

/*
 * "Aqui você encontra": os seis diferenciais num anel 3D (CircularGallery). A seção não prende
 * a rolagem: o anel gira sozinho, um cartão a cada poucos segundos, enquanto está na tela.
 * Quem quiser navega arrastando o anel, pelas setas ou pelos pontos; quem não quiser segue descendo.
 */
export function Diferenciais() {
  const ref = useRef<HTMLElement>(null)
  const rotacao = useRef(0)
  const interagiu = useRef(0)
  const arrastou = useRef(false)
  const [ativo, setAtivo] = useState(0)
  const movel = useMidia('(max-width: 767px)')
  const n = diferenciais.length
  const passo = 360 / n

  const itens = useMemo<GalleryItem[]>(
    () =>
      diferenciais.map((d, i) => {
        const f = fonteFoto(d.foto as NomeFoto)
        return {
          common: d.titulo,
          binomial: d.resumo,
          photo: { url: f.src, srcSet: f.srcSet, sizes: '320px', text: d.alt, by: 'Foto real · Volts', pos: d.posicao },
          badge: pad(i + 1),
          description: d.texto,
        }
      }),
    [],
  )

  useEffect(() => {
    const raiz = ref.current!
    const palco = raiz.querySelector<HTMLElement>('.df-palco')!

    // giro automático: só com a seção na tela e sem ninguém mexendo há alguns segundos
    let visivel = false
    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting), { threshold: 0.4 })
    io.observe(palco)
    const relogio = window.setInterval(() => {
      if (visivel && !document.hidden && performance.now() - interagiu.current > 7000) rotacao.current -= passo
    }, 4200)

    // arrastar para os lados gira o anel (na vertical a página continua rolando)
    let arrasto: { x: number; ini: number; id: number } | null = null
    const descer = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest('button, a')) return
      arrasto = { x: e.clientX, ini: rotacao.current, id: e.pointerId }
      arrastou.current = false
      interagiu.current = performance.now()
    }
    const mover = (e: PointerEvent) => {
      if (!arrasto) return
      const dx = e.clientX - arrasto.x
      if (Math.abs(dx) > 6 && !arrastou.current) {
        arrastou.current = true
        palco.setPointerCapture(arrasto.id)
        palco.classList.add('df-palco--arrastando')
      }
      if (arrastou.current) rotacao.current = arrasto.ini + dx * (movel ? 0.32 : 0.2)
      interagiu.current = performance.now()
    }
    const soltar = () => {
      if (!arrasto) return
      const desloc = rotacao.current - arrasto.ini
      // um arrasto curto já passa um cartão; depois assenta sempre de frente
      let alvo = Math.round(rotacao.current / passo) * passo
      if (alvo === arrasto.ini && Math.abs(desloc) > passo * 0.15) alvo += Math.sign(desloc) * passo
      rotacao.current = alvo
      if (palco.hasPointerCapture(arrasto.id)) palco.releasePointerCapture(arrasto.id)
      palco.classList.remove('df-palco--arrastando')
      arrasto = null
      // o clique que vem logo depois de um arrasto não conta como escolha de cartão
      window.setTimeout(() => (arrastou.current = false), 0)
      interagiu.current = performance.now()
    }
    palco.addEventListener('pointerdown', descer)
    palco.addEventListener('pointermove', mover)
    palco.addEventListener('pointerup', soltar)
    palco.addEventListener('pointercancel', soltar)

    const ctx = gsap.context(() => {
      gsap.fromTo('.df-fundo', { xPercent: 8 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: raiz, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo('.df-palco .cg', { opacity: 0.25 }, { opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: palco, start: 'top 95%', end: 'top 40%', scrub: true } })
    }, raiz)
    return () => {
      io.disconnect()
      window.clearInterval(relogio)
      palco.removeEventListener('pointerdown', descer)
      palco.removeEventListener('pointermove', mover)
      palco.removeEventListener('pointerup', soltar)
      palco.removeEventListener('pointercancel', soltar)
      ctx.revert()
    }
  }, [movel, passo])

  const lerRotacao = useCallback(() => rotacao.current, [])

  // vai ao cartão i pelo caminho mais curto do anel
  const irPara = useCallback(
    (i: number) => {
      if (arrastou.current) return
      const atual = Math.round(-rotacao.current / passo)
      let delta = (((i - atual) % n) + n) % n
      if (delta > n / 2) delta -= n
      rotacao.current = -(atual + delta) * passo
      interagiu.current = performance.now()
    },
    [n, passo],
  )
  const girar = (lado: 1 | -1) => {
    rotacao.current = Math.round(rotacao.current / passo) * passo - lado * passo
    interagiu.current = performance.now()
  }

  const d = diferenciais[ativo]

  return (
    <section ref={ref} id="experiencia" className="diferenciais" aria-labelledby="df-titulo">
      <div className="df-fixo">
        <p className="df-fundo" aria-hidden="true">
          Diferenciais
        </p>
        <header className="recipiente df-topo">
          <p className="rotulo" data-decodifica>
            03 / Diferenciais
          </p>
          <h2 id="df-titulo" className="df-titulo">
            Aqui você <span className="destaque">encontra</span>
          </h2>
        </header>

        <div className="df-palco">
          <div className="df-chao" aria-hidden="true" />
          <CircularGallery
            items={itens}
            radius={movel ? 270 : 470}
            itemWidth={movel ? 190 : 270}
            itemHeight={movel ? 256 : 360}
            perspective={movel ? 1100 : 2000}
            getRotation={lerRotacao}
            onActiveChange={setAtivo}
            onItemSelect={irPara}
            aria-label="Diferenciais da Volts"
            data-cursor="Arraste"
          />
        </div>

        <div className="recipiente df-rodape">
          <div className="df-detalhe" aria-hidden="true">
            <p className="df-contador condensada">
              <b>{pad(ativo + 1)}</b>
              <span>/{pad(n)}</span>
            </p>
            <p key={ativo} className="df-desc">
              {d.texto}
            </p>
          </div>
          <div className="df-controles">
            <button type="button" className="df-seta df-seta--volta" aria-label="Diferencial anterior" onClick={() => girar(-1)}>
              <Icone nome="seta" tamanho={18} />
            </button>
            <ol className="df-pontos">
              {diferenciais.map((x, i) => (
                <li key={x.titulo}>
                  <button type="button" aria-label={`${pad(i + 1)}: ${x.titulo}`} aria-current={i === ativo ? 'true' : undefined} onClick={() => irPara(i)}>
                    <i />
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" className="df-seta" aria-label="Próximo diferencial" onClick={() => girar(1)}>
              <Icone nome="seta" tamanho={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
