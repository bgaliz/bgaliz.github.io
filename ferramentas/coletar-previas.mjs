/**
 * PRÉVIAS DE LINK: o que o WhatsApp faz ao colar uma URL
 * ══════════════════════════════════════════════════════════════════════════
 * Rode com: node ferramentas/coletar-previas.mjs   (a Action mensal também)
 *
 * O WhatsApp não tira print: o servidor dele abre a URL, lê og:title,
 * og:description, og:image e o ícone, e monta o cartão. Aqui é igual, no
 * build e nunca no navegador do visitante (lá o CORS bloqueia ler o HTML de
 * outro site, e cada visita vazaria o IP do recrutador para terceiros).
 *
 * Cadeia de reserva por campo:
 *   título     og:title → twitter:title → <title> → nome declarado aqui
 *   descrição  og:description → meta description → (vazio: o site usa o texto
 *              de conteudo/curriculo.mjs)
 *   imagem     og:image → twitter:image → captura da própria página 1200×630
 *   ícone      <link rel=icon> → /favicon.ico → (a página usa a inicial)
 *
 * Segurança: só https e só as URLs declaradas; 10 s e 2 MB de HTML; imagem
 * só image/* até 5 MB e SEMPRE redesenhada num canvas e reexportada como
 * WebP (descarta metadados e qualquer carga escondida no arquivo); texto sem
 * caracteres de controle e com tamanho limitado. Se uma URL falhar, fica a
 * última prévia boa e o script só avisa: o build nunca quebra por um site
 * de terceiro fora do ar.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';
import { EXPERIENCIAS, PROJETOS } from '../assets/dados/perfil.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARQUIVO = join(RAIZ, 'dados/previas.json');
const PASTA = join(RAIZ, 'assets/img/previas');
const AGENTE = 'BrunoGalizPortfolio/1.0 (+https://bgaliz.github.io)';
const LIMITE_HTML = 2 * 1024 * 1024;
const LIMITE_IMAGEM = 5 * 1024 * 1024;

/* Nome de reserva para quando o site não tem título nenhum (MS Digital é uma
   SPA que só escreve o título depois do JavaScript). */
const NOMES = { sgi: 'MS Digital', calango: 'Calango Doido NFT' };

const alvos = [
  ...EXPERIENCIAS.filter((e) => e.url).map((e) => ({ id: e.id, url: e.url, nome: NOMES[e.id] || e.empresa })),
  ...PROJETOS.filter((p) => p.url).map((p) => ({ id: p.id, url: p.url, nome: NOMES[p.id] || p.nome })),
];

const anterior = existsSync(ARQUIVO) ? JSON.parse(readFileSync(ARQUIVO, 'utf8')).itens ?? {} : {};
mkdirSync(PASTA, { recursive: true });
mkdirSync(dirname(ARQUIVO), { recursive: true });

/* ── Texto ──────────────────────────────────────────────────────────────── */

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decodificar = (t) => t
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => ENTIDADES[n.toLowerCase()] ?? m);
const limpar = (t, max) => {
  if (!t) return null;
  const s = decodificar(t).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return s ? (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s) : null;
};

