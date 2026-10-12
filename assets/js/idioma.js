/**
 * IDIOMA: páginas separadas, não troca de texto
 * ══════════════════════════════════════════════════════════════════════════
 * PT e EN são páginas próprias (/ e /en/), geradas pelo build. Robô em inglês
 * encontra HTML em inglês de verdade, com hreflang apontando o par.
 *
 * Aqui só duas coisas: lembrar a escolha de quem clicou no alternador, e,
 * para quem tem o navegador em inglês e está na página em português,
 * destacar o link "EN" (sem redirecionar: redirecionar por idioma confunde
 * buscador e tira de quem lê a escolha).
 * ══════════════════════════════════════════════════════════════════════════
 */

export function iniciarIdioma() {
  const link = document.querySelector('[data-idioma]');
  if (!link) return;

  link.addEventListener('click', () => {
    try { localStorage.setItem('idioma', link.dataset.idioma); } catch (e) {}
  });

  const aqui = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'pt';
  let escolhido = null;
  try { escolhido = localStorage.getItem('idioma'); } catch (e) {}
  const navegador = (navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en';

  if (!escolhido && navegador !== aqui && link.dataset.idioma === navegador) {
    link.dataset.sugerido = '';
    link.title = navegador === 'en' ? 'Read in English' : 'Ler em português';
  }
}
