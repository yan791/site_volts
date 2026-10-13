import { gerarMalha } from 'file:///C:/Users/yanya/OneDrive/Documentos/Claude_Sites/volts/site/src/camisa/geometria.ts'
for (const tipo of ['camiseta', 'regata'] as const) {
  const t0 = performance.now()
  const m = gerarMalha(tipo)
  const t1 = performance.now()
  let z = [0,0,0,0]; for (const v of m.zonas) z[v]++
  let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9; for (let i=0;i<m.posicoes.length;i+=3){minx=Math.min(minx,m.posicoes[i]);maxx=Math.max(maxx,m.posicoes[i]);miny=Math.min(miny,m.posicoes[i+1]);maxy=Math.max(maxy,m.posicoes[i+1])}
  console.log(tipo, (t1-t0).toFixed(0)+'ms', 'verts', m.posicoes.length/3, 'tris', m.indices.length/3, 'zonas', z, 'x', minx.toFixed(3), maxx.toFixed(3), 'y', miny.toFixed(3), maxy.toFixed(3))
}
