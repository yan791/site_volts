import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const p = await b.newPage(); await p.goto('http://127.0.0.1:5230/?x=1')
console.log('reduce?', await p.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
await b.close()
