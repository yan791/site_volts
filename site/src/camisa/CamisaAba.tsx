import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Icone } from '../componentes/Icone'
import { Logo } from '../componentes/Logo'
import { camisa, linkWhatsApp } from '../dados/volts'
import { travarRolagem } from '../lib/rolagem'
import { asset, reais } from '../lib/utilidades'
import { Seletores } from './Seletores'
import type { ControleVisualizador } from './Visualizador3D'
import type { IdVariante, Variante } from './modelos'
import './CamisaAba.css'

const Visualizador3D = lazy(() => import('./Visualizador3D'))

type Props = { aberta: boolean; variante: Variante; aoMudar: (id: IdVariante) => void; aoFechar: () => void }

export function CamisaAba({ aberta, variante, aoMudar, aoFechar }: Props) {
  const painelRef = useRef<HTMLDivElement>(null)
  const controle = useRef<ControleVisualizador>(null)
  const [sem3D, setSem3D] = useState(false)
  const [perto, setPerto] = useState(false)
  const [vista, setVista] = useState<'frente' | 'lado' | 'costas' | null>(null)
  const [montar, setMontar] = useState(aberta)

  useEffect(() => {
    if (aberta) setMontar(true)
  }, [aberta])

  useEffect(() => {
    if (!aberta) return
    const origem = document.activeElement as HTMLElement | null
    travarRolagem(true, 'camisa')
    const fora = Array.from(document.querySelectorAll<HTMLElement>('.cabecalho, main, .rodape'))
    fora.forEach((el) => el.setAttribute('inert', ''))
    const t = setTimeout(() => painelRef.current?.focus({ preventScroll: true }), 60)
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', tecla)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', tecla)
      fora.forEach((el) => el.removeAttribute('inert'))
      travarRolagem(false, 'camisa')
      origem?.focus?.({ preventScroll: true })
    }
  }, [aberta, aoFechar])

  const escolha = `${variante.nome} ${variante.corNome.toLowerCase()}`
  const metade = camisa.preco / 2

  const irPara = (v: 'frente' | 'lado' | 'costas') => {
    setVista(v)
    controle.current?.vista(v)
  }

  if (!montar) return null

  return (
    <div
      ref={painelRef}
      className={`aba ${aberta ? 'aba--aberta' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="aba-titulo"
      aria-hidden={!aberta}
      tabIndex={-1}
      data-lenis-prevent
    >
      <div className="aba__topo">
        <Logo className="aba__logo" />
        <p className="rotulo aba__trilha">Loja Volts · Camisa oficial</p>
        <button type="button" className="aba__fechar" onClick={aoFechar}>
          <span className="sr-only">Fechar a camisa oficial</span>
          <Icone nome="fechar" tamanho={22} />
        </button>
      </div>

      <div className="aba__corpo">
        <div className="aba__palco">
          <div className="portal portal--aba" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          {aberta && !sem3D ? (
            <Suspense fallback={null}>
              <Visualizador3D ref={controle} variante={variante} aoFalhar={() => setSem3D(true)} />
            </Suspense>
          ) : (
            <img
              className="aba__estatica"
              src={asset(`img/camisa-${variante.id}-900.webp`)}
              alt={`${variante.nome} oficial Volts, ${variante.corNome}`}
              width={900}
              height={1000}
            />
          )}

          {!sem3D && (
            <div className="aba__controles">
              <div className="aba__vistas" role="group" aria-label="Ver a camisa de outro ângulo">
                {(['frente', 'lado', 'costas'] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={vista === v} onClick={() => irPara(v)}>
                    {v === 'frente' ? 'Frente' : v === 'lado' ? 'Lado' : 'Costas'}
                  </button>
                ))}
              </div>
              <button type="button" className="aba__zoom" aria-pressed={perto} onClick={() => setPerto(controle.current?.alternarZoom() ?? false)}>
                <Icone nome={perto ? 'menos' : 'mais'} tamanho={18} />
                <span className="aba__zoom-texto">{perto ? 'Afastar' : 'Ver detalhes'}</span>
              </button>
            </div>
          )}
          {!sem3D && (
            <p className="aba__dica" aria-hidden="true">
              <Icone nome="girar" tamanho={16} /> Arraste para girar
            </p>
          )}
        </div>

        <div className="aba__info">
          <h2 id="aba-titulo" className="aba__titulo">
            <span className="display">Camisa</span> <span className="condensada destaque">oficial</span>
          </h2>
          <p className="aba__slogan">{camisa.slogan}</p>

          <div className="aba__preco">
            <span className="condensada">{reais(camisa.preco)}</span>
            <span>valor unitário</span>
          </div>

          <div className="aba__bloco">
            <Seletores variante={variante} aoMudar={aoMudar} prefixo="aba" />
            <p className="aba__escolha" aria-live="polite">
              Sua escolha: <strong>{escolha}</strong>
            </p>
            <p className="aba__tamanho" data-provisorio={camisa.tamanhos ? undefined : 'tamanhos e tabela de medidas'}>
              <Icone nome="camisa" tamanho={18} />
              {camisa.tamanhos ? `Tamanhos: ${camisa.tamanhos.join(', ')}.` : 'O tamanho você informa no formulário do pedido.'}
            </p>
          </div>

          <ul className="aba__qualidades">
            {camisa.qualidades.map((q) => (
              <li key={q.titulo}>
                <span className="aba__icone">
                  <Icone nome={q.icone} tamanho={22} />
                </span>
                <strong>{q.titulo}</strong>
                <span>{q.texto}</span>
              </li>
            ))}
          </ul>

          <section className="aba__bloco" aria-labelledby="aba-pagamento">
            <h3 id="aba-pagamento" className="aba__subtitulo">
              Pagamento em duas partes
            </h3>
            <div className="pagamento">
              <div className="pagamento__parte pagamento__parte--entrada">
                <span className="pagamento__pct condensada">50%</span>
                <span className="pagamento__valor">{reais(metade)}</span>
                <span className="pagamento__quando">Antecipado, para confirmar o pedido</span>
              </div>
              <div className="pagamento__parte">
                <span className="pagamento__pct condensada">50%</span>
                <span className="pagamento__valor">{reais(metade)}</span>
                <span className="pagamento__quando">Na entrega da camisa</span>
              </div>
            </div>
            <p className="aba__nota">
              <Icone nome="check" tamanho={16} /> O pedido só é feito depois do pagamento da entrada.
            </p>
          </section>

          <section className="aba__bloco" aria-labelledby="aba-passos">
            <h3 id="aba-passos" className="aba__subtitulo">
              Como garantir a sua
            </h3>
            <ol className="passos">
              {camisa.passos.map((p, i) => (
                <li key={p.titulo}>
                  <span className="passos__num condensada">{i + 1}</span>
                  <Icone nome={p.icone} tamanho={20} />
                  <span>{p.titulo}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="aba__acoes">
            <a className="botao botao--grande aba__pedido" href={camisa.formulario} target="_blank" rel="noopener">
              Fazer meu pedido <Icone nome="externo" className="seta" />
            </a>
            <p className="aba__aviso" data-provisorio="campos do formulário (modelo e cor)">
              Abre o formulário oficial da Volts no Google Forms, em uma nova aba. Pode ser preciso entrar com uma conta Google. No formulário,
              informe também a sua escolha: <strong>{escolha}</strong>.
            </p>
            <a
              className="botao botao--fantasma aba__duvida"
              href={linkWhatsApp(`Oi, Volts! Vim pelo site e tenho interesse na camisa oficial: ${escolha}. Pode me ajudar com o pedido?`)}
              target="_blank"
              rel="noopener"
            >
              <Icone nome="whatsapp" /> Tirar dúvidas no WhatsApp
            </a>
          </div>

          <p className="aba__rodape">
            Imagem 3D ilustrativa, feita a partir da arte oficial da camisa. A peça real pode ter pequenas variações de cor e acabamento.
          </p>
        </div>
      </div>

      <div className="aba__barra">
        <span>
          <strong>{reais(camisa.preco)}</strong> {escolha}
        </span>
        <a className="botao" href={camisa.formulario} target="_blank" rel="noopener">
          Fazer pedido
        </a>
      </div>
    </div>
  )
}
