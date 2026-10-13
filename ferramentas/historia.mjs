// Fotografa o ato 1 em vários pontos do progresso.  node historia.mjs <url> <largura> <altura> <p1,p2,...> [prefixo] [--movel]
import puppeteer from 'puppeteer-core'
const [url, w, h, lista, prefixo = 'hs'] = process.argv.slice(2)
const movel = process.argv.includes('--movel')
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const page = await browser.newPage()
const erros = []
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(m.text()) })
page.on('pageerror', (e) => erros.push(e.message))
await page.setViewport({ width: +w, height: +h, isMobile: movel, hasTouch: movel })
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForFunction(() => window.__historia?.get().pronto, { timeout: 30000 }).catch(() => erros.push('cena 3D não ficou pronta'))
await new Promise((r) => setTimeout(r, 2600))
for (const p of lista.split(',').map(Number)) {
  await page.evaluate((p) => {
    const r = document.querySelector('.historia')
    const y = r.offsetTop + p * (r.offsetHeight - innerHeight)
    window.scrollTo(0, y)
  }, p)
  await new Promise((r) => setTimeout(r, 1700))
  await page.screenshot({ path: `shots/${prefixo}-${String(p).replace('.', '_')}.png` })
  console.log('p', p, JSON.stringify(await page.evaluate(() => window.__historia?.get())))
}
console.log(erros.length ? erros.join('\n') : 'sem erros')
await browser.close()
