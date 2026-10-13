import * as THREE from 'three'
import { eixoManga, gerarMalha, type Malha, type TipoPeca } from './geometria'
import type { Variante } from './modelos'

/*
 * Cena 3D da camisa oficial: estúdio escuro, luz quente de cima (como os quadros do
 * teto da Volts) e contraluz verde e amarela nas laterais. A troca de cor ou de modelo
 * acontece com uma linha de energia que sobe pela peça.
 */

export type Vista = 'frente' | 'lado' | 'costas'

type Opcoes = {
  reduzido: boolean
  /** giro comandado de fora (pelo scroll): sem giro automático nem arrastar */
  controlado?: boolean
  aoProgresso?: (p: number) => void
  aoErro?: (e: unknown) => void
}

// ---------------------------------------------------------------------------
// texturas desenhadas em canvas
// ---------------------------------------------------------------------------
const MARCA_RAIO = 'M0 0H69L100 92L119 102L85 106L84 186Z'
const MARCA_BARRA = 'M228 0H309L201 260H121Z'

/** Atlas de máscaras: logo do peito (vermelho = texto, verde = raio) e etiqueta da barra (azul = fundo). */
async function texturaLogo() {
  try {
    await Promise.all([
      document.fonts.load('860 200px "Archivo Variable"'),
      document.fonts.load('620 60px "Archivo Variable"'),
    ])
  } catch {
    /* segue com a fonte de reserva */
  }
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 768
  const g = c.getContext('2d')!
  g.fillStyle = '#000'
  g.fillRect(0, 0, 1024, 768)

  // ---- logo do peito (área de 1024 x 512): o conjunto é medido e encaixado em 900 px ----
  const estica = g as CanvasRenderingContext2D & { fontStretch?: string; letterSpacing?: string }
  estica.fontStretch = 'extra-expanded'
  let corpoFonte = 268
  g.font = `860 ${corpoFonte}px "Archivo Variable", "Arial Black", sans-serif`
  const medir = () => {
    const alturaMarca = corpoFonte * 0.74
    const larguraMarca = 309 * (alturaMarca / 260)
    return { alturaMarca, larguraMarca, total: larguraMarca - corpoFonte * 0.04 + g.measureText('OLTS').width }
  }
  let med = medir()
  corpoFonte *= Math.min(1, 900 / med.total)
  g.font = `860 ${corpoFonte}px "Archivo Variable", "Arial Black", sans-serif`
  med = medir()
  const x0 = (1024 - med.total) / 2
  const linhaBase = 290
  const escala = med.alturaMarca / 260
  g.save()
  g.translate(x0, linhaBase - med.alturaMarca)
  g.scale(escala, escala)
  g.fillStyle = '#00ff00'
  g.fill(new Path2D(MARCA_RAIO))
  g.fillStyle = '#ff0000'
  g.fill(new Path2D(MARCA_BARRA))
  g.restore()
  g.fillStyle = '#ff0000'
  g.textBaseline = 'alphabetic'
  g.fillText('OLTS', x0 + med.larguraMarca - corpoFonte * 0.04, linhaBase)
  const corpoSub = corpoFonte * 0.2
  g.font = `620 ${corpoSub}px "Archivo Variable", Arial, sans-serif`
  estica.letterSpacing = `${corpoSub * 0.42}px`
  const sub = 'TRAINING STUDIO'
  const ls = g.measureText(sub).width - corpoSub * 0.42
  g.fillText(sub, x0 + med.total - ls, linhaBase + corpoFonte * 0.32)
  estica.letterSpacing = '0px'

  // ---- etiqueta da barra (área de 1024 x 256) ----
  g.fillStyle = '#0000ff'
  g.fillRect(40, 560, 944, 160)
  g.fillStyle = '#ff0000'
  g.font = '860 112px "Archivo Variable", "Arial Black", sans-serif'
  const tw = g.measureText('VOLTS').width
  g.fillText('VOLTS', 512 - tw / 2, 682)

  if (import.meta.env.DEV) (window as unknown as { __atlas: string }).__atlas = c.toDataURL()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.NoColorSpace
  t.anisotropy = 8
  t.generateMipmaps = true
  t.minFilter = THREE.LinearMipmapLinearFilter
  return t
}

