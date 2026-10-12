/**
 * O SITE VISTO PELO ROBÔ DO RECRUTADOR
 * ══════════════════════════════════════════════════════════════════════════
 * Rode com: node ferramentas/verificar-robo.mjs   (o CI também roda)
 *
 * Em 12/out/2026, um navegador headless que não rolava a página via 81% do
 * texto do portfólio com opacidade quase zero. Scanners de ATS, sourcing por
 * IA e prévias de link se comportam exatamente assim. Este script repete o
 * teste em todas as páginas, PT e EN, e falha se qualquer garantia cair:
 *
 *   1. sem rolar: nenhum bloco de texto com opacidade efetiva < 0,5;
 *   2. sem rolar: toda <img> de conteúdo carregada, com alt, e do próprio site;
 *   3. sem JavaScript: os termos que as vagas pedem estão no texto visível;
 *   4. nenhum travessão (— ou –) no texto visível;
 *   5. JSON-LD válido, com Person, cargo atual, trajetória e ocupação;
 *   6. JSON Resume e cv.txt coerentes com a página.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { servir, RAIZ } from './servidor-local.mjs';
import { EXPERIENCIAS } from '../assets/dados/perfil.js';

const PAGINAS = ['/', '/en/', '/projetos/', '/en/projects/', '/curriculo/', '/en/resume/', '/privacidade.html'];

/* Termos que precisam estar no texto lido sem JS (amostra de vagas da Gupy,
   docs/termos-vagas.md) e os fatos que o robô não pode perder. */
const TERMOS = {
  '/': ['Desenvolvedor Full Stack Pleno', 'Java', 'Spring Boot', 'Vue.js', 'React', 'TypeScript',
    'Node.js', 'APIs REST', 'PostgreSQL', 'Docker', 'CI/CD', 'Scrum', 'Migração de sistema legado',
    'IA aplicada ao desenvolvimento', 'Experiência profissional', 'Competências técnicas',
    'brunogaliz2@gmail.com', ...EXPERIENCIAS.map((e) => e.empresa)],
  '/en/': ['Mid-level Full Stack Developer', 'Java', 'Spring Boot', 'REST APIs', 'Professional experience',
    'Technical skills', 'Legacy system migration'],
  '/curriculo/': ['Experiência profissional', 'Competências técnicas', 'Formação e idiomas'],
};

let falhas = 0;
const falhou = (msg) => { falhas++; console.error(`  ✗ ${msg}`); };
const passou = (msg) => console.log(`  ✓ ${msg}`);

const { base, fechar } = await servir();
const navegador = await chromium.launch({ channel: process.env.PW_CANAL || 'chrome' });

/* ── 1, 2 e 4: com JS, sem rolar ────────────────────────────────────────── */

