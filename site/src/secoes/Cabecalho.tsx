import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Icone } from '../componentes/Icone'
import { Logo } from '../componentes/Logo'
import { contato, linkWhatsApp, mensagens } from '../dados/volts'
import { rolarPara, travarRolagem } from '../lib/rolagem'
import './Cabecalho.css'

const LINKS = [
  { href: '#programas', rotulo: 'Programas' },
  { href: '#experiencia', rotulo: 'Diferenciais' },
  { href: '#estrutura', rotulo: 'Estrutura' },
  { href: '#camisa', rotulo: 'Camisa oficial', soNoMenu: true },
  { href: '#contato', rotulo: 'Como chegar' },
]
// a barra fica sempre visível e translúcida (não apaga a animação do início): os dois atalhos
// levam direto ao ponto, comprar a camiseta ou agendar a aula

export function Cabecalho() {
  const [rolou, setRolou] = useState(false)
  const [aberto, setAberto] = useState(false)
  const botaoRef = useRef<HTMLButtonElement>(null)
  const painelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ver = () => setRolou(window.scrollY > 24)
    ver()
    window.addEventListener('scroll', ver, { passive: true })
    return () => window.removeEventListener('scroll', ver)
  }, [])

  useEffect(() => {
    if (!aberto) return
    travarRolagem(true, 'menu')
    const primeiro = painelRef.current?.querySelector<HTMLElement>('a, button')
    primeiro?.focus()
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
      if (e.key === 'Tab' && painelRef.current) {
        const focaveis = Array.from(painelRef.current.querySelectorAll<HTMLElement>('a, button'))
        const ini = focaveis[0]
        const fim = focaveis[focaveis.length - 1]
        if (e.shiftKey && document.activeElement === ini) {
          e.preventDefault()
          fim.focus()
        } else if (!e.shiftKey && document.activeElement === fim) {
          e.preventDefault()
          ini.focus()
        }
      }
    }
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('keydown', tecla)
      travarRolagem(false, 'menu')
    }
  }, [aberto])

  const fechar = () => {
    setAberto(false)
    botaoRef.current?.focus()
  }

  const irPara = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setAberto(false)
    // espera o menu soltar a rolagem antes de deslizar até a seção
    requestAnimationFrame(() => requestAnimationFrame(() => rolarPara(href)))
  }

  return (
    <header className={`cabecalho ${rolou ? 'cabecalho--rolou' : ''} ${aberto ? 'cabecalho--aberto' : ''}`}>
      <div className="recipiente cabecalho__barra">
        <a href="#inicio" className="cabecalho__logo" aria-label="Volts Training Studio, voltar ao início">
          <Logo />
        </a>

        <nav className="cabecalho__nav" aria-label="Seções da página">
          <ul>
            {LINKS.filter((l) => !l.soNoMenu).map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.rotulo}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="cabecalho__acoes">
          <a className="botao botao--fantasma cabecalho__atalho cabecalho__atalho--camisa" href="#comprar-camisa" data-cursor="Comprar">
            <Icone nome="camisa" tamanho={17} className="cabecalho__icone" />
            <span>
              Camiseta <span className="cabecalho__quebra">Volts</span>
            </span>
          </a>
          <a className="botao cabecalho__atalho" href={linkWhatsApp(mensagens.experimental)} target="_blank" rel="noopener" data-cursor="Agendar">
            <Icone nome="whatsapp" tamanho={17} className="cabecalho__icone" />
            <span>
              Agendar <span className="cabecalho__quebra">Aula</span>
            </span>
          </a>
          <button
            ref={botaoRef}
            type="button"
            className="cabecalho__menu"
            aria-expanded={aberto}
            aria-controls="menu-celular"
            onClick={() => (aberto ? fechar() : setAberto(true))}
          >
            <span className="sr-only">{aberto ? 'Fechar menu' : 'Abrir menu'}</span>
            <Icone nome={aberto ? 'fechar' : 'menu'} tamanho={24} />
          </button>
        </div>
      </div>

      <div id="menu-celular" ref={painelRef} className="menu-celular" hidden={!aberto} role="dialog" aria-modal="true" aria-label="Menu">
        <nav aria-label="Seções da página">
          <ol className="menu-celular__lista">
            {LINKS.map((l, i) => (
              <li key={l.href} style={{ ['--i' as string]: i }}>
                <a href={l.href} onClick={(e) => irPara(e, l.href)}>
                  <span className="menu-celular__num">{String(i + 1).padStart(2, '0')}</span>
                  {l.rotulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="menu-celular__rodape">
          <a className="botao botao--grande" href={linkWhatsApp(mensagens.experimental)} target="_blank" rel="noopener">
            Agendar aula experimental <Icone nome="seta" className="seta" />
          </a>
          <div className="menu-celular__contatos">
            <a href={contato.instagram} target="_blank" rel="noopener">
              <Icone nome="instagram" /> {contato.instagramUsuario}
            </a>
            <a href={contato.telefoneLink}>
              <Icone nome="telefone" /> {contato.telefone}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
