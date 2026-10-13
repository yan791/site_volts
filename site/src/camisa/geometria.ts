/*
 * Modelagem da camisa oficial por campo de distância (SDF) + "surface nets".
 *
 * A peça é descrita como um volume: tronco de seção elíptica que muda com a altura,
 * mangas cônicas fundidas ao tronco com junção suave (a "axila"), linha de ombros,
 * barra, decote, gola canelada e um leve caimento de tecido. A malha é extraída no
 * navegador (num Web Worker), então nenhum arquivo 3D precisa ser baixado.
 * Unidades em metros: a camiseta tem cerca de 74 cm de altura.
 */

export type TipoPeca = 'camiseta' | 'regata'

export type Malha = {
  posicoes: Float32Array
  normais: Float32Array
  zonas: Float32Array // pares [parte de dentro, gola/viés], suavizados para as bordas não serrilharem
  uvs: Float32Array
  indices: Uint32Array
}

// ---------------------------------------------------------------------------
// utilidades
// ---------------------------------------------------------------------------
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const suave = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
function smin(a: number, b: number, k: number) {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k)

/** Distância aproximada até uma elipse 2D (negativa dentro). */
function elipse(x: number, z: number, a: number, b: number) {
  const k0 = Math.hypot(x / a, z / b)
  if (k0 < 1e-6) return -Math.min(a, b)
  const k1 = Math.hypot(x / (a * a), z / (b * b))
  return (k0 * (k0 - 1)) / k1
}

// perfil do tronco: [altura, meia largura, meia profundidade]
const PERFIL: [number, number, number][] = [
  [-0.46, 0.238, 0.112],
  [-0.38, 0.236, 0.111],
  [-0.24, 0.232, 0.109],
  [-0.08, 0.228, 0.111],
  [0.06, 0.237, 0.12],
  [0.16, 0.243, 0.118],
  [0.24, 0.236, 0.104],
  [0.32, 0.21, 0.09],
  [0.42, 0.19, 0.082],
]

/** Interpolação Catmull-Rom do perfil (contínua na derivada, sem vincos no sombreamento). */
function perfil(y: number): [number, number] {
  const n = PERFIL.length
  let i = 0
  while (i < n - 2 && y > PERFIL[i + 1][0]) i++
  const p0 = PERFIL[Math.max(i - 1, 0)]
  const p1 = PERFIL[i]
  const p2 = PERFIL[i + 1]
  const p3 = PERFIL[Math.min(i + 2, n - 1)]
  const t = clamp((y - p1[0]) / (p2[0] - p1[0]), 0, 1)
  const t2 = t * t
  const t3 = t2 * t
  const cr = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  return [cr(p0[1], p1[1], p2[1], p3[1]), cr(p0[2], p1[2], p2[2], p3[2])]
}

// ---------------------------------------------------------------------------
// medidas de cada peça
// ---------------------------------------------------------------------------
type Medidas = {
  mangas: boolean
  decote: { rx: number; rz: number; cz: number; queda: number }
  cava?: { cx: number; cy: number; rx: number; ry: number }
  limites: [number, number, number, number, number, number]
}

const MEDIDAS: Record<TipoPeca, Medidas> = {
  camiseta: {
    mangas: true,
    decote: { rx: 0.071, rz: 0.062, cz: 0.006, queda: 0.034 },
    limites: [-0.47, 0.47, -0.41, 0.4, -0.16, 0.16],
  },
  regata: {
    mangas: false,
    decote: { rx: 0.09, rz: 0.072, cz: 0.008, queda: 0.07 },
    cava: { cx: 0.262, cy: 0.228, rx: 0.1, ry: 0.152 },
    limites: [-0.3, 0.3, -0.41, 0.4, -0.16, 0.16],
  },
}

const BARRA = -0.375
const FUNDO_DECOTE = 0.17
const RAIO_GOLA = 0.0115

/** Eixo da manga do lado s (+1 direita, -1 esquerda): origem, direção e comprimento. */
export function eixoManga(s: number) {
  const ux = 0.8 * s
  const uy = -0.6
  return { ax: 0.165 * s, ay: 0.2, ux, uy, comp: 0.25 }
}

function topo(m: Medidas, x: number, z: number) {
  const ax = Math.abs(x)
  let y = 0.336 - 0.33 * Math.max(ax - 0.06, 0)
  // a frente do decote é mais baixa que as costas
  const d = m.decote
  y -= d.queda * suave(-0.012, 0.078, z) * (1 - suave(d.rx * 0.6, d.rx + 0.06, ax))
  return y
}

