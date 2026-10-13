/*
 * Modo revisão: abra o site com ?revisao no endereço para ver, destacado em amarelo,
 * cada conteúdo que ainda depende de confirmação da Volts. Visitantes comuns não veem nada.
 */
export function iniciarRevisao() {
  if (!new URLSearchParams(location.search).has('revisao')) return
  document.documentElement.classList.add('revisao')
  const itens = Array.from(document.querySelectorAll<HTMLElement>('[data-provisorio]')).map((el) => ({
    ponto: el.dataset.provisorio,
    texto: el.textContent?.trim().slice(0, 80),
  }))
  console.info('Volts: conteúdos a confirmar', itens)
}
