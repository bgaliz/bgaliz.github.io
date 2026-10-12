/**
 * BARRA DE NAVEGAÇÃO
 * Some ao descer e volta ao subir (a leitura ganha a tela inteira, e a
 * navegação está a um gesto de distância). A miniatura do retrato aparece
 * quando o cabeçalho do currículo sai da tela. Só atributos: a aparência
 * mora no CSS.
 */

export function iniciarBarra() {
  const barra = document.querySelector('[data-barra]');
  if (!barra) return;

  let ultimo = scrollY;
  let pendente = false;
  const medir = () => {
    pendente = false;
    const y = scrollY;
    barra.toggleAttribute('data-rolou', y > 8);
    // Só esconde depois de passar da altura da barra, e com folga de 6 px
    // para não piscar em rolagem trêmula de trackpad.
    if (y > 120 && y - ultimo > 6) barra.setAttribute('data-escondida', '');
    else if (ultimo - y > 6 || y < 120) barra.removeAttribute('data-escondida');
    ultimo = y;
  };
  addEventListener('scroll', () => {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(medir);
  }, { passive: true });

  const topo = document.querySelector('.cv-topo');
  if (topo) {
    new IntersectionObserver(([e]) => barra.toggleAttribute('data-miniatura', !e.isIntersecting),
      { rootMargin: '-56px 0px 0px 0px' }).observe(topo);
  }
}
