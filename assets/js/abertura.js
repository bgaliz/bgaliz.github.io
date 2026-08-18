/**
 * ABERTURA COREOGRAFADA
 * ══════════════════════════════════════════════════════════════════════════
 * ~900ms: os fios se acomodam, o nome assenta de wght 200 → 760 e wdth
 * 78 → 100, e os metadados entram escalonados.
 *
 * Três limites deliberados, porque abertura mal-feita é obstáculo:
 *   · roda UMA vez por sessão — quem volta não espera de novo;
 *   · qualquer tecla, clique ou rolagem pula na hora;
 *   · não existe sob prefers-reduced-motion.
 * A animação em si mora no CSS (movimento.css); aqui só se decide se roda.
 * ══════════════════════════════════════════════════════════════════════════
 */

const DURACAO_TOTAL = 1700;   // até o último item escalonado terminar

export function iniciarAbertura() {
  const raiz = document.documentElement;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let jaViu = false;
  try { jaViu = sessionStorage.getItem('abertura') === '1'; } catch (e) {}
  if (jaViu) return;

  // Quem chega por âncora (#contato) quer o conteúdo, não a apresentação.
  if (location.hash && location.hash !== '#topo') return;

  raiz.classList.add('abrindo');
  try { sessionStorage.setItem('abertura', '1'); } catch (e) {}

  let encerrada = false;
  const encerrar = () => {
    if (encerrada) return;
    encerrada = true;
    raiz.classList.remove('abrindo');
    limpar();
  };

  const opcoes = { once: true, passive: true };
  const pular = () => encerrar();

  addEventListener('keydown', pular, opcoes);
  addEventListener('pointerdown', pular, opcoes);
  addEventListener('wheel', pular, opcoes);
  addEventListener('touchstart', pular, opcoes);

  function limpar() {
    removeEventListener('keydown', pular);
    removeEventListener('pointerdown', pular);
    removeEventListener('wheel', pular);
    removeEventListener('touchstart', pular);
  }

  setTimeout(encerrar, DURACAO_TOTAL);
}
