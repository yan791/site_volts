import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })
const page = await browser.newPage()
await page.setViewport({ width: 1100, height: 760 })
await page.goto('http://127.0.0.1:5230/?animacoes#comprar-camisa', { waitUntil: 'networkidle0' })
await page.waitForSelector('.v3d--pronto', { timeout: 60000 })
await new Promise((r) => setTimeout(r, 1500))
await page.click('.aba label.amostra:nth-child(2)')
const t0 = Date.now()
for (let i = 0; i < 6; i++) {
  await page.screenshot({ path: `shots/scan-${i}.png`, clip: { x: 0, y: 68, width: 640, height: 690 } })
  console.log(i, Date.now() - t0, 'ms')
}
await browser.close()
