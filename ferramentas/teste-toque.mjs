// Celular: deslize horizontal nos carrosséis e rolagem vertical por cima deles (nada prende a página).
import puppeteer from 'puppeteer-core'
const base = process.argv[2] ?? 'http://127.0.0.1:5231/'
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await page.evaluateOnNewDocument(() => sessionStorage.setItem('volts-abertura', '1'))
await page.goto(base, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1500))
const cdp = await page.createCDPSession()
// dedo de verdade: toque, 12 movimentos e soltar
const arrastar = async (x0, y0, x1, y1) => {
  const ponto = (x, y) => [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: ponto(x0, y0) })
  for (let i = 1; i <= 12; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: ponto(x0 + ((x1 - x0) * i) / 12, y0 + ((y1 - y0) * i) / 12) })
    await new Promise((r) => setTimeout(r, 16))
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await new Promise((r) => setTimeout(r, 1000))
}
// programas: deslize para a esquerda no trilho
const trilho = await page.evaluate(() => { const t = document.querySelector('.pg-trilho'); t.scrollIntoView({ block: 'center' }); return null })
await new Promise((r) => setTimeout(r, 800))
const caixa = await page.evaluate(() => { const r = document.querySelector('.pg-foto').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
await arrastar(caixa.x + 120, caixa.y, caixa.x - 160, caixa.y)
console.log('programas depois do deslize:', await page.evaluate(() => ({ scrollLeft: Math.round(document.querySelector('.pg-trilho').scrollLeft), passo: document.querySelector('.pg-passo--ativo .pg-passo-num').textContent })))
// rolagem vertical começando em cima do trilho e em cima do anel de diferenciais
let y0 = await page.evaluate(() => scrollY)
await arrastar(caixa.x, caixa.y + 100, caixa.x, caixa.y - 300)
console.log('vertical sobre programas, rolou px:', Math.round((await page.evaluate(() => scrollY)) - y0))
await page.evaluate(() => document.querySelector('.df-palco').scrollIntoView({ block: 'center' }))
await new Promise((r) => setTimeout(r, 800))
y0 = await page.evaluate(() => scrollY)
await arrastar(195, 420, 195, 120)
console.log('vertical sobre o anel, rolou px:', Math.round((await page.evaluate(() => scrollY)) - y0))
await page.evaluate(() => document.querySelector('.df-palco').scrollIntoView({ block: 'center' }))
await new Promise((r) => setTimeout(r, 800))
const c0 = await page.$eval('.df-contador b', (e) => e.textContent)
await arrastar(300, 420, 80, 420)
await new Promise((r) => setTimeout(r, 800))
console.log('anel depois do deslize horizontal:', c0, '->', await page.$eval('.df-contador b', (e) => e.textContent))
await browser.close()
