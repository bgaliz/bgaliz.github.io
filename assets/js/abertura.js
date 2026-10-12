/**
 * CHEGADA
 * ══════════════════════════════════════════════════════════════════════════
 * O nome se acomoda: largura 75 → 112, peso 380 → 680, em 700 ms. É o único
 * momento coreografado da página, e o nome está legível desde o primeiro
 * quadro (nada some, só ganha corpo). A animação mora em movimento.css;
 * aqui só se decide se ela roda:
 *   · uma vez por sessão (quem volta não espera de novo);
 *   · nunca sob prefers-reduced-motion;
 *   · nunca para quem chega por âncora (#contato quer o conteúdo).
 * ══════════════════════════════════════════════════════════════════════════
 */

export function iniciarAbertura() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (location.hash) return;
  try {
    if (sessionStorage.getItem('chegou') === '1') return;
    sessionStorage.setItem('chegou', '1');
  } catch (e) { return; }

  const raiz = document.documentElement;
  raiz.classList.add('chegando');
  setTimeout(() => raiz.classList.remove('chegando'), 900);
}