/** Mapa de normais de malha esportiva (pontos de tricô em fileiras alternadas). */
function texturaTrama() {
  const n = 256
  const altura = new Float32Array(n * n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const v = y / n
      const u = x / n
      const fileira = Math.floor(v * 32)
      const ly = (v * 32) % 1
      const lx = (u * 32 + (fileira % 2) * 0.5) % 1
      altura[y * n + x] = Math.exp(-(((lx - 0.5) ** 2) / 0.05 + ((ly - 0.5) ** 2) / 0.11))
    }
  }
  const dados = new Uint8Array(n * n * 4)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const h = (xx: number, yy: number) => altura[((yy + n) % n) * n + ((xx + n) % n)]
      const dx = (h(x + 1, y) - h(x - 1, y)) * 1.6
      const dy = (h(x, y + 1) - h(x, y - 1)) * 1.6
      const l = Math.hypot(dx, dy, 1)
      const i = (y * n + x) * 4
      dados[i] = ((-dx / l) * 0.5 + 0.5) * 255
      dados[i + 1] = ((-dy / l) * 0.5 + 0.5) * 255
      dados[i + 2] = ((1 / l) * 0.5 + 0.5) * 255
      dados[i + 3] = 255
    }
  }
  const t = new THREE.DataTexture(dados, n, n, THREE.RGBAFormat)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.generateMipmaps = true
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.magFilter = THREE.LinearFilter
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}

function texturaSombra() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  gr.addColorStop(0, 'rgba(0,0,0,0.75)')
  gr.addColorStop(0.55, 'rgba(0,0,0,0.3)')
  gr.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = gr
  g.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// ---------------------------------------------------------------------------
// material: tecido com sheen + desenho da peça calculado no shader
// ---------------------------------------------------------------------------
const mangaD = eixoManga(1)

const GLSL_DESENHO = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uListra;
uniform vec3 uLogo;
uniform vec3 uLogoRaio;
uniform vec3 uEtiqueta;
uniform vec3 uEtiquetaTexto;
uniform sampler2D uAtlas;
uniform float uTipo;
uniform float uCorte;
uniform float uLado;
uniform vec3 uLinha;
varying vec3 vObj;
varying vec3 vObjN;
varying vec2 vZona;

float faixa(float v, float a, float b, float aa) {
  return smoothstep(a - aa, a + aa, v) * (1.0 - smoothstep(b - aa, b + aa, v));
}

