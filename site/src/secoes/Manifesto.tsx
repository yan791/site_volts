import { useEffect, useRef } from 'react'
import { Foto } from '../componentes/Foto'
import { gsap } from '../lib/rolagem'
import './Manifesto.css'

// frase da própria Volts (legendas de 05/10/2026); as palavras-chave acendem em amarelo
const TEXTO =
  'Seu treino pode acompanhar o seu ritmo. Na Volts, tem opção para quem quer ganhar força, melhorar o condicionamento, cuidar da saúde, correr mais ou simplesmente se movimentar com mais disposição.'
const CHAVES = new Set(['ritmo.', 'força,', 'condicionamento,', 'saúde,', 'correr', 'disposição.'])

export function Manifesto() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const raiz = ref.current!
    const ctx = gsap.context(() => {
      const palavras = gsap.utils.toArray<HTMLElement>('.mf-p')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.mf-fixo', start: 'top top', end: '+=140%', pin: true, scrub: 0.6, anticipatePin: 1 },
      })
      tl.to(palavras, { opacity: 1, stagger: 0.12, duration: 0.5, ease: 'none' }, 0)
        .to('.mf-p--chave', { color: '#d6f600', textShadow: '0 0 28px rgba(214,246,0,.45)', stagger: 0.6, duration: 0.4, ease: 'none' }, 0.3)
        .fromTo('.mf-carga i', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: tl.duration() || 3 }, 0)

      // equipe: a foto abre pelo corte diagonal, a moldura de neon se desenha
      gsap.fromTo(
        '.mf-foto-recorte',
        { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
        {
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          ease: 'power3.inOut',
          duration: 1.4,
          scrollTrigger: { trigger: '.mf-equipe', start: 'top 70%', once: true },
        },
      )
      gsap.fromTo('.mf-foto img', { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.mf-equipe', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo(
        '.mf-moldura rect',
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.25, scrollTrigger: { trigger: '.mf-equipe', start: 'top 65%', once: true } },
      )
      gsap.from('.mf-citacao span', {
        yPercent: 120,
        opacity: 0,
        stagger: 0.06,
        duration: 0.9,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: '.mf-citacao', start: 'top 85%', once: true },
      })
    }, raiz)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="sobre" className="manifesto" aria-labelledby="mf-titulo">
      <div className="mf-fixo">
        <div className="recipiente">
          <p className="rotulo" data-decodifica>
            01 / A Volts
          </p>
          <h2 id="mf-titulo" className="mf-texto">
            {TEXTO.split(' ').map((w, i) => (
              <span key={i}>
                <span className={`mf-p ${CHAVES.has(w) ? 'mf-p--chave' : ''}`}>{w}</span>{' '}
              </span>
            ))}
          </h2>
          <div className="mf-carga" aria-hidden="true">
            <i />
          </div>
        </div>
      </div>

      <div className="recipiente mf-equipe">
        <figure className="mf-foto">
          <div className="mf-foto-recorte">
            <Foto nome="professores" alt="Três professores da Volts com a camisa preta do estúdio" sizes="(max-width: 899px) 92vw, 46vw" posicao="50% 4%" />
          </div>
          <svg className="mf-moldura" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect x="-3" y="-4" width="58" height="52" pathLength={1} className="q" />
            <rect x="6" y="5" width="30" height="30" pathLength={1} className="v" />
          </svg>
          <figcaption className="rotulo">Equipe Volts</figcaption>
        </figure>
        <div className="mf-equipe-texto">
          <p className="mf-grande" data-titulo>
            Cada treino é acompanhado de perto por professores que fazem da técnica e do cuidado parte de cada resultado.
          </p>
          <p className="lede">São propostas diferentes, do funcional à corrida, para pessoas em fases diferentes da vida.</p>
          <blockquote className="mf-citacao condensada" aria-label="O movimento faz parte da vida.">
            {'O movimento faz parte da vida.'.split(' ').map((w, i) => (
              <span key={i} aria-hidden="true">
                {w}
              </span>
            ))}
          </blockquote>
        </div>
      </div>
    </section>
  )
}
