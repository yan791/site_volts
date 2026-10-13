import { useEffect, useRef } from 'react'
import { gsap } from '../lib/rolagem'
import './Cursor.css'

/*
 * Cursor próprio (só com mouse): um ponto amarelo e um anel que segue com atraso.
 * Sobre links e botões o anel cresce; com data-cursor="Texto" ele mostra uma palavra.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current!
    const ponto = el.querySelector<HTMLElement>('.cursor-ponto')!
    const anel = el.querySelector<HTMLElement>('.cursor-anel')!
    const texto = el.querySelector<HTMLElement>('.cursor-texto')!
    document.documentElement.classList.add('com-cursor')
    const px = gsap.quickTo(ponto, 'x', { duration: 0.08, ease: 'power3' })
    const py = gsap.quickTo(ponto, 'y', { duration: 0.08, ease: 'power3' })
    const ax = gsap.quickTo(anel, 'x', { duration: 0.45, ease: 'power3' })
    const ay = gsap.quickTo(anel, 'y', { duration: 0.45, ease: 'power3' })
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      el.classList.add('cursor--vivo')
      px(e.clientX)
      py(e.clientY)
      ax(e.clientX)
      ay(e.clientY)
      const alvo = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor], label, canvas.v3d__canvas')
      el.classList.toggle('cursor--sobre', !!alvo)
      const rotulo = alvo?.dataset.cursor ?? (alvo?.matches('canvas') ? 'Girar' : '')
      el.classList.toggle('cursor--texto', !!rotulo)
      if (rotulo && texto.textContent !== rotulo) texto.textContent = rotulo
    }
    const sair = () => el.classList.remove('cursor--vivo')
    const baixar = () => el.classList.add('cursor--clique')
    const subir = () => el.classList.remove('cursor--clique')
    window.addEventListener('pointermove', mover, { passive: true })
    document.addEventListener('pointerleave', sair)
    window.addEventListener('pointerdown', baixar)
    window.addEventListener('pointerup', subir)
    return () => {
      document.documentElement.classList.remove('com-cursor')
      window.removeEventListener('pointermove', mover)
      document.removeEventListener('pointerleave', sair)
      window.removeEventListener('pointerdown', baixar)
      window.removeEventListener('pointerup', subir)
    }
  }, [])

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span className="cursor-anel">
        <span className="cursor-texto" />
      </span>
      <span className="cursor-ponto" />
    </div>
  )
}
