import { useId, useState } from 'react'
import { Icone } from '../componentes/Icone'
import { linkWhatsApp, mensagens, perguntas } from '../dados/volts'
import './Perguntas.css'

export function Perguntas() {
  const [aberta, setAberta] = useState<number | null>(0)
  const base = useId()

  return (
    <section id="duvidas" className="duvidas" aria-labelledby="duvidas-titulo">
      <div className="recipiente duvidas__grade">
        <div className="duvidas__lado">
          <p className="rotulo" data-revelar>
            <span className="indice">08</span> Dúvidas
          </p>
          <h2 id="duvidas-titulo" className="titulo-secao" data-revelar style={{ ['--atraso' as string]: 80 }}>
            Antes da <span className="destaque">primeira aula</span>
          </h2>
          <p className="lede" data-revelar style={{ ['--atraso' as string]: 140 }}>
            Não encontrou o que procurava? A equipe responde pelo WhatsApp.
          </p>
          <a className="link-seta" href={linkWhatsApp(mensagens.duvida)} target="_blank" rel="noopener" data-revelar>
            Perguntar pelo WhatsApp <Icone nome="seta" tamanho={16} />
          </a>
        </div>

        <ul className="duvidas__lista" data-revelar>
          {perguntas.map((q, i) => {
            const ativa = aberta === i
            const idBotao = `${base}-b${i}`
            const idPainel = `${base}-p${i}`
            return (
              <li key={q.p} className={`duvida ${ativa ? 'duvida--aberta' : ''}`}>
                <h3>
                  <button id={idBotao} type="button" aria-expanded={ativa} aria-controls={idPainel} onClick={() => setAberta(ativa ? null : i)}>
                    <span>{q.p}</span>
                    <span className="duvida__sinal" aria-hidden="true" />
                  </button>
                </h3>
                <div id={idPainel} role="region" aria-labelledby={idBotao} className="duvida__painel" inert={!ativa}>
                  <div>
                    <p>{q.r}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
