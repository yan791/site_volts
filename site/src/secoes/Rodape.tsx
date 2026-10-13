import { Icone } from '../componentes/Icone'
import { Logo } from '../componentes/Logo'
import { contato, linkWhatsApp, mensagens } from '../dados/volts'
import './Rodape.css'

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="recipiente">
        <div className="rodape__grade">
          <div className="rodape__marca">
            <Logo />
            <p>Treino funcional, corrida e treinamento personalizado em grupos reduzidos. Olinda, PE.</p>
          </div>
          <nav aria-label="Rodapé">
            <h2 className="rodape__titulo">Navegue</h2>
            <ul>
              <li>
                <a href="#programas">Programas</a>
              </li>
              <li>
                <a href="#experiencia">Diferenciais</a>
              </li>
              <li>
                <a href="#estrutura">Estrutura</a>
              </li>
              <li>
                <a href="#camisa">Camisa oficial</a>
              </li>
              <li>
                <a href="#duvidas">Dúvidas</a>
              </li>
            </ul>
          </nav>
          <div>
            <h2 className="rodape__titulo">Contato</h2>
            <ul>
              <li>
                <a href={linkWhatsApp(mensagens.experimental)} target="_blank" rel="noopener">
                  <Icone nome="whatsapp" tamanho={18} /> WhatsApp
                </a>
              </li>
              <li>
                <a href={contato.telefoneLink}>
                  <Icone nome="telefone" tamanho={18} /> {contato.telefone}
                </a>
              </li>
              <li>
                <a href={contato.instagram} target="_blank" rel="noopener">
                  <Icone nome="instagram" tamanho={18} /> {contato.instagramUsuario}
                </a>
              </li>
              <li>
                <a href={contato.rotas} target="_blank" rel="noopener">
                  <Icone nome="mapa" tamanho={18} /> {contato.endereco}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="rodape__titulo">Alunos</h2>
            <ul>
              <li>
                <a href={contato.areaDoAluno} target="_blank" rel="noopener">
                  <Icone nome="calendario" tamanho={18} /> Área do aluno e agendamento
                </a>
              </li>
              <li>
                <a href="#comprar-camisa">
                  <Icone nome="camisa" tamanho={18} /> Comprar a camisa oficial
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="rodape__base">
          <p>© {new Date().getFullYear()} Volts Training Studio. Todos os direitos reservados.</p>
          <p>Fotos e vídeos: Instagram {contato.instagramUsuario}</p>
          <a href="#inicio" className="rodape__topo">
            Voltar ao topo <Icone nome="seta" tamanho={14} className="rodape__seta" />
          </a>
        </div>
      </div>
    </footer>
  )
}