function manga(x: number, y: number, z: number, s: number) {
  const e = eixoManga(s)
  const px = x - e.ax
  const py = y - e.ay
  const t = px * e.ux + py * e.uy
  const r = mix(0.092, 0.069, clamp(t / e.comp, 0, 1))
  const vx = px - e.ux * t
  const vy = py - e.uy * t
  let d = Math.hypot(vx, vy, z / 0.8) - r
  d = smax(d, t - e.comp, 0.012) // punho
  d = smax(d, -(t + 0.1), 0.02) // não atravessa o tronco
  return d
}

function furoDecote(m: Medidas, x: number, y: number, z: number) {
  const d = m.decote
  return smax(elipse(x, z - d.cz, d.rx, d.rz), FUNDO_DECOTE - y, 0.01)
}

function cava(m: Medidas, x: number, y: number) {
  const c = m.cava!
  const ax = Math.abs(x)
  // elipsoide alongado em z: corta a peça de frente a costas
  return elipse(ax - c.cx, y - c.cy, c.rx, c.ry)
}

/** Corpo sem gola nem caimento: usado também para achar a borda do decote. */
function corpo(m: Medidas, x: number, y: number, z: number) {
  const [a, b] = perfil(y)
  let d = elipse(x, z, a, b)
  if (m.mangas) {
    d = smin(d, manga(x, y, z, 1), 0.042)
    d = smin(d, manga(x, y, z, -1), 0.042)
  }
  d = smax(d, y - topo(m, x, z), 0.045)
  d = smax(d, BARRA - y, 0.012)
  if (m.cava) d = smax(d, -cava(m, x, y), 0.028)
  d = smax(d, -furoDecote(m, x, y, z), m.cava ? 0.02 : 0.012)
  return d
}

function caimento(m: Medidas, x: number, y: number, z: number) {
  let f = 0.0011 * Math.sin(38 * x + 11 * y) * Math.sin(29 * y - 17 * z)
  if (m.mangas) {
    for (const s of [1, -1]) {
      const dx = (x - 0.18 * s) / 0.085
      const dy = (y - 0.12) / 0.08
      const w = Math.exp(-(dx * dx + dy * dy))
      f += 0.0032 * w * Math.sin((s * x * 0.55 + y * 0.83) * 92)
    }
  }
  const barra = suave(-0.37, -0.31, y) * (1 - suave(-0.22, -0.13, y))
  f += 0.0019 * barra * Math.sin(x * 31 + 1.3) * (0.6 + 0.4 * Math.sin(z * 40))
  // leve vinco vertical nas costas, como tecido pendurado
  f += 0.0012 * suave(0.02, 0.1, -z) * Math.sin(x * 18) * (1 - suave(0.1, 0.3, y))
  return f
}

// ---------------------------------------------------------------------------
// gola: tubo que acompanha a borda real do decote
// ---------------------------------------------------------------------------
function bordaDecote(m: Medidas, segmentos = 72): Float32Array {
  const d = m.decote
  const pts = new Float32Array(segmentos * 3)
  for (let i = 0; i < segmentos; i++) {
    const phi = (i / segmentos) * Math.PI * 2
    const x = (d.rx + 0.003) * Math.cos(phi)
    const z = d.cz + (d.rz + 0.003) * Math.sin(phi)
    // desce do alto até achar a superfície do corpo (bissecção)
    let lo = FUNDO_DECOTE + 0.01
    let hi = 0.42
    for (let k = 0; k < 28; k++) {
      const meio = (lo + hi) / 2
      if (corpo(m, x, meio, z) < 0) lo = meio
      else hi = meio
    }
    pts[i * 3] = x
    pts[i * 3 + 1] = lo - 0.002
    pts[i * 3 + 2] = z
  }
  return pts
}

function distPolilinha(pts: Float32Array, x: number, y: number, z: number) {
  const n = pts.length / 3
  let melhor = 1e9
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const ax = pts[i * 3]
    const ay = pts[i * 3 + 1]
    const az = pts[i * 3 + 2]
    const bx = pts[j * 3] - ax
    const by = pts[j * 3 + 1] - ay
    const bz = pts[j * 3 + 2] - az
    const px = x - ax
    const py = y - ay
    const pz = z - az
    const t = clamp((px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz), 0, 1)
    const dx = px - bx * t
    const dy = py - by * t
    const dz = pz - bz * t
    const d2 = dx * dx + dy * dy + dz * dz
    if (d2 < melhor) melhor = d2
  }
  return Math.sqrt(melhor)
}

