/**
 * CONSTRUÇÃO DO SITE: UMA FONTE, TODAS AS SAÍDAS
 * ══════════════════════════════════════════════════════════════════════════
 * Rode com: node ferramentas/construir.mjs   (ou: npm run construir)
 *
 *   assets/dados/perfil.js     estrutura e datas
 *   conteudo/curriculo.mjs     todo o texto, PT e EN
 *   dados/previas.json         prévias de link (ferramentas/coletar-previas.mjs)
 *            ↓
 *   páginas PT e EN · JSON-LD · JSON Resume · cv.txt · llms.txt · sitemap
 *
 * O problema original deste projeto eram três currículos que se
 * contradiziam. Daqui sai tudo de uma vez, então não há como divergirem.
 *
 * Os valores temporais (duração de cada cargo, data de atualização) entram
 * nos slots `data-din` já no HTML: o crawler, o card do LinkedIn e quem está
 * sem JS leem o arquivo cru. `dinamico.js` recalcula no navegador entre um
 * build e outro (a Action roda todo mês).
 *
 * Sem dependência: template literals e regex sobre marcação nossa.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { calcularSlots } from '../assets/js/dinamico.js';
import { paginaInicio } from './paginas/home.mjs';
import { paginaProjetos, FRAMES_PROJETOS } from './paginas/projetos.mjs';
import { paginaCurriculo } from './paginas/curriculo.mjs';
import { paginaNaoEncontrada } from './paginas/nao-encontrada.mjs';
import { paginaPrivacidade } from './paginas/privacidade.mjs';
import { jsonResume, textoPuro, llmsTxt } from './saidas/curriculo-dados.mjs';
import { SITE, ROTAS } from './paginas/base.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const AGORA = process.env.DATA_REFERENCIA ? new Date(process.env.DATA_REFERENCIA) : new Date();
const API_ORIGEM = 'https://bgaliz-portfolio.vercel.app';

let avisos = 0;

/* ── Prévias de link ────────────────────────────────────────────────────── */

function lerPrevias() {
  const arq = join(RAIZ, 'dados/previas.json');
  if (!existsSync(arq)) {
    console.log('  · dados/previas.json ausente: prévias saem só com texto');
    return {};
  }
  return JSON.parse(readFileSync(arq, 'utf8')).itens ?? {};
}

/* ── Slots temporais ────────────────────────────────────────────────────── */

