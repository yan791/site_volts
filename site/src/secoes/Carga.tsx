import { useEffect, useRef, useState } from 'react'
import { Icone } from '../componentes/Icone'
import { NeonTeto } from '../componentes/NeonTeto'
import { linkWhatsApp, mensagens } from '../dados/volts'
import { ScrollTrigger } from '../lib/rolagem'
import './Carga.css'

/*
 * Carga: sem botão para segurar. Enquanto a seção entra na tela, o medidor sobe de 000V a 220V
 * e os quadros do teto acendem um a um. Ao completar, o clarão e o convite para a aula.
 * A página nunca para aqui: a carga acompanha a rolagem.
 */
export function Carga() {
  const ref = useRef<HTMLElement>(null)
  const [ligado, setLigado] = useState(false)

  useEffect(() => {
    const raiz = ref.current!
    const quadros = Array.from(raiz.querySelectorAll<SVGGElement>('.neon-teto__quadro'))
    const ordem = quadros.map((q) => Number(q.style.getPropertyValue('--i')) || 0)
    const total = Math.max(...ordem) + 1
    const num = raiz.querySelector<HTMLElement>('.cg-num')!
    const anel = raiz.querySelector<SVGCircleElement>('.cg-anel-carga')!
    let completo = false

    const aplicar = (p: number) => {
      // depois de completa, a carga fica cheia mesmo se a pessoa voltar a rolagem
      const n = completo ? 1 : p
      num.textContent = String(Math.round(n * 220)).padStart(3, '0')
      anel.style.strokeDashoffset = String(1 - n)
      // cada quadro acende de uma vez (com uma piscada em CSS) ao passar do seu ponto: o teto só
      // é redesenhado quando um quadro muda, não a cada quadro da rolagem
      const acesos = n * total * 1.05
      quadros.forEach((q, i) => q.classList.toggle('cg-aceso', ordem[i] < acesos - 0.5))
      raiz.style.setProperty('--n', n.toFixed(3))
      if (n >= 0.999 && !completo) {
        completo = true
        setLigado(true)
        raiz.classList.remove('cg--clarao')
        void raiz.offsetWidth
        raiz.classList.add('cg--clarao')
      }
    }
    const st = ScrollTrigger.create({
      trigger: raiz.querySelector('.cg-medidor'),
      start: 'top 85%',
      end: 'center 45%',
      onUpdate: (self) => aplicar(self.progress),
      onRefresh: (self) => aplicar(self.progress),
    })
    return () => st.kill()
  }, [])

  return (
    <section ref={ref} id="carga" className={`carga ${ligado ? 'cg--ligado' : ''}`} aria-labelledby="cg-titulo">
      <div className="cg-teto" aria-hidden="true">
        <NeonTeto variante="final" ligado={false} />
      </div>
      <div className="cg-clarao" aria-hidden="true" />
      <div className="recipiente cg-palco">
        <p className="rotulo cg-rotulo" data-decodifica>
          04 / Carga
        </p>
        <h2 id="cg-titulo" className="cg-titulo">
          <span className="display">Ligue a sua</span>
          <span className="condensada destaque">energia.</span>
        </h2>

        <div className="cg-medidor" aria-hidden="true">
          <svg className="cg-anel" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" className="cg-anel-fundo" />
            <circle cx="60" cy="60" r="54" className="cg-anel-carga" pathLength={1} />
          </svg>
          <span className="cg-leitura">
            <span className="cg-num condensada">000</span>
            <span className="cg-v">V</span>
          </span>
          <Icone nome="raio" tamanho={22} className="cg-raio" />
        </div>
        <p className="cg-instrucao" aria-hidden="true">
          {ligado ? '220V · Carga completa' : 'Carregando'}
        </p>

        <div className="cg-final">
          <a className="botao botao--grande botao--corrente" href={linkWhatsApp(mensagens.experimental)} target="_blank" rel="noopener" data-cursor="Agendar">
            Agendar aula experimental <Icone nome="seta" className="seta" />
          </a>
        </div>
      </div>
    </section>
  )
}