function meta(html, ...nomes) {
  for (const nome of nomes) {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${nome}["'][^>]*>`, 'i');
    const tag = html.match(re)?.[0];
    const valor = tag?.match(/content=["']([^"']*)["']/i)?.[1];
    if (valor) return valor;
  }
  return null;
}

/* Descrições genéricas que não dizem nada sobre o projeto. */
const GENERICA = /^Contribute to .+ by creating an account on GitHub\.?$/i;

/* ── Rede ───────────────────────────────────────────────────────────────── */

async function baixar(url, limite, aceita) {
  if (!url.startsWith('https://')) throw new Error(`não é https: ${url}`);
  const r = await fetch(url, {
    headers: { 'User-Agent': AGENTE, Accept: aceita },
    redirect: 'follow',
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  if (!r.url.startsWith('https://')) throw new Error('redirecionou para http');
  const tamanho = Number(r.headers.get('content-length') || 0);
  if (tamanho > limite) throw new Error('grande demais');
  const corpo = Buffer.from(await r.arrayBuffer());
  if (corpo.length > limite) throw new Error('grande demais');
  return { corpo, tipo: r.headers.get('content-type') || '', urlFinal: r.url };
}

/* ── Imagem: sempre redesenhada e reexportada ───────────────────────────── */

let navegador;
let pagina;

async function reexportar(buffer, tipo, largura, altura) {
  const dataUrl = `data:${tipo};base64,${buffer.toString('base64')}`;
  const base64 = await pagina.evaluate(async ({ dataUrl, largura, altura }) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = largura; c.height = altura;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    // Cobre o quadro inteiro (como object-fit: cover), centralizado no alto.
    const escala = Math.max(largura / img.naturalWidth, altura / img.naturalHeight);
    const w = img.naturalWidth * escala;
    const h = img.naturalHeight * escala;
    ctx.drawImage(img, (largura - w) / 2, 0, w, h);
    return c.toDataURL('image/webp', 0.8).split(',')[1];
  }, { dataUrl, largura, altura });
  return Buffer.from(base64, 'base64');
}

async function capturar(url) {
  const contexto = await navegador.newContext({ viewport: { width: 1200, height: 630 }, userAgent: AGENTE });
  const p = await contexto.newPage();
  try {
    await p.goto(url, { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {});
    await p.waitForTimeout(1200);
    return await p.screenshot({ type: 'png' });
  } finally {
    await contexto.close();
  }
}

/* ── Coleta de um alvo ──────────────────────────────────────────────────── */

async function coletar({ id, url, nome }) {
  const { corpo, urlFinal } = await baixar(url, LIMITE_HTML, 'text/html');
  const html = corpo.toString('utf8');
  const titulo = limpar(meta(html, 'og:title', 'twitter:title') || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1], 80)
    ?.replace(/^GitHub - /, '');
  let descricao = limpar(meta(html, 'og:description', 'description', 'twitter:description'), 200);
  if (descricao && GENERICA.test(descricao)) descricao = null;

  const item = {
    url,
    titulo: titulo || nome,
    descricao,
    imagem: null,
    icone: null,
    fonte: { titulo: titulo ? 'site' : 'reserva', descricao: descricao ? 'site' : 'reserva', imagem: null },
    coletado_em: new Date().toISOString().slice(0, 10),
  };

  // Imagem: a declarada pelo site, senão a captura da própria página.
  const declarada = meta(html, 'og:image', 'twitter:image');
  let bruta = null;
  let tipo = 'image/png';
  if (declarada) {
    try {
      const r = await baixar(new URL(declarada, urlFinal).href, LIMITE_IMAGEM, 'image/*');
      if (!r.tipo.startsWith('image/')) throw new Error(`tipo ${r.tipo}`);
      bruta = r.corpo; tipo = r.tipo.split(';')[0];
      item.fonte.imagem = 'og:image';
    } catch (e) { console.warn(`    og:image falhou (${e.message}); vai a captura`); }
  }
  if (!bruta) {
    bruta = await capturar(url);
    item.fonte.imagem = 'captura';
  }
  writeFileSync(join(PASTA, `${id}.webp`), await reexportar(bruta, tipo, 800, 420));
  item.imagem = `/assets/img/previas/${id}.webp`;

  // Ícone.
  const href = html.match(/<link[^>]+rel=["'][^"']*\bicon\b[^"']*["'][^>]*>/i)?.[0]?.match(/href=["']([^"']+)["']/i)?.[1];
  for (const candidato of [href, '/favicon.ico'].filter(Boolean)) {
    try {
      const r = await baixar(new URL(candidato, urlFinal).href, 512 * 1024, 'image/*');
      const t = r.tipo.split(';')[0] || 'image/x-icon';
      if (!t.startsWith('image/')) continue;
      writeFileSync(join(PASTA, `${id}-icone.webp`), await reexportar(r.corpo, t, 32, 32));
      item.icone = `/assets/img/previas/${id}-icone.webp`;
      break;
    } catch (e) { /* tenta o próximo; sem ícone, a página usa a inicial */ }
  }
  return item;
}

/* ── Execução ───────────────────────────────────────────────────────────── */

navegador = await chromium.launch({ channel: process.env.PW_CANAL || 'chrome' });
pagina = await navegador.newPage();

const itens = {};
let falhas = 0;
for (const alvo of alvos) {
  process.stdout.write(`  · ${alvo.id.padEnd(11)} ${alvo.url}\n`);
  try {
    itens[alvo.id] = await coletar(alvo);
    const f = itens[alvo.id].fonte;
    console.log(`    título: ${f.titulo}, descrição: ${f.descricao}, imagem: ${f.imagem}, ícone: ${itens[alvo.id].icone ? 'sim' : 'não'}`);
  } catch (e) {
    falhas++;
    console.warn(`    ⚠ falhou (${e.message}); mantendo a prévia anterior`);
    if (anterior[alvo.id]) itens[alvo.id] = anterior[alvo.id];
  }
}
await navegador.close();

writeFileSync(ARQUIVO, `${JSON.stringify({ gerado_em: new Date().toISOString().slice(0, 10), itens }, null, 2)}\n`);
console.log(`\n${Object.keys(itens).length} prévia(s) em dados/previas.json${falhas ? `, ${falhas} falha(s) (prévia anterior mantida)` : ''}.\n`);
