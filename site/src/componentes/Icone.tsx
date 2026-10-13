/* Conjunto único de ícones de linha (24px, traço 1.75) para a página inteira não misturar estilos. */

const caminhos = {
  seta: <path d="M4.5 12h14M13 6l6 6-6 6" />,
  externo: <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />,
  whatsapp: (
    <>
      <path d="M3.6 20.4l1.25-4.15a8.6 8.6 0 1 1 3.05 3l-4.3 1.15z" />
      <path d="M9.3 8.3c.2-.45.45-.55.75-.55h.55c.2 0 .4.1.5.35l.7 1.6c.1.25.05.5-.1.7l-.5.6a6.2 6.2 0 0 0 2.75 2.75l.6-.5c.2-.15.45-.2.7-.1l1.6.7c.25.1.35.3.35.5v.55c0 .3-.1.55-.55.75-.6.3-1.6.4-3.05-.2a8.3 8.3 0 0 1-4.3-4.3c-.6-1.45-.5-2.45-.2-3.05z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r=".6" fill="currentColor" />
    </>
  ),
  mapa: (
    <>
      <path d="M12 21s-7-6.1-7-11.4a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" />
      <circle cx="12" cy="9.6" r="2.5" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  estacionamento: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M10 16.5v-9h3.2a2.6 2.6 0 0 1 0 5.2H10" />
    </>
  ),
  telefone: <path d="M5.2 4h3.3l1.6 4-2 1.4a11 11 0 0 0 6.5 6.5L16 13.9l4 1.6v3.3a1.5 1.5 0 0 1-1.6 1.5C10.6 19.8 4.2 13.4 3.7 5.6A1.5 1.5 0 0 1 5.2 4z" />,
  play: <path d="M8.5 5.8v12.4L18.5 12z" fill="currentColor" />,
  fechar: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 8.5h16M4 15.5h11" />,
  raio: <path d="M13.2 2.5L4.8 13.6h6.4l-1 7.9 8.4-11.2h-6.5z" />,
  haltere: <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />,
  vento: <path d="M3 8.5h10.5a3 3 0 1 0-3-3M3 12.5h15a3 3 0 1 1-3 3M3 16.5h6" />,
  escudo: (
    <>
      <path d="M12 3.2l7 2.8v5.6c0 4.4-3 7.9-7 9.3-4-1.4-7-4.9-7-9.3V6z" />
      <path d="M9 12l2.1 2.1L15.2 10" />
    </>
  ),
  pessoa: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.6 20.3c1.2-3.6 3.9-5.3 7.4-5.3s6.2 1.7 7.4 5.3" />
    </>
  ),
  camisa: <path d="M8.3 3.5L3.3 6.4l2.3 4L8 9.3v11.2h8V9.3l2.4 1.1 2.3-4-5-2.9c-.5 1.4-1.9 2.4-3.7 2.4s-3.2-1-3.7-2.4z" />,
  recibo: (
    <>
      <path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z" />
      <path d="M9 8h6M9 11.5h6M9 15h3.5" />
    </>
  ),
  girar: <path d="M19.5 12.5a7.5 7.5 0 1 1-2.2-5.8M19.5 4v4.4h-4.4" />,
  check: <path d="M5 12.5l4.4 4.4L19 7.4" />,
  calendario: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.8h17M8 3v4M16 3v4" />
    </>
  ),
  mais: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  cartao: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  frente: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17M3.5 12h17" opacity=".5" />
    </>
  ),
}

export type NomeIcone = keyof typeof caminhos

export function Icone({ nome, tamanho = 20, className = '' }: { nome: NomeIcone; tamanho?: number; className?: string }) {
  return (
    <svg
      className={`icone ${className}`}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {caminhos[nome]}
    </svg>
  )
}
