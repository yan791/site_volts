import { useEffect, useState } from 'react'

/** Caminho de um arquivo da pasta public, respeitando o base relativo do build. */
export const asset = (caminho: string) => `${import.meta.env.BASE_URL}${caminho}`

// Decisão do projeto: as animações ficam sempre ligadas, mesmo com "Efeitos de animação"
// desligado no sistema (o mesmo combinado dos outros sites da agência).
export function prefereMenosMovimento() {
  return false
}

export function useMovimentoReduzido() {
  return false
}

export function useMidia(query: string) {
  const [bate, setBate] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const mudar = () => setBate(mq.matches)
    mudar()
    mq.addEventListener('change', mudar)
    return () => mq.removeEventListener('change', mudar)
  }, [query])
  return bate
}

/** Observa os elementos [data-revelar] e marca .visivel quando entram na tela. */
export function iniciarEntradas(raiz: ParentNode = document) {
  const alvos = Array.from(raiz.querySelectorAll<HTMLElement>('[data-revelar]:not(.visivel)'))
  if (!('IntersectionObserver' in window)) {
    alvos.forEach((el) => el.classList.add('visivel'))
    return () => {}
  }
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) {
          e.target.classList.add('visivel')
          io.unobserve(e.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  )
  alvos.forEach((el) => io.observe(el))
  return () => io.disconnect()
}

/** Formata valores em reais. */
export const reais = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
