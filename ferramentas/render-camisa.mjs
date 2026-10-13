// Gera imagens da camisa 3D com fundo transparente a partir do servidor de desenvolvimento.
// node render-camisa.mjs <pasta-saida> <largura> <altura> <variante:angulo> [...]
import puppeteer from 'puppeteer-core'

const [saida, w = '1000', h = '1100', ...itens] = process.argv.slice(2)
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
})
for (const item of itens) {
  const [id, angulo = '-0.35'] = item.split(':')
  const page = await browser.newPage()
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(`[${m.type()}] ${m.text()}`) })
  page.on('pageerror', (e) => console.log('[pageerror]', e.message))
  await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 })
  const t0 = Date.now()
  await page.goto(`http://127.0.0.1:5230/?render=${id}&angulo=${angulo}`, { waitUntil: 'networkidle0' })
  await page.waitForFunction('window.__camisaPronta === true', { timeout: 90000 })
  await new Promise((r) => setTimeout(r, 1200))
  const arq = `${saida}/${id}_${angulo}.png`
  await page.screenshot({ path: arq, omitBackground: true })
  console.log(arq, `${Date.now() - t0} ms`)
  await page.close()
}
await browser.close()
