// Capturas de tela com o Chrome headless.
// node shot.mjs <url> <saida.png> [largura] [altura] [--full] [--movel] [--reduzido] [--abertura] [--rolar=<seletor|px>[+vh]] [--espera=ms] [--clique=<seletor>]
// --rolar=#secao+1.5 rola até o topo da seção e mais 1,5 altura de tela (útil nas seções fixas)
import puppeteer from 'puppeteer-core'

const args = process.argv.slice(2)
const pos = args.filter((a) => !a.startsWith('--'))
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? true] }))
const [url, saida, largura = '1440', altura = '900'] = pos

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()
const erros = []
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(`[${m.type()}] ${m.text()}`) })
page.on('pageerror', (e) => erros.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => erros.push(`[falha] ${r.url()} ${r.failure()?.errorText}`))
await page.setViewport({ width: +largura, height: +altura, deviceScaleFactor: opt.dpr ? +opt.dpr : 1, isMobile: !!opt.movel, hasTouch: !!opt.movel })
if (opt.reduzido) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
if (!opt.abertura) await page.evaluateOnNewDocument(() => sessionStorage.setItem('volts-abertura', '1'))
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
await page.evaluate(() => document.fonts.ready)
if (opt.rolar) {
  await page.evaluate(async (alvo) => {
    const [sel, mais] = alvo.split('+')
    const y = (/^\d+$/.test(sel) ? +sel : (document.querySelector(sel)?.getBoundingClientRect().top ?? 0) + scrollY) + (mais ? +mais * innerHeight : 0)
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 120))
    window.scrollTo(0, y)
  }, opt.rolar)
}
if (opt.clique) {
  await page.click(opt.clique)
}
await new Promise((r) => setTimeout(r, opt.espera ? +opt.espera : 2600))
if (opt.full) {
  // percorre a página para carregar as imagens preguiçosas e disparar as entradas
  await page.evaluate(async () => {
    const passo = innerHeight * 0.8
    for (let y = 0; y < document.documentElement.scrollHeight; y += passo) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 140))
    }
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 300))
  })
  await page.evaluate(() => Promise.race([
    Promise.all(Array.from(document.images).filter((i) => !i.complete && i.offsetParent).map((i) => new Promise((r) => { i.onload = i.onerror = r }))),
    new Promise((r) => setTimeout(r, 6000)),
  ]))
  // revela as entradas para a captura de página inteira
  await page.evaluate(() => document.querySelectorAll('[data-revelar]').forEach((e) => e.classList.add('visivel')))
  await new Promise((r) => setTimeout(r, 1400))
}
if (opt.recorte) {
  const [cy, ch] = opt.recorte.split(',').map(Number)
  await page.screenshot({ path: saida, clip: { x: 0, y: cy, width: +largura, height: ch }, captureBeyondViewport: true })
} else {
  await page.screenshot({ path: saida, fullPage: !!opt.full })
}
const info = await page.evaluate(() => ({ larguraDoc: document.documentElement.scrollWidth, larguraJanela: innerWidth, altura: document.documentElement.scrollHeight }))
console.log(JSON.stringify(info))
if (erros.length) console.log(erros.join('\n'))
await browser.close()
