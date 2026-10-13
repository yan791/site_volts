// Rola só o ato 1 com efeitos ligados/desligados e compara o tempo por quadro.
import puppeteer from 'puppeteer-core'
const [url, largura = '1536', altura = '864'] = process.argv.slice(2)
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: +largura, height: +altura, deviceScaleFactor: 1 })
await page.evaluateOnNewDocument(() => sessionStorage.setItem('volts-abertura', '1'))
const testes = {
  base: '0',
  sem3D: 'window.__salao.render = () => {}',
  semBloom: 'window.__salao.bloom.enabled = false',
  semTextos: "document.querySelectorAll('.hs-faixa,.hs-rotulo,.hs-foto,.hs-cap').forEach(e => e.style.display = 'none')",
  semResto: "document.querySelectorAll('main > section:not(.historia), .voltimetro, .cursor, .ambiente').forEach(e => e.style.display = 'none')",
}
const res = {}
for (const [nome, js] of Object.entries(testes)) {
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.__historia?.get().pronto, { timeout: 30000 })
  await new Promise((r) => setTimeout(r, 1500))
  await page.evaluate(() => { const c = window.__salao; c.qualidade = 1; c.medir = () => {}; c.aplicarResolucao() })
  await page.evaluate(js)
  await page.mouse.move(+largura / 2, +altura / 2)
  await page.evaluate(() => { window.__q = []; let u = performance.now(); const f = (t) => { window.__q.push(t - u); u = t; requestAnimationFrame(f) }; requestAnimationFrame(f) })
  const fim = await page.evaluate(() => document.querySelector('.historia').offsetHeight - innerHeight)
  while ((await page.evaluate(() => scrollY)) < fim) {
    await page.mouse.wheel({ deltaY: 120 })
    await new Promise((r) => setTimeout(r, 45))
  }
  res[nome] = await page.evaluate(() => { const q = window.__q.slice(5); return { media: +(q.reduce((a, b) => a + b, 0) / q.length).toFixed(1), acima20: q.filter((d) => d > 20).length, n: q.length } })
  console.log(nome, JSON.stringify(res[nome]))
}
await browser.close()
