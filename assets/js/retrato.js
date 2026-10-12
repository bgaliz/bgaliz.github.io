/**
 * A FOTO REVELADA
 * ══════════════════════════════════════════════════════════════════════════
 * Num relatório impresso, foto vira retícula: os pontos de meio-tom. Na
 * primeira visita da sessão, o retrato aparece como retícula, desenhada aqui
 * a partir da luminância da foto real, e se revela em fotografia contínua.
 * É o gesto do site inteiro: o dado bruto virando documento.
 *
 * Garantias:
 *   · a <img> real está sempre no HTML e visível; o canvas é uma camada por
 *     cima, aria-hidden, e é removido ao terminar;
 *   · sem JS, sob movimento reduzido ou em visita repetida: só a foto;
 *   · ponto e fundo vêm das cores do tema, lidas do CSS.
 * ══════════════════════════════════════════════════════════════════════════
 */

export async function iniciarRetrato() {
  const figura = document.querySelector('[data-retrato]');
  const img = figura?.querySelector('img');
  if (!figura || !img) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (sessionStorage.getItem('retrato') === '1') return;
    sessionStorage.setItem('retrato', '1');
  } catch (e) { return; }

  try { await img.decode(); } catch (e) { return; }

  const largura = img.clientWidth;
  const altura = img.clientHeight;
  if (!largura || !altura) return;

  const dpr = Math.min(devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(largura * dpr);
  canvas.height = Math.round(altura * dpr);
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');

  // Amostra a foto numa grade pequena: uma célula por ponto.
  const passo = 7;
  const colunas = Math.ceil(largura / passo);
  const linhas = Math.ceil(altura / passo);
  const amostra = document.createElement('canvas');
  amostra.width = colunas;
  amostra.height = linhas;
  const actx = amostra.getContext('2d', { willReadFrequently: true });
  actx.drawImage(img, 0, 0, colunas, linhas);
  let pixels;
  try { pixels = actx.getImageData(0, 0, colunas, linhas).data; } catch (e) { return; }

  const estilo = getComputedStyle(document.documentElement);
  const papel = estilo.getPropertyValue('--papel').trim() || '#EFF0EC';
  const tinta = estilo.getPropertyValue('--tinta').trim() || '#15171A';

  const desenhar = (k) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = papel;
    ctx.fillRect(0, 0, largura, altura);
    ctx.fillStyle = tinta;
    for (let y = 0; y < linhas; y++) {
      for (let x = 0; x < colunas; x++) {
        const i = (y * colunas + x) * 4;
        const luz = (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;
        const r = (1 - luz) * passo * 0.62 * k;
        if (r < 0.25) continue;
        ctx.beginPath();
        ctx.arc(x * passo + passo / 2, y * passo + passo / 2, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  figura.append(canvas);
  const inicio = performance.now();
  const CRESCE = 380;
  const SOME = 520;

  const quadro = (agora) => {
    const t = agora - inicio;
    if (t < CRESCE) {
      // Os pontos crescem até o tamanho da retícula.
      desenhar(1 - (1 - t / CRESCE) ** 3);
      requestAnimationFrame(quadro);
    } else if (t < CRESCE + SOME) {
      // A retícula dá lugar à foto: só a camada por cima esmaece.
      canvas.style.opacity = String(1 - ((t - CRESCE) / SOME) ** 2);
      requestAnimationFrame(quadro);
    } else {
      canvas.remove();
    }
  };
  desenhar(0.01);
  requestAnimationFrame(quadro);
}
