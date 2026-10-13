// Abre a aba da camisa, troca cor e modelo e captura o meio e o fim da transição.
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage()
const erros = []
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) erros.push(m.text()) })
page.on('pageerror', (e) => erros.push(e.message))
await page.setViewport({ width: 1280, height: 800 })
await page.goto('http://127.0.0.1:5230/', { waitUntil: 'networkidle0' })
// abre pelo link da seção, como um visitante
await page.evaluate(() => document.querySelector('#camisa')?.scrollIntoView())
await new Promise((r) => setTimeout(r, 800))
await page.click('.loja__compra a.botao')
await page.waitForSelector('.v3d--pronto', { timeout: 60000 })
await new Promise((r) => setTimeout(r, 1200))
console.log('hash ao abrir:', await page.evaluate(() => location.hash), 'foco:', await page.evaluate(() => document.activeElement?.className))
await page.click('.aba label.amostra:nth-child(2)')
await new Promise((r) => setTimeout(r, 480))
await page.screenshot({ path: 'shots/troca-meio.png' })
await new Promise((r) => setTimeout(r, 1500))
await page.screenshot({ path: 'shots/troca-fim.png' })
await page.click('.aba .modelo-opcao:nth-child(2)')
await new Promise((r) => setTimeout(r, 2600))
await page.screenshot({ path: 'shots/troca-regata.png' })
const estado = await page.evaluate(() => ({
  escolha: document.querySelector('.aba__escolha')?.textContent,
  verdeDesabilitado: document.querySelector('.aba input[value="verde"]')?.disabled,
}))
console.log(JSON.stringify(estado))
// vista de costas e fechar com Esc
await page.click('.aba__vistas button:nth-child(3)')
await new Promise((r) => setTimeout(r, 1600))
await page.screenshot({ path: 'shots/troca-costas.png' })
await page.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 900))
console.log('depois do Esc:', await page.evaluate(() => ({ hash: location.hash, aberta: !!document.querySelector('.aba--aberta'), inert: document.querySelector('main')?.hasAttribute('inert') })))
console.log(erros.length ? erros.join('\n') : 'sem erros no console')
await browser.close()