export function criarCampo(tipo: TipoPeca) {
  const m = MEDIDAS[tipo]
  const borda = bordaDecote(m)
  const d = m.decote
  const sdf = (x: number, y: number, z: number) => {
    let v = corpo(m, x, y, z)
    if (Math.abs(x) < d.rx + 0.05 && Math.abs(z - d.cz) < d.rz + 0.05 && y > FUNDO_DECOTE + 0.02) {
      v = smin(v, distPolilinha(borda, x, y, z) - RAIO_GOLA, 0.006)
    }
    return v + caimento(m, x, y, z)
  }
  const zona = (x: number, y: number, z: number) => {
    if (Math.abs(x) < d.rx + 0.05 && y > FUNDO_DECOTE - 0.01 && distPolilinha(borda, x, y, z) < RAIO_GOLA + 0.0035) return 2
    if (elipse(x, z - d.cz, d.rx, d.rz) < 0.0015 && y < topo(m, x, z) - 0.004 && y > FUNDO_DECOTE - 0.02) return 1
    if (m.cava && Math.abs(cava(m, x, y)) < 0.011 && y > 0.05) return 3
    return 0
  }
  return { sdf, zona, limites: m.limites }
}

// ---------------------------------------------------------------------------
// extração da malha (naive surface nets)
// ---------------------------------------------------------------------------
const ARESTAS: [number, number][] = [
  [0, 1], [2, 3], [4, 5], [6, 7],
  [0, 2], [1, 3], [4, 6], [5, 7],
  [0, 4], [1, 5], [2, 6], [3, 7],
]