vec3 corPeca() {
  vec3 c = uBase;
  vec3 p = vObj;
  float ax = abs(p.x);
  float aa = 0.0016;

  if (uTipo < 0.5) {
    // camiseta: dois cortes diagonais na lateral, perto da barra
    float q = ax * 0.866 - p.y * 0.5;
    float regiao = smoothstep(0.112, 0.13, ax) * (1.0 - smoothstep(-0.16, -0.14, p.y));
    float l = faixa(q, 0.318, 0.338, aa) + faixa(q, 0.352, 0.364, aa);
    c = mix(c, uListra, clamp(l, 0.0, 1.0) * regiao);
    // mangas: dois cortes inclinados perto do punho
    vec2 a = vec2(${mangaD.ax.toFixed(3)} * sign(p.x), ${mangaD.ay.toFixed(3)});
    vec2 u = vec2(${mangaD.ux.toFixed(3)} * sign(p.x), ${mangaD.uy.toFixed(3)});
    vec2 n = vec2(-u.y, u.x) * sign(p.x);
    vec2 d = p.xy - a;
    float t = dot(d, u) + dot(d, n) * 0.55;
    float naManga = smoothstep(0.205, 0.235, ax);
    float lm = faixa(t, 0.168, 0.184, aa) + faixa(t, 0.196, 0.205, aa);
    c = mix(c, uListra, clamp(lm, 0.0, 1.0) * naManga);
  } else {
    // regata: corte longo descendo da cava pela lateral
    float q = ax - 0.172 + p.y * 0.2;
    float regiao = (1.0 - smoothstep(0.06, 0.1, p.y)) * smoothstep(-0.37, -0.33, p.y);
    float l = faixa(q, 0.0, 0.026, aa) + faixa(q, 0.036, 0.046, aa);
    c = mix(c, uListra, clamp(l, 0.0, 1.0) * regiao);
  }

  // logo no peito e etiqueta na barra, só na frente
  float frente = smoothstep(0.05, 0.25, vObjN.z) * step(0.0, p.z);
  vec2 uvLogo = vec2((p.x + 0.1) / 0.2, (p.y - 0.078) / 0.1);
  if (uTipo > 0.5) uvLogo = vec2((p.x + 0.095) / 0.19, (p.y - 0.055) / 0.095);
  if (uvLogo.x > 0.0 && uvLogo.x < 1.0 && uvLogo.y > 0.0 && uvLogo.y < 1.0) {
    vec4 m = texture(uAtlas, vec2(uvLogo.x, 1.0 / 3.0 + uvLogo.y * (2.0 / 3.0)));
    c = mix(c, uLogo, m.r * frente);
    c = mix(c, uLogoRaio, m.g * frente);
  }
  vec2 uvEt = vec2((p.x - 0.112) / 0.066, (p.y + 0.352) / 0.0165);
  if (uvEt.x > 0.0 && uvEt.x < 1.0 && uvEt.y > 0.0 && uvEt.y < 1.0) {
    vec4 m = texture(uAtlas, vec2(uvEt.x, uvEt.y / 3.0));
    c = mix(c, uEtiqueta, max(m.b, m.r) * frente);
    c = mix(c, uEtiquetaTexto, m.r * frente);
  }

  // gola e viés canelados, parte de dentro mais escura
  float gola = smoothstep(0.25, 0.7, vZona.y);
  float ang = atan(p.z, p.x);
  float costela = 0.9 + 0.1 * sin(ang * 140.0 + p.y * 400.0);
  c *= mix(1.0, costela * 0.93, gola);
  c *= mix(1.0, 0.3, smoothstep(0.2, 0.75, vZona.x));
  return c;
}
`

function criarMaterial(trama: THREE.Texture, atlas: THREE.Texture) {
  const u = {
    uBase: { value: new THREE.Color() },
    uListra: { value: new THREE.Color() },
    uLogo: { value: new THREE.Color() },
    uLogoRaio: { value: new THREE.Color() },
    uEtiqueta: { value: new THREE.Color() },
    uEtiquetaTexto: { value: new THREE.Color() },
    uAtlas: { value: atlas },
    uTipo: { value: 0 },
    uCorte: { value: 10 },
    uLado: { value: 1 },
    uLinha: { value: new THREE.Color('#d6f600') },
  }
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0,
    sheen: 0.6,
    sheenRoughness: 0.42,
    sheenColor: new THREE.Color('#bfc7bb'),
    normalMap: trama,
    normalScale: new THREE.Vector2(0.22, 0.22),
  })
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 aZona;\nvarying vec3 vObj;\nvarying vec3 vObjN;\nvarying vec2 vZona;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;\nvObjN = normal;\nvZona = aZona;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${GLSL_DESENHO}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'if ((vObj.y - uCorte) * uLado > 0.0) discard;\nvec4 diffuseColor = vec4( corPeca(), opacity );')
      .replace(
        'vec3 totalEmissiveRadiance = emissive;',
        'vec3 totalEmissiveRadiance = emissive + uLinha * (1.0 - smoothstep(0.0, 0.01, abs(vObj.y - uCorte))) * 3.0;',
      )
  }
  mat.customProgramCacheKey = () => 'volts-camisa'
  return { mat, u }
}

function pintar(u: ReturnType<typeof criarMaterial>['u'], v: Variante) {
  u.uBase.value.set(v.base)
  u.uListra.value.set(v.listra)
  u.uLogo.value.set(v.logo)
  u.uLogoRaio.value.set(v.logoRaio)
  u.uEtiqueta.value.set(v.etiqueta)
  u.uEtiquetaTexto.value.set(v.etiquetaTexto)
  u.uTipo.value = v.tipo === 'camiseta' ? 0 : 1
}

function geometriaDe(m: Malha) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(m.posicoes, 3))
  g.setAttribute('normal', new THREE.BufferAttribute(m.normais, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(m.uvs, 2))
  g.setAttribute('aZona', new THREE.BufferAttribute(m.zonas, 2))
  g.setIndex(new THREE.BufferAttribute(m.indices, 1))
  g.computeBoundingSphere()
  return g
}

// ---------------------------------------------------------------------------
// cena
// ---------------------------------------------------------------------------
export class CenaCamisa {
  private renderer: THREE.WebGLRenderer
  private cena = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(26, 1, 0.1, 20)
  private peca = new THREE.Group()
  private trama = texturaTrama()
  private atlas: THREE.Texture | null = null
  private atlasP: Promise<THREE.Texture> | null = null
  private geometrias = new Map<TipoPeca, Promise<THREE.BufferGeometry>>()
  private worker: Worker | null = null
  private pedidos = new Map<TipoPeca, (m: Malha) => void>()
  private atual: { malha: THREE.Mesh; u: ReturnType<typeof criarMaterial>['u']; variante: Variante } | null = null
  private saindo: THREE.Mesh[] = []
  private quadro = 0
  private ultimo = 0
  private visivel = true
  private rot = { y: -0.35, x: 0, alvoY: -0.35, alvoX: 0, vel: 0 }
  private dist = { atual: 2.4, alvo: 2.4, alvoY: 0, y: 0, base: 2.4, perto: false }
  private ocioso = 0
  private arrastando = false
  private ultimoX = 0
  private ultimoY = 0
  private transicao: { ini: number; dur: number } | null = null
  private ro: ResizeObserver
  private io: IntersectionObserver
  private destruida = false
  private desenhou = false
  private compilado = false
  private pedidos3D = 0

  constructor(private canvas: HTMLCanvasElement, private opcoes: Opcoes) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.NeutralToneMapping
    this.renderer.toneMappingExposure = 1.0
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.setClearColor(0x000000, 0)

    // luz de preenchimento no lugar de um mapa de ambiente: o visual fica igual e a cena nasce
    // sem a pausa de quase 1 s que o PMREM (RoomEnvironment) causava ao ser calculado
    this.cena.add(new THREE.HemisphereLight('#e8eee6', '#2a3328', 2.8), new THREE.AmbientLight('#ffffff', 1.3))

    const chave = new THREE.DirectionalLight('#fff0d8', 2.5)
    chave.position.set(0.9, 1.7, 1.8)
    const preenchimento = new THREE.DirectionalLight('#e2e9ff', 0.55)
    preenchimento.position.set(-1.5, 0.3, 1.2)
    const contraVerde = new THREE.DirectionalLight('#46f08c', 2.6)
    contraVerde.position.set(-1.6, 0.6, -1.3)
    const contraVolt = new THREE.DirectionalLight('#d6f600', 1.5)
    contraVolt.position.set(1.7, 0.2, -1.2)
    const ceu = new THREE.HemisphereLight('#22332a', '#050605', 0.7)
    this.cena.add(chave, preenchimento, contraVerde, contraVolt, ceu, this.peca)

    const sombra = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 0.46),
      new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false }),
    )
    sombra.rotation.x = -Math.PI / 2
    sombra.position.y = -0.49
    this.cena.add(sombra)

    this.camera.position.set(0, 0.02, this.dist.atual)
    this.ligarControles()
    this.ro = new ResizeObserver(() => this.ajustar())
    this.ro.observe(canvas.parentElement ?? canvas)
    this.io = new IntersectionObserver(([e]) => {
      this.visivel = e.isIntersecting
      if (this.visivel) this.pedirQuadro()
    })
    this.io.observe(canvas)
    document.addEventListener('visibilitychange', this.aoVisibilidade)
    this.ajustar()
  }

  // ---------------- geometria (worker) ----------------
  private malha(tipo: TipoPeca): Promise<THREE.BufferGeometry> {
    const existente = this.geometrias.get(tipo)
    if (existente) return existente
    const passo = window.matchMedia('(max-width: 700px)').matches ? 0.0064 : 0.0056
    const p = new Promise<Malha>((resolver) => {
      try {
        if (!this.worker) {
          this.worker = new Worker(new URL('./geometria.worker.ts', import.meta.url), { type: 'module' })
          this.worker.onmessage = (ev) => {
            const { malha, progresso, tipo: t } = ev.data
            if (progresso !== undefined) {
              if (!this.atual) this.opcoes.aoProgresso?.(progresso)
              return
            }
            this.pedidos.get(t)?.(malha)
            this.pedidos.delete(t)
          }
        }
        this.pedidos.set(tipo, resolver)
        this.worker.postMessage({ tipo, passo })
      } catch {
        // sem worker: gera na thread principal
        resolver(gerarMalha(tipo, passo))
      }
    }).then(geometriaDe)
    this.geometrias.set(tipo, p)
    return p
  }

  /** Pré-carrega a outra peça para a troca ser instantânea. */
  preparar(tipo: TipoPeca) {
    this.malha(tipo)
  }

  // ---------------- troca de variante ----------------
  async mostrar(v: Variante) {
    const pedido = ++this.pedidos3D
    try {
      this.atlasP ??= texturaLogo()
      this.atlas = await this.atlasP
      const geo = await this.malha(v.tipo)
      if (this.destruida || pedido !== this.pedidos3D) return
      if (this.atual?.variante.id === v.id) return
      const { mat, u } = criarMaterial(this.trama, this.atlas)
      pintar(u, v)
      const malha = new THREE.Mesh(geo, mat)
      if (!this.compilado) {
        // texturas sobem para a GPU e o shader compila em paralelo, sem travar a página
        this.renderer.initTexture(this.atlas)
        this.renderer.initTexture(this.trama)
        await this.renderer.compileAsync(malha, this.camera, this.cena)
        this.compilado = true
        if (this.destruida || pedido !== this.pedidos3D) return mat.dispose()
      }
      this.peca.add(malha)
      const anterior = this.atual
      this.atual = { malha, u, variante: v }

      if (anterior) {
        // linha de energia sobe pela peça: a nova aparece embaixo, a anterior some em cima
        u.uLado.value = 1
        u.uCorte.value = -0.42
        anterior.u.uLado.value = -1
        anterior.u.uCorte.value = -0.42
        this.saindo.push(anterior.malha)
        this.transicao = { ini: performance.now(), dur: this.opcoes.reduzido ? 600 : 1050 }
        ;(anterior.malha.userData as { u: unknown }).u = anterior.u
      }
      this.opcoes.aoProgresso?.(1)
      this.pedirQuadro()
    } catch (e) {
      this.opcoes.aoErro?.(e)
    }
  }

  private descartar(m: THREE.Mesh) {
    this.peca.remove(m)
    ;(m.material as THREE.Material).dispose()
  }

  // ---------------- câmera e controles ----------------
  vista(nome: Vista) {
    const alvos: Record<Vista, number> = { frente: 0, lado: -Math.PI / 2, costas: Math.PI }
    const base = alvos[nome]
    // escolhe a volta mais curta a partir da rotação atual
    const voltas = Math.round((this.rot.alvoY - base) / (Math.PI * 2))
    this.rot.alvoY = base + voltas * Math.PI * 2
    this.rot.alvoX = 0
    this.rot.vel = 0
    this.ocioso = -6
    this.pedirQuadro()
  }

  alternarZoom() {
    this.dist.perto = !this.dist.perto
    this.dist.alvo = this.dist.perto ? this.dist.base * 0.56 : this.dist.base
    this.dist.alvoY = this.dist.perto ? 0.09 : 0
    this.pedirQuadro()
    return this.dist.perto
  }

  /** Gira a peça para um ângulo (usado pela seção que gira com o scroll). */
  girar(y: number, x = 0) {
    this.rot.alvoY = y
    this.rot.alvoX = x
    this.ocioso = 0
    this.pedirQuadro()
  }

  private ligarControles() {
    const c = this.canvas
    if (this.opcoes.controlado) return
    c.style.touchAction = 'pan-y'
    c.addEventListener('pointerdown', (e) => {
      this.arrastando = true
      this.ultimoX = e.clientX
      this.ultimoY = e.clientY
      this.rot.vel = 0
      c.setPointerCapture(e.pointerId)
      c.classList.add('arrastando')
    })
    c.addEventListener('pointermove', (e) => {
      if (!this.arrastando) return
      const dx = e.clientX - this.ultimoX
      const dy = e.clientY - this.ultimoY
      this.ultimoX = e.clientX
      this.ultimoY = e.clientY
      this.rot.alvoY += dx * 0.0095
      this.rot.vel = dx * 0.0095
      if (e.pointerType === 'mouse') this.rot.alvoX = THREE.MathUtils.clamp(this.rot.alvoX + dy * 0.004, -0.22, 0.22)
      this.ocioso = 0
      this.pedirQuadro()
    })
    const soltar = () => {
      this.arrastando = false
      c.classList.remove('arrastando')
    }
    c.addEventListener('pointerup', soltar)
    c.addEventListener('pointercancel', soltar)
    c.addEventListener(
      'wheel',
      (e) => {
        if (!e.ctrlKey && Math.abs(e.deltaY) < 1) return
        e.preventDefault()
        const min = this.dist.base * 0.52
        this.dist.alvo = THREE.MathUtils.clamp(this.dist.alvo + e.deltaY * 0.0012, min, this.dist.base * 1.1)
        this.dist.alvoY = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(this.dist.alvo, min, this.dist.base, 0.09, 0), 0, 0.09)
        this.dist.perto = this.dist.alvo < this.dist.base * 0.8
        this.pedirQuadro()
      },
      { passive: false },
    )
    c.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.rot.alvoY -= 0.35
      else if (e.key === 'ArrowRight') this.rot.alvoY += 0.35
      else return
      e.preventDefault()
      this.ocioso = -4
      this.pedirQuadro()
    })
  }

  private aoVisibilidade = () => {
    if (!document.hidden) this.pedirQuadro()
  }

  private ajustar() {
    const pai = this.canvas.parentElement ?? this.canvas
    const w = Math.max(pai.clientWidth, 1)
    const h = Math.max(pai.clientHeight, 1)
    this.renderer.setSize(w, h, false)
    const aspecto = w / h
    this.camera.aspect = aspecto
    this.camera.fov = 26
    this.camera.updateProjectionMatrix()
    // distância que faz a peça inteira (mangas incluídas) caber com folga em qualquer proporção
    const t = Math.tan(THREE.MathUtils.degToRad(13))
    const base = Math.max(0.44 / t, 0.5 / (t * aspecto)) + 0.16
    const proporcao = this.dist.alvo / this.dist.base
    this.dist.base = base
    this.dist.alvo = base * proporcao
    if (!this.desenhou) this.dist.atual = this.dist.alvo
    this.pedirQuadro()
  }

  private pedirQuadro() {
    if (this.quadro || this.destruida) return
    this.ultimo = performance.now()
    this.quadro = requestAnimationFrame(this.loop)
  }

  private loop = (agora: number) => {
    this.quadro = 0
    if (this.destruida) return
    const dt = Math.min((agora - this.ultimo) / 1000, 0.05)
    this.ultimo = agora
    let mexendo = false

    // giro automático lento quando ninguém está mexendo
    this.ocioso += dt
    if (!this.arrastando && !this.opcoes.reduzido && !this.opcoes.controlado && this.ocioso > 2.5) this.rot.alvoY += dt * 0.28
    if (!this.arrastando && Math.abs(this.rot.vel) > 0.0001) {
      this.rot.alvoY += this.rot.vel
      this.rot.vel *= 0.92
      mexendo = true
    }
    const k = 1 - Math.pow(0.0018, dt)
    this.rot.y += (this.rot.alvoY - this.rot.y) * k
    this.rot.x += (this.rot.alvoX - this.rot.x) * k
    this.dist.atual += (this.dist.alvo - this.dist.atual) * k
    this.dist.y += (this.dist.alvoY - this.dist.y) * k
    this.peca.rotation.set(this.rot.x, this.rot.y, 0)
    this.camera.position.set(0, 0.02 + this.dist.y, this.dist.atual)
    this.camera.lookAt(0, -0.01 + this.dist.y, 0)
    if (Math.abs(this.rot.alvoY - this.rot.y) > 0.0005 || Math.abs(this.dist.alvo - this.dist.atual) > 0.0005) mexendo = true

    if (this.transicao && this.atual) {
      const t = Math.min((agora - this.transicao.ini) / this.transicao.dur, 1)
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const corte = -0.42 + e * 0.84
      this.atual.u.uCorte.value = corte
      for (const m of this.saindo) (m.userData.u as { uCorte: { value: number } }).uCorte.value = corte
      if (t >= 1) {
        this.atual.u.uCorte.value = 10
        this.atual.u.uLado.value = 1
        this.saindo.forEach((m) => this.descartar(m))
        this.saindo = []
        this.transicao = null
      }
      mexendo = true
    }

    this.renderer.render(this.cena, this.camera)
    this.desenhou = true
    const girando = !this.opcoes.reduzido && !this.opcoes.controlado && !this.arrastando && this.ocioso > 2.5
    if (this.visivel && !document.hidden && (mexendo || girando || this.arrastando || this.ocioso < 3)) this.pedirQuadro()
  }

  /** Captura o quadro atual (usado para gerar as imagens estáticas da seção). */
  capturar(): string {
    this.renderer.render(this.cena, this.camera)
    return this.renderer.domElement.toDataURL('image/png')
  }

  /** Posiciona a peça num ângulo fixo, sem animação (imagens estáticas). */
  fixar(anguloY: number) {
    this.rot.y = this.rot.alvoY = anguloY
    this.ocioso = -1e9
    this.peca.rotation.set(0, anguloY, 0)
  }

  destruir() {
    this.destruida = true
    cancelAnimationFrame(this.quadro)
    this.ro.disconnect()
    this.io.disconnect()
    document.removeEventListener('visibilitychange', this.aoVisibilidade)
    this.worker?.terminate()
    this.peca.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        ;(o.material as THREE.Material).dispose()
      }
    })
    this.geometrias.forEach((p) => p.then((g) => g.dispose()))
    this.trama.dispose()
    this.atlas?.dispose()
    this.renderer.dispose()
  }
}
