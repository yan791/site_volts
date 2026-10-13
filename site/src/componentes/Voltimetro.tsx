import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '../lib/rolagem'
import './Voltimetro.css'

/*
 * Voltímetro fixo: a página é um circuito que carrega enquanto o visitante desce.
 * 000V no topo, 220V no convite final. A cada 55V (um programa) o mostrador dá um estalo.
 */
export function Voltimetro() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current!
    const num = el.querySelector<HTMLElement>('.vm-num')!
    const barra = el.querySelector<HTMLElement>('.vm-barra i')!
    let ultimoPatamar = 0
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const v = Math.round(self.progress * 220)
        num.textContent = String(v).padStart(3, '0')
        barra.style.setProperty('--carga', self.progress.toFixed(4))
        const patamar = Math.floor(v / 55)
        if (patamar !== ultimoPatamar) {
          ultimoPatamar = patamar
          el.classList.remove('vm--estalo')
          void el.offsetWidth
          el.classList.add('vm--estalo')
        }
        el.classList.toggle('vm--cheio', v >= 220)
      },
    })
    return () => st.kill()
  }, [])

  return (
    <div ref={ref} className="voltimetro" aria-hidden="true">
      <span className="vm-rotulo">Carga</span>
      <span className="vm-leitura">
        <span className="vm-num">000</span>
        <span className="vm-v">V</span>
      </span>
      <span className="vm-barra">
        <i />
      </span>
    </div>
  )
}
