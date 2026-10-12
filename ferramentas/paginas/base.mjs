/**
 * PEÇAS COMUNS DAS PÁGINAS
 * ══════════════════════════════════════════════════════════════════════════
 * Template literals puros: o site continua sem dependência e sem framework.
 * Tudo que vem de texto passa por `esc`; nada de HTML cru vindo de conteúdo.
 *
 * Caminhos absolutos (/assets/...) porque as páginas vivem em profundidades
 * diferentes (/, /projetos/, /en/resume/). O site é a raiz do domínio
 * bgaliz.github.io, então a raiz é sempre a mesma.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { PERFIL } from '../../assets/dados/perfil.js';
import { PESSOA, ROTULOS, COLOFAO } from '../../conteudo/curriculo.mjs';

export const SITE = 'https://bgaliz.github.io';

export const ROTAS = {
  pt: { inicio: '/', projetos: '/projetos/', curriculo: '/curriculo/', privacidade: '/privacidade.html' },
  en: { inicio: '/en/', projetos: '/en/projects/', curriculo: '/en/resume/', privacidade: '/privacidade.html' },
};

export const LOCALE = { pt: 'pt-BR', en: 'en' };
export const OG_LOCALE = { pt: 'pt_BR', en: 'en_US' };

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Escolhe o idioma de um par { pt, en }. Texto solto passa direto. */
export const t = (valor, idioma) =>
  (valor && typeof valor === 'object' && ('pt' in valor || 'en' in valor)) ? (valor[idioma] ?? valor.pt) : valor;

export const rotulo = (idioma, chave) => ROTULOS[idioma][chave];
export const outro = (idioma) => (idioma === 'pt' ? 'en' : 'pt');

/** Script de tema antes da primeira pintura: sem ele, quem escolheu o tema
 *  escuro vê um clarão a cada carregamento. Inline e síncrono por isso; o
 *  hash dele entra na CSP pelo próprio build. */
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem('tema');if(t)document.documentElement.dataset.tema=t;}catch(e){}document.documentElement.classList.add('js');})();`;

/**
 * Documento completo.
 * @param {object} o
 * @param {'pt'|'en'} o.idioma
 * @param {string} o.chave       inicio | projetos | curriculo | 404
 * @param {string} o.titulo
 * @param {string} o.descricao
 * @param {string} o.corpo       HTML do <body> sem cabeçalho e rodapé
 * @param {object[]} [o.jsonld]  objetos schema.org
 * @param {string} [o.og]        caminho da imagem social
 * @param {string} [o.classe]    classe do <body>
 * @param {string[]} [o.preload] recursos extras para preload (imagens LCP)
 */
export function documento({ idioma, chave, titulo, descricao, corpo, jsonld = [], og, classe = '', preload = [] }) {
  const rotaAqui = ROTAS[idioma][chave];
  const canonico = rotaAqui ? `${SITE}${rotaAqui}` : null;
  const imagemSocial = `${SITE}${og || (idioma === 'en' ? '/assets/img/og/og-en.jpg' : '/assets/img/og/og-pt.jpg')}`;

  const alternos = rotaAqui && ROTAS.en[chave]
    ? `
<link rel="alternate" hreflang="pt-BR" href="${SITE}${ROTAS.pt[chave]}">
<link rel="alternate" hreflang="en" href="${SITE}${ROTAS.en[chave]}">
<link rel="alternate" hreflang="x-default" href="${SITE}${ROTAS.pt[chave]}">`
    : '';

  const dados = jsonld.length
    ? `\n<script type="application/ld+json">\n${JSON.stringify(jsonld.length === 1 ? jsonld[0] : { '@context': 'https://schema.org', '@graph': jsonld }, null, 2)}\n</script>`
    : '';

  return `<!doctype html>
<html lang="${LOCALE[idioma]}" data-pagina="${esc(chave)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
<meta name="author" content="${esc(PERFIL.nomeCompleto)}">${canonico ? `\n<link rel="canonical" href="${canonico}">` : '\n<meta name="robots" content="noindex">'}${alternos}

<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">${canonico ? `\n<meta property="og:url" content="${canonico}">` : ''}
<meta property="og:image" content="${imagemSocial}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${OG_LOCALE[idioma]}">
<meta property="profile:first_name" content="Bruno">
<meta property="profile:last_name" content="Galiz de Oliveira">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="me" href="${PERFIL.contato.github}">
<link rel="me" href="${PERFIL.contato.linkedin}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#EFF0EC" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121417" media="(prefers-color-scheme: dark)">

<link rel="preload" href="/assets/fonts/mona.woff2" as="font" type="font/woff2" crossorigin>${preload.map((p) => `\n${p}`).join('')}
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="stylesheet" href="/assets/css/impressao.css" media="print">

<script>${SCRIPT_TEMA}</script>${dados}
</head>

