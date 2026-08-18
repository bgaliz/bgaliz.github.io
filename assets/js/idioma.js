/**
 * TROCA DE IDIOMA
 * ══════════════════════════════════════════════════════════════════════════
 * O HTML é escrito em português estaticamente — crawler e leitor sem JS veem
 * o conteúdo completo. O inglês vive em `data-en`, e a troca é uma inversão:
 * ao ir para EN guardamos o PT em `data-pt`, e vice-versa. Assim a operação
 * é reversível sem nunca perder o texto original.
 *
 * Os valores temporais são reformatados pelo idioma novo — "1 ano e 1 mês"
 * vira "1 year 1 month", com a pluralização certa de cada língua.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { aplicarSlots } from './dinamico.js';

const raiz = document.documentElement;

export function idiomaAtual() {
  return raiz.dataset.idioma || 'pt';
}

function trocarTextos(para) {
  for (const el of document.querySelectorAll('[data-en]')) {
    // Na primeira ida para EN, memoriza o português que está no HTML.
    if (!el.dataset.pt) el.dataset.pt = el.textContent;
    const novo = para === 'en' ? el.dataset.en : el.dataset.pt;
    if (novo != null) el.textContent = novo;
  }

  // Rótulos de acessibilidade dos botões trocam junto.
  for (const el of document.querySelectorAll('[data-en-label]')) {
    if (!el.dataset.ptLabel) el.dataset.ptLabel = el.getAttribute('aria-label') || '';
    const novo = para === 'en' ? el.dataset.enLabel : el.dataset.ptLabel;
    if (novo) el.setAttribute('aria-label', novo);
  }
}

function aplicar(para) {
  raiz.dataset.idioma = para;
  raiz.lang = para === 'en' ? 'en' : 'pt-BR';
  trocarTextos(para);
  aplicarSlots(para);          // reformata durações, períodos, datas
  document.title = para === 'en'
    ? 'Bruno Galiz — Full-Stack Developer'
    : 'Bruno Galiz — Desenvolvedor Full-Stack';

  // Hoje ninguém escuta: a lista de ferramentas só tem nome próprio (Vue.js,
  // Conexa) e lê igual nas duas línguas, e o resto é data-en. O evento fica
  // porque é o gancho certo para qualquer bloco futuro que precise ser
  // REMONTADO, e não só ter o texto trocado.
  document.dispatchEvent(new CustomEvent('idioma:mudou', { detail: { idioma: para } }));
}

export function definirIdioma(para, comTransicao = true) {
  try { localStorage.setItem('idioma', para); } catch (e) {}

  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!comTransicao || reduzido || !document.startViewTransition) {
    aplicar(para);
    return;
  }

  raiz.classList.add('trocando-idioma');
  const vt = document.startViewTransition(() => aplicar(para));
  vt.finished.finally(() => raiz.classList.remove('trocando-idioma'));
}

export function iniciarIdioma() {
  // O script inline no <head> já decidiu o idioma inicial sem repintar.
  const inicial = raiz.dataset.idiomaPendente === 'en' ? 'en' : 'pt';
  delete raiz.dataset.idiomaPendente;
  if (inicial === 'en') aplicar('en');
  else raiz.dataset.idioma = 'pt';

  document.getElementById('alternar-idioma')?.addEventListener('click', () => {
    definirIdioma(idiomaAtual() === 'pt' ? 'en' : 'pt');
  });
}
