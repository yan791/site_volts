import { Foto } from '../componentes/Foto'
import { Icone } from '../componentes/Icone'
import { contato, depoimentos, linkWhatsApp, mensagens } from '../dados/volts'
import './Comunidade.css'

export function Comunidade() {
  return (
    <section id="comunidade" className="comunidade" aria-labelledby="comunidade-titulo">
      <div className="comunidade__capa">
        <Foto
          nome="meia-maratona"
          alt="Três atletas da Volts com a camisa amarela do estúdio na Meia Maratona Eu Amo Recife"
          sizes="100vw"
          posicao="50% 38%"
        />
        <div className="recipiente comunidade__capa-texto">
          <p className="rotulo" data-revelar>
            <span className="indice">05</span> Comunidade
          </p>
          <h2 id="comunidade-titulo" className="titulo-secao comunidade__titulo" data-revelar style={{ ['--atraso' as string]: 80 }}>
            O movimento não para quando <span className="destaque">o treino acaba.</span>
          </h2>
        </div>
      </div>

      <div className="recipiente">
        <ul className="comunidade__grade">
          <li className="comunidade__card comunidade__card--corrida" data-revelar>
            <span className="comunidade__icone">
              <Icone nome="raio" />
            </span>
            <h3>Corrida Volts</h3>
            <p>Corridas em grupo saindo do estúdio. Todos os níveis são bem-vindos: o importante é estar junto.</p>
            <a className="link-seta" href={contato.instagram} target="_blank" rel="noopener">
              Próximas datas no Instagram <Icone nome="externo" tamanho={15} />
            </a>
          </li>
          <li className="comunidade__card" data-revelar style={{ ['--atraso' as string]: 90 }}>
            <span className="comunidade__icone">
              <Icone nome="calendario" />
            </span>
            <h3>Nas provas da cidade</h3>
            <p>Atletas da Volts na XIII Meia Maratona Eu Amo Recife: 21 km de desafio levando a energia do estúdio para as ruas.</p>
          </li>
          <li className="comunidade__card comunidade__card--foto" data-revelar style={{ ['--atraso' as string]: 180 }}>
            <div className="comunidade__card-img">
              <Foto nome="dia-do-cliente" alt="Alunos e equipe da Volts reunidos no Dia do Cliente" sizes="(max-width: 899px) 92vw, 32vw" />
            </div>
            <h3>Dia do Cliente</h3>
            <p>Em 15 de setembro, alunos e equipe celebraram juntos quem escolhe caminhar e evoluir com a Volts.</p>
          </li>
          <li className="comunidade__card comunidade__card--evento" data-revelar style={{ ['--atraso' as string]: 270 }}>
            <div className="comunidade__card-img">
              <Foto nome="evento" alt="Aluna comemorando em uma festa no espaço da Volts" sizes="(max-width: 899px) 46vw, 18vw" posicao="50% 8%" />
            </div>
            <h3>Seu evento aqui</h3>
            <p>O espaço também recebe aniversários e confraternizações.</p>
            <a className="link-seta" href={linkWhatsApp(mensagens.evento)} target="_blank" rel="noopener">
              Consultar disponibilidade <Icone nome="seta" tamanho={15} />
            </a>
          </li>
        </ul>

        {depoimentos.length > 0 && (
          <div className="depoimentos">
            <h3 className="rotulo">O que dizem os alunos</h3>
            <ul>
              {depoimentos.map((d) => (
                <li key={d.nome}>
                  <blockquote>
                    <p>{d.texto}</p>
                    <footer>
                      <strong>{d.nome}</strong> <span>{d.programa}</span>
                    </footer>
                  </blockquote>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
