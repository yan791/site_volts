import { useRef, useState } from 'react'
import { asset } from '../lib/utilidades'
import { Icone } from './Icone'
import './Reel.css'

type Props = {
  video: 'aqui-e-a-volts' | 'como-chegar' | 'modalidades'
  titulo: string
  duracao: string
  className?: string
}

/*
 * Reel real do Instagram da Volts. Nada é baixado até o visitante tocar em assistir:
 * o vídeo entra no lugar da capa e começa com som e controles.
 */
export function Reel({ video, titulo, duracao, className = '' }: Props) {
  const [ativo, setAtivo] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)

  return (
    <figure className={`reel ${ativo ? 'reel--ativo' : ''} ${className}`}>
      {ativo ? (
        <video
          ref={ref}
          className="reel__video"
          src={asset(`video/${video}.mp4`)}
          poster={asset(`video/${video}.webp`)}
          controls
          autoPlay
          playsInline
          preload="auto"
          aria-label={titulo}
        />
      ) : (
        <button type="button" className="reel__capa" onClick={() => setAtivo(true)} aria-label={`Assistir ao vídeo: ${titulo} (${duracao})`}>
          <img src={asset(`video/${video}.webp`)} alt="" loading="lazy" decoding="async" width={540} height={960} />
          <span className="reel__play" aria-hidden="true">
            <Icone nome="play" tamanho={22} />
          </span>
          <span className="reel__info" aria-hidden="true">
            <span className="reel__titulo">{titulo}</span>
            <span className="reel__duracao">{duracao}</span>
          </span>
        </button>
      )}
      <figcaption className="sr-only">Vídeo publicado no Instagram da Volts: {titulo}</figcaption>
    </figure>
  )
}
