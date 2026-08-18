/**
 * INJEÇÃO DOS VALORES TEMPORAIS NO HTML SERVIDO
 * ══════════════════════════════════════════════════════════════════════════
 * Rode com: node ferramentas/construir.mjs   (ou: npm run construir)
 *
 * POR QUE ISTO EXISTE
 * O dinamico.js já corrige tudo no navegador. Mas o crawler do Google, o
 * card de pré-visualização do LinkedIn e quem estiver sem JS leem o HTML
 * CRU — e para esses o valor precisa já estar certo no arquivo. Por isso a
 * dupla camada: este script (agendado mensalmente por GitHub Action) mantém
 * o HTML fresco, e o JS cobre o intervalo entre execuções.
 *
 * Nenhuma das duas é obrigatória: cada uma sozinha já mantém o site correto.
 * Juntas, tornam impossível o portfólio envelhecer sem ninguém notar — que
 * é exatamente o que aconteceu com o "mais de 5 anos" do currículo.
 *
 * Sem dependências: o HTML é escrito por nós, com marcação previsível, então
 * a substituição por regex é segura e não justifica um parser inteiro.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { calcularSlots } from '../assets/js/dinamico.js';
import { TECNOLOGIAS } from '../assets/dados/perfil.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const AGORA = new Date();
const slots = calcularSlots('pt', AGORA);

const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let totalTrocas = 0;

/** Substitui o conteúdo de todo elemento que carregue um dado `data-din`. */
function injetar(html, arquivo = '') {
  let saida = html;
  const semTroca = [];

  for (const [chave, valor] of Object.entries(slots)) {
    const k = esc(chave);
    let achou = false;

    // <meta ... data-din="chave" ... content="...">  → troca o content
    saida = saida.replace(
      new RegExp(`(<meta\\b[^>]*\\bdata-din="${k}"[^>]*\\bcontent=")([^"]*)(")`, 'g'),
      (m, a, antigo, c) => {
        achou = true;
        if (antigo !== valor) totalTrocas++;
        return a + valor.replace(/"/g, '&quot;') + c;
      }
    );

    // <tag ... data-din="chave">texto</tag>  → troca o texto
    saida = saida.replace(
      new RegExp(`(<(\\w+)\\b[^>]*\\bdata-din="${k}"[^>]*>)([^<]*)(</\\2>)`, 'g'),
      (m, abre, tag, antigo, fecha) => {
        achou = true;
        if (antigo !== valor) totalTrocas++;
        return abre + valor + fecha;
      }
    );

    // O slot está no HTML e nenhum regex casou. Quase sempre significa que o
    // elemento deixou de ser folha (ganhou um <span> dentro), ou que data-din
    // passou para depois de content=/datetime=. Silêncio aqui é HTML servido
    // envelhecendo sem ninguém notar — e a Action commita direto na branch.
    if (!achou && saida.includes(`data-din="${chave}"`)) semTroca.push(chave);
  }

  if (semTroca.length) {
    console.error(`\n  ⚠ ${arquivo}: slots presentes no HTML e NÃO injetados:`);
    for (const chave of semTroca) console.error(`      · ${chave}`);
    console.error('    (data-din tem de vir antes de content=/datetime=, e o');
    console.error('     elemento tem de conter só texto, sem filhos)\n');
    process.exitCode = 1;
  }

  // <time> precisa do datetime legível por máquina, não só do texto visível.
  saida = saida.replace(
    /(<time\b[^>]*\bdata-din="site\.atualizado"[^>]*\bdatetime=")([^"]*)(")/g,
    (m, a, antigo, c) => {
      if (antigo !== slots['site.atualizadoISO']) totalTrocas++;
      return a + slots['site.atualizadoISO'] + c;
    }
  );

  return saida;
}

/**
 * Pré-renderiza as etiquetas de tecnologia, agrupadas por CAMADA.
 *
 * Sem isto a seção chega vazia para o crawler e para quem está sem JS. Com
 * isto, a seção 004 não precisa de JS nenhum.
 *
 * Duas formas já morreram aqui, e as duas lições valem:
 *   · uma matriz 35×6, onde 77% das células diziam "não" — grade é a forma
 *     certa para cruzamento denso, e este dado é esparso;
 *   · uma fileira de pontos contando projetos, que todo leitor entendeu como
 *     NOTA DE 1 A 5 — qualquer marcador ordinal vai ser lido assim.
 *
 * Por isso aqui não se emite número, ponto, barra nem gradação. A ordem é a
 * única hierarquia: `grupo` põe o que é de hoje na frente, e o desempate é a
 * ordem de perfil.js. O nível em palavras vive na prosa do index.html.
 */
const PESO_GRUPO = { diario: 0, entrego: 1, historico: 2 };

function injetarFerramentas(html) {
  const renderizadas = new Set();

  const saida = html.replace(
    /(<ul class="rol-tec" data-camada="(\w+)">)([\s\S]*?)(<\/ul>)/g,
    (m, abre, camada, dentro, fecha) => {
      const itens = TECNOLOGIAS
        .map((t, ordem) => ({ ...t, ordem }))
        .filter((t) => t.camada === camada)
        .sort((a, b) => (PESO_GRUPO[a.grupo] ?? 9) - (PESO_GRUPO[b.grupo] ?? 9) || a.ordem - b.ordem)
        .map((t) => {
          renderizadas.add(t.id);
          return `\n          <li>${t.nome}</li>`;
        }).join('');
      totalTrocas++;
      return `${abre}${itens}\n        ${fecha}`;
    }
  );

  // Uma tecnologia sem `camada` — ou com uma camada que não existe no HTML —
  // sumiria da página em silêncio, e a Action mensal commitaria a perda.
  const perdidas = TECNOLOGIAS.filter((t) => !renderizadas.has(t.id));
  if (perdidas.length) {
    console.error('\n  ⚠ tecnologias que não caíram em nenhuma camada renderizada:');
    for (const t of perdidas) console.error(`      · ${t.nome} (camada: ${t.camada ?? 'ausente'})`);
    console.error('    (confira `camada` em perfil.js e o data-camada das listas no HTML)\n');
    process.exitCode = 1;
  }

  return saida;
}

function processar(arquivo, transformar) {
  const caminho = join(RAIZ, arquivo);
  let antes;
  try { antes = readFileSync(caminho, 'utf8'); }
  catch (e) { console.log(`  · ${arquivo} (ausente, ignorado)`); return false; }

  const depois = transformar(antes);
  if (antes === depois) { console.log(`  = ${arquivo} já estava atualizado`); return false; }

  writeFileSync(caminho, depois);
  console.log(`  ✎ ${arquivo} atualizado`);
  return true;
}

console.log(`\nReferência: ${slots['site.atualizado']} (${slots['site.atualizadoISO']})\n`);

let mudou = false;
mudou = processar('index.html', (h) => injetarFerramentas(injetar(h, 'index.html'))) || mudou;
mudou = processar('privacidade.html', (h) => injetar(h, 'privacidade.html')) || mudou;

mudou = processar('sitemap.xml', (xml) =>
  xml.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${slots['site.atualizadoISO']}</lastmod>`)
) || mudou;

console.log(`\n${totalTrocas} valor(es) temporal(is) trocado(s).`);
console.log(mudou ? 'Há mudanças para commitar.\n' : 'Nada mudou — nenhum commit necessário.\n');

// Sai diferente de zero se algum slot ficou para trás — o workflow para antes
// de commitar HTML com data envelhecida. Sem isso a falha era silenciosa.
// (Se commita ou não, quando tudo deu certo, o workflow decide por git status.)
process.exit(process.exitCode ?? 0);
