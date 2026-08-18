/**
 * PONTO DE ENTRADA
 * ══════════════════════════════════════════════════════════════════════════
 * Duas regras governam este arquivo:
 *
 * 1. ORDEM — primeiro o que corrige conteúdo (datas, idioma, tema), depois o
 *    que enfeita. Se um enfeite quebrar, o conteúdo já está correto; por isso
 *    cada módulo decorativo entra em try/catch próprio e falha em silêncio.
 *
 * 2. PESO — só o essencial é importado estaticamente. Abertura, rastro e
 *    refletor entram por import dinâmico, fora do caminho crítico, porque
 *    nenhum precisa existir antes da primeira pintura. É o que mantém o JS
 *    crítico abaixo do orçamento e o LCP curto.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { aplicarSlots } from './dinamico.js';
import { iniciarIdioma, idiomaAtual } from './idioma.js';
import { iniciarTema } from './tema.js';

const seguro = (nome, fn) => {
  try { return fn(); } catch (e) {
    if (location.hostname === 'localhost') console.warn(`[${nome}]`, e);
  }
};

const carregar = (nome, caminho, usar) =>
  import(caminho).then(usar).catch((e) => {
    if (location.hostname === 'localhost') console.warn(`[${nome}]`, e);
  });

/* ── 1 · Conteúdo correto antes de qualquer enfeite ─────────────────────── */

seguro('idioma', iniciarIdioma);
seguro('slots', () => aplicarSlots(idiomaAtual()));
seguro('tema', iniciarTema);

/* ── 2 · Seção corrente no índice ───────────────────────────────────────── */

/* Marca no índice a seção que está sendo lida. A faixa central da tela é o
   critério — a seção "corrente" deve ser a que o olho percorre, não a que
   acabou de encostar na borda.

   O seletor não menciona classe nenhuma de propósito: renomear o índice não
   pode desligar o indicador em silêncio. O contrato é o atributo. */
const elos = new Map(
  [...document.querySelectorAll('a[data-secao]')].map((a) => [a.dataset.secao, a])
);

const observadorSecao = new IntersectionObserver((entradas) => {
  for (const e of entradas) {
    if (!e.isIntersecting) continue;
    const id = e.target.dataset.secaoObs;
    for (const [chave, elo] of elos) {
      if (chave === id) elo.setAttribute('aria-current', 'true');
      else elo.removeAttribute('aria-current');
    }
  }
}, { rootMargin: '-45% 0px -45% 0px' });

document.querySelectorAll('[data-secao-obs]').forEach((s) => observadorSecao.observe(s));

/* ── 3 · Enfeites e comportamentos, sob demanda ─────────────────────────── */

carregar('abertura', './abertura.js', (m) => m.iniciarAbertura());
carregar('rastro', './rastro.js', (m) => m.iniciarRastro());
carregar('refletor', './refletor.js', (m) => m.iniciarRefletor());

/* A seção 004 não carrega JS nenhum. A lista vem pronta do build, e o realce
   ao passar o ponteiro é CSS puro — foi o que sobrou quando a matriz de 35×6
   virou lista: sem montagem, sem realce cruzado, sem observador de proximidade. */

/* ── 4 · Botões magnéticos ──────────────────────────────────────────────── */
/* Puxão sutil e inercial nos CTAs. Só com ponteiro preciso — no toque não
   existe hover, e o deslocamento atrapalharia o alvo. */

if (matchMedia('(pointer: fine)').matches &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  for (const botao of document.querySelectorAll('.botao')) {
    botao.addEventListener('pointermove', (e) => {
      const r = botao.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      botao.style.setProperty('--puxao-x', `${dx * 7}px`);
      botao.style.setProperty('--puxao-y', `${dy * 5}px`);
    });
    botao.addEventListener('pointerleave', () => {
      botao.style.setProperty('--puxao-x', '0px');
      botao.style.setProperty('--puxao-y', '0px');
    });
  }
}
