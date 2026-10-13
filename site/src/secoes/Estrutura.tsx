import { useEffect, useRef } from 'react'
import { Foto, type NomeFoto } from '../componentes/Foto'
import { Reel } from '../componentes/Reel'
import { fotosEstrutura } from '../dados/volts'
import { gsap } from '../lib/rolagem'
import './Estrutura.css'

/** Por dentro da Volts: as fotos começam empilhadas como um baralho e se abrem em leque com o scroll. */
export function Estrutura() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const raiz = ref.current!
    const mm = gsap.matchMedia()
    mm.add({ largo: '(min-width: 768px)', estreito: '(max-width: 767px)' }, (c) => {
      const largo = c.conditions?.largo
      const cartas = gsap.utils.toArray<HTMLElement>('.es-carta', raiz)
      const n = cartas.length
      // no celular a grade 2x2 encolhe até caber entre o título e o texto
      const encaixe = () => {
        if (largo) return 1
        const mesa = raiz.querySelector<HTMLElement>('.es-mesa')!
        const c = cartas[0]
        return Math.min(1, (mesa.clientHeight - 14) / (2 * c.offsetHeight), (window.innerWidth - 36) / (2 * c.offsetWidth))
      }
      // posição final de cada carta: em fila no desktop, em grade 2x2 no celular
      const destino = (i: number) => {
        if (largo) return { x: (i - (n - 1) / 2) * Math.min(window.innerWidth * 0.205, 300), y: (i % 2 ? 1 : -1) * 18, rotation: (i - (n - 1) / 2) * 2.4, scale: 1 }
        const s = encaixe()
        const c = cartas[0]
        return { x: (i % 2 ? 1 : -1) * ((c.offsetWidth * s) / 2 + 6), y: (i < 2 ? -1 : 1) * ((c.offsetHeight * s) / 2 + 6), rotation: (i % 2 ? 1 : -1) * 2, scale: s }
      }
      gsap.set(cartas, { rotation: (i) => (i - (n - 1) / 2) * -7, x: (i) => i * 6, y: (i) => i * -6, scale: () => 0.86 * encaixe() })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: raiz.querySelector('.es-fixo'), start: 'top top', end: '+=160%', pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
      })
      tl.fromTo(raiz.querySelector('.es-fundo'), { scale: 0.7, opacity: 0.2 }, { scale: 1.08, opacity: 1, ease: 'power2.out', duration: 1 }, 0)
        .to(cartas, { x: (i) => destino(i).x, y: (i) => destino(i).y, rotation: (i) => destino(i).rotation, scale: (i) => destino(i).scale, ease: 'power3.inOut', duration: 1, stagger: 0.04 }, 0.1)
        .fromTo(raiz.querySelectorAll('.es-carta figcaption'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.3 }, 0.8)
        .fromTo(raiz.querySelector('.es-texto'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 0.85)
    })
    return () => mm.revert()
  }, [])

  const [salao, equipamentos, entrada] = fotosEstrutura
  const cartas: ({ tipo: 'foto'; f: (typeof fotosEstrutura)[number] } | { tipo: 'reel' })[] = [
    { tipo: 'foto', f: equipamentos },
    { tipo: 'foto', f: salao },
    { tipo: 'reel' },
    { tipo: 'foto', f: entrada },
  ]

  return (
    <section ref={ref} id="estrutura" className="estrutura" aria-labelledby="es-titulo" data-fixa>
      <div className="es-fixo">
        <p className="es-fundo display" aria-hidden="true">
          Por dentro
        </p>
        <header className="recipiente es-topo">
          <p className="rotulo" data-decodifica>
            05 / Estrutura
          </p>
          <h2 id="es-titulo" className="es-titulo">
            Por dentro <span className="destaque">da Volts</span>
          </h2>
        </header>
        <div className="es-mesa">
          {cartas.map((c, i) => (
            <figure key={i} className={`es-carta ${c.tipo === 'reel' ? 'es-carta--reel' : ''}`} style={{ zIndex: 10 - Math.abs(i - 1.5) * 2 }}>
              {c.tipo === 'foto' ? (
                <div className="es-img">
                  <Foto nome={c.f.src as NomeFoto} alt={c.f.alt} sizes="(max-width: 767px) 44vw, 22vw" />
                </div>
              ) : (
                <Reel video="aqui-e-a-volts" titulo="Aqui é a Volts" duracao="29 s" />
              )}
              <figcaption className="rotulo">{c.tipo === 'foto' ? c.f.legenda : 'Tour em vídeo'}</figcaption>
            </figure>
          ))}
        </div>
        <p className="recipiente es-texto lede">Luz neon no teto, espaço livre para o treino funcional e equipamentos para objetivos diferentes.</p>
      </div>
    </section>
  )
}
