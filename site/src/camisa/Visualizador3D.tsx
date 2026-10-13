import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { CenaCamisa, type Vista } from './cena'
import { variantes, type Variante } from './modelos'
import { useMovimentoReduzido } from '../lib/utilidades'
import './Visualizador3D.css'

export type ControleVisualizador = {
  vista: (v: Vista) => void
  alternarZoom: () => boolean
}

type Props = {
  variante: Variante
  /** ângulo fixo, sem giro automático: usado para gerar as imagens estáticas */
  anguloFixo?: number
  aoFalhar?: () => void
}

function temWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}

const Visualizador3D = forwardRef<ControleVisualizador, Props>(function Visualizador3D({ variante, anguloFixo, aoFalhar }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cenaRef = useRef<CenaCamisa | null>(null)
  const [progresso, setProgresso] = useState(0)
  const [pronto, setPronto] = useState(false)
  const reduzido = useMovimentoReduzido()

  useImperativeHandle(ref, () => ({
    vista: (v) => cenaRef.current?.vista(v),
    alternarZoom: () => cenaRef.current?.alternarZoom() ?? false,
  }))

  useEffect(() => {
    if (!canvasRef.current) return
    if (!temWebGL()) {
      aoFalhar?.()
      return
    }
    const cena = new CenaCamisa(canvasRef.current, {
      reduzido: reduzido || anguloFixo !== undefined,
      aoProgresso: (p) => setProgresso(p),
      aoErro: () => aoFalhar?.(),
    })
    cenaRef.current = cena
    if (anguloFixo !== undefined) cena.fixar(anguloFixo)
    return () => {
      cena.destruir()
      cenaRef.current = null
    }
    // a cena é criada uma vez; a variante muda pelo efeito abaixo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const cena = cenaRef.current
    if (!cena) return
    let vivo = true
    cena.mostrar(variante).then(() => {
      if (!vivo) return
      setPronto(true)
      if (anguloFixo !== undefined) (window as unknown as { __camisaPronta: boolean }).__camisaPronta = true
      // deixa a outra peça pronta para a troca ser imediata
      const outra = variantes.find((v) => v.tipo !== variante.tipo)
      if (outra) cena.preparar(outra.tipo)
    })
    return () => {
      vivo = false
    }
  }, [variante, anguloFixo])

  const volts = Math.round(progresso * 220)

  return (
    <div className={`v3d ${pronto ? 'v3d--pronto' : ''}`}>
      <canvas
        ref={canvasRef}
        className="v3d__canvas"
        tabIndex={0}
        role="img"
        aria-label={`${variante.nome} oficial Volts, ${variante.corNome}, em 3D. Arraste para girar ou use as setas do teclado.`}
      />
      {!pronto && (
        <div className="v3d__carregando" aria-live="polite">
          <span className="v3d__volts condensada">
            {String(volts).padStart(3, '0')}
            <small>V</small>
          </span>
          <span className="v3d__barra">
            <i style={{ transform: `scaleX(${Math.max(progresso, 0.04)})` }} />
          </span>
          <span className="rotulo">Montando a camisa em 3D</span>
        </div>
      )}
    </div>
  )
})

export default Visualizador3D
