import { useMemo } from 'react'
import './NeonTeto.css'

/*
 * Elemento assinatura do site: o teto do salão da Volts, com os quadros de neon
 * (moldura branca quente por fora, verde por dentro), redesenhado em perspectiva.
 * No hero ele continua o teto real da foto; no fim da página ele acende inteiro.
 */

type Config = {
  w: number
  h: number
  vp: [number, number] // ponto de fuga
  f: number // distância focal
  altura: number // altura do teto acima do olho
  lado: number // tamanho de cada quadro no mundo
  colunas: number[]
  fileiras: number[]
}

const CONFIGS: Record<'hero' | 'final', Config> = {
  // mesmo ponto de fuga do teto real na foto do hero (centro do painel à direita)
  hero: {
    w: 1440,
    h: 900,
    vp: [1109, 470],
    f: 1050,
    altura: 1,
    lado: 0.8,
    colunas: [-2.1, -3.5, -4.9, -6.3, -7.7, -9.1],
    fileiras: [3, 4.4, 6.4],
  },
  final: {
    w: 1600,
    h: 900,
    vp: [800, 540],
    f: 940,
    altura: 1,
    lado: 0.8,
    colunas: [-5.6, -4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2, 5.6],
    fileiras: [1.6, 2.2, 3, 4, 5.2],
  },
}

type Quadro = { externo: string; interno: string; ordem: number; tamanho: number }

function projetar(c: Config, x: number, z: number): [number, number] {
  return [c.vp[0] + (x * c.f) / z, c.vp[1] - (c.altura * c.f) / z]
}

function poligono(c: Config, cx: number, cz: number, meio: number) {
  const pts = [
    projetar(c, cx - meio, cz - meio),
    projetar(c, cx + meio, cz - meio),
    projetar(c, cx + meio, cz + meio),
    projetar(c, cx - meio, cz + meio),
  ]
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

function montar(c: Config): Quadro[] {
  const lista: Quadro[] = []
  for (const z of c.fileiras) {
    for (const x of c.colunas) {
      const [px] = projetar(c, x, z)
      const tamanho = (c.lado * c.f) / z
      // a ordem de acendimento parte do ponto de fuga, como uma corrente percorrendo o teto
      const ordem = Math.hypot(px - c.vp[0], z * 120)
      lista.push({
        externo: poligono(c, x, z, c.lado / 2),
        interno: poligono(c, x, z, c.lado * 0.27),
        ordem,
        tamanho,
      })
    }
  }
  const ordenados = [...lista].sort((a, b) => a.ordem - b.ordem)
  ordenados.forEach((q, i) => (q.ordem = i))
  return lista
}

export function NeonTeto({ variante, ligado, className = '' }: { variante: 'hero' | 'final'; ligado: boolean; className?: string }) {
  const c = CONFIGS[variante]
  const quadros = useMemo(() => montar(c), [c])
  return (
    <svg
      className={`neon-teto neon-teto--${variante} ${ligado ? 'neon-teto--ligado' : ''} ${className}`}
      viewBox={`0 0 ${c.w} ${c.h}`}
      preserveAspectRatio={variante === 'hero' ? 'xMaxYMin slice' : 'xMidYMin slice'}
      aria-hidden="true"
      focusable="false"
    >
      {quadros.map((q, i) => (
        <g key={i} className="neon-teto__quadro" style={{ ['--i' as string]: q.ordem }}>
          <polygon className="nt-brilho nt-quente" points={q.externo} />
          <polygon className="nt-brilho nt-verde" points={q.interno} />
          <polygon className="nt-linha nt-quente" points={q.externo} />
          <polygon className="nt-linha nt-verde" points={q.interno} />
        </g>
      ))}
    </svg>
  )
}
