/// <reference lib="webworker" />
import { gerarMalha, type TipoPeca } from './geometria'

// Gera a malha fora da thread principal: a página continua rolando lisa enquanto a camisa é montada.
self.onmessage = (ev: MessageEvent<{ tipo: TipoPeca; passo: number }>) => {
  const { tipo, passo } = ev.data
  const malha = gerarMalha(tipo, passo, (p) => self.postMessage({ progresso: p, tipo }))
  self.postMessage({ malha, tipo }, [malha.posicoes.buffer, malha.normais.buffer, malha.zonas.buffer, malha.uvs.buffer, malha.indices.buffer])
}
