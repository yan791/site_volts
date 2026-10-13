import { cores, coresDoTipo, tipos, variantePor, type IdVariante, type Variante } from './modelos'
import './Seletores.css'

/** Escolha de modelo e de cor da camisa oficial (usada na seção da página e na aba de compra). */
export function Seletores({ variante, aoMudar, prefixo }: { variante: Variante; aoMudar: (id: IdVariante) => void; prefixo: string }) {
  const disponiveis = coresDoTipo(variante.tipo)

  const trocarTipo = (tipo: Variante['tipo']) => {
    const v = variantePor(tipo, variante.cor) ?? variantePor(tipo, coresDoTipo(tipo)[0])
    if (v) aoMudar(v.id)
  }
  const trocarCor = (cor: Variante['cor']) => {
    const v = variantePor(variante.tipo, cor)
    if (v) aoMudar(v.id)
  }

  return (
    <div className="seletores">
      <fieldset className="seletores__grupo">
        <legend className="seletores__titulo">
          Cor <span>{cores.find((c) => c.id === variante.cor)?.nome}</span>
        </legend>
        <div className="seletores__cores">
          {cores.map((c) => {
            const ok = disponiveis.includes(c.id)
            return (
              <label key={c.id} className={`amostra ${ok ? '' : 'amostra--indisponivel'}`} title={ok ? c.nome : `${c.nome}: não disponível em ${variante.nome.toLowerCase()}`}>
                <input
                  type="radio"
                  name={`${prefixo}-cor`}
                  value={c.id}
                  checked={variante.cor === c.id}
                  disabled={!ok}
                  onChange={() => trocarCor(c.id)}
                />
                <span className="amostra__bola" style={{ ['--a' as string]: c.amostra, ['--d' as string]: c.detalhe }} aria-hidden="true" />
                <span className="amostra__nome">{c.nome}</span>
              </label>
            )
          })}
        </div>
        {disponiveis.length < cores.length && (
          <p className="seletores__nota" data-provisorio="outras cores da regata">
            Regata disponível na cor amarela.
          </p>
        )}
      </fieldset>

      <fieldset className="seletores__grupo">
        <legend className="seletores__titulo">Modelo</legend>
        <div className="seletores__modelos">
          {tipos.map((t) => (
            <label key={t.id} className="modelo-opcao">
              <input type="radio" name={`${prefixo}-modelo`} value={t.id} checked={variante.tipo === t.id} onChange={() => trocarTipo(t.id)} />
              <span>{t.nome}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
