import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

/*
 * O salão da Volts em 3D: o teto com os quadros de neon (moldura branca quente por fora,
 * verde por dentro) em duas colunas, piso de borracha que reflete a luz, paredes verdes,
 * névoa, arcos elétricos e o V do logo montado por partículas na parede do fundo.
 * Tudo é procedural; nenhum modelo é baixado. O progresso do scroll (0 a 1) comanda
 * câmera, carga dos quadros e montagem do V.
 */

const ALTURA = 3.2
const MEIA_LARGURA = 4.2
const FUNDO = -17
const FILEIRAS = [-0.5, -3.1, -5.7, -8.3, -10.9, -13.5]
const COLUNAS = [-1.35, 1.35]
const LADO_EXT = 1.5
const LADO_INT = 0.82
const Z_MARCA = -12.6

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a))
const suave = (t: number) => t * t * (3 - 2 * t)

// câmera: pontos de parada da história (progresso, posição, alvo)
const CHAVES: { p: number; pos: [number, number, number]; alvo: [number, number, number] }[] = [
  { p: 0.0, pos: [0, 1.62, 5.4], alvo: [0, 2.05, -6] },
  { p: 0.13, pos: [0, 1.62, 4.5], alvo: [0, 2.05, -6] },
  { p: 0.31, pos: [0.15, 1.55, -0.4], alvo: [0.25, 1.95, -9] },
  { p: 0.37, pos: [0, 1.42, -1.5], alvo: [0, 3.3, -4.9] },
  { p: 0.53, pos: [0, 1.38, -2.4], alvo: [0, 3.3, -6.1] },
  { p: 0.61, pos: [0, 1.5, -4.4], alvo: [0, 1.85, Z_MARCA] },
  { p: 0.75, pos: [0, 1.6, -6.6], alvo: [0, 1.82, Z_MARCA] },
  { p: 1.0, pos: [0, 1.62, -5.6], alvo: [0, 1.8, Z_MARCA] },
]

/*
 * Interpolação cúbica monótona (Fritsch-Carlson) por eixo: a câmera passa pelas chaves sem
 * parar em cada uma e sem passar do ponto. Onde o movimento inverte, ela desacelera sozinha.
 */
function monotona(xs: number[], ys: number[]) {
  const n = xs.length
  const d: number[] = []
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]))
  const m = new Array<number>(n).fill(0)
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0
      continue
    }
    const a = m[i] / d[i]
    const b = m[i + 1] / d[i]
    const q = a * a + b * b
    if (q > 9) {
      const t = 3 / Math.sqrt(q)
      m[i] = t * a * d[i]
      m[i + 1] = t * b * d[i]
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let i = 0
    while (x > xs[i + 1]) i++
    const h = xs[i + 1] - xs[i]
    const t = (x - xs[i]) / h
    const t2 = t * t
    const t3 = t2 * t
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
  }
}
const ps = CHAVES.map((c) => c.p)
const CAMINHO = {
  pos: [0, 1, 2].map((e) => monotona(ps, CHAVES.map((c) => c.pos[e]))),
  alvo: [0, 1, 2].map((e) => monotona(ps, CHAVES.map((c) => c.alvo[e]))),
}

// quadros que viram os quatro programas no ato 3 (vistos de baixo)
export const QUADROS_PROGRAMAS = [
  { col: 0, fil: 1 },
  { col: 1, fil: 1 },
  { col: 0, fil: 2 },
  { col: 1, fil: 2 },
]

// polígonos do V da marca (mesmo desenho do logo, unidades do SVG)
const RAIO: [number, number][] = [[0, 0], [69, 0], [100, 92], [119, 102], [85, 106], [84, 186]]
const BARRA: [number, number][] = [[228, 0], [309, 0], [201, 260], [121, 260]]
const ESC_MARCA = 2.5 / 260

function marcaParaMundo([x, y]: [number, number]): [number, number] {
  return [(x - 154.5) * ESC_MARCA, 1.75 + (130 - y) * ESC_MARCA]
}

