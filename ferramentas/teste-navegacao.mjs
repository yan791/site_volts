// Confere âncoras do menu, seletor de objetivo, carrossel de diferenciais, sanfona de dúvidas e os links externos.
import puppeteer from 'puppeteer-core'

const base = process.argv[2] ?? 'http://127.0.0.1:5231/'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage()
const erros = []
page.on('pageerror', (e) => erros.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()) })
await page.setViewport({ width: 1366, height: 820 })
await page.evaluateOnNewDocument(() => sessionStorage.setItem('volts-abertura', '1'))
await page.goto(base, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1500))
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

// links do menu (passam pela rolagem suave do site)
for (const alvo of ['#programas', '#experiencia', '#estrutura', '#contato']) {
  await page.evaluate((a) => document.querySelector(`.cabecalho__nav a[href="${a}"]`).click(), alvo)
  await espera(2200)
  const topo = await page.evaluate((a) => Math.round(document.querySelector(a).getBoundingClientRect().top), alvo)
  console.log('menu', alvo, 'topo da seção na tela:', topo)
}

// seletor de objetivo: o trilho leva ao programa indicado
await page.evaluate(() => document.querySelector('#programas').scrollIntoView())
await espera(900)
await page.evaluate(() => document.querySelector('.pg-chip:nth-child(4)').click())
await espera(2400)
console.log('objetivo:', await page.$eval('.pg-resposta', (e) => e.textContent))
console.log('passo ativo no trilho:', await page.$eval('.pg-passo--ativo .pg-passo-nome', (e) => e.textContent))

// seta do carrossel de programas
await page.evaluate(() => document.querySelector('.pg-seta--volta').click())
await espera(1200)
console.log('programas, depois da seta de voltar:', await page.$eval('.pg-passo--ativo .pg-passo-nome', (e) => e.textContent))

// carrossel de diferenciais: seta e pontos (o giro automático espera 7 s depois de um clique)
await page.evaluate(() => document.querySelector('#experiencia').scrollIntoView())
await espera(1500)
const contador = () => page.$eval('.df-contador b', (e) => e.textContent)
const antes = await contador()
await page.evaluate(() => document.querySelector('.df-seta:not(.df-seta--volta)').click())
await espera(1600)
console.log('diferenciais:', antes, '-> depois da seta:', await contador())
await page.evaluate(() => document.querySelectorAll('.df-pontos button')[4].click())
await espera(1800)
console.log('depois do ponto 05:', await contador(), '| cartão de frente:', await page.$eval('.cg-cartao[data-frente] .cg-titulo', (e) => e.textContent))

// atalho do topo: Camiseta Volts abre a aba de compra
await page.evaluate(() => document.querySelector('.cabecalho__atalho--camisa').click())
await espera(1200)
console.log('atalho camiseta:', await page.evaluate(() => ({ hash: location.hash, aberta: !!document.querySelector('.aba--aberta') })))
await page.keyboard.press('Escape')
await espera(900)

// sanfona
await page.evaluate(() => document.querySelector('#duvidas').scrollIntoView())
await espera(800)
await page.evaluate(() => document.querySelector('.duvida:nth-child(3) button').click())
await espera(600)
console.log('dúvida 3 aberta:', await page.$eval('.duvida:nth-child(3) button', (b) => b.getAttribute('aria-expanded')))

// links externos
const links = await page.$$eval('a[href^="http"]', (l) => [...new Set(l.map((a) => a.href.split('?')[0]))])
console.log('destinos externos:', links.join(' | '))
const semRel = await page.$$eval('a[target="_blank"]:not([rel~="noopener"])', (l) => l.length)
console.log('links _blank sem noopener:', semRel)
const wa = await page.$eval('.hs-acoes a', (a) => decodeURIComponent(a.href))
console.log('WhatsApp da primeira dobra:', wa)
console.log('WhatsApp do topo:', await page.$eval('.cabecalho__atalho:not(.cabecalho__atalho--camisa)', (a) => decodeURIComponent(a.href)))
console.log(erros.length ? erros.join('\n') : 'sem erros')
await browser.close()
