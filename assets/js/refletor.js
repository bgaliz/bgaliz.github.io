/**
 * REFLETOR — o círculo de luz que segue o ponteiro
 * ══════════════════════════════════════════════════════════════════════════
 * Um radial-gradient fixo, ATRÁS do conteúdo (a .casca vive em z-index 1) e
 * abaixo das outras duas camadas ambiente (grão 9999, vinheta 9998).
 *
 * A convenção é a mesma dos botões magnéticos em principal.js: o JS escreve
 * SÓ coordenadas em custom properties, e a aparência inteira mora no CSS.
 * Consequência prática: a cor é por tema (--refletor-cor, definida nos três
 * blocos de tokens.css) e este arquivo não conhece uma cor sequer — trocar
 * de tinta para papel troca a luz sem passar por aqui.
 *
 * Quatro portas antes de existir:
 *   · ponteiro preciso — no toque não há cursor a seguir;
 *   · prefers-reduced-motion: no-preference;
 *   · o elemento é CRIADO aqui: sem JS ele não existe, e não falta;
 *   · uma escrita por quadro, via rAF — pointermove dispara muito mais.
 * ══════════════════════════════════════════════════════════════════════════
 */

export function iniciarRefletor() {
  if (!matchMedia('(pointer: fine)').matches) return;
  if (!matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

  const luz = document.createElement('div');
  luz.className = 'refletor';
  luz.setAttribute('aria-hidden', 'true');
  document.body.prepend(luz);

  let x = 0;
  let y = 0;
  let agendado = false;
  let vivo = false;

  const pintar = () => {
    agendado = false;
    luz.style.setProperty('--refletor-x', `${x}px`);
    luz.style.setProperty('--refletor-y', `${y}px`);
  };

  const apagar = () => {
    if (!vivo) return;
    vivo = false;
    delete luz.dataset.vivo;
  };

  addEventListener('pointermove', (ev) => {
    // Notebook com tela sensível satisfaz `pointer: fine` pelo mouse e ainda
    // emite eventos de toque. O toque não acende a luz.
    if (ev.pointerType === 'touch') return;

    // clientX/clientY são relativos à viewport e a camada é `fixed`: os dois
    // concordam, então não há termo de scroll e a luz não atrasa a rolagem.
    x = ev.clientX;
    y = ev.clientY;

    if (!vivo) {
      vivo = true;
      luz.dataset.vivo = '';
    }
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(pintar);
  }, { passive: true });

  // `pointerleave` no <html> é o que de fato dispara ao sair da viewport;
  // no window, não. `blur` cobre troca de aba e de janela.
  document.documentElement.addEventListener('pointerleave', apagar);
  addEventListener('blur', apagar);
}
