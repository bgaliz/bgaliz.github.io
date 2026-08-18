/**
 * RASTRO DE VISITAS
 * ══════════════════════════════════════════════════════════════════════════
 * Registra QUE houve visita e o movimento no tempo. Não identifica pessoas.
 *
 * Princípios que valem mais que qualquer métrica:
 *   · falha SEMPRE em silêncio — se a API cair, o portfólio nem percebe;
 *   · sem cookies; a sessão vive em sessionStorage e morre com a aba;
 *   · o IP nunca é gravado (o servidor só o usa para compor um hash diário);
 *   · respeita doNotTrack e a recusa explícita no aviso.
 *
 * O `?ref=` marca de onde veio o acesso: ao enviar o portfólio para um contato
 * ou proposta, usa-se bgaliz.github.io/?ref=nome e o painel mostra se abriram.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { urlDe } from './config.js';

/* Um só lugar define o endereço da API: assets/js/config.js. Enquanto estiver
   nulo, o rastreamento fica inteiro desligado — o site funciona 100% assim. */
const API = urlDe('coletar');

const CHAVE_RECUSA = 'semRastro';
const CHAVE_AVISO = 'avisoVisto';

let sessao = null;
let inicio = 0;
let habilitado = false;
const secoesVistas = new Set();

/* ── Consentimento ─────────────────────────────────────────────────────── */

function recusou() {
  try { return localStorage.getItem(CHAVE_RECUSA) === '1'; } catch (e) { return true; }
}

function podeRastrear() {
  if (!API) return false;
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return false;
  return !recusou();
}

function idSessao() {
  try {
    let s = sessionStorage.getItem('sessao');
    if (!s) {
      s = (crypto.randomUUID?.() || String(Math.random()).slice(2)) + '';
      sessionStorage.setItem('sessao', s);
    }
    return s;
  } catch (e) {
    return 'efemera';
  }
}

/* ── Envio ─────────────────────────────────────────────────────────────── */

function enviar(evento, detalhe = null, duracao = null, comBeacon = false) {
  if (!habilitado) return;

  const params = new URLSearchParams(location.search);
  const corpo = JSON.stringify({
    evento,
    detalhe,
    duracao_ms: duracao,
    sessao,
    ref: params.get('ref') || null,
    referrer: document.referrer || null,
    idioma: document.documentElement.lang || null,
    tela: `${innerWidth}x${innerHeight}`,
  });

  try {
    if (comBeacon && navigator.sendBeacon) {
      // type/plain evita o preflight CORS, que não completaria no unload.
      navigator.sendBeacon(API, new Blob([corpo], { type: 'text/plain;charset=UTF-8' }));
    } else {
      fetch(API, {
        method: 'POST',
        body: corpo,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        keepalive: true,
        mode: 'cors',
      }).catch(() => {});
    }
  } catch (e) { /* silêncio, sempre */ }
}

/* ── Aviso LGPD ────────────────────────────────────────────────────────── */

function montarAviso() {
  const aviso = document.getElementById('aviso-lgpd');
  if (!aviso) return;

  // Só avisa sobre o que de fato acontece. Sem API configurada nada é
  // registrado, e um aviso de rastreamento inexistente seria ruído — além
  // de mentira. Idem quando o navegador já pediu para não ser rastreado.
  if (!API) return;
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;

  let visto = false;
  try { visto = localStorage.getItem(CHAVE_AVISO) === '1'; } catch (e) { visto = true; }
  if (visto || recusou()) return;

  aviso.hidden = false;

  aviso.addEventListener('click', (e) => {
    const acao = e.target.dataset?.lgpd;
    if (!acao) return;

    try {
      localStorage.setItem(CHAVE_AVISO, '1');
      if (acao === 'recusar') localStorage.setItem(CHAVE_RECUSA, '1');
    } catch (err) {}

    if (acao === 'recusar') habilitado = false;
    aviso.hidden = true;
  });
}

/* ── Início ────────────────────────────────────────────────────────────── */

export function iniciarRastro() {
  montarAviso();

  habilitado = podeRastrear();
  if (!habilitado) return;

  sessao = idSessao();
  inicio = performance.now();

  enviar('pageview');

  // Seções lidas — uma vez cada, para não inflar o volume.
  const obs = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      const id = e.target.dataset.secaoObs;
      if (!id || secoesVistas.has(id)) continue;
      secoesVistas.add(id);
      enviar('secao', id);
    }
  },
  /* Faixa central da tela, não fração do alvo. `threshold` mede uma fração do
     PRÓPRIO alvo: com a casca de duas colunas as seções ficam ~2× mais altas,
     e 42% de uma trajetória de sete verbetes passa da viewport de um notebook
     — o evento simplesmente nunca dispararia, e o painel perderia a barra sem
     ninguém notar. "Leu a seção" passa a significar "a seção cruzou o meio da
     tela", que é o mesmo critério que o índice já usa em principal.js. */
  { threshold: 0, rootMargin: '-35% 0px -35% 0px' });

  document.querySelectorAll('[data-secao-obs]').forEach((s) => obs.observe(s));

  // Cliques em contato, currículo e links externos.
  document.addEventListener('click', (e) => {
    const alvo = e.target.closest('[data-cta]');
    if (alvo) enviar('clique', alvo.dataset.cta);
  }, { passive: true });

  // Duração real da visita. pagehide é mais confiável que unload no mobile.
  addEventListener('pagehide', () => {
    enviar('saida', null, Math.round(performance.now() - inicio), true);
  }, { capture: true });
}