function forma(pts: [number, number][]) {
  const s = new THREE.Shape()
  pts.forEach((p, i) => {
    const [x, y] = marcaParaMundo(p)
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  })
  s.closePath()
  return s
}

function dentro(pt: [number, number], poli: [number, number][]) {
  let c = false
  for (let i = 0, j = poli.length - 1; i < poli.length; j = i++) {
    const [xi, yi] = poli[i]
    const [xj, yj] = poli[j]
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

function texturaPiso() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d')!
  g.fillStyle = '#0b0f0c'
  g.fillRect(0, 0, 512, 512)
  // placas de borracha de 1 m com juntas finas
  g.strokeStyle = 'rgba(0,0,0,0.9)'
  g.lineWidth = 6
  g.strokeRect(0, 0, 512, 512)
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.025})`
    g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(8.4, 24)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function texturaParede() {
  // a parede do fundo com o letreiro VOLTS pintado em amarelo, como no salão real
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 1024
  const g = c.getContext('2d')!
  g.clearRect(0, 0, 2048, 1024)
  g.save()
  const esc = 0.95
  g.translate(560, 250)
  g.scale(esc, esc)
  g.fillStyle = '#e4ee1a'
  g.fill(new Path2D('M0 0H69L100 92L119 102L85 106L84 186Z'))
  g.fillStyle = '#e9ecdf'
  g.fill(new Path2D('M228 0H309L201 260H121Z'))
  g.restore()
  g.fillStyle = '#e4ee1a'
  g.font = '900 250px "Archivo Variable", "Arial Black", sans-serif'
  ;(g as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = 'extra-expanded'
  g.fillText('OLTS', 850, 495)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/*
 * Saída numa passada só: aberração cromática, clarão, vinheta e grão (em linear, como antes) e
 * depois o tone mapping e a conversão para sRGB do OutputPass. Uma tela cheia a menos por quadro.
 */
const SAIDA_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform float uTempo;
  uniform float uFlash;
  uniform float uVinheta;
  #include <tonemapping_pars_fragment>
  #include <colorspace_pars_fragment>
  varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uTempo * 7.0) * 43758.5453); }
  void main(){
    vec2 d = (vUv - 0.5);
    float ab = 0.0016 + uFlash * 0.006;
    vec3 c;
    c.r = texture2D(tDiffuse, vUv + d * ab * 2.0).r;
    c.g = texture2D(tDiffuse, vUv).g;
    c.b = texture2D(tDiffuse, vUv - d * ab * 2.0).b;
    c += uFlash * vec3(0.55, 0.62, 0.35);
    float v = smoothstep(0.95, 0.25, length(d * vec2(1.0, 1.15)));
    c *= mix(1.0, v, 0.55 * uVinheta);
    c += (h(vUv * 900.0) - 0.5) * 0.035;
    gl_FragColor = vec4(c, 1.0);
    #ifdef NEUTRAL_TONE_MAPPING
      gl_FragColor.rgb = NeutralToneMapping(gl_FragColor.rgb);
    #endif
    #ifdef SRGB_TRANSFER
      gl_FragColor = sRGBTransferOETF(gl_FragColor);
    #endif
  }`

type Quadro = { centro: THREE.Vector3; potencia: number; atraso: number }

