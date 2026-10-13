import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })
const page = await browser.newPage()
await page.goto('about:blank')
console.log(await page.evaluate(() => { const gl = document.createElement('canvas').getContext('webgl2'); const d = gl.getExtension('WEBGL_debug_renderer_info'); return gl.getParameter(d.UNMASKED_RENDERER_WEBGL) }))
await browser.close()
