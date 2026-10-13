/*
 * Rolagem suave (Lenis) ligada ao GSAP ScrollTrigger.
 * Por decisão do projeto, a animação fica sempre ligada, no celular também.
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
const travas = new Set<string>()
const pulso = (t: number) => lenis?.raf(t * 1000)
let ultimaRolagem = 0
if (typeof window !== 'undefined') window.addEventListener('scroll', () => (ultimaRolagem = performance.now()), { passive: true })

/**
 * Espera um momento parado: ninguém rolando há `calma` ms e o navegador ocioso.
 * Trabalho pesado (criar uma cena 3D, compilar shaders) roda aqui para não engasgar a rolagem.
 */
export function ocioso(calma = 280): Promise<void> {
  return new Promise((resolver) => {
    const tentar = () => {
      const falta = calma - (performance.now() - ultimaRolagem)
      if (falta > 0) return void setTimeout(tentar, falta + 20)
      const ric = (window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      const conferir = () => (performance.now() - ultimaRolagem < calma ? tentar() : resolver())
      if (ric) ric(conferir, { timeout: 600 })
      else setTimeout(conferir, 16)
    }
    tentar()
  })
}

export function iniciarRolagem() {
  if (lenis) return lenis
  // lerp contínuo: cada giro da roda soma ao movimento em curso, sem recomeçar a curva
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true, touchMultiplier: 1.15 })
  lenis.on('scroll', () => {
    ScrollTrigger.update()
    ultimaRolagem = performance.now()
  })
  gsap.ticker.add(pulso)
  gsap.ticker.lagSmoothing(0)
  if (travas.size) lenis.stop()
  return lenis
}

export function encerrarRolagem() {
  gsap.ticker.remove(pulso)
  lenis?.destroy()
  lenis = null
}

/** velocidade atual da rolagem (px por quadro): faixas e títulos inclinam com ela */
export const velocidade = () => lenis?.velocity ?? 0

export function rolarPara(alvo: string | number | HTMLElement, imediato = false) {
  if (lenis) {
    // o Lenis já respeita o scroll-padding-top do html (altura do cabeçalho)
    lenis.scrollTo(alvo, { immediate: imediato, duration: 1.5, force: true })
    return
  }
  const el = typeof alvo === 'string' ? document.querySelector(alvo) : typeof alvo === 'number' ? null : alvo
  const y = typeof alvo === 'number' ? alvo : (el?.getBoundingClientRect().top ?? 0) + scrollY - 80
  window.scrollTo({ top: y, behavior: imediato ? 'auto' : 'smooth' })
}

/** trava a rolagem (menu, aba da camisa, abertura). Só solta quando todos soltarem. */
export function travarRolagem(travar: boolean, quem = 'geral') {
  if (travar) travas.add(quem)
  else travas.delete(quem)
  document.documentElement.classList.toggle('travado', travas.size > 0)
  if (!lenis) return
  if (travas.size) lenis.stop()
  else lenis.start()
}

/** Links internos (#secao) passam pela rolagem suave e levam o foco para a seção. */
export function ligarAncoras() {
  const clique = (ev: MouseEvent) => {
    const a = (ev.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey) return
    const id = a.getAttribute('href')!
    if (id === '#' || id.startsWith('#comprar-camisa')) return
    const alvo = document.querySelector<HTMLElement>(id)
    if (!alvo) return
    ev.preventDefault()
    // seções fixas (data-fixa) já reservam o espaço do cabeçalho: vão para o topo exato, com o palco inteiro na tela
    rolarPara(alvo.hasAttribute('data-fixa') ? alvo.getBoundingClientRect().top + window.scrollY : alvo)
    history.replaceState(null, '', id)
    alvo.setAttribute('tabindex', '-1')
    alvo.focus({ preventScroll: true })
  }
  document.addEventListener('click', clique)
  return () => document.removeEventListener('click', clique)
}

export { gsap, ScrollTrigger }
