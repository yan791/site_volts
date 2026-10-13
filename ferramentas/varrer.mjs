// Várias capturas numa só visita: node varrer.mjs <url> <largura> <altura> <prefixo> [--movel] <alvo>...
// alvo = "#secao+1.2" (topo da seção + 1,2 tela) ou um número de pixels
import puppeteer from 'puppeteer-core'

const args = process.argv.slice(2)
const movel = args.includes('--movel')
const [url, largura, altura, prefixo, ...alvos] = args.filter((a) => !a.startsWith('--'))
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'],
})
const page = await browser.newPage()
const erros = []
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(`[${m.type()}] ${m.text()}`) })
page.on('pageerror', (e) => erros.push(`[pageerror] ${e.message}`))
await page.setViewport({ width: +largura, height: +altura, deviceScaleFactor: 1, isMobile: movel, hasTouch: movel })
await page.evaluateOnNewDocument(() => sessionStorage.setItem('volts-abertura', '1'))
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2000))
for (const alvo of alvos) {
  // desce aos poucos até o alvo, para disparar as entradas como numa visita real
  const y = await page.evaluate((alvo) => {
    const [sel, mais] = alvo.split('+')
    return Math.round((/^\d+$/.test(sel) ? +sel : (document.querySelector(sel)?.getBoundingClientRect().top ?? 0) + scrollY) + (mais ? +mais * innerHeight : 0))
  }, alvo)
  await page.evaluate(async (y) => {
    const ini = scrollY
    const passos = Math.min(30, Math.max(1, Math.ceil(Math.abs(y - ini) / 500)))
    for (let i = 1; i <= passos; i++) {
      window.scrollTo(0, ini + ((y - ini) * i) / passos)
      await new Promise((r) => setTimeout(r, 40))
    }
  }, y)
  await new Promise((r) => setTimeout(r, 1800))
  const nome = `shots/${prefixo}-${alvo.replace(/[#+]/g, (c) => (c === '#' ? '' : '_'))}.png`
  await page.screenshot({ path: nome })
  console.log(nome)
}
if (erros.length) console.log(erros.join('\n'))
await browser.close()
