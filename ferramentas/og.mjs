// Gera a imagem de compartilhamento (og-volts.jpg) a partir de og.html.
import puppeteer from 'puppeteer-core'
import { pathToFileURL } from 'node:url'

const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--allow-file-access-from-files'],
})
const p = await b.newPage()
await p.setViewport({ width: 1200, height: 630 })
await p.goto(pathToFileURL('og.html').href, { waitUntil: 'networkidle0' })
await p.evaluate(() => document.fonts.ready)
await p.screenshot({ path: 'render/og.png' })
await b.close()
