import './Logo.css'

/*
 * Redesenho em vetor da marca da Volts a partir da foto de perfil do Instagram:
 * o "V" é um raio amarelo e uma barra branca. PENDENTE: trocar pelo arquivo vetorial
 * oficial quando a Volts enviar.
 */
export function Marca({ className = '', raio = 'var(--logo-raio, #f2ea00)' }: { className?: string; raio?: string }) {
  return (
    <svg className={className} viewBox="-4 -4 317 268" aria-hidden="true" focusable="false">
      <path d="M0 0H69L100 92L119 102L85 106L84 186Z" fill={raio} stroke={raio} strokeWidth="5" strokeLinejoin="round" />
      <path d="M228 0H309L201 260H121Z" fill="currentColor" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ className = '', semSub = false }: { className?: string; semSub?: boolean }) {
  return (
    <span className={`logo ${className}`} role="img" aria-label="Volts Training Studio">
      <span className="logo__linha" aria-hidden="true">
        <Marca className="logo__marca" />
        <span className="logo__palavra">OLTS</span>
      </span>
      {!semSub && (
        <span className="logo__sub" aria-hidden="true">
          Training Studio
        </span>
      )}
    </span>
  )
}
