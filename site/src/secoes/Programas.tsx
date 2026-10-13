import { useEffect, useRef, useState } from 'react'
import { Foto, type NomeFoto } from '../componentes/Foto'
import { Icone } from '../componentes/Icone'
import { Reel } from '../componentes/Reel'
import { linkWhatsApp, objetivos, programas, tambemNaVolts, type Programa } from '../dados/volts'
import { rolarPara } from '../lib/rolagem'
import './Programas.css'

const nomeCompleto = (p: Programa) => p.nome.join('')
function listar(nomes: string[]) {
  if (nomes.length <= 1) return nomes.join('')
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`
}

/*
 * Os quatro programas num carrossel horizontal que não prende a rolagem da página: quem quer
 * ver desliza (toque, arrasto, setas ou abas); quem não quer segue descendo normalmente.
 * Ao deslizar, número e nome andam em parallax e o painel que chega acende a moldura de neon.
 */
export function Programas() {
  const ref = useRef<HTMLElement>(null)
  const trilhoRef = useRef<HTMLOListElement>(null)
  const [objetivo, setObjetivo] = useState<string | null>(null)
  const [ativo, setAtivo] = useState(0)
  const escolhido = objetivos.find((o) => o.id === objetivo) ?? null
  const indicados = escolhido ? programas.filter((p) => escolhido.programas.includes(p.id)) : []

  useEffect(() => {
    const trilho = trilhoRef.current!
    const paineis = Array.from(trilho.children) as HTMLElement[]
    let raf = 0
    const medir = () => {
      raf = 0
      const w = trilho.clientWidth || 1
      const x = trilho.scrollLeft / w
      // --d: distância do painel ao centro (-1 a 1), usada no parallax do número e do nome
      paineis.forEach((p, i) => p.style.setProperty('--d', Math.max(-1, Math.min(1, i - x)).toFixed(3)))
      const i = Math.round(x)
      setAtivo(i)
      paineis.forEach((p, k) => p.classList.toggle('pg-painel--ativo', k === i))
    }
    const aoRolar = () => {
      if (!raf) raf = requestAnimationFrame(medir)
    }
    medir()
    trilho.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)

    // com mouse, dá para arrastar o trilho (no toque o deslize já é nativo)
    let arrasto: { x: number; ini: number; id: number } | null = null
    const descer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || (e.target as HTMLElement).closest('a, button')) return
      arrasto = { x: e.clientX, ini: trilho.scrollLeft, id: e.pointerId }
      trilho.setPointerCapture(e.pointerId)
      trilho.classList.add('pg-trilho--arrastando')
    }
    const mover = (e: PointerEvent) => {
      if (!arrasto) return
      trilho.scrollLeft = arrasto.ini - (e.clientX - arrasto.x)
    }
    const soltar = () => {
      if (!arrasto) return
      const w = trilho.clientWidth
      const desloc = trilho.scrollLeft - arrasto.ini
      // um arrasto curto já troca de painel, para frente ou para trás
      const base = Math.round(arrasto.ini / w)
      const alvo = Math.abs(desloc) > w * 0.12 ? base + Math.sign(desloc) : base
      trilho.releasePointerCapture(arrasto.id)
      arrasto = null
      trilho.classList.remove('pg-trilho--arrastando')
      trilho.scrollTo({ left: Math.max(0, Math.min(paineis.length - 1, alvo)) * w, behavior: 'smooth' })
    }
    trilho.addEventListener('pointerdown', descer)
    trilho.addEventListener('pointermove', mover)
    trilho.addEventListener('pointerup', soltar)
    trilho.addEventListener('pointercancel', soltar)
    return () => {
      cancelAnimationFrame(raf)
      trilho.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
      trilho.removeEventListener('pointerdown', descer)
      trilho.removeEventListener('pointermove', mover)
      trilho.removeEventListener('pointerup', soltar)
      trilho.removeEventListener('pointercancel', soltar)
    }
  }, [])

  const irParaPrograma = (i: number) => {
    const trilho = trilhoRef.current
    if (!trilho) return
    const alvo = Math.max(0, Math.min(programas.length - 1, i))
    trilho.scrollTo({ left: alvo * trilho.clientWidth, behavior: 'smooth' })
  }

  const escolher = (id: string) => {
    const novo = objetivo === id ? null : id
    setObjetivo(novo)
    const o = objetivos.find((x) => x.id === novo)
    if (!o) return
    irParaPrograma(programas.findIndex((p) => p.id === o.programas[0]))
    // traz o carrossel para a tela se ele estiver abaixo da dobra
    const caixa = ref.current?.querySelector<HTMLElement>('.pg-carrossel')
    if (caixa && caixa.getBoundingClientRect().top > window.innerHeight * 0.45) rolarPara(caixa)
  }

  return (
    <section ref={ref} id="programas" className="programas" aria-labelledby="pg-titulo">
      <header className="recipiente pg-topo">
        <div>
          <p className="rotulo" data-decodifica>
            02 / Programas
          </p>
          <h2 id="pg-titulo" className="pg-titulo">
            Quatro programas. <span className="destaque">Um só propósito:</span> fazer você evoluir.
          </h2>
        </div>
        <div className="pg-seletor">
          <p className="pg-pergunta" id="pg-pergunta">
            <Icone nome="raio" tamanho={16} /> Qual Volts combina com você?
          </p>
          <div className="pg-chips" role="group" aria-labelledby="pg-pergunta">
            {objetivos.map((o) => (
              <button key={o.id} type="button" className="pg-chip" aria-pressed={objetivo === o.id} onClick={() => escolher(o.id)}>
                {o.rotulo}
              </button>
            ))}
          </div>
          <p className="pg-resposta" aria-live="polite">
            {escolhido ? (
              <>
                Para <strong>{escolhido.frase}</strong>: <strong className="destaque">{listar(indicados.map(nomeCompleto))}</strong>.{' '}
                <a
                  className="pg-resposta-link"
                  href={linkWhatsApp(
                    `Oi, Volts! Vim pelo site e quero agendar uma aula experimental. Meu objetivo é ${escolhido.frase} e me interessei por ${listar(indicados.map(nomeCompleto))}.`,
                  )}
                  target="_blank"
                  rel="noopener"
                >
                  Agendar com esse objetivo
                </a>
              </>
            ) : (
              'Toque em um objetivo e o carrossel mostra o programa indicado.'
            )}
          </p>
        </div>
      </header>

      <div className="pg-carrossel" role="region" aria-roledescription="carrossel" aria-label="Programas da Volts">
        <ol ref={trilhoRef} className="pg-trilho" data-lenis-prevent-horizontal data-cursor="Arraste">
          {programas.map((p, i) => {
            const indicado = !!escolhido && escolhido.programas.includes(p.id)
            return (
              <li
                key={p.id}
                className={`pg-painel ${indicado ? 'pg-painel--indicado' : ''}`}
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${programas.length}: ${nomeCompleto(p)}`}
              >
                <span className="pg-num condensada" aria-hidden="true">
                  0{i + 1}
                </span>
                <div className="pg-foto">
                  <Foto nome={p.foto.src as NomeFoto} alt={p.foto.alt} sizes="(max-width: 767px) 92vw, 34vw" posicao={p.foto.posicao} />
                  <svg className="pg-moldura" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <rect x="4" y="3" width="92" height="94" pathLength={1} className="q" />
                    <rect x="16" y="15" width="68" height="70" pathLength={1} className="v" />
                  </svg>
                  <span className="pg-carga" aria-hidden="true">
                    +{55 * (i + 1)}V
                  </span>
                  {indicado && <span className="pg-indicado">Indicado para você</span>}
                </div>
                <h3 className="pg-nome">
                  <span className="display">{p.nome[0]}</span>
                  <span className="condensada destaque">{p.nome[1]}</span>
                </h3>
                <div className="pg-info">
                  <p className="pg-tipo">{p.tipo}</p>
                  <p className="pg-resumo">{p.resumo}</p>
                  <p className="pg-para">{p.paraQuem}</p>
                  <ul className="pg-focos" aria-label={`Focos do ${nomeCompleto(p)}`}>
                    {p.focos.map((f, k) => (
                      <li key={f} className="pg-foco" style={{ ['--k' as string]: k }}>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a className="botao botao--corrente" href={linkWhatsApp(p.acao.mensagem)} target="_blank" rel="noopener" data-cursor="Agendar">
                    {p.acao.rotulo} <span className="sr-only">: {nomeCompleto(p)}</span>
                    <Icone nome="seta" className="seta" />
                  </a>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="recipiente pg-controles">
          <div className="pg-progresso" role="group" aria-label="Escolher programa">
            {programas.map((p, i) => (
              <button key={p.id} type="button" className={`pg-passo ${i === ativo ? 'pg-passo--ativo' : ''}`} aria-current={i === ativo ? 'true' : undefined} onClick={() => irParaPrograma(i)}>
                <span className="pg-passo-num">0{i + 1}</span>
                <span className="pg-passo-nome">{nomeCompleto(p)}</span>
                <i />
              </button>
            ))}
          </div>
          <div className="pg-setas">
            <button type="button" className="pg-seta pg-seta--volta" aria-label="Programa anterior" disabled={ativo === 0} onClick={() => irParaPrograma(ativo - 1)}>
              <Icone nome="seta" tamanho={18} />
            </button>
            <button type="button" className="pg-seta" aria-label="Próximo programa" disabled={ativo === programas.length - 1} onClick={() => irParaPrograma(ativo + 1)}>
              <Icone nome="seta" tamanho={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="recipiente pg-depois">
        <div className="pg-tambem">
          <h3 className="rotulo" data-decodifica>
            Também na Volts
          </h3>
          <ul>
            {tambemNaVolts.map((t) => (
              <li key={t.titulo} data-provisorio={t.provisorio ? 'descrição e horários' : undefined}>
                <strong>{t.titulo}</strong>
                <span>{t.texto}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="pg-video">
          <div>
            <p className="pg-video-titulo">Ainda em dúvida?</p>
            <p>As quatro modalidades explicadas em um minuto, direto do estúdio.</p>
          </div>
          <Reel video="modalidades" titulo="As 4 modalidades" duracao="1 min" />
        </div>
      </div>
    </section>
  )
}
