/**
 * CARD SOCIAL (og:image), PT e EN
 * ══════════════════════════════════════════════════════════════════════════
 * Rode com: node ferramentas/gerar-og.mjs
 *
 * É a imagem que o LinkedIn e o WhatsApp mostram quando o link é colado, e
 * a maior parte das visitas reais chega assim. Feita de HTML com a foto
 * real e as fontes do próprio site, capturada pelo Playwright em 1200×630:
 * nada de imagem gerada por IA. Mesmos tokens, mesma retícula de marcas de
 * corte, mesmo acento terra.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';
import { PESSOA } from '../conteudo/curriculo.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (arq) => readFileSync(join(RAIZ, arq)).toString('base64');
const FOTO = `data:image/jpeg;base64,${b64('assets/img/retrato/bruno-3x4-960.jpg')}`;
const MONA = `data:font/woff2;base64,${b64('assets/fonts/mona.woff2')}`;
const NEON = `data:font/woff2;base64,${b64('assets/fonts/monaspace.woff2')}`;

const html = (idioma) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Mona Sans'; src: url(${MONA}) format('woff2'); font-weight: 300 800; font-stretch: 75% 125%; }
@font-face { font-family: 'Monaspace Neon'; src: url(${NEON}) format('woff2'); font-weight: 200 800; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #EFF0EC; color: #15171A; font-family: 'Mona Sans'; display: grid; grid-template-columns: 1fr 360px; gap: 64px; padding: 72px 80px; align-items: end; }
h1 { font-size: 104px; font-weight: 700; font-stretch: 125%; letter-spacing: -0.045em; line-height: 0.92; }
.cargo { font-size: 34px; font-weight: 620; margin-top: 28px; }
.stack { font-size: 26px; color: #474C54; margin-top: 10px; }
.site { font-family: 'Monaspace Neon'; font-size: 20px; color: #A63D17; margin-top: 36px; }
figure { position: relative; width: 360px; height: 480px; align-self: center; }
img { width: 100%; height: 100%; object-fit: cover; display: block; }
i { position: absolute; width: 22px; height: 22px; border: 0 solid #A63D17; }
i:nth-of-type(1) { top: -12px; left: -12px; border-top-width: 2px; border-left-width: 2px; }
i:nth-of-type(2) { top: -12px; right: -12px; border-top-width: 2px; border-right-width: 2px; }
i:nth-of-type(3) { bottom: -12px; left: -12px; border-bottom-width: 2px; border-left-width: 2px; }
i:nth-of-type(4) { bottom: -12px; right: -12px; border-bottom-width: 2px; border-right-width: 2px; }
</style></head><body>
<div>
  <h1>Bruno<br>Galiz</h1>
  <p class="cargo">${PESSOA.cargo[idioma]}</p>
  <p class="stack">${PESSOA.stackChave}</p>
  <p class="site">bgaliz.github.io${idioma === 'en' ? '/en' : ''}</p>
</div>
<figure><img src="${FOTO}" alt=""><i></i><i></i><i></i><i></i></figure>
</body></html>`;

mkdirSync(join(RAIZ, 'assets/img/og'), { recursive: true });
const navegador = await chromium.launch({ channel: process.env.PW_CANAL || 'chrome' });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
for (const idioma of ['pt', 'en']) {
  await pagina.setContent(html(idioma));
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: join(RAIZ, `assets/img/og/og-${idioma}.jpg`), type: 'jpeg', quality: 88 });
  console.log(`  ✎ assets/img/og/og-${idioma}.jpg`);
}
await navegador.close();
