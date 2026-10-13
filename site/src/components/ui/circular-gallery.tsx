/*
  CircularGallery (21st.dev), adaptado ao site da Volts.
  Mantém a ideia e as props do original (items, radius, autoRotateSpeed). O projeto não usa
  Tailwind: as classes viraram CSS próprio em circular-gallery.css, com a identidade da Volts.
  Acréscimos:
  - itemWidth / itemHeight / perspective: tamanho dos cartões e profundidade do anel;
  - getRotation: rotação (graus) controlada de fora; aqui vem do scroll da seção fixa;
  - onActiveChange: avisa qual cartão está de frente; onItemSelect: clique num cartão;
  - o giro é escrito direto no DOM a cada quadro (sem re-render do React) e para fora da tela;
  - cada cartão tem frente e verso, então o anel continua sólido quando um cartão vira de costas.
*/
import { forwardRef, useEffect, useImperativeHandle, useRef, type HTMLAttributes } from 'react'
import './circular-gallery.css'

// utilitário simples para juntar classes condicionais (o mesmo do original)
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ')

export interface GalleryItem {
  common: string
  binomial: string
  photo: {
    url: string
    text: string
    pos?: string
    by: string
    srcSet?: string
    sizes?: string
  }
  /** Selo no canto do cartão (ex.: "01"). */
  badge?: string
  /** Texto completo para leitores de tela (o visual mostra só o título). */
  description?: string
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[]
  /** Distância dos cartões até o centro. */
  radius?: number
  /** Velocidade do giro automático quando a página não está rolando (modo original). */
  autoRotateSpeed?: number
  itemWidth?: number
  itemHeight?: number
  perspective?: number
  /** Rotação em graus controlada de fora; desliga o giro pela página e o automático. */
  getRotation?: () => number
  onActiveChange?: (index: number) => void
  onItemSelect?: (index: number) => void
}

const CORTE = 26