const comJs = await navegador.newContext({ viewport: { width: 1366, height: 768 } });
const p = await comJs.newPage();
for (const rota of PAGINAS) {
  await p.goto(`${base}${rota}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const blocos = [...document.querySelectorAll('main p, main h1, main h2, main h3, main li, main td, main dt, main dd')]
      .filter((e) => e.innerText.trim());
    const opaco = (e) => { let o = 1; for (let n = e; n && n !== document.body; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; };
    // Só imagens que aparecem na tela e têm endereço (a retícula de impressão
    // e o painel de prévia vazio ficam de fora).
    const imgs = [...document.querySelectorAll('main img')].filter((i) => i.getAttribute('src') && i.offsetParent !== null);
    return {
      blocos: blocos.length,
      invisiveis: blocos.filter((e) => opaco(e) < 0.5).map((e) => e.innerText.slice(0, 40)),
      semAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
      naoCarregadas: imgs.filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute('src')),
      externas: imgs.filter((i) => new URL(i.currentSrc || i.src).origin !== location.origin).length,
      travessoes: (document.body.innerText.match(/[—–]/g) || []).length,
    };
  });
  if (r.invisiveis.length) falhou(`${rota}: ${r.invisiveis.length} bloco(s) invisível(is) sem rolar: ${r.invisiveis.slice(0, 3).join(' | ')}`);
  else passou(`${rota}: ${r.blocos} blocos de texto, todos visíveis sem rolar`);
  if (r.semAlt) falhou(`${rota}: ${r.semAlt} imagem(ns) sem alt`);
  if (r.naoCarregadas.length) falhou(`${rota}: imagem(ns) não carregada(s): ${r.naoCarregadas.join(', ')}`);
  if (r.externas) falhou(`${rota}: ${r.externas} imagem(ns) servida(s) de outro domínio`);
  if (r.travessoes) falhou(`${rota}: ${r.travessoes} travessão(ões) no texto visível`);
}
await comJs.close();

/* ── 3: sem JavaScript nenhum ───────────────────────────────────────────── */

const semJs = await navegador.newContext({ javaScriptEnabled: false });
const q = await semJs.newPage();
for (const [rota, termos] of Object.entries(TERMOS)) {
  await q.goto(`${base}${rota}`);
  const texto = await q.evaluate(() => document.body.innerText);
  const faltam = termos.filter((t) => !texto.includes(t));
  if (faltam.length) falhou(`${rota} sem JS: faltam ${faltam.join(', ')}`);
  else passou(`${rota} sem JS: ${termos.length} termos obrigatórios presentes`);
}
await semJs.close();

/* ── 5: JSON-LD ─────────────────────────────────────────────────────────── */

for (const rota of ['/', '/en/', '/projetos/', '/curriculo/']) {
  const html = readFileSync(join(RAIZ, rota === '/' ? 'index.html' : `${rota.slice(1)}index.html`), 'utf8');
  const bloco = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  try {
    const dados = JSON.parse(bloco);
    const grafo = dados['@graph'] || [dados];
    const pessoa = grafo.find((x) => x['@type'] === 'Person');
    const problemas = [
      !pessoa && 'sem Person',
      pessoa && !pessoa.jobTitle && 'sem jobTitle',
      pessoa && !pessoa.worksFor && 'sem worksFor',
      pessoa && !(pessoa.alumniOf?.length >= 6) && 'trajetória incompleta em alumniOf',
      pessoa && !pessoa.hasOccupation?.skills && 'sem hasOccupation.skills',
      pessoa && pessoa.telephone && 'telefone exposto no JSON-LD',
    ].filter(Boolean);
    if (problemas.length) falhou(`${rota} JSON-LD: ${problemas.join(', ')}`);
    else passou(`${rota} JSON-LD: Person com cargo atual, ${pessoa.alumniOf.length} papéis e ocupação`);
  } catch (e) {
    falhou(`${rota} JSON-LD inválido: ${e.message}`);
  }
}

/* ── 6: JSON Resume e texto puro ────────────────────────────────────────── */

for (const arq of ['curriculo.json', 'resume.json']) {
  const r = JSON.parse(readFileSync(join(RAIZ, arq), 'utf8'));
  const devs = EXPERIENCIAS.filter((e) => e.contaComoDev).length;
  if (r.basics?.name && r.work?.length === devs && r.work.every((w) => w.highlights?.length && w.startDate)) {
    passou(`${arq}: ${r.work.length} cargos, cada um com principal entrega e data`);
  } else falhou(`${arq}: estrutura incompleta`);
}
for (const arq of ['cv.txt', 'en/cv.txt']) {
  const t = readFileSync(join(RAIZ, arq), 'utf8');
  const faltam = EXPERIENCIAS.map((e) => e.empresa).filter((n) => !t.includes(n));
  if (faltam.length || /[—–]/.test(t)) falhou(`${arq}: ${faltam.length ? `faltam ${faltam.join(', ')}` : 'tem travessão'}`);
  else passou(`${arq}: todas as empresas, nenhum travessão`);
}

await navegador.close();
fechar();

console.log(falhas ? `\n${falhas} falha(s).\n` : '\nO robô do recrutador lê tudo.\n');
process.exit(falhas ? 1 : 0);
