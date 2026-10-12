/**
 * TEMA: papel (claro) ⇄ tinta (escuro)
 * ══════════════════════════════════════════════════════════════════════════
 * A escolha explícita fica no localStorage e vence a preferência do sistema
 * nos dois sentidos. O flash de tema errado no carregamento é resolvido antes
 * daqui, pelo script inline do <head>.
 *
 * A troca usa View Transitions com uma revelação circular que parte do
 * próprio botão (o CSS lê --vt-x/--vt-y). Sem suporte, a troca é imediata.
 * ══════════════════════════════════════════════════════════════════════════
 */

const raiz = document.documentElement;
const COR_BARRA = { papel: '#EFF0EC', tinta: '#121417' };

function temaEfetivo() {
  if (raiz.dataset.tema) return raiz.dataset.tema;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'tinta' : 'papel';
}

function pintarBotao(botao, tema) {
  botao.setAttribute('aria-label', tema === 'tinta' ? botao.dataset.rotuloClaro : botao.dataset.rotuloEscuro);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = COR_BARRA[tema];
  document.head.append(meta);
}

export function iniciarTema() {
  const botao = document.querySelector('[data-tema-alternar]');
  if (!botao) return;
  pintarBotao(botao, temaEfetivo());

  botao.addEventListener('click', (ev) => {
    const novo = temaEfetivo() === 'tinta' ? 'papel' : 'tinta';
    const r = botao.getBoundingClientRect();
    raiz.style.setProperty('--vt-x', `${((ev.clientX || r.left + r.width / 2) / innerWidth) * 100}%`);
    raiz.style.setProperty('--vt-y', `${((ev.clientY || r.top + r.height / 2) / innerHeight) * 100}%`);

    const trocar = () => {
      raiz.dataset.tema = novo;
      try { localStorage.setItem('tema', novo); } catch (e) {}
      pintarBotao(botao, novo);
    };

    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) {
      trocar();
      return;
    }
    raiz.classList.add('trocando-tema');
    document.startViewTransition(trocar).finished.finally(() => raiz.classList.remove('trocando-tema'));
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!raiz.dataset.tema) pintarBotao(botao, temaEfetivo());
  });
}
