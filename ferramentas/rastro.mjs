// Rastreia a rolagem de um trecho e lista o que pesa nas tarefas longas da thread principal.
// node rastro.mjs <url> <ate_px> [largura] [altura]
import puppeteer from 'puppeteer-core'
import { readFileSync } from 'node:fs'

const [url, ate = '6000', largura = '1440', altura = '900'] = process.argv.slice(2)
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: +largura, height: +altura, deviceScaleFactor: 1 })
await page.evaluateOnNewDocument(() => sessionStorage.setItem('volts-abertura', '1'))
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, 3000))
await page.mouse.move(+largura / 2, +altura / 2)
await page.tracing.start({ path: 'shots/rastro.json', categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'v8.execute'] })
while ((await page.evaluate(() => scrollY)) < +ate) {
  await page.mouse.wheel({ deltaY: 120 })
  await new Promise((r) => setTimeout(r, 45))
}
await new Promise((r) => setTimeout(r, 800))
await page.tracing.stop()
await browser.close()

const { traceEvents } = JSON.parse(readFileSync('shots/rastro.json', 'utf8'))
const principal = traceEvents.find((e) => e.name === 'thread_name' && e.args?.name === 'CrRendererMain')
const tid = principal?.tid
const tarefas = traceEvents.filter((e) => e.tid === tid && e.ph === 'X' && e.name === 'RunTask' && e.dur > 30000)
console.log(`tarefas longas (>30ms): ${tarefas.length}`)
const somas = {}
for (const t of tarefas) {
  const filhos = traceEvents.filter((e) => e.tid === tid && e.ph === 'X' && e.ts >= t.ts && e.ts + (e.dur || 0) <= t.ts + t.dur && e.name !== 'RunTask')
  for (const f of filhos) {
    const chave = f.name + (f.args?.data?.functionName ? `:${f.args.data.functionName}` : '') + (f.args?.data?.url ? ` ${f.args.data.url.split('/').pop()}` : '')
    somas[chave] = (somas[chave] || 0) + f.dur / 1000
  }
}
Object.entries(somas)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25)
  .forEach(([k, v]) => console.log(v.toFixed(1).padStart(8), 'ms ', k))
console.log('piores:', tarefas.map((t) => (t.dur / 1000).toFixed(0)).sort((a, b) => b - a).slice(0, 10).join(', '))