export class Salao3D {
  private renderer: THREE.WebGLRenderer
  private cena = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, 1, 0.05, 60)
  private composer: EffectComposer
  private bloom: UnrealBloomPass
  private uFinal: Record<string, THREE.IUniform>
  private barrasQ: THREE.InstancedMesh
  private barrasV: THREE.InstancedMesh
  private reflexoQ: THREE.InstancedMesh
  private reflexoV: THREE.InstancedMesh
  private feixes: THREE.Mesh[] = []
  private uPart: Record<string, THREE.IUniform>
  private marca: THREE.Group
  private matRaio: THREE.MeshBasicMaterial
  private matBarra: THREE.MeshStandardMaterial
  private arcos: THREE.Line[] = []
  private ultimoArco = 0
  private luzes: THREE.PointLight[] = []
  private luzMarca: THREE.PointLight
  private matLetreiro!: THREE.MeshStandardMaterial
  quadros: Quadro[] = []
  private cor = new THREE.Color()
  private quente = new THREE.Color(1.0, 0.82, 0.6)
  private verde = new THREE.Color(0.12, 1.0, 0.42)
  private movel: boolean
  private mouse = { x: 0, y: 0, sx: 0, sy: 0 }
  private alvoCam = new THREE.Vector3()
  marcaCentro = new THREE.Vector3(0, 1.75, Z_MARCA)
  private tam = { w: 1, h: 1 }
  private teto = 1
  private qualidade = 1
  private media = 0
  private contagem = 0
  private ultimoQuadro = 0
  trocas = 0
  get resolucao() {
    return +(this.teto * this.qualidade).toFixed(2)
  }

  constructor(canvas: HTMLCanvasElement, { movel }: { movel: boolean }) {
    this.movel = movel
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false })
    this.renderer.setClearColor(0x060907, 1)
    this.renderer.toneMapping = THREE.NeutralToneMapping
    this.renderer.toneMappingExposure = 0.95
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.cena.background = new THREE.Color(0x060907)
    this.cena.fog = new THREE.FogExp2(0x050806, 0.036)

    this.montarSala()
    const geoBarra = new THREE.BoxGeometry(1, 1, 1)
    const matNeon = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, fog: true })
    const matReflexo = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, fog: true, transparent: true, opacity: 0.2, depthWrite: false })
    const n = FILEIRAS.length * COLUNAS.length * 4
    this.barrasQ = new THREE.InstancedMesh(geoBarra, matNeon, n)
    this.barrasV = new THREE.InstancedMesh(geoBarra, matNeon, n)
    this.reflexoQ = new THREE.InstancedMesh(geoBarra, matReflexo, n)
    this.reflexoV = new THREE.InstancedMesh(geoBarra, matReflexo, n)
    this.montarQuadros()
    this.cena.add(this.barrasQ, this.barrasV, this.reflexoQ, this.reflexoV)

    const { pontos, u } = this.montarParticulas()
    this.uPart = u
    this.cena.add(pontos)

    const m = this.montarMarca()
    this.marca = m.grupo
    this.matRaio = m.matRaio
    this.matBarra = m.matBarra
    this.cena.add(this.marca)

    for (let i = 0; i < 4; i++) {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(26 * 3), 3))
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: new THREE.Color(2.4, 2.8, 2.2), toneMapped: false, transparent: true, opacity: 0 }))
      l.frustumCulled = false
      this.arcos.push(l)
      this.cena.add(l)
    }

    // luzes que acompanham a câmera: dão volume às paredes e ao piso perto de quem olha
    const lv = new THREE.PointLight('#46f08c', 7, 10, 1.6)
    const lq = new THREE.PointLight('#ffe2b8', 5, 9, 1.6)
    const lv2 = new THREE.PointLight('#46f08c', 5, 10, 1.6)
    this.luzes.push(lv, lq, lv2)
    this.cena.add(lv, lq, lv2)
    this.luzMarca = new THREE.PointLight('#e8f51c', 0, 7, 1.6)
    this.luzMarca.position.set(0, 1.9, Z_MARCA + 1.4)
    this.cena.add(this.luzMarca)
    this.cena.add(new THREE.AmbientLight('#1b2b21', 0.9))

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.cena, this.camera))
    this.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.7, 0.16, 0.8)
    this.composer.addPass(this.bloom)
    // o brilho fica sempre na resolução cheia, mesmo quando a cena baixa a resolução: com menos
    // pixels o halo cresceria e a cena ficaria leitosa (e assim os buffers dele não são recriados)
    const tamanhoBloom = this.bloom.setSize.bind(this.bloom)
    // calculado em metade da resolução (o efeito mais caro da cena); o raio menor compensa o halo
    this.bloom.setSize = () => tamanhoBloom(Math.round(this.tam.w * this.teto * 0.5), Math.round(this.tam.h * this.teto * 0.5))
    const saida = new OutputPass()
    this.uFinal = saida.uniforms as unknown as Record<string, THREE.IUniform>
    Object.assign(this.uFinal, { uTempo: { value: 0 }, uFlash: { value: 0 }, uVinheta: { value: 1 } })
    saida.material.fragmentShader = SAIDA_FRAG
    saida.material.needsUpdate = true
    this.composer.addPass(saida)

    window.addEventListener('pointermove', this.aoMouse, { passive: true })

    // um quadro de aquecimento com tudo visível (inclusive o V, que só aparece no fim), passando pelo
    // composer: os shaders compilam já no estado certo (render target, sem tone mapping) e nada
    // compila no meio da rolagem
    this.marca.visible = true
    this.composer.render()
    this.marca.visible = false
  }

  private aoMouse = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    this.mouse.x = (e.clientX / innerWidth) * 2 - 1
    this.mouse.y = (e.clientY / innerHeight) * 2 - 1
  }

  private montarSala() {
    const piso = new THREE.Mesh(
      new THREE.PlaneGeometry(MEIA_LARGURA * 2, 30),
      new THREE.MeshStandardMaterial({ map: texturaPiso(), roughness: 0.42, metalness: 0.15, transparent: true, opacity: 0.84 }),
    )
    piso.rotation.x = -Math.PI / 2
    piso.position.set(0, 0, -6)
    this.cena.add(piso)

    const matParede = new THREE.MeshStandardMaterial({ color: '#0b1c13', roughness: 0.92 })
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(30, ALTURA + 0.2), matParede)
      p.rotation.y = (-s * Math.PI) / 2
      p.position.set(s * MEIA_LARGURA, ALTURA / 2, -6)
      this.cena.add(p)
      // faixa de rodapé escura, como no salão
      const r = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.12), new THREE.MeshStandardMaterial({ color: '#050806', roughness: 0.8 }))
      r.rotation.y = (-s * Math.PI) / 2
      r.position.set(s * (MEIA_LARGURA - 0.01), 0.06, -6)
      this.cena.add(r)
    }
    const fundo = new THREE.Mesh(new THREE.PlaneGeometry(MEIA_LARGURA * 2, ALTURA + 0.2), new THREE.MeshStandardMaterial({ color: '#0c2117', roughness: 0.92 }))
    fundo.position.set(0, ALTURA / 2, FUNDO)
    this.cena.add(fundo)
    const texLetreiro = texturaParede()
    this.matLetreiro = new THREE.MeshStandardMaterial({ map: texLetreiro, emissiveMap: texLetreiro, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.3, roughness: 0.9, transparent: true })
    const letreiro = new THREE.Mesh(new THREE.PlaneGeometry(MEIA_LARGURA * 2, ALTURA + 0.2), this.matLetreiro)
    letreiro.position.set(0, ALTURA / 2, FUNDO + 0.02)
    this.cena.add(letreiro)
    const teto = new THREE.Mesh(new THREE.PlaneGeometry(MEIA_LARGURA * 2, 30), new THREE.MeshStandardMaterial({ color: '#030403', roughness: 1 }))
    teto.rotation.x = Math.PI / 2
    teto.position.set(0, ALTURA + 0.08, -6)
    this.cena.add(teto)

    // feixes de luz suaves embaixo de cada quadro
    const geo = new THREE.CylinderGeometry(0.62, 1.25, ALTURA, 32, 1, true)
    geo.translate(0, -ALTURA / 2, 0)
    for (const z of FILEIRAS) {
      for (const x of COLUNAS) {
        const mat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          uniforms: { uForca: { value: 0 }, uCor: { value: new THREE.Color('#7dffb5') } },
          vertexShader: `varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = position.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
          fragmentShader: `uniform float uForca; uniform vec3 uCor; varying float vY; varying vec3 vN; varying vec3 vV;
            void main(){ float a = smoothstep(${(-ALTURA).toFixed(2)}, 0.0, vY); a *= a; float borda = pow(1.0 - abs(dot(vN, vV)), 1.6);
            gl_FragColor = vec4(uCor, a * (1.0 - borda) * 0.022 * uForca); }`,
        })
        const f = new THREE.Mesh(geo, mat)
        f.position.set(x, ALTURA, z)
        this.feixes.push(f)
        this.cena.add(f)
      }
    }
  }

  private montarQuadros() {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const s = new THREE.Vector3()
    const p = new THREE.Vector3()
    let i = 0
    FILEIRAS.forEach((z, fil) => {
      COLUNAS.forEach((x) => {
        this.quadros.push({ centro: new THREE.Vector3(x, ALTURA - 0.02, z), potencia: 0, atraso: fil * 0.22 + (x > 0 ? 0.11 : 0) + Math.random() * 0.08 })
        for (const [lado, malha, reflexo, esp] of [
          [LADO_EXT, this.barrasQ, this.reflexoQ, 0.045],
          [LADO_INT, this.barrasV, this.reflexoV, 0.038],
        ] as const) {
          const meio = lado / 2
          const barras: [number, number, number, number][] = [
            [x, z - meio, lado + esp, esp],
            [x, z + meio, lado + esp, esp],
            [x - meio, z, esp, lado],
            [x + meio, z, esp, lado],
          ]
          for (const [bx, bz, sx, sz] of barras) {
            p.set(bx, ALTURA - 0.03, bz)
            s.set(sx, esp * 0.8, sz)
            m.compose(p, q, s)
            malha.setMatrixAt(i, m)
            p.y = -(ALTURA - 0.03)
            m.compose(p, q, s)
            reflexo.setMatrixAt(i, m)
            malha.setColorAt(i, new THREE.Color(0, 0, 0))
            reflexo.setColorAt(i, new THREE.Color(0, 0, 0))
            i++
          }
          i -= 4
        }
        i += 4
      })
    })
    for (const mm of [this.barrasQ, this.barrasV, this.reflexoQ, this.reflexoV]) {
      mm.instanceMatrix.needsUpdate = true
      mm.instanceColor!.needsUpdate = true
    }
  }

  private montarParticulas() {
    const n = this.movel ? 1500 : 2800
    const ini = new Float32Array(n * 3)
    const fim = new Float32Array(n * 3)
    const atraso = new Float32Array(n)
    const tom = new Float32Array(n)
    const caixaX = [-10, 330]
    let k = 0
    while (k < n) {
      const pt: [number, number] = [caixaX[0] + Math.random() * (caixaX[1] - caixaX[0]), Math.random() * 262]
      const noRaio = dentro(pt, RAIO)
      const naBarra = dentro(pt, BARRA)
      if (!noRaio && !naBarra) continue
      const [wx, wy] = marcaParaMundo(pt)
      fim.set([wx, wy, Z_MARCA + (Math.random() - 0.5) * 0.24], k * 3)
      ini.set([(Math.random() - 0.5) * 8, Math.random() * ALTURA, 4 - Math.random() * 19], k * 3)
      atraso[k] = Math.random() * 0.45
      tom[k] = noRaio ? 1 : 0
      k++
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(ini, 3))
    g.setAttribute('aFim', new THREE.BufferAttribute(fim, 3))
    g.setAttribute('aAtraso', new THREE.BufferAttribute(atraso, 1))
    g.setAttribute('aTom', new THREE.BufferAttribute(tom, 1))
    const u = { uMontar: { value: 0 }, uTempo: { value: 0 }, uBrilho: { value: 0.6 }, uEscala: { value: 1 } }
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: u,
      vertexShader: /* glsl */ `
        attribute vec3 aFim; attribute float aAtraso; attribute float aTom;
        uniform float uMontar; uniform float uTempo; uniform float uEscala;
        varying float vTom; varying float vK; varying float vPerto;
        void main(){
          float k = clamp((uMontar - aAtraso) / 0.55, 0.0, 1.0);
          k = k * k * (3.0 - 2.0 * k);
          vec3 flutua = position + vec3(sin(uTempo * 0.3 + position.z) * 0.18, sin(uTempo * 0.21 + position.x * 1.7) * 0.12, cos(uTempo * 0.25 + position.y) * 0.18);
          vec3 p = mix(flutua, aFim, k);
          // trajetória em arco: as partículas sobem antes de assentar no V
          p.y += sin(k * 3.14159) * 0.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          // perto da câmera a partícula some em vez de virar uma bolha enorme (e cara de desenhar)
          gl_PointSize = min(uEscala * mix(15.0, 14.0, k) / -mv.z, 26.0 * uEscala);
          gl_Position = projectionMatrix * mv;
          vTom = aTom; vK = k; vPerto = smoothstep(0.35, 1.6, -mv.z);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uBrilho; varying float vTom; varying float vK; varying float vPerto;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          vec3 c = mix(vec3(0.85, 1.0, 0.9), mix(vec3(1.0, 1.0, 0.95), vec3(0.95, 1.0, 0.1), vTom), vK);
          gl_FragColor = vec4(c * (0.9 + vK * 1.3), a * uBrilho * mix(0.4, 1.0, vK) * vPerto);
        }`,
    })
    const pontos = new THREE.Points(g, mat)
    pontos.frustumCulled = false
    return { pontos, u }
  }

  private montarMarca() {
    const grupo = new THREE.Group()
    const ext = { depth: 0.16, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 2 }
    const matRaio = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.55, 0.12), toneMapped: false, transparent: true, opacity: 0 })
    const matBarra = new THREE.MeshStandardMaterial({ color: '#d9ded6', emissive: new THREE.Color('#eef2ea'), emissiveIntensity: 0.22, roughness: 0.35, metalness: 0.1, transparent: true, opacity: 0 })
    const raio = new THREE.Mesh(new THREE.ExtrudeGeometry(forma(RAIO), ext), matRaio)
    const barra = new THREE.Mesh(new THREE.ExtrudeGeometry(forma(BARRA), ext), matBarra)
    grupo.add(raio, barra)
    grupo.position.z = Z_MARCA - 0.08
    return { grupo, matRaio, matBarra }
  }

  resize(w: number, h: number, dpr: number) {
    this.tam = { w, h }
    this.teto = Math.min(dpr, this.movel ? 1.5 : 1.25)
    this.aplicarResolucao()
    const aspecto = w / h
    this.camera.aspect = aspecto
    this.camera.fov = aspecto < 0.8 ? 66 : aspecto < 1.2 ? 58 : 50
    this.camera.updateProjectionMatrix()
  }

  private aplicarResolucao() {
    const { w, h } = this.tam
    const ratio = Math.max(0.5, this.teto * this.qualidade)
    this.renderer.setPixelRatio(ratio)
    this.renderer.setSize(w, h, false)
    this.composer.setPixelRatio(ratio)
    this.composer.setSize(w, h)
    this.trocas++
    this.uPart.uEscala.value = h * ratio * 0.0016 * (this.movel ? 1.2 : 1)
  }

  /**
   * Mede o intervalo entre quadros e ajusta a resolução: se o aparelho não sustenta a
   * cena, ela renderiza com menos pixels (o grão e o bloom escondem a diferença).
   */
  private medir() {
    const agora = performance.now()
    const dt = agora - this.ultimoQuadro
    this.ultimoQuadro = agora
    if (dt <= 0 || dt > 120) return
    this.media = this.media ? this.media * 0.92 + dt * 0.08 : dt
    if (++this.contagem < 30) return
    this.contagem = 0
    // desce em passos grandes e raros (cada troca recria buffers); só volta a subir com folga
    if (this.media > 18.5 && this.qualidade > 0.56) {
      this.qualidade = Math.max(0.56, this.qualidade * 0.75)
      this.aplicarResolucao()
    } else if (this.media < 11 && this.qualidade < 1) {
      this.qualidade = Math.min(1, this.qualidade / 0.75)
      this.aplicarResolucao()
    }
  }

  /** Câmera ao longo das chaves, numa curva contínua. */
  private posicionarCamera(p: number, tempo: number) {
    const [px, py, pz] = CAMINHO.pos.map((f) => f(p))
    const [ax, ay, az] = CAMINHO.alvo.map((f) => f(p))
    this.mouse.sx += (this.mouse.x - this.mouse.sx) * 0.035
    this.mouse.sy += (this.mouse.y - this.mouse.sy) * 0.035
    const resp = Math.sin(tempo * 0.5) * 0.018
    this.camera.position.set(px + this.mouse.sx * 0.12, py - this.mouse.sy * 0.07 + resp, pz)
    this.alvoCam.set(ax + this.mouse.sx * 0.2, ay - this.mouse.sy * 0.12, az)
    this.camera.lookAt(this.alvoCam)
    // as luzes de apoio andam com a câmera
    this.luzes[0].position.set(-1.8, 2.7, pz - 2.5)
    this.luzes[1].position.set(1.6, 2.8, pz - 4.5)
    this.luzes[2].position.set(0, 2.6, pz - 8)
  }

  private gerarArco(l: THREE.Line, a: THREE.Vector3, b: THREE.Vector3, amp: number) {
    const pos = l.geometry.getAttribute('position') as THREE.BufferAttribute
    const n = pos.count
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const env = Math.sin(t * Math.PI)
      pos.setXYZ(
        i,
        a.x + (b.x - a.x) * t + (Math.random() - 0.5) * amp * env,
        a.y + (b.y - a.y) * t + (Math.random() - 0.5) * amp * env - env * 0.08,
        a.z + (b.z - a.z) * t + (Math.random() - 0.5) * amp * env,
      )
    }
    pos.needsUpdate = true
  }

  /**
   * Aplica o estado da história.
   * p: progresso do scroll; tempo: segundos; ligar: rampa de carregamento (0 a 1);
   * destaque: índice do programa em destaque no ato 3 (-1 nenhum) e força 0 a 1.
   */
  apply(p: number, tempo: number, ligar: number, destaque: { i: number; k: number }[]) {
    this.posicionarCamera(p, tempo)

    // ---- quadros do teto: acendem um a um no carregamento e ganham carga ao longo da história
    const carga = 0.72 + 0.28 * suave(inv(0.6, 0.95, p))
    this.quadros.forEach((q, i) => {
      const t = clamp((ligar * 2.4 - q.atraso) / 0.5)
      // pisca duas vezes antes de firmar (abaixo de 3 piscadas por segundo)
      let pisca = 1
      if (t > 0 && t < 1) pisca = t < 0.25 ? 0.9 : t < 0.42 ? 0.12 : t < 0.6 ? 1 : t < 0.72 ? 0.4 : 1
      if (t === 0) pisca = 0
      // tremor leve do neon, sempre
      const zumbido = 0.94 + 0.06 * Math.sin(tempo * 13 + i * 2.1) * Math.sin(tempo * 3.7 + i)
      let extra = 0
      for (const d of destaque) if (d.i === i) extra = d.k
      q.potencia = pisca * zumbido * carga * (1 + extra * 0.55)
    })
    let idx = 0
    this.quadros.forEach((q) => {
      for (let b = 0; b < 4; b++) {
        this.cor.copy(this.quente).multiplyScalar(1.75 * q.potencia)
        this.barrasQ.setColorAt(idx, this.cor)
        this.reflexoQ.setColorAt(idx, this.cor)
        this.cor.copy(this.verde).multiplyScalar(2.3 * q.potencia)
        this.barrasV.setColorAt(idx, this.cor)
        this.reflexoV.setColorAt(idx, this.cor)
        idx++
      }
    })
    for (const mm of [this.barrasQ, this.barrasV, this.reflexoQ, this.reflexoV]) mm.instanceColor!.needsUpdate = true
    this.feixes.forEach((f, i) => ((f.material as THREE.ShaderMaterial).uniforms.uForca.value = this.quadros[i].potencia))

    // ---- arcos elétricos: na chegada da luz e entre os quadros no ato 2
    const arcoK = Math.max(1 - Math.abs(ligar - 0.55) * 3, 0) * 0.8 + (inv(0.15, 0.2, p) * (1 - inv(0.3, 0.34, p))) + inv(0.7, 0.76, p) * (1 - inv(0.86, 0.95, p)) * 0.8
    if (tempo - this.ultimoArco > 0.07) {
      this.ultimoArco = tempo
      this.arcos.forEach((l, i) => {
        const vivo = arcoK > 0.02 && Math.random() < 0.55
        ;(l.material as THREE.LineBasicMaterial).opacity = vivo ? Math.min(arcoK, 1) * (0.5 + Math.random() * 0.5) : 0
        if (!vivo) return
        if (p > 0.65) {
          // descargas saindo do V para o teto
          const a = this.marcaCentro.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2.4, (Math.random() - 0.3) * 1.6, 0.2))
          const qd = this.quadros[8 + Math.floor(Math.random() * 4)]
          this.gerarArco(l, a, qd.centro, 0.42)
        } else {
          const fil = Math.floor(Math.random() * 4)
          const a = this.quadros[fil * 2 + (i % 2)].centro.clone()
          const b = this.quadros[(fil + 1) * 2 + ((i + 1) % 2)].centro.clone()
          a.x += (Math.random() - 0.5) * 1.2
          b.x += (Math.random() - 0.5) * 1.2
          this.gerarArco(l, a, b, 0.5)
        }
      })
    }

    // ---- partículas e o V
    const montar = inv(0.555, 0.735, p)
    this.uPart.uMontar.value = montar * 1.45
    this.uPart.uTempo.value = tempo
    this.uPart.uBrilho.value = 0.18 + 0.5 * suave(inv(0.5, 0.6, p)) - 0.62 * suave(inv(0.74, 0.8, p))
    const solido = suave(inv(0.7, 0.78, p))
    const pulso = 0.82 + 0.1 * Math.sin(tempo * 4.2)
    this.matRaio.opacity = solido
    this.matRaio.color.setRGB(1.5 * pulso, 1.55 * pulso, 0.12)
    this.matBarra.opacity = solido
    this.marca.visible = solido > 0.001
    this.marca.rotation.y = (1 - solido) * 0.35 + Math.sin(tempo * 0.5) * 0.02
    this.luzMarca.intensity = 6 * solido * pulso
    this.matLetreiro.opacity = 1 - 0.92 * suave(inv(0.6, 0.72, p))

    // ---- pós: bloom cresce com a carga; clarão quando o V liga
    this.bloom.strength = (this.movel ? 0.62 : 0.7) + 0.1 * suave(inv(0.7, 0.8, p))
    const clarao = Math.max(0, 1 - Math.abs(p - 0.765) / 0.02) * 0.55 + Math.max(0, 1 - Math.abs(ligar - 0.62) / 0.05) * 0.18
    this.uFinal.uFlash.value = clarao
    this.uFinal.uTempo.value = tempo
  }

  render() {
    this.medir()
    this.composer.render()
  }

  /** Projeta um ponto do salão na tela (px). */
  projetar(v: THREE.Vector3, w: number, h: number) {
    const p = v.clone().project(this.camera)
    return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h, frente: p.z < 1 }
  }

  dispose() {
    window.removeEventListener('pointermove', this.aoMouse)
    this.cena.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
      const mat = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else mat?.dispose?.()
    })
    this.composer.dispose()
    this.renderer.dispose()
  }
}
