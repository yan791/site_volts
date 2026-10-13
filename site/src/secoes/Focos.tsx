import { useEffect, useRef } from 'react'
import { gsap, velocidade } from '../lib/rolagem'
import './Focos.css'

// focos citados nas artes oficiais dos programas
const LINHA_A = ['Força', 'Resistência', 'Condicionamento', 'Performance', 'Hipertrofia']
const LINHA_B = ['Mobilidade', 'Equilíbrio', 'Coordenação', 'Corrida', 'Qualidade de vida']

function Raio() {
  return (
    <svg className="fc-raio" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.2 2.5L4.8 13.6h6.4l-1 7.9 8.4-11.2h-6.5z" />
    </svg>
  )
}

function Trilha({ itens, vazado }: { itens: string[]; vazado?: boolean }) {
  const bloco = (chave: string) => (
    <div className="fc-bloco" key={chave} aria-hidden={chave !== 'a'}>
      {itens.map((t) => (
        <span key={t} className={`fc-item ${vazado ? 'fc-item--vazado' : ''}`}>
          {t}
          <Raio />
        </span>
      ))}
    </div>
  )
  return <div className="fc-trilha">{[bloco('a'), bloco('b')]}</div>
}

/** Duas faixas de palavras gigantes em sentidos opostos; aceleram e invertem com o scroll. */
export function Focos() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const raiz = ref.current!
    const ctx = gsap.context(() => {
      const [a, b] = gsap.utils.toArray<HTMLElement>('.fc-trilha')
      // começa longe do início para poder andar para trás quando o scroll sobe
      const ta = gsap.to(a, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 }).totalTime(28 * 400)
      const tb = gsap.fromTo(b, { xPercent: -50 }, { xPercent: 0, duration: 32, ease: 'none', repeat: -1 }).totalTime(32 * 400)
      let dir = 1
      const pulso = () => {
        const v = velocidade()
        if (Math.abs(v) > 0.3) dir = v > 0 ? 1 : -1
        const escala = dir * (1 + Math.min(Math.abs(v) * 0.08, 1.8))
        ta.timeScale(gsap.utils.interpolate(ta.timeScale(), escala, 0.06))
        tb.timeScale(gsap.utils.interpolate(tb.timeScale(), escala, 0.06))
      }
      gsap.ticker.add(pulso)
      return () => gsap.ticker.remove(pulso)
    }, raiz)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="focos" aria-label="Focos dos programas da Volts">
      <div className="fc-linha" data-inclina>
        <Trilha itens={LINHA_A} />
      </div>
      <div className="fc-linha fc-linha--b" data-inclina>
        <Trilha itens={LINHA_B} vazado />
      </div>
    </section>
  )
}
