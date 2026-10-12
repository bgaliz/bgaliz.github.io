/**
 * COPIAR E IMPRIMIR
 *   [data-copiar="texto"]        copia o próprio valor (ex.: o e-mail)
 *   [data-copiar-de="/cv.txt"]   busca o arquivo e copia (o currículo em texto)
 *   [data-imprimir]              abre a impressão
 * O botão confirma trocando o rótulo por 1,8 s. O evento vai para o painel
 * como "copiar" (o servidor só aceita identificadores curtos).
 */

import { registrar } from './rastro.js';

export function iniciarCopiar() {
  document.addEventListener('click', async (e) => {
    const alvo = e.target.closest('[data-copiar], [data-copiar-de], [data-imprimir]');
    if (!alvo) return;

    if (alvo.hasAttribute('data-imprimir')) { print(); return; }

    try {
      const texto = alvo.dataset.copiar
        ?? await fetch(alvo.dataset.copiarDe).then((r) => (r.ok ? r.text() : Promise.reject()));
      await navigator.clipboard.writeText(texto);
      confirmar(alvo);
      if (alvo.dataset.copiarRastro) registrar('copiar', alvo.dataset.copiarRastro);
    } catch (err) { /* sem área de transferência: o texto continua visível na página */ }
  });
}

function confirmar(botao) {
  const span = botao.querySelector('span') || botao;
  const antes = span.textContent;
  span.textContent = botao.dataset.rotuloOk || 'OK';
  botao.setAttribute('data-ok', '');
  setTimeout(() => { span.textContent = antes; botao.removeAttribute('data-ok'); }, 1800);
}
