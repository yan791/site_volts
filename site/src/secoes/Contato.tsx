import { useState } from 'react'
import { Foto } from '../componentes/Foto'
import { Icone } from '../componentes/Icone'
import { Reel } from '../componentes/Reel'
import { contato, linkWhatsApp, mensagens } from '../dados/volts'
import './Contato.css'

export function Contato() {
  const [mapa, setMapa] = useState(false)

  return (
    <section id="contato" className="contato" aria-labelledby="contato-titulo">
      <div className="recipiente">
        <header className="contato__topo">
          <p className="rotulo" data-revelar>
            <span className="indice">07</span> Como chegar
          </p>
          <h2 id="contato-titulo" className="titulo-secao" data-revelar style={{ ['--atraso' as string]: 80 }}>
            Chegar na Volts <span className="destaque">é fácil.</span>
          </h2>
        </header>

        <div className="contato__grade">
          <div className="contato__info" data-revelar>
            <dl className="contato__lista">
              <div>
                <dt>
                  <Icone nome="mapa" /> Endereço
                </dt>
                <dd>
                  <strong>{contato.endereco}</strong>
                  <span>{contato.cidade}</span>
                  <span className="contato__ref">{contato.referencia}</span>
                </dd>
              </div>
              <div>
                <dt>
                  <Icone nome="estacionamento" /> Estacionamento
                </dt>
                <dd>{contato.estacionamento}</dd>
              </div>
              <div>
                <dt>
                  <Icone nome="relogio" /> Horários
                </dt>
                <dd data-provisorio={contato.horarios ? undefined : 'horários de funcionamento'}>
                  {contato.horarios ? (
                    contato.horarios.map((h) => (
                      <span key={h.dias}>
                        <strong>{h.dias}</strong> {h.horas}
                      </span>
                    ))
                  ) : (
                    <>
                      Os horários das aulas e das turmas são informados pela equipe.{' '}
                      <a className="contato__link" href={linkWhatsApp(mensagens.horarios)} target="_blank" rel="noopener">
                        Consultar pelo WhatsApp
                      </a>
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt>
                  <Icone nome="telefone" /> Telefone e WhatsApp
                </dt>
                <dd>
                  <a className="contato__link" href={contato.telefoneLink}>
                    {contato.telefone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>
                  <Icone nome="instagram" /> Instagram
                </dt>
                <dd>
                  <a className="contato__link" href={contato.instagram} target="_blank" rel="noopener">
                    {contato.instagramUsuario}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="contato__acoes">
              <a className="botao" href={linkWhatsApp(mensagens.experimental)} target="_blank" rel="noopener">
                Agendar aula experimental <Icone nome="seta" className="seta" />
              </a>
              <a className="botao botao--fantasma" href={contato.rotas} target="_blank" rel="noopener">
                <Icone nome="mapa" /> Abrir rota
              </a>
            </div>
            <a className="contato__aluno" href={contato.areaDoAluno} target="_blank" rel="noopener">
              <span>
                <strong>Já é aluno?</strong> Agende suas aulas na área do aluno.
              </span>
              <Icone nome="externo" tamanho={18} />
            </a>
          </div>

          <div className="contato__mapa" data-revelar style={{ ['--atraso' as string]: 120 }}>
            {mapa ? (
              <iframe
                title="Mapa com a localização da Volts Training Studio em Olinda"
                src={contato.mapaEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <button type="button" className="contato__carregar-mapa" onClick={() => setMapa(true)}>
                <Foto nome="fachada" alt="" sizes="(max-width: 899px) 92vw, 40vw" posicao="30% 88%" />
                <span className="contato__carregar-texto">
                  <Icone nome="mapa" tamanho={22} />
                  <strong>Ver no mapa</strong>
                  <span>Carrega o Google Maps</span>
                </span>
              </button>
            )}
          </div>

          <div className="contato__video" data-revelar style={{ ['--atraso' as string]: 200 }}>
            <Reel video="como-chegar" titulo="O caminho até a Volts" duracao="24 s" />
          </div>
        </div>
      </div>
    </section>
  )
}
