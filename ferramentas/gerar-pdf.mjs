/**
 * PDFs DO CURRÍCULO, GERADOS DA PRÓPRIA PÁGINA
 * ══════════════════════════════════════════════════════════════════════════
 * Rode com: node ferramentas/gerar-pdf.mjs   (depois de construir.mjs)
 *
 * Os PDFs antigos eram feitos à mão no Canva e envelheceram sem ninguém
 * notar: diziam "mais de 5 anos" quando já eram 7, tinham "Porfolio" no
 * lugar de "Portfolio" e métricas que o site tinha removido. Agora o PDF é a
 * impressão de /curriculo/ (e /en/resume/): diz exatamente o que a página
 * diz, sai em texto real (ATS lê), em uma coluna e sem foto.
 *
 * Um servidor estático mínimo (servidor-local.mjs) serve a raiz só durante a
 * geração.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { join } from 'node:path';
import { chromium } from 'playwright';
import { servir, RAIZ } from './servidor-local.mjs';

const { base, fechar } = await servir();

const navegador = await chromium.launch({ channel: process.env.PW_CANAL || 'chrome' });
const pagina = await navegador.newPage();

const alvos = [
  { rota: '/curriculo/', arquivo: 'curriculo/bruno-galiz-pt.pdf', titulo: 'Currículo - Bruno Galiz de Oliveira' },
  { rota: '/en/resume/', arquivo: 'curriculo/bruno-galiz-en.pdf', titulo: 'Résumé - Bruno Galiz de Oliveira' },
];

for (const { rota, arquivo } of alvos) {
  await pagina.goto(`${base}${rota}`, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.emulateMedia({ media: 'print' });
  await pagina.pdf({
    path: join(RAIZ, arquivo),
    format: 'A4',
    preferCSSPageSize: true,
    printBackground: false,
    tagged: true,
    outline: true,
  });
  console.log(`  ✎ ${arquivo}`);
}

await navegador.close();
fechar();
