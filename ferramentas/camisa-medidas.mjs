import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.evaluateOnNewDocument(() => sessionStorage.setItem('volts-abertura', '1'))
await page.goto('http://127.0.0.1:5230/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 2000))
await page.evaluate(() => {
  window.__lentas = []
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lentas.push(Math.round(e.duration)))).observe({ type: 'longtask', buffered: false })
  document.querySelector('#comunidade').scrollIntoView()
})
await page.waitForSelector('.cs-canvas--pronto', { timeout: 30000 })
await new Promise((r) => setTimeout(r, 1500))
console.log(await page.evaluate(() => JSON.stringify({ medidas: performance.getEntriesByType('measure').filter((m) => /^c[s]?:/.test(m.name)).map((m) => `${m.name} ${Math.round(m.duration)}`), longas: window.__lentas })))
await browser.close()
