import { useEffect, useRef, useState } from 'react'
import { Icone } from '../componentes/Icone'
import { camisa } from '../dados/volts'
import { gsap, ocioso, rolarPara, ScrollTrigger } from '../lib/rolagem'
import { asset, reais } from '../lib/utilidades'
import type { CenaCamisa } from './cena'
import { variantes, type IdVariante, type Variante } from './modelos'
import './CamisaScroll.css'

/*
 * Camisa oficial: a peça 3D fica no palco fixo e gira com o scroll. A cada terço a cor ou o
 * modelo muda com a linha de energia: verde-oliva, amarela, regata. As amostras levam direto
 * ao trecho de cada uma, e o botão abre a aba de compra com a escolha atual.
 */
const ORDEM: IdVariante[] = ['camiseta-verde', 'camiseta-amarela', 'regata-amarela']

export function CamisaScroll({ aoMudar }: { aoMudar: (id: IdVariante) => void }) {
  const ref = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [atual, setAtual] = useState(0)
  const [sem3D, setSem3D] = useState(false)
  const [pronto, setPronto] = useState(false)
  const cenaRef = useRef<CenaCamisa | null>(null)
  const atualRef = useRef(0)

  useEffect(() => {
    const raiz = ref.current!
    let descartado = false
    let cena: CenaCamisa | null = null

    // a cena só nasce quando a seção se aproxima (o 3D da camisa pesa mais que a página)
    const nascer = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting || cena) return
        nascer.disconnect()
        try {
          // cada etapa pesada espera um momento parado da rolagem; até lá fica a foto estática
          await ocioso()
          const { CenaCamisa } = await import('./cena')
          await ocioso()
          if (descartado || !canvasRef.current) return
          cena = new CenaCamisa(canvasRef.current, { reduzido: false, controlado: true, aoErro: () => setSem3D(true) })
          cenaRef.current = cena
          cena.preparar('regata')
          await ocioso()
          await cena.mostrar(variantes.find((v) => v.id === ORDEM[atualRef.current])!)
          if (!descartado) setPronto(true)
        } catch {
          setSem3D(true)
        }
      },
      { rootMargin: '250% 0px' },
    )
    nascer.observe(raiz)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'camisa',
        trigger: raiz.querySelector('.cs-fixo'),
        start: 'top top',
        end: '+=220%',
        pin: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress
          cenaRef.current?.girar(-0.45 + p * Math.PI * 2.4, Math.sin(p * Math.PI) * 0.08)
          const i = Math.min(ORDEM.length - 1, Math.floor(p * ORDEM.length * 0.999))
          if (i !== atualRef.current) {
            atualRef.current = i
            setAtual(i)
            const v = variantes.find((x) => x.id === ORDEM[i])!
            cenaRef.current?.mostrar(v)
          }
          raiz.style.setProperty('--p', p.toFixed(3))
        },
      })
      gsap.from(raiz.querySelectorAll('.cs-titulo > span'), {
        yPercent: 110,
        stagger: 0.1,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: raiz, start: 'top 70%', once: true },
      })
    }, raiz)

    return () => {
      descartado = true
      nascer.disconnect()
      ctx.revert()
      cena?.destruir()
      cenaRef.current = null
    }
  }, [])

  const v: Variante = variantes.find((x) => x.id === ORDEM[atual])!
  const irPara = (i: number) => {
    const st = ScrollTrigger.getById('camisa')
    if (st) rolarPara(st.start + (st.end - st.start) * ((i + 0.5) / ORDEM.length))
  }

  return (
    <section ref={ref} id="camisa" className="camisa-scroll" aria-labelledby="cs-titulo" data-fixa>
      <div className="cs-fixo">
        <div className="cs-faixa" aria-hidden="true" />
        <div className="cs-palco">
          <div className="portal cs-portal" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          {sem3D || !pronto ? (
            <img className="cs-estatica" src={asset(`img/camisa-${v.id}-900.webp`)} alt={`${v.nome} oficial Volts, ${v.corNome}`} width={900} height={1000} />
          ) : null}
          <canvas ref={canvasRef} className={`cs-canvas ${pronto && !sem3D ? 'cs-canvas--pronto' : ''}`} aria-hidden="true" />
          <span className="cs-volta condensada" aria-hidden="true">
            {String(atual + 1).padStart(2, '0')}
            <small>/03</small>
          </span>
        </div>

        <div className="cs-texto">
          <p className="rotulo" data-decodifica>
            06 / Camisa oficial
          </p>
          <h2 id="cs-titulo" className="cs-titulo">
            <span className="display">Camisa</span>
            <span className="condensada destaque">oficial</span>
          </h2>
          <p className="cs-slogan">{camisa.slogan}</p>

          <ol className="cs-opcoes" aria-label="Modelos e cores">
            {ORDEM.map((id, i) => {
              const x = variantes.find((y) => y.id === id)!
              return (
                <li key={id}>
                  <button type="button" className={`cs-opcao ${i === atual ? 'cs-opcao--ativa' : ''}`} aria-pressed={i === atual} onClick={() => irPara(i)}>
                    <span className="cs-amostra" style={{ ['--a' as string]: x.base, ['--d' as string]: x.listra }} aria-hidden="true" />
                    <span className="cs-opcao-texto">
                      <strong>{x.nome}</strong>
                      <span>{x.corNome}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="cs-compra">
            <p className="cs-preco">
              <span className="condensada">{reais(camisa.preco)}</span>
              <span>valor unitário · 50% na reserva e 50% na entrega</span>
            </p>
            <a className="botao botao--grande botao--corrente" href="#comprar-camisa" onClick={() => aoMudar(v.id)} data-cursor="Comprar">
              Garantir a minha <Icone nome="seta" className="seta" />
            </a>
          </div>
        </div>

        <div className="cs-barra" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  )
}
