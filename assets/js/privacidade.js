/**
 * Ligar e desligar o registro de visitas, na página de privacidade.
 * A escolha fica só neste navegador (localStorage); nada é enviado.
 */

export function iniciarPrivacidade() {
  const estado = document.getElementById('estado-rastro');
  const botao = document.getElementById('alternar-rastro');
  const rotulo = document.getElementById('rotulo-rastro');
  if (!estado || !botao || !rotulo) return;

  const recusou = () => { try { return localStorage.getItem('semRastro') === '1'; } catch (e) { return true; } };
  const dnt = navigator.doNotTrack === '1' || navigator.globalPrivacyControl;

  function pintar() {
    if (dnt) {
      estado.innerHTML = 'Seu navegador pede para não ser rastreado. <strong>O registro está desligado</strong> e eu respeito isso.';
      botao.hidden = true;
      return;
    }
    const desligado = recusou();
    estado.innerHTML = desligado
      ? 'O registro está <strong>desligado</strong> neste navegador.'
      : 'O registro anônimo está <strong>ligado</strong> neste navegador.';
    rotulo.textContent = desligado ? 'Ligar o registro' : 'Desligar o registro';
  }

  botao.addEventListener('click', () => {
    try {
      if (recusou()) localStorage.removeItem('semRastro');
      else localStorage.setItem('semRastro', '1');
      localStorage.setItem('avisoVisto', '1');
    } catch (e) {}
    pintar();
  });

  pintar();
}
