// Mede o custo de cada efeito do salão 3D: fixa a história num ponto e compara o tempo por quadro.
// node custo3d.mjs <url> <p> [largura] [altura]
import puppeteer from 'puppeteer-core'
const [url, p = '0.3', largura = '1536', altura = '864'] = process.argv.slice(2)
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: +largura, height: +altura, deviceScaleFactor: 1 })
await page.evaluateOnNewDocument(() => sessionStorage.setItem('volts-abertura', '1'))
await page.goto(url, { waitUntil: 'networkidle0' })
await page.waitForFunction(() => window.__historia?.get().pronto, { timeout: 30000 })
await page.evaluate((p) => {
  const s = document.querySelector('.historia')
  window.scrollTo(0, (s.offsetHeight - innerHeight) * p)
}, +p)
await new Promise((r) => setTimeout(r, 1500))
const medir = () => page.evaluate(() => new Promise((res) => {
  const q = []; let u = performance.now()
  const f = (t) => { q.push(t - u); u = t; if (q.length < 150) requestAnimationFrame(f); else res(+(q.slice(10).reduce((a, b) => a + b, 0) / 140).toFixed(2)) }
  requestAnimationFrame(f)
}))
// trava a resolução para comparar o mesmo número de pixels
await page.evaluate(() => { const c = window.__salao; c.qualidade = 1; c.medir = () => {}; c.aplicarResolucao() })
const testes = {
  base: () => {},
  semFeixes: (c) => c.feixes.forEach((f) => (f.visible = false)),
  semBloom: (c) => (c.bloom.enabled = false),
  semFinal: (c) => (c.final.enabled = false),
  semParticulas: (c) => c.cena.children.filter((o) => o.isPoints).forEach((o) => (o.visible = false)),
  semReflexo: (c) => [c.reflexoQ, c.reflexoV].forEach((o) => (o.visible = false)),
  semLuzes: (c) => c.luzes.forEach((l) => (l.visible = false)),
}
const res = {}
for (const [nome, fn] of Object.entries(testes)) {
  await page.evaluate(`(${fn.toString()})(window.__salao)`)
  res[nome] = await medir()
  await page.reload({ waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.__historia?.get().pronto, { timeout: 30000 })
  await page.evaluate((p) => { const s = document.querySelector('.historia'); window.scrollTo(0, (s.offsetHeight - innerHeight) * p) }, +p)
  await new Promise((r) => setTimeout(r, 1500))
  await page.evaluate(() => { const c = window.__salao; c.qualidade = 1; c.medir = () => {}; c.aplicarResolucao() })
}
console.log(JSON.stringify(res, null, 1))
await browser.close()