<body class="${esc(classe)}">
<a class="pular" href="#conteudo">${esc(rotulo(idioma, 'pular'))}</a>
${cabecalho(idioma, chave)}
${corpo}
${rodape(idioma)}
${avisoLgpd(idioma)}
<script type="module" src="/assets/js/principal.js"></script>
</body>
</html>
`;
}

/* ── Barra de navegação ─────────────────────────────────────────────────── */

function cabecalho(idioma, chave) {
  const r = ROTAS[idioma];
  const contraparte = ROTAS[outro(idioma)][chave] || ROTAS[outro(idioma)].inicio;
  const atual = (k) => (k === chave ? ' aria-current="page"' : '');
  const experiencia = chave === 'inicio' ? '#experiencia' : `${r.inicio}#experiencia`;

  return `<header class="barra" data-barra>
  <a class="barra__marca" href="${r.inicio}" aria-label="Bruno Galiz, ${esc(rotulo(idioma, 'navExperiencia'))}">
    <span class="barra__miniatura" aria-hidden="true"><img src="/assets/img/retrato/bruno-56.webp" width="28" height="28" alt="" decoding="async"></span>
    <span class="barra__nome">Bruno Galiz</span>
  </a>
  <nav class="barra__nav" aria-label="${idioma === 'pt' ? 'Principal' : 'Main'}">
    <a href="${experiencia}">${esc(rotulo(idioma, 'navExperiencia'))}</a>
    <a href="${r.projetos}"${atual('projetos')}>${esc(rotulo(idioma, 'navProjetos'))}</a>
    <a href="${r.curriculo}"${atual('curriculo')}>${esc(rotulo(idioma, 'navCurriculo'))}</a>
  </nav>
  <div class="barra__acoes">
    <a class="barra__idioma" href="${contraparte}" hreflang="${LOCALE[outro(idioma)]}" lang="${LOCALE[outro(idioma)]}" data-idioma="${outro(idioma)}" translate="no">${idioma === 'pt' ? 'EN' : 'PT'}</a>
    <button class="barra__tema" type="button" data-tema-alternar
            aria-label="${esc(rotulo(idioma, 'temaEscuro'))}"
            data-rotulo-claro="${esc(rotulo(idioma, 'temaClaro'))}"
            data-rotulo-escuro="${esc(rotulo(idioma, 'temaEscuro'))}">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor"/></svg>
    </button>
  </div>
</header>`;
}

/* ── Rodapé ─────────────────────────────────────────────────────────────── */

function rodape(idioma) {
  const r = ROTAS[idioma];
  return `<footer class="rodape">
  <p class="rodape__colofao">${esc(t(COLOFAO, idioma))}</p>
  <p class="rodape__meta">
    <span>${esc(PERFIL.nomeCompleto)}</span>
    <span>${esc(rotulo(idioma, 'atualizado'))} <time data-din="site.atualizado" datetime="2026-10-12">12 out 2026</time></span>
    <a href="${r.privacidade}">${esc(rotulo(idioma, 'privacidade'))}</a>
  </p>
</footer>`;
}

/* ── Aviso LGPD (mesmo texto e escolhas de antes; rastro.js o mostra) ───── */

function avisoLgpd(idioma) {
  const pt = idioma === 'pt';
  return `<aside class="aviso-lgpd" id="aviso-lgpd" hidden>
  <p>${pt
    ? 'Registro visitas de forma anônima: sem cookies e sem guardar seu IP. É como eu sei se está havendo ou não visitas ao site.'
    : 'I log visits anonymously: no cookies, and your IP is never stored. It tells me whether what I send is being opened.'}</p>
  <div class="aviso-lgpd__acoes">
    <button type="button" data-lgpd="aceitar">${pt ? 'Entendi' : 'Got it'}</button>
    <button type="button" data-lgpd="recusar">${pt ? 'Não quero' : 'No thanks'}</button>
    <a href="/privacidade.html">${pt ? 'Detalhes' : 'Details'}</a>
  </div>
</aside>`;
}

/* ── Prévia de link (como o WhatsApp monta a partir dos metadados) ──────── */

/**
 * @param {object} p   entrada de dados/previas.json (pode faltar)
 * @param {object} o   { url, titulo, descricao, idioma, rastro }
 */
export function previa(p, { url, titulo, descricao, idioma, rastro = '' }) {
  const tituloFinal = p?.titulo || titulo;
  const descricaoFinal = p?.descricao || descricao;
  const dominio = url ? new URL(url).hostname.replace(/^www\./, '') : null;
  const imagem = p?.imagem
    ? `<span class="previa__imagem"><img src="${esc(p.imagem)}" width="800" height="420" alt="" fetchpriority="low"></span>`
    : '';
  const icone = p?.icone
    ? `<img class="previa__icone" src="${esc(p.icone)}" width="16" height="16" alt="" fetchpriority="low" decoding="async">`
    : `<span class="previa__icone previa__icone--letra" aria-hidden="true">${esc((dominio || tituloFinal || '?').charAt(0).toUpperCase())}</span>`;

  const miolo = `${imagem}
    <span class="previa__texto">
      <span class="previa__dominio">${icone}${esc(dominio || rotulo(idioma, 'codigoSobPedido'))}</span>
      <span class="previa__titulo">${esc(tituloFinal)}</span>
      ${descricaoFinal ? `<span class="previa__descricao">${esc(descricaoFinal)}</span>` : ''}
    </span>`;

  return url
    ? `<a class="previa${imagem ? '' : ' previa--sem-imagem'}" href="${esc(url)}" rel="noopener" data-cta="${esc(rastro)}">${miolo}</a>`
    : `<div class="previa previa--sem-imagem previa--sem-link">${miolo}</div>`;
}
