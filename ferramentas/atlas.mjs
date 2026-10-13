import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=d3d11'] })
const p = await b.newPage(); await p.setViewport({ width: 600, height: 600 })
await p.goto('http://127.0.0.1:5230/?render=camiseta-verde', { waitUntil: 'networkidle0' })
await p.waitForFunction('window.__atlas', { timeout: 60000 })
const d = await p.evaluate(() => window.__atlas)
fs.writeFileSync('render/atlas.png', Buffer.from(d.split(',')[1], 'base64'))
await b.close()
