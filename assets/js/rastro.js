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

import { urlDe, VERSAO } from './config.js';

/* Um só lugar define o endereço da API: assets/js/config.js. Enquanto estiver
   nulo, o rastreamento fica inteiro desligado — o site funciona 100% assim. */
const API = urlDe('coletar');

const CHAVE_RECUSA = 'semRastro';
const CHAVE_AVISO = 'avisoVisto';

let sessao = null;
let inicio = 0;
let habilitado = false;
const secoesVistas = new Set();

/* Sinais de que há uma pessoa do outro lado. Scanner de ATS abre a página,
   executa este arquivo e sai sem tocar em nada; gente mexe o ponteiro, toca,
   rola com a roda ou usa o teclado. */
let interagiu = false;
let ultimaInteracao = -Infinity;
let ativoMs = 0;
const JANELA_ATIVA = 30_000;
const marcasVistas = new Set();

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

function enviar(evento, detalhe = null, extra = {}, comBeacon = false) {
  if (!habilitado) return;

  const params = new URLSearchParams(location.search);
  const corpo = JSON.stringify({
    evento,
    detalhe,
    sessao,
    ref: params.get('ref') || null,
    referrer: document.referrer || null,
    idioma: document.documentElement.lang || null,
    pagina: location.pathname,
    versao: VERSAO,
    tela: `${innerWidth}x${innerHeight}`,
    ...extra,
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

/** Para outros módulos registrarem o que a pessoa fez (abrir um caso,
 *  copiar o e-mail, gerar o relatório). O servidor valida o formato. */
export function registrar(evento, detalhe = null) {
  enviar(evento, detalhe);
}

/* ── Presença: interação real e tempo ativo ────────────────────────────── */

function vigiarPresenca() {
  const marcar = () => {
    ultimaInteracao = performance.now();
    if (interagiu) return;
    interagiu = true;
    enviar('interacao');
  };
  for (const tipo of ['pointerdown', 'pointermove', 'wheel', 'touchstart', 'keydown']) {
    addEventListener(tipo, marcar, { passive: true, capture: true });
  }
  // Rolar mantém a leitura ativa, mas sozinho não prova que há gente.
  addEventListener('scroll', () => { ultimaInteracao = performance.now(); }, { passive: true });

  /* Tempo ATIVO, não de relógio: soma só o segundo em que a aba está visível
     e houve interação nos últimos 30 s. Aba esquecida aberta não conta. */
  setInterval(() => {
    if (document.visibilityState === 'visible'
        && performance.now() - ultimaInteracao < JANELA_ATIVA) ativoMs += 1000;
  }, 1000);
}

/* ── Profundidade: 25, 50, 75 e 100% da página ─────────────────────────── */

function vigiarProfundidade() {
  let pendente = false;
  const medir = () => {
    pendente = false;
    if (!interagiu) return;           // robô não rola; e se rolar sozinho, não conta
    const altura = document.documentElement.scrollHeight;
    const alcance = ((scrollY + innerHeight) / altura) * 100;
    for (const marca of [25, 50, 75, 100]) {
      if (alcance >= marca - 1 && !marcasVistas.has(marca)) {
        marcasVistas.add(marca);
        enviar('profundidade', String(marca));
      }
    }
  };
  addEventListener('scroll', () => {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(medir);
  }, { passive: true });
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

  /* Só depois da primeira rolagem (ou de 8 s parado). Aparecer junto com a
     página fazia o aviso ser a primeira coisa vista no celular, por cima do
     nome. A visita continua informada: o aviso vem antes de qualquer leitura
     longa, e a política completa está no rodapé desde o primeiro quadro. */
  let mostrado = false;
  const mostrar = () => {
    if (mostrado) return;
    mostrado = true;
    removeEventListener('scroll', mostrar);
    clearTimeout(relogio);
    aviso.hidden = false;
  };
  addEventListener('scroll', mostrar, { once: true, passive: true });
  const relogio = setTimeout(mostrar, 8000);

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

/* ── Auto-exclusão ─────────────────────────────────────────────────────
   `?eu=1` marca este navegador como do próprio dono: nada mais é contado
   aqui. Em 12/out/2026, 14 das 48 visitas "humanas" eram de Campo Grande,
   desktop, acesso direto — o dono conferindo o próprio site. `?eu=0` desfaz.
   O parâmetro some da barra de endereço logo em seguida. */

function aplicarAutoExclusao() {
  const params = new URLSearchParams(location.search);
  if (!params.has('eu')) return;

  const desfazer = params.get('eu') === '0';
  try {
    if (desfazer) localStorage.removeItem(CHAVE_RECUSA);
    else {
      localStorage.setItem(CHAVE_RECUSA, '1');
      localStorage.setItem(CHAVE_AVISO, '1');
    }
  } catch (e) { return; }

  params.delete('eu');
  const resto = params.toString();
  history.replaceState(null, '', location.pathname + (resto ? `?${resto}` : '') + location.hash);

  const nota = document.createElement('p');
  nota.className = 'aviso-lgpd';
  nota.setAttribute('role', 'status');
  nota.textContent = desfazer
    ? 'Visitas deste navegador voltam a ser contadas.'
    : 'Pronto: visitas deste navegador não serão mais contadas.';
  document.body.append(nota);
  setTimeout(() => nota.remove(), 4000);
}

export function iniciarRastro() {
  aplicarAutoExclusao();
  montarAviso();

  habilitado = podeRastrear();
  if (!habilitado) return;

  sessao = idSessao();
  inicio = performance.now();

  enviar('pageview');
  vigiarPresenca();
  vigiarProfundidade();

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

  // Aprofundamento aberto (<details data-rastro="id">). `toggle` não sobe
  // na árvore, por isso a captura.
  document.addEventListener('toggle', (e) => {
    const d = e.target;
    if (d.open && d.dataset?.rastro) enviar('abrir', d.dataset.rastro);
  }, true);

  // Duração da visita (relógio) e tempo ativo. pagehide é mais confiável que
  // unload no mobile.
  addEventListener('pagehide', () => {
    enviar('saida', null, {
      duracao_ms: Math.round(performance.now() - inicio),
      ativo_ms: ativoMs,
    }, true);
  }, { capture: true });
}
