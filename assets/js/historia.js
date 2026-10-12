/**
 * HISTÓRIA: o ano que rola e a régua da carreira
 * ══════════════════════════════════════════════════════════════════════════
 * O capítulo que cruza o meio da tela define o ano do odômetro e o traço
 * aceso da régua. Cada dígito é uma coluna 0-9 deslocada por --d; o CSS
 * anima a troca. Sem JS, o odômetro mostra o ano do cargo mais recente e
 * cada capítulo continua com a própria data escrita.
 * ══════════════════════════════════════════════════════════════════════════
 */

export function iniciarHistoria() {
  const odometro = document.querySelector('[data-odometro]');
  const cargos = document.querySelectorAll('.cargo[data-ano]');
  if (!odometro || !cargos.length) return;

  const digitos = odometro.querySelectorAll('.odometro__digito');
  const tracos = document.querySelectorAll('.regua__traco');

  const mostrar = (cargo) => {
    const ano = cargo.dataset.ano;
    [...ano].forEach((d, i) => digitos[i]?.style.setProperty('--d', d));
    for (const t of tracos) t.toggleAttribute('data-ativo', t.dataset.cargo === cargo.dataset.cargo);
  };

  mostrar(cargos[0]);

  const obs = new IntersectionObserver((entradas) => {
    for (const e of entradas) if (e.isIntersecting) mostrar(e.target);
  }, { rootMargin: '-45% 0px -50% 0px' });
  cargos.forEach((c) => obs.observe(c));
}
