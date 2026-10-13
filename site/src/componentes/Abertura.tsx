import { useEffect, useRef, useState } from 'react'
import { concluirAbertura } from '../lib/efeitos'
import { gsap, travarRolagem } from '../lib/rolagem'
import './Abertura.css'

/*
 * Abertura "ligando": o V do logo se desenha, o contador sobe de 000 a 220 volts piscando
 * como painel elétrico e a tela se parte na diagonal do raio. Uma vez por sessão.
 */
const CHAVE = 'volts-abertura'

function vaiAparecer() {
  try {
    return !sessionStorage.getItem(CHAVE) && !new URLSearchParams(location.search).has('render')
  } catch {
    return false
  }
}

export function Abertura() {
  const [viva, setViva] = useState(vaiAparecer)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!viva) {
      concluirAbertura()
      return
    }
    try {
      sessionStorage.setItem(CHAVE, '1')
    } catch {
      /* sem armazenamento: só não lembra que já apareceu */
    }
    travarRolagem(true, 'abertura')
    const el = ref.current!
    const num = el.querySelector<HTMLElement>('.ab-num')!
    const cont = { v: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        travarRolagem(false, 'abertura')
        setViva(false)
      },
    })
    tl.fromTo(el.querySelectorAll('.ab-marca path'), { strokeDashoffset: 1, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut', stagger: 0.12 })
      .to(el.querySelectorAll('.ab-marca path'), { fillOpacity: 1, duration: 0.25, ease: 'steps(3)' }, '-=0.1')
      .to(
        cont,
        {
          v: 220,
          duration: 1.15,
          ease: 'power2.in',
          onUpdate: () => (num.textContent = String(Math.round(cont.v)).padStart(3, '0')),
        },
        0.2,
      )
      .to(el.querySelector('.ab-barra i'), { scaleX: 1, duration: 1.15, ease: 'power2.in' }, 0.2)
      .add(() => {
        el.classList.add('ab--clarao')
        concluirAbertura()
      })
      .to(el.querySelector('.ab-conteudo'), { opacity: 0, scale: 1.08, duration: 0.3, ease: 'power2.in' }, '+=0.08')
      .to(el.querySelector('.ab-a'), { xPercent: -100, yPercent: -12, duration: 0.85, ease: 'expo.inOut' }, '<0.05')
      .to(el.querySelector('.ab-b'), { xPercent: 100, yPercent: 12, duration: 0.85, ease: 'expo.inOut' }, '<')
    return () => {
      tl.kill()
      travarRolagem(false, 'abertura')
    }
  }, [viva])

  if (!viva) return null
  return (
    <div ref={ref} className="abertura" aria-hidden="true">
      <div className="ab-a" />
      <div className="ab-b" />
      <div className="ab-conteudo">
        <svg className="ab-marca" viewBox="-6 -6 321 272">
          <path d="M0 0H69L100 92L119 102L85 106L84 186Z" pathLength={1} className="ab-raio" />
          <path d="M228 0H309L201 260H121Z" pathLength={1} className="ab-barra-v" />
        </svg>
        <p className="ab-leitura">
          <span className="ab-num">000</span>
          <span className="ab-v">V</span>
        </p>
        <span className="ab-barra">
          <i />
        </span>
        <p className="ab-rotulo">Ligando o salão</p>
      </div>
    </div>
  )
}
