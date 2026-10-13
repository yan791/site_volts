import { SplitText } from 'gsap/SplitText'
import { gsap, ScrollTrigger, velocidade } from './rolagem'

gsap.registerPlugin(SplitText)

/*
 * Efeitos ligados por atributo, para qualquer seção usar sem repetir código:
 *  data-titulo        linhas sobem de dentro de uma máscara quando o título entra na tela
 *  data-decodifica    rótulo que se "decodifica" letra a letra, como um painel ligando
 *  data-inclina       inclina com a velocidade do scroll
 *  data-parallax="n"  desloca n (fração da altura) enquanto atravessa a tela
 *  data-magnetico     puxado pelo cursor (só com mouse)
 */

const SINAIS = '01VOLTS220⚡/#+'

export function decodificar(el: HTMLElement, duracao = 0.9) {
  const final = el.dataset.texto ?? el.textContent ?? ''
  el.dataset.texto = final
  const obj = { t: 0 }
  return gsap.to(obj, {
    t: 1,
    duration: duracao,
    ease: 'none',
    onUpdate: () => {
      const n = Math.floor(obj.t * final.length)
      let s = final.slice(0, n)
      for (let i = n; i < final.length; i++) s += final[i] === ' ' ? ' ' : SINAIS[Math.floor(Math.random() * SINAIS.length)]
      el.textContent = s
    },
    onComplete: () => {
      el.textContent = final
    },
  })
}

export function ligarEfeitos(raiz: HTMLElement) {
  const finos = window.matchMedia('(pointer: fine)').matches
  const ctx = gsap.context(() => {
    raiz.querySelectorAll<HTMLElement>('[data-titulo]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'linha-mascara',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 105,
            rotate: 1,
            transformOrigin: '0% 100%',
            duration: 1.15,
            ease: 'expo.out',
            stagger: 0.085,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        },
      })
    })

    raiz.querySelectorAll<HTMLElement>('[data-decodifica]').forEach((el) => {
      el.dataset.texto = el.textContent ?? ''
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => decodificar(el) })
    })

    raiz.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
      const n = Number(el.dataset.parallax) || 0.15
      gsap.fromTo(
        el,
        { yPercent: n * 100 },
        { yPercent: -n * 100, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    })

    const inclinados = Array.from(raiz.querySelectorAll<HTMLElement>('[data-inclina]'))
    if (inclinados.length) {
      const setters = inclinados.map((el) => gsap.quickTo(el, 'skewY', { duration: 0.9, ease: 'power2' }))
      const inclinar = () => {
        const v = gsap.utils.clamp(-3, 3, velocidade() * -0.07)
        setters.forEach((s) => s(v))
      }
      gsap.ticker.add(inclinar)
      return () => gsap.ticker.remove(inclinar)
    }
  }, raiz)

  // ímã nos botões (fora do contexto: eventos simples)
  const limpezas: (() => void)[] = []
  if (finos) {
    raiz.querySelectorAll<HTMLElement>('.botao, [data-magnetico]').forEach((el) => {
      const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' })
      const y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' })
      const mover = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        x((e.clientX - (r.left + r.width / 2)) * 0.16)
        y((e.clientY - (r.top + r.height / 2)) * 0.2)
      }
      const sair = () => {
        x(0)
        y(0)
      }
      el.addEventListener('pointermove', mover)
      el.addEventListener('pointerleave', sair)
      limpezas.push(() => {
        el.removeEventListener('pointermove', mover)
        el.removeEventListener('pointerleave', sair)
      })
    })
  }

  return () => {
    limpezas.forEach((f) => f())
    ctx.revert()
  }
}

// ---------------------------------------------------------------------------
// abertura: a história espera a cortina sair para começar a ligar o salão
// ---------------------------------------------------------------------------
let soltar: () => void = () => {}
export const aberturaConcluida = new Promise<void>((r) => (soltar = r))
export const concluirAbertura = () => soltar()
