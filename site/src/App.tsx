import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { CamisaAba } from './camisa/CamisaAba'
import { CamisaScroll } from './camisa/CamisaScroll'
import { varianteId, type IdVariante } from './camisa/modelos'
import { Abertura } from './componentes/Abertura'
import { Cursor } from './componentes/Cursor'
import { Voltimetro } from './componentes/Voltimetro'
import { Cabecalho } from './secoes/Cabecalho'
import { Carga } from './secoes/Carga'
import { ChamadaFinal } from './secoes/ChamadaFinal'
import { Comunidade } from './secoes/Comunidade'
import { Contato } from './secoes/Contato'
import { Diferenciais } from './secoes/Diferenciais'
import { Estrutura } from './secoes/Estrutura'
import { Focos } from './secoes/Focos'
import { Manifesto } from './secoes/Manifesto'
import { Perguntas } from './secoes/Perguntas'
import { Programas } from './secoes/Programas'
import { Rodape } from './secoes/Rodape'
import { Historia } from './story/Historia'
import { ligarEfeitos } from './lib/efeitos'
import { encerrarRolagem, iniciarRolagem, ligarAncoras, ScrollTrigger } from './lib/rolagem'
import { iniciarEntradas } from './lib/utilidades'
import { iniciarRevisao } from './lib/revisao'

const RenderCamisa = import.meta.env.DEV ? lazy(() => import('./camisa/RenderCamisa')) : null
const parametros = new URLSearchParams(location.search)
const HASH_CAMISA = '#comprar-camisa'

export function App() {
  if (RenderCamisa && parametros.get('render')) {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
    return (
      <Suspense fallback={null}>
        <RenderCamisa id={parametros.get('render') as IdVariante} angulo={Number(parametros.get('angulo') ?? -0.35)} />
      </Suspense>
    )
  }
  return <Site />
}

function Site() {
  const [variante, setVariante] = useState<IdVariante>('camiseta-verde')
  const [abaAberta, setAbaAberta] = useState(() => location.hash === HASH_CAMISA)
  const abertaPelaPagina = useRef(false)

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true })
    iniciarRolagem()
    const desligar = ligarAncoras()
    const entradas = iniciarEntradas()
    const efeitos = ligarEfeitos(document.getElementById('raiz')!)
    iniciarRevisao()
    // fontes e imagens mudam alturas: recalcula os gatilhos quando chegarem
    const recalcular = () => ScrollTrigger.refresh()
    document.fonts.ready.then(recalcular)
    window.addEventListener('load', recalcular)
    const pausar = () => document.body.classList.toggle('pausado', document.hidden)
    document.addEventListener('visibilitychange', pausar)
    return () => {
      desligar()
      entradas()
      efeitos()
      encerrarRolagem()
      window.removeEventListener('load', recalcular)
      document.removeEventListener('visibilitychange', pausar)
    }
  }, [])

  useEffect(() => {
    const aoMudarHash = () => {
      const aberta = location.hash === HASH_CAMISA
      if (aberta) abertaPelaPagina.current = true
      setAbaAberta(aberta)
    }
    window.addEventListener('hashchange', aoMudarHash)
    return () => window.removeEventListener('hashchange', aoMudarHash)
  }, [])

  const fecharAba = useCallback(() => {
    if (abertaPelaPagina.current) {
      abertaPelaPagina.current = false
      history.back()
    } else {
      history.replaceState(null, '', location.pathname + location.search)
      setAbaAberta(false)
    }
  }, [])

  const v = varianteId(variante)

  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Abertura />
      <div className="ambiente" aria-hidden="true" />
      <Cabecalho />
      <main id="conteudo" tabIndex={-1}>
        <Historia />
        <Manifesto />
        <Focos />
        <Programas />
        <Diferenciais />
        <Carga />
        <Estrutura />
        <Comunidade />
        <CamisaScroll aoMudar={setVariante} />
        <Contato />
        <Perguntas />
        <ChamadaFinal />
      </main>
      <Rodape />
      <Voltimetro />
      <Cursor />
      <CamisaAba aberta={abaAberta} variante={v} aoMudar={setVariante} aoFechar={fecharAba} />
    </>
  )
}
