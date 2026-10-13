import meta from '../dados/imagens.json'
import { asset } from '../lib/utilidades'

export type NomeFoto = keyof typeof meta

type Props = {
  nome: NomeFoto
  alt: string
  sizes: string
  className?: string
  prioridade?: boolean
  posicao?: string
}

/** Endereços da foto em todas as larguras geradas (src = a maior). */
export function fonteFoto(nome: NomeFoto) {
  const m = meta[nome]
  const maior = m.larguras[m.larguras.length - 1]
  return {
    src: asset(`img/${nome}-${maior}.webp`),
    srcSet: m.larguras.map((w) => `${asset(`img/${nome}-${w}.webp`)} ${w}w`).join(', '),
    w: m.w,
    h: m.h,
  }
}

/** Foto real da Volts em WebP, com srcset gerado por ferramentas/imagens.py. */
export function Foto({ nome, alt, sizes, className, prioridade, posicao }: Props) {
  const m = meta[nome]
  const f = fonteFoto(nome)
  return (
    <img
      className={className}
      src={f.src}
      srcSet={f.srcSet}
      sizes={sizes}
      width={m.w}
      height={m.h}
      alt={alt}
      loading={prioridade ? 'eager' : 'lazy'}
      decoding={prioridade ? 'sync' : 'async'}
      fetchPriority={prioridade ? 'high' : undefined}
      style={posicao ? { objectPosition: posicao } : undefined}
      draggable={false}
    />
  )
}