export function gerarMalha(tipo: TipoPeca, passo = 0.0058, progresso?: (p: number) => void): Malha {
  const { sdf, zona, limites } = criarCampo(tipo)
  const [x0, x1, y0, y1, z0, z1] = limites
  const nx = Math.ceil((x1 - x0) / passo)
  const ny = Math.ceil((y1 - y0) / passo)
  const nz = Math.ceil((z1 - z0) / passo)
  const sx = nx + 1
  const sy = ny + 1
  const campo = new Float32Array(sx * sy * (nz + 1))

  for (let k = 0; k <= nz; k++) {
    const z = z0 + k * passo
    for (let j = 0; j <= ny; j++) {
      const y = y0 + j * passo
      const base = sx * (j + sy * k)
      for (let i = 0; i <= nx; i++) campo[base + i] = sdf(x0 + i * passo, y, z)
    }
    if (progresso && k % 4 === 0) progresso((k / nz) * 0.8)
  }

  const idx = (i: number, j: number, k: number) => i + sx * (j + sy * k)
  const celula = new Int32Array(nx * ny * nz).fill(-1)
  const pos: number[] = []
  const cantos = new Float32Array(8)

  for (let k = 0; k < nz; k++) {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        let mascara = 0
        for (let c = 0; c < 8; c++) {
          const v = campo[idx(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1))]
          cantos[c] = v
          if (v < 0) mascara |= 1 << c
        }
        if (mascara === 0 || mascara === 255) continue
        let ax = 0
        let ay = 0
        let az = 0
        let n = 0
        for (const [a, b] of ARESTAS) {
          const va = cantos[a]
          const vb = cantos[b]
          if (va < 0 === vb < 0) continue
          const t = va / (va - vb)
          ax += (a & 1) + (((b & 1) - (a & 1)) * t)
          ay += ((a >> 1) & 1) + ((((b >> 1) & 1) - ((a >> 1) & 1)) * t)
          az += ((a >> 2) & 1) + ((((b >> 2) & 1) - ((a >> 2) & 1)) * t)
          n++
        }
        celula[i + nx * (j + ny * k)] = pos.length / 3
        pos.push(x0 + (i + ax / n) * passo, y0 + (j + ay / n) * passo, z0 + (k + az / n) * passo)
      }
    }
  }
  progresso?.(0.86)

  const cel = (i: number, j: number, k: number) => celula[i + nx * (j + ny * k)]
  const tri: number[] = []
  const quad = (a: number, b: number, c: number, d: number, inverter: boolean) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return
    if (inverter) tri.push(a, b, c, a, c, d)
    else tri.push(a, c, b, a, d, c)
  }
  for (let k = 1; k < nz; k++) {
    for (let j = 1; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        // aresta em x
        const va = campo[idx(i, j, k)]
        const vb = campo[idx(i + 1, j, k)]
        if (va < 0 !== vb < 0) quad(cel(i, j - 1, k - 1), cel(i, j, k - 1), cel(i, j, k), cel(i, j - 1, k), va < 0)
      }
    }
  }
  for (let k = 1; k < nz; k++) {
    for (let j = 0; j < ny; j++) {
      for (let i = 1; i < nx; i++) {
        const va = campo[idx(i, j, k)]
        const vb = campo[idx(i, j + 1, k)]
        if (va < 0 !== vb < 0) quad(cel(i - 1, j, k - 1), cel(i - 1, j, k), cel(i, j, k), cel(i, j, k - 1), va < 0)
      }
    }
  }
  for (let k = 0; k < nz; k++) {
    for (let j = 1; j < ny; j++) {
      for (let i = 1; i < nx; i++) {
        const va = campo[idx(i, j, k)]
        const vb = campo[idx(i, j, k + 1)]
        if (va < 0 !== vb < 0) quad(cel(i - 1, j - 1, k), cel(i, j - 1, k), cel(i, j, k), cel(i - 1, j, k), va < 0)
      }
    }
  }
  progresso?.(0.9)

  // normais pelo gradiente do campo + um passo de projeção na superfície
  const nv = pos.length / 3
  const posicoes = new Float32Array(pos)
  const normais = new Float32Array(nv * 3)
  const zonas = new Float32Array(nv * 2)
  const uvs = new Float32Array(nv * 2)
  const e = 0.0012
  for (let v = 0; v < nv; v++) {
    let x = posicoes[v * 3]
    let y = posicoes[v * 3 + 1]
    let z = posicoes[v * 3 + 2]
    for (let it = 0; it < 2; it++) {
      const f = sdf(x, y, z)
      const gx = (sdf(x + e, y, z) - sdf(x - e, y, z)) / (2 * e)
      const gy = (sdf(x, y + e, z) - sdf(x, y - e, z)) / (2 * e)
      const gz = (sdf(x, y, z + e) - sdf(x, y, z - e)) / (2 * e)
      const g2 = gx * gx + gy * gy + gz * gz || 1
      const passoProj = clamp(f / g2, -passo * 0.6, passo * 0.6)
      x -= gx * passoProj
      y -= gy * passoProj
      z -= gz * passoProj
      if (it === 1) {
        const gl = Math.sqrt(g2)
        normais[v * 3] = gx / gl
        normais[v * 3 + 1] = gy / gl
        normais[v * 3 + 2] = gz / gl
      }
    }
    posicoes[v * 3] = x
    posicoes[v * 3 + 1] = y
    posicoes[v * 3 + 2] = z
    const zv = zona(x, y, z)
    zonas[v * 2] = zv === 1 ? 1 : 0
    zonas[v * 2 + 1] = zv >= 2 ? 1 : 0
    uvs[v * 2] = x * 26
    uvs[v * 2 + 1] = y * 26
  }
  // suaviza as zonas pelos vizinhos da malha: a transição vira um degradê curto em vez de degraus
  const soma = new Float32Array(nv * 2)
  const conta = new Float32Array(nv)
  for (let it = 0; it < 3; it++) {
    soma.fill(0)
    conta.fill(0)
    for (let t = 0; t < tri.length; t += 3) {
      const a = tri[t]
      const b = tri[t + 1]
      const c = tri[t + 2]
      for (const [p, q, r] of [[a, b, c], [b, c, a], [c, a, b]]) {
        soma[p * 2] += zonas[q * 2] + zonas[r * 2]
        soma[p * 2 + 1] += zonas[q * 2 + 1] + zonas[r * 2 + 1]
        conta[p] += 2
      }
    }
    for (let v = 0; v < nv; v++) {
      if (!conta[v]) continue
      zonas[v * 2] = (zonas[v * 2] + soma[v * 2] / conta[v]) / 2
      zonas[v * 2 + 1] = (zonas[v * 2 + 1] + soma[v * 2 + 1] / conta[v]) / 2
    }
  }
  progresso?.(1)

  return { posicoes, normais, zonas, uvs, indices: new Uint32Array(tri) }
}
