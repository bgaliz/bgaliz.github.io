/**
 * TROCA DE TEMA — tinta ⇄ papel
 * ══════════════════════════════════════════════════════════════════════════
 * A revelação circular parte das coordenadas reais do botão, via View
 * Transitions (Chrome 111+, Safari 18+, Firefox 144+). Onde não há suporte,
 * a troca é instantânea — o tema muda igual, só sem a geometria.
 *
 * O flash de tema errado no carregamento é resolvido antes daqui: há um
 * script inline e síncrono no <head> que lê o localStorage antes da
 * primeira pintura.
 * ══════════════════════════════════════════════════════════════════════════
 */

const raiz = document.documentElement;

function temaEfetivo() {
  if (raiz.dataset.tema) return raiz.dataset.tema;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'papel' : 'tinta';
}

function atualizarRotulo(botao, tema) {
  const paraPapel = tema === 'tinta';
  const pt = paraPapel ? 'Mudar para tema claro' : 'Mudar para tema escuro';
  const en = paraPapel ? 'Switch to light theme' : 'Switch to dark theme';
  botao.setAttribute('aria-label', raiz.dataset.idioma === 'en' ? en : pt);
  botao.dataset.enLabel = en;
  botao.dataset.ptLabel = pt;

  // A cor da barra do navegador no mobile acompanha o tema.
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = tema === 'tinta' ? '#0B0A08' : '#F7F3EA';
  document.head.appendChild(meta);
}

export function iniciarTema() {
  const botao = document.getElementById('alternar-tema');
  if (!botao) return;

  atualizarRotulo(botao, temaEfetivo());

  botao.addEventListener('click', (ev) => {
    const novo = temaEfetivo() === 'tinta' ? 'papel' : 'tinta';

    // Coordenadas do clique alimentam o clip-path do CSS.
    const r = botao.getBoundingClientRect();
    const x = ev.clientX || r.left + r.width / 2;
    const y = ev.clientY || r.top + r.height / 2;
    raiz.style.setProperty('--vt-x', `${(x / innerWidth) * 100}%`);
    raiz.style.setProperty('--vt-y', `${(y / innerHeight) * 100}%`);

    const trocar = () => {
      raiz.dataset.tema = novo;
      try { localStorage.setItem('tema', novo); } catch (e) {}
      atualizarRotulo(botao, novo);
      document.dispatchEvent(new CustomEvent('tema:mudou', { detail: { tema: novo } }));
    };

    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzido || !document.startViewTransition) { trocar(); return; }

    raiz.classList.add('trocando-tema');
    const vt = document.startViewTransition(trocar);
    vt.finished.finally(() => raiz.classList.remove('trocando-tema'));
  });

  // Se o usuário nunca escolheu, seguir a preferência do sistema ao vivo.
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (!raiz.dataset.tema) {
      atualizarRotulo(botao, temaEfetivo());
      document.dispatchEvent(new CustomEvent('tema:mudou', { detail: { tema: temaEfetivo() } }));
    }
  });
}
