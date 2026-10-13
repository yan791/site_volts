import Visualizador3D from './Visualizador3D'
import { varianteId, type IdVariante } from './modelos'

/*
 * Só no desenvolvimento: ?render=camiseta-verde&angulo=-0.35
 * Mostra a camisa sozinha num quadro transparente para gerar as imagens estáticas
 * da seção (ferramentas/render-camisa.mjs).
 */
export default function RenderCamisa({ id, angulo }: { id: IdVariante; angulo: number }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'transparent' }}>
      <Visualizador3D variante={varianteId(id)} anguloFixo={angulo} />
    </div>
  )
}
