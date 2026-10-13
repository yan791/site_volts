import type { TipoPeca } from './geometria'

/*
 * Modelos e cores da camisa oficial, como aparecem no panfleto da Volts:
 * camiseta verde-oliva com detalhes amarelos, camiseta amarela com detalhes pretos
 * e regata amarela com detalhes pretos. PENDENTE: confirmar se existem outras
 * combinações de modelo e cor.
 */

export type IdCor = 'verde' | 'amarela'
export type IdVariante = 'camiseta-verde' | 'camiseta-amarela' | 'regata-amarela'

export type Variante = {
  id: IdVariante
  tipo: TipoPeca
  cor: IdCor
  nome: string
  corNome: string
  // cores usadas no 3D (sRGB)
  base: string
  listra: string
  logo: string
  logoRaio: string
  etiqueta: string
  etiquetaTexto: string
}

export const cores: { id: IdCor; nome: string; amostra: string; detalhe: string }[] = [
  { id: 'verde', nome: 'Verde-oliva', amostra: '#3c4a33', detalhe: '#d6f600' },
  { id: 'amarela', nome: 'Amarela', amostra: '#e2f31d', detalhe: '#101310' },
]

export const tipos: { id: TipoPeca; nome: string }[] = [
  { id: 'camiseta', nome: 'Camiseta' },
  { id: 'regata', nome: 'Regata' },
]

export const variantes: Variante[] = [
  {
    id: 'camiseta-verde',
    tipo: 'camiseta',
    cor: 'verde',
    nome: 'Camiseta',
    corNome: 'Verde-oliva com detalhes amarelos',
    base: '#3a4731',
    listra: '#d6f600',
    logo: '#f1f3ec',
    logoRaio: '#e9f000',
    etiqueta: '#111411',
    etiquetaTexto: '#f1f3ec',
  },
  {
    id: 'camiseta-amarela',
    tipo: 'camiseta',
    cor: 'amarela',
    nome: 'Camiseta',
    corNome: 'Amarela com detalhes pretos',
    base: '#dcef1c',
    listra: '#121512',
    logo: '#121512',
    logoRaio: '#121512',
    etiqueta: '#121512',
    etiquetaTexto: '#dcef1c',
  },
  {
    id: 'regata-amarela',
    tipo: 'regata',
    cor: 'amarela',
    nome: 'Regata',
    corNome: 'Amarela com detalhes pretos',
    base: '#dcef1c',
    listra: '#121512',
    logo: '#121512',
    logoRaio: '#121512',
    etiqueta: '#121512',
    etiquetaTexto: '#dcef1c',
  },
]

export const variantePor = (tipo: TipoPeca, cor: IdCor) => variantes.find((v) => v.tipo === tipo && v.cor === cor)
export const varianteId = (id: IdVariante) => variantes.find((v) => v.id === id)!
export const coresDoTipo = (tipo: TipoPeca) => variantes.filter((v) => v.tipo === tipo).map((v) => v.cor)
