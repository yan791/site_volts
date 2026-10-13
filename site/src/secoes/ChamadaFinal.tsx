import { useEffect, useRef, useState } from 'react'
import { Icone } from '../componentes/Icone'
import { NeonTeto } from '../componentes/NeonTeto'
import { contato, linkWhatsApp, mensagens } from '../dados/volts'
import { gsap } from '../lib/rolagem'
import './ChamadaFinal.css'

/** 220V: o raio corta a tela, o teto inteiro acende e o convite final fecha a página. */
export function ChamadaFinal() {
  const ref = useRef<HTMLElement>(null)
  const [ligado, setLigado] = useState(false)

  useEffect(() => {
    const raiz = ref.current!
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })
      tl.fromTo('.fn-raio path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: 'power4.in' })
        .add(() => {
          raiz.classList.remove('fn--clarao')
          void raiz.offsetWidth
          raiz.classList.add('fn--clarao')
          setLigado(true)
        })
        .fromTo('.fn-letra', { yPercent: 120, rotateX: -80, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, stagger: 0.045, duration: 0.9, ease: 'back.out(1.6)' }, '-=0.05')
        .fromTo('.fn-depois > *', { y: 26, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: 'expo.out' }, '-=0.5')
        .to('.fn-raio', { opacity: 0, duration: 0.8 }, '-=0.6')
      gsap.timeline({ scrollTrigger: { trigger: raiz, start: 'top 55%', once: true, onEnter: () => tl.play() } })
      gsap.fromTo('.fn-fundo', { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: raiz, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, raiz)
    return () => ctx.revert()
  }, [])

  const letras = (t: string) =>
    [...t].map((c, i) => (
      <span key={i} className="fn-letra">
        {c}
      </span>
    ))

  return (
    <section ref={ref} id="agendar" className={`final ${ligado ? 'final--ligado' : ''}`} aria-labelledby="final-titulo">
      <div className="final__teto" aria-hidden="true">
        <NeonTeto variante="final" ligado={ligado} />
      </div>
      <svg className="fn-raio" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
        <path d="M640 -10 L470 250 L560 262 L360 610" pathLength={1} />
      </svg>
      <div className="fn-clarao" aria-hidden="true" />
      <p className="fn-fundo" aria-hidden="true">
        220V 220V 220V
      </p>
      <div className="recipiente final__conteudo">
        <p className="rotulo final__rotulo">220V · Carga completa</p>
        <h2 id="final-titulo" className="fn-titulo" aria-label="Seja Volts.">
          <span className="fn-l1 display" aria-hidden="true">
            {letras('Seja')}
          </span>
          <span className="fn-l2 condensada" aria-hidden="true">
            {letras('Volts.')}
          </span>
        </h2>
        <div className="fn-depois">
          <p className="final__texto">Sua primeira aula começa com uma mensagem. Conte seu objetivo, combine o melhor horário com a equipe e venha conhecer a Volts na prática.</p>
          <div className="final__acoes">
            <a className="botao botao--grande botao--corrente" href={linkWhatsApp(mensagens.experimental)} target="_blank" rel="noopener" data-cursor="Agendar">
              <Icone nome="whatsapp" /> Agendar aula experimental
            </a>
            <a className="botao botao--fantasma botao--grande" href={contato.telefoneLink}>
              <Icone nome="telefone" /> {contato.telefone}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
