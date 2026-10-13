// Gera o pôster do ato 1 (aparece antes do 3D carregar e quando não há WebGL).
import puppeteer from 'puppeteer-core'
const [url, saida = 'shots/poster.png', largura = '1600', altura = '1000'] = process.argv.slice(2)
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: +largura, height: +altura, deviceScaleFactor: 1 })
await page.evaluateOnNewDocument(() => sessionStorage.setItem('volts-abertura', '1'))
await page.goto(url, { waitUntil: 'networkidle0' })
await page.waitForFunction(() => window.__historia?.get().pronto, { timeout: 30000 })
await page.evaluate(() => {
  const c = window.__salao
  c.qualidade = 1
  c.medir = () => {}
  c.aplicarResolucao()
  document.querySelectorAll('.hs-faixa, .hs-cap, .hs-dica, .hs-vinheta, .hs-rotulo, .hs-poster, header, .cabecalho, .voltimetro, .cursor, .barra-celular').forEach((e) => (e.style.display = 'none'))
})
await new Promise((r) => setTimeout(r, 4000))
await page.screenshot({ path: saida })
await browser.close()
