/**
 * MONTE O RELATÓRIO DE MIM
 * ══════════════════════════════════════════════════════════════════════════
 * O caso de trabalho mais forte do Bruno, aplicado a ele mesmo: escolher as
 * colunas e o filtro, e o PDF sair exatamente igual à tela.
 *
 * Sem JS a tabela completa já está no HTML (e o robô lê tudo). Com JS os
 * controles aparecem; colunas somem por atributo (data-sem) e linhas por
 * data-fora, com View Transition quando o navegador suporta. O PDF é a
 * impressão do navegador com uma folha de estilo que mostra só a tabela.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { registrar } from './rastro.js';

export function iniciarRelatorio() {
  const raiz = document.querySelector('[data-relatorio]');
  const form = raiz?.querySelector('[data-relatorio-controles]');
  const tabela = raiz?.querySelector('.tabela');
  if (!raiz || !form || !tabela) return;

  form.hidden = false;
  const linhas = [...tabela.tBodies[0].rows];

  function estado() {
    const dados = new FormData(form);
    const colunas = dados.getAll('col');
    return { colunas, tec: dados.get('tec') || '', dominio: dados.get('dominio') || '' };
  }

  function aplicar() {
    const { colunas, tec, dominio } = estado();
    const todas = [...tabela.tHead.rows[0].cells].map((c) => c.dataset.col);
    tabela.dataset.sem = todas.filter((c) => !colunas.includes(c)).join(' ');
    for (const tr of linhas) {
      const passa = (!tec || tr.dataset.stack.split(' ').includes(tec))
        && (!dominio || tr.dataset.dominio === dominio);
      tr.toggleAttribute('data-fora', !passa);
    }
  }

  form.addEventListener('change', () => {
    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduzido) document.startViewTransition(aplicar);
    else aplicar();
  });

  const resumo = () => {
    const { colunas, tec, dominio } = estado();
    return [colunas.join('.'), tec && `tec:${tec}`, dominio && `area:${dominio}`].filter(Boolean).join(',').slice(0, 80);
  };

  raiz.querySelector('[data-relatorio-pdf]')?.addEventListener('click', () => {
    registrar('relatorio', resumo());
    document.body.classList.add('imprimindo-relatorio');
    const limpar = () => document.body.classList.remove('imprimindo-relatorio');
    addEventListener('afterprint', limpar, { once: true });
    print();
    setTimeout(limpar, 1000);
  });

  const copiar = raiz.querySelector('[data-relatorio-copiar]');
  copiar?.addEventListener('click', async () => {
    const visivel = (el) => getComputedStyle(el).display !== 'none';
    const cab = [...tabela.tHead.rows[0].cells].filter(visivel).map((c) => c.textContent.trim());
    const corpo = linhas.filter(visivel).map((tr) => [...tr.cells].filter(visivel).map((c) => c.textContent.trim()));
    const texto = [cab, ...corpo].map((l) => l.join('\t')).join('\n');
    try {
      await navigator.clipboard.writeText(texto);
      sinalizar(copiar);
      registrar('copiar', 'relatorio');
    } catch (e) { /* sem permissão de área de transferência: nada a fazer */ }
  });

  aplicar();
}

function sinalizar(botao) {
  const span = botao.querySelector('span');
  const antes = span.textContent;
  span.textContent = botao.dataset.rotuloOk;
  botao.setAttribute('data-ok', '');
  setTimeout(() => { span.textContent = antes; botao.removeAttribute('data-ok'); }, 1800);
}
