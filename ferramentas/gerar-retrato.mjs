/**
 * RETRATO: recortes, formatos e a retícula de impressão
 * ══════════════════════════════════════════════════════════════════════════
 * Rode com: node ferramentas/gerar-retrato.mjs
 *
 * Entrada (fora do site publicado, ver .gitignore):
 *   assets/img/origem/bruno-2k.png   upscale 2K (Higgsfield) da foto real;
 *                                    identidade conferida lado a lado
 * Saída (assets/img/retrato/):
 *   bruno-3x4-{480,640,960}.webp     o "3x4" do cabeçalho
 *   bruno-3x4-960.jpg                reserva universal e imagem do JSON-LD
 *   bruno-56.webp                    miniatura da barra de navegação
 *   bruno-reticula.webp              retícula em tinta, para o PDF do relatório
 *
 * O recorte deixa o broche de lapela de fora (denunciava foto de casamento)
 * e mantém o tijolo: a cor dele é o acento do site.
 *
 * Playwright desenha e codifica (canvas → WebP/JPEG/PNG). Sem dependência
 * nova. AVIF ficou de fora: nenhum codificador disponível aqui gravava o
 * formato, e o WebP de 960 px já fica em ~100 KB.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEM = join(RAIZ, 'assets/img/origem/bruno-2k.png');
const SAIDA = join(RAIZ, 'assets/img/retrato');

/* Recorte em frações da imagem de origem: cabeça e ombros, sem o broche. */
const RECORTE_3x4 = { x: 0.17, y: 0.0, w: 0.66, h: 0.88 };
const RECORTE_ROSTO = { x: 0.29, y: 0.06, w: 0.42, h: 0.42 };

if (!existsSync(ORIGEM)) {
  console.error(`Falta ${ORIGEM}. Gere o upscale primeiro (ver README).`);
  process.exit(1);
}
mkdirSync(SAIDA, { recursive: true });

const navegador = await chromium.launch({ channel: process.env.PW_CANAL || 'chrome' });
const pagina = await navegador.newPage();
const dataUrl = `data:image/png;base64,${readFileSync(ORIGEM).toString('base64')}`;
await pagina.setContent(`<img id="f" src="${dataUrl}">`);
await pagina.waitForFunction(() => document.getElementById('f').complete);

async function exportar({ recorte, largura, altura, tipo, qualidade, reticula = false }) {
  const base64 = await pagina.evaluate(({ recorte, largura, altura, tipo, qualidade, reticula }) => {
    const img = document.getElementById('f');
    const c = document.createElement('canvas');
    c.width = largura; c.height = altura;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    const sx = recorte.x * img.naturalWidth;
    const sy = recorte.y * img.naturalHeight;
    const sw = recorte.w * img.naturalWidth;
    const sh = recorte.h * img.naturalHeight;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, largura, altura);

    if (reticula) {
      // Mesma regra da revelação na tela: um ponto por célula, raio pela
      // escuridão da célula. Tinta pura sobre branco: imprime bem e gasta pouco.
      const passo = 4;
      const dados = ctx.getImageData(0, 0, largura, altura).data;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, largura, altura);
      ctx.fillStyle = '#111';
      for (let y = 0; y < altura; y += passo) {
        for (let x = 0; x < largura; x += passo) {
          let soma = 0, n = 0;
          for (let j = 0; j < passo && y + j < altura; j++) {
            for (let i = 0; i < passo && x + i < largura; i++) {
              const k = ((y + j) * largura + (x + i)) * 4;
              soma += 0.2126 * dados[k] + 0.7152 * dados[k + 1] + 0.0722 * dados[k + 2];
              n++;
            }
          }
          const r = (1 - soma / n / 255) * passo * 0.68;
          if (r < 0.3) continue;
          ctx.beginPath();
          ctx.arc(x + passo / 2, y + passo / 2, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    return c.toDataURL(tipo, qualidade).split(',')[1];
  }, { recorte, largura, altura, tipo, qualidade, reticula });
  return Buffer.from(base64, 'base64');
}

const gravar = (nome, buffer) => {
  writeFileSync(join(SAIDA, nome), buffer);
  console.log(`  ✎ ${nome} (${Math.round(buffer.length / 1024)} KB)`);
};

for (const largura of [480, 640, 960]) {
  const altura = Math.round((largura * 4) / 3);
  gravar(`bruno-3x4-${largura}.webp`, await exportar({ recorte: RECORTE_3x4, largura, altura, tipo: 'image/webp', qualidade: 0.84 }));
}
gravar('bruno-3x4-960.jpg', await exportar({ recorte: RECORTE_3x4, largura: 960, altura: 1280, tipo: 'image/jpeg', qualidade: 0.86 }));
gravar('bruno-56.webp', await exportar({ recorte: RECORTE_ROSTO, largura: 56, altura: 56, tipo: 'image/webp', qualidade: 0.86 }));
gravar('bruno-reticula.webp', await exportar({ recorte: RECORTE_3x4, largura: 240, altura: 320, tipo: 'image/webp', qualidade: 0.9, reticula: true }));

await navegador.close();
