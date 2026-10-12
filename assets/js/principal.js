/**
 * PONTO DE ENTRADA
 * ══════════════════════════════════════════════════════════════════════════
 * Duas regras governam este arquivo:
 *
 * 1. ORDEM: primeiro o que corrige conteúdo (datas, tema), depois o que
 *    enfeita. Se um enfeite quebrar, o conteúdo já está certo; por isso
 *    cada módulo decorativo entra em try/catch próprio e falha em silêncio.
 *
 * 2. PESO: só o essencial é importado estaticamente. O resto entra por
 *    import dinâmico e só na página que o usa: a página de projetos não
 *    baixa o relatório, o currículo não baixa o retrato.
 *
 * Nada aqui revela conteúdo: todo texto já está visível no HTML. O JS só
 * acrescenta comportamento.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { aplicarSlots } from './dinamico.js';
import { iniciarTema } from './tema.js';
import { iniciarIdioma } from './idioma.js';

const raiz = document.documentElement;
const idioma = raiz.lang.toLowerCase().startsWith('en') ? 'en' : 'pt';
const pagina = raiz.dataset.pagina;
const local = location.hostname === 'localhost';

const seguro = (nome, fn) => {
  try { return fn(); } catch (e) { if (local) console.warn(`[${nome}]`, e); }
};
const carregar = (nome, caminho, usar) =>
  import(caminho).then(usar).catch((e) => { if (local) console.warn(`[${nome}]`, e); });

/* ── 1 · Conteúdo correto antes de qualquer enfeite ─────────────────────── */

seguro('slots', () => aplicarSlots(idioma));
seguro('tema', iniciarTema);
seguro('idioma', iniciarIdioma);

/* ── 2 · Comportamento, sob demanda ─────────────────────────────────────── */

carregar('barra', './barra.js', (m) => m.iniciarBarra());
carregar('copiar', './copiar.js', (m) => m.iniciarCopiar());

if (pagina === 'inicio') {
  carregar('abertura', './abertura.js', (m) => m.iniciarAbertura());
  carregar('retrato', './retrato.js', (m) => m.iniciarRetrato());
  carregar('historia', './historia.js', (m) => m.iniciarHistoria());
  carregar('relatorio', './relatorio.js', (m) => m.iniciarRelatorio(idioma));
  carregar('demo', './demo-campo.js', (m) => m.iniciarDemoCampo(idioma));
}
if (pagina === 'projetos') carregar('projetos', './projetos.js', (m) => m.iniciarProjetos());
if (pagina === 'privacidade') carregar('privacidade', './privacidade.js', (m) => m.iniciarPrivacidade());

carregar('rastro', './rastro.js', (m) => m.iniciarRastro());
