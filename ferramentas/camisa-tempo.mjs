// Mede as etapas de criação da camisa 3D (rastro das tarefas longas enquanto ela nasce).
import puppeteer from 'puppeteer-core'
import { readFileSync } from 'node:fs'
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.evaluateOnNewDocument(() => sessionStorage.setItem('volts-abertura', '1'))
await page.goto(process.argv[2] ?? 'http://127.0.0.1:5230/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 2500))
await page.tracing.start({ path: 'shots/camisa.json', categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'v8.execute', 'disabled-by-default-v8.cpu_profiler'] })
await page.evaluate(() => document.querySelector('#comunidade').scrollIntoView())
await page.waitForSelector('.cs-canvas--pronto', { timeout: 30000 })
await new Promise((r) => setTimeout(r, 500))
await page.tracing.stop()
await browser.close()
const { traceEvents } = JSON.parse(readFileSync('shots/camisa.json', 'utf8'))
const tid = traceEvents.find((e) => e.name === 'thread_name' && e.args?.name === 'CrRendererMain')?.tid
const longas = traceEvents.filter((e) => e.tid === tid && e.ph === 'X' && e.name === 'RunTask' && e.dur > 40000)
for (const t of longas) {
  const fn = traceEvents.filter((e) => e.tid === tid && e.ph === 'X' && e.ts >= t.ts && e.ts + (e.dur || 0) <= t.ts + t.dur && e.name === 'FunctionCall').sort((a, b) => b.dur - a.dur)[0]
  const gl = traceEvents.filter((e) => e.tid === tid && e.ph === 'X' && e.ts >= t.ts && e.ts + (e.dur || 0) <= t.ts + t.dur && /Compile|Shader|Program|GPU|WebGL/i.test(e.name)).reduce((a, e) => a + e.dur, 0)
  console.log(`${(t.dur / 1000).toFixed(0)} ms`, fn ? `${fn.args?.data?.functionName || '?'} ${(fn.args?.data?.url || '').split('/').pop()}:${fn.args?.data?.lineNumber}` : '', gl ? `(gl ${(gl / 1000).toFixed(0)} ms)` : '')
}