const CircularGallery = forwardRef<HTMLDivElement, CircularGalleryProps>(
  (
    {
      items,
      className,
      radius = 600,
      autoRotateSpeed = 0.02,
      itemWidth = 300,
      itemHeight = 400,
      perspective = 2000,
      getRotation,
      onActiveChange,
      onItemSelect,
      style,
      ...props
    },
    ref,
  ) => {
    const raiz = useRef<HTMLDivElement>(null)
    const anel = useRef<HTMLDivElement>(null)
    const cartoes = useRef<(HTMLDivElement | null)[]>([])
    const sombras = useRef<(HTMLDivElement | null)[]>([])
    const legendas = useRef<(HTMLDivElement | null)[]>([])
    const externo = useRef(getRotation)
    const aviso = useRef(onActiveChange)
    externo.current = getRotation
    aviso.current = onActiveChange
    useImperativeHandle(ref, () => raiz.current!)

    const anglePerItem = 360 / items.length

    useEffect(() => {
      let atual = externo.current ? externo.current() : 0
      let rolagem = 0
      let automatico = 0
      let ultimaRolagem = 0
      let frente = -1
      let escrito = Number.NaN
      let raf = 0
      let ultimo = 0

      // modo original: a rolagem da página inteira gira a galeria
      const aoRolar = () => {
        if (externo.current) return
        const altura = document.documentElement.scrollHeight - window.innerHeight
        rolagem = altura > 0 ? (window.scrollY / altura) * 360 : 0
        ultimaRolagem = performance.now()
      }

      const quadro = (agora: number) => {
        const dt = Math.min(64, agora - (ultimo || agora))
        ultimo = agora
        let alvo: number
        if (externo.current) alvo = externo.current()
        else {
          if (agora - ultimaRolagem > 150) automatico += autoRotateSpeed * (dt / 16.67)
          alvo = rolagem + automatico
        }
        atual += (alvo - atual) * (1 - Math.pow(1 - 0.14, dt / 16.67))
        if (Math.abs(alvo - atual) < 0.005) atual = alvo
        // parado: nada muda no DOM neste quadro
        if (atual === escrito) {
          raf = requestAnimationFrame(quadro)
          return
        }
        escrito = atual
        if (anel.current) anel.current.style.transform = `rotateY(${atual.toFixed(3)}deg)`

        for (let i = 0; i < items.length; i++) {
          const relativo = (((i * anglePerItem + atual) % 360) + 360) % 360
          const normal = relativo > 180 ? 360 - relativo : relativo // 0 = de frente, 180 = de costas
          // o original baixa a opacidade dos cartões de lado; aqui eles escurecem (não ficam transparentes)
          const sombra = sombras.current[i]
          if (sombra) sombra.style.opacity = Math.min(0.78, (normal / 180) * 1.35).toFixed(3)
          const legenda = legendas.current[i]
          if (legenda) legenda.style.opacity = Math.max(0, Math.min(1, (64 - normal) / 30)).toFixed(3)
        }

        const i = ((Math.round(-atual / anglePerItem) % items.length) + items.length) % items.length
        if (i !== frente) {
          cartoes.current[frente]?.removeAttribute('data-frente')
          cartoes.current[i]?.setAttribute('data-frente', '')
          frente = i
          aviso.current?.(i)
        }
        raf = requestAnimationFrame(quadro)
      }

      const io = new IntersectionObserver(([e]) => {
        cancelAnimationFrame(raf)
        ultimo = 0
        escrito = Number.NaN
        raf = e.isIntersecting ? requestAnimationFrame(quadro) : 0
      })
      if (raiz.current) io.observe(raiz.current)
      window.addEventListener('scroll', aoRolar, { passive: true })
      return () => {
        io.disconnect()
        cancelAnimationFrame(raf)
        window.removeEventListener('scroll', aoRolar)
      }
    }, [items.length, anglePerItem, autoRotateSpeed])

    const moldura = `${0.75},${0.75} ${itemWidth - CORTE},${0.75} ${itemWidth - 0.75},${CORTE} ${itemWidth - 0.75},${itemHeight - 0.75} ${0.75},${itemHeight - 0.75}`

    return (
      <div
        ref={raiz}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Galeria circular 3D"
        className={cn('cg', className)}
        style={{ perspective: `${perspective}px`, ['--cg-corte' as string]: `${CORTE}px`, ...style }}
        {...props}
      >
        <div ref={anel} className="cg-anel">
          {items.map((item, i) => (
            <div
              key={item.photo.url + i}
              ref={(el) => void (cartoes.current[i] = el)}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${items.length}: ${item.common}`}
              className={cn('cg-cartao', onItemSelect && 'cg-cartao--clicavel')}
              style={{
                width: itemWidth,
                height: itemHeight,
                ['--cg-w' as string]: `${itemWidth}px`,
                marginLeft: -itemWidth / 2,
                marginTop: -itemHeight / 2,
                transform: `rotateY(${i * anglePerItem}deg) translateZ(${radius}px)`,
              }}
              onClick={onItemSelect ? () => onItemSelect(i) : undefined}
            >
              <div className="cg-face cg-face--frente">
                <img
                  className="cg-foto"
                  src={item.photo.url}
                  srcSet={item.photo.srcSet}
                  sizes={item.photo.sizes}
                  alt={item.photo.text}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  style={{ objectPosition: item.photo.pos || 'center' }}
                />
                <div className="cg-degrade" />
                {item.badge && (
                  <span className="cg-selo" aria-hidden="true">
                    {item.badge}
                  </span>
                )}
                <div ref={(el) => void (legendas.current[i] = el)} className="cg-legenda">
                  <h3 className="cg-titulo">{item.common}</h3>
                  <em className="cg-sub">{item.binomial}</em>
                  <p className="cg-credito">{item.photo.by}</p>
                  {item.description && <p className="sr-only">{item.description}</p>}
                </div>
                <div ref={(el) => void (sombras.current[i] = el)} className="cg-sombra" />
                <svg className="cg-moldura" viewBox={`0 0 ${itemWidth} ${itemHeight}`} aria-hidden="true">
                  <polygon points={moldura} />
                </svg>
              </div>
              <div className="cg-face cg-face--costas" aria-hidden="true">
                <svg className="cg-marca" viewBox="0 0 309 260">
                  <path d="M0 0H69L100 92L119 102L85 106L84 186Z" />
                  <path d="M228 0H309L201 260H121Z" />
                </svg>
                {item.badge && <span className="cg-costas-num">{item.badge}</span>}
                <svg className="cg-moldura" viewBox={`0 0 ${itemWidth} ${itemHeight}`}>
                  <polygon points={moldura} />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
)

CircularGallery.displayName = 'CircularGallery'

export { CircularGallery }