const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function injetar(html, idioma, arquivo) {
  const slots = calcularSlots(idioma, AGORA);
  let saida = html;
  const semTroca = [];

  for (const [chave, valor] of Object.entries(slots)) {
    const k = escRe(chave);
    let achou = false;
    saida = saida.replace(
      new RegExp(`(<meta\\b[^>]*\\bdata-din="${k}"[^>]*\\bcontent=")([^"]*)(")`, 'g'),
      (m, a, antigo, c) => { achou = true; return a + valor.replace(/"/g, '&quot;') + c; },
    );
    saida = saida.replace(
      new RegExp(`(<(\\w+)\\b[^>]*\\bdata-din="${k}"[^>]*>)([^<]*)(</\\2>)`, 'g'),
      (m, abre, tag, antigo, fecha) => { achou = true; return abre + valor + fecha; },
    );
    if (!achou && saida.includes(`data-din="${chave}"`)) semTroca.push(chave);
  }

  saida = saida.replace(
    /(<time\b[^>]*\bdata-din="site\.atualizado"[^>]*\bdatetime=")([^"]*)(")/g,
    (m, a, antigo, c) => a + slots['site.atualizadoISO'] + c,
  );

  // Slot no HTML sem valor no catálogo: o elemento ficaria vazio para sempre.
  const orfaos = [...saida.matchAll(/data-din="([^"]+)"/g)].map((m) => m[1]).filter((c) => !(c in slots));
  for (const c of new Set([...semTroca, ...orfaos])) {
    console.error(`  ⚠ ${arquivo}: slot "${c}" não foi injetado`);
    avisos++;
  }
  return saida;
}

/* ── Política de segurança de conteúdo (em <meta>) ──────────────────────── */
/* O GitHub Pages não deixa definir cabeçalho. Script inline só roda se o
   hash dele estiver na política, e quem calcula é este build: editar o script
   de tema e esquecer a CSP quebraria o tema em silêncio. JSON-LD é dado, não
   código, e fica de fora. `frame-ancestors` não vale em <meta>. */

function aplicarCsp(html, { frames = [] } = {}) {
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => `'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`);

  const politica = [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' ${API_ORIGEM}`,
    `frame-src ${frames.length ? frames.join(' ') : "'none'"}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  return html.replace(
    /(<meta charset="utf-8">)/i,
    `$1\n<meta http-equiv="Content-Security-Policy" content="${politica}">\n<meta name="referrer" content="strict-origin-when-cross-origin">`,
  );
}

/* ── Escrita ────────────────────────────────────────────────────────────── */

let escritos = 0;
let mudaram = 0;

function gravar(caminho, conteudo) {
  const destino = join(RAIZ, caminho);
  mkdirSync(dirname(destino), { recursive: true });
  const antes = existsSync(destino) ? readFileSync(destino, 'utf8') : null;
  escritos++;
  if (antes === conteudo) return;
  writeFileSync(destino, conteudo);
  mudaram++;
  console.log(`  ✎ ${caminho}`);
}

function pagina(caminho, html, idioma, opcoes) {
  gravar(caminho, aplicarCsp(injetar(html, idioma, caminho), opcoes));
}

/* ── Sitemap com versões de idioma ──────────────────────────────────────── */

function sitemap() {
  const hoje = AGORA.toISOString().slice(0, 10);
  const pares = ['inicio', 'projetos', 'curriculo'];
  const urls = pares.flatMap((chave) => ['pt', 'en'].map((idioma) => {
    const alternos = ['pt', 'en'].map((i) => `    <xhtml:link rel="alternate" hreflang="${i === 'pt' ? 'pt-BR' : 'en'}" href="${SITE}${ROTAS[i][chave]}"/>`).join('\n');
    return `  <url>
    <loc>${SITE}${ROTAS[idioma][chave]}</loc>
    <lastmod>${hoje}</lastmod>
${alternos}
  </url>`;
  }));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
  <url>
    <loc>${SITE}/privacidade.html</loc>
    <lastmod>${hoje}</lastmod>
  </url>
</urlset>
`;
}

/* ── Execução ───────────────────────────────────────────────────────────── */

const previas = lerPrevias();
const ref = AGORA;
console.log(`\nReferência: ${AGORA.toISOString().slice(0, 10)}\n`);

pagina('index.html', paginaInicio('pt', { previas, ref }), 'pt');
pagina('en/index.html', paginaInicio('en', { previas, ref }), 'en');
pagina('projetos/index.html', paginaProjetos('pt', { previas, ref }), 'pt', { frames: FRAMES_PROJETOS });
pagina('en/projects/index.html', paginaProjetos('en', { previas, ref }), 'en', { frames: FRAMES_PROJETOS });
pagina('curriculo/index.html', paginaCurriculo('pt', { ref }), 'pt');
pagina('en/resume/index.html', paginaCurriculo('en', { ref }), 'en');
pagina('404.html', paginaNaoEncontrada(), 'pt');
pagina('privacidade.html', paginaPrivacidade(), 'pt');

gravar('curriculo.json', `${JSON.stringify(jsonResume('pt', ref), null, 2)}\n`);
gravar('resume.json', `${JSON.stringify(jsonResume('en', ref), null, 2)}\n`);
gravar('cv.txt', textoPuro('pt', ref));
gravar('en/cv.txt', textoPuro('en', ref));
gravar('llms.txt', llmsTxt());
gravar('sitemap.xml', sitemap());

console.log(`\n${escritos} arquivo(s) gerado(s), ${mudaram} com mudança.`);
if (avisos) {
  console.error(`${avisos} aviso(s): corrija antes de publicar.\n`);
  process.exit(1);
}
console.log(mudaram ? 'Há mudanças para commitar.\n' : 'Nada mudou.\n');
