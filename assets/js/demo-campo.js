/**
 * DEMONSTRAÇÃO REAL DO CASO CONEXA: criar um campo sem deploy
 * O visitante dá nome e tipo, e o campo aparece no prontuário na hora. É o
 * mecanismo que tirou o time de produto do caminho: o campo é dado, não
 * código. Tudo local, nada é enviado; dados de exemplo.
 */

export function iniciarDemoCampo() {
  const demo = document.querySelector('[data-demo-campo]');
  const form = demo?.querySelector('.demo-campo__criar');
  const ficha = demo?.querySelector('.demo-campo__ficha');
  if (!form || !ficha) return;

  let criados = 0;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    const rotulo = String(dados.get('rotulo') || '').trim().slice(0, 40);
    if (!rotulo || criados >= 6) return;
    criados++;

    const tipo = ['text', 'date', 'checkbox'].includes(dados.get('tipo')) ? dados.get('tipo') : 'text';
    const label = document.createElement('label');
    label.setAttribute('data-novo', '');
    const nome = document.createElement('span');
    nome.textContent = rotulo;
    const campo = document.createElement('input');
    campo.type = tipo;
    label.append(nome, ' ', campo);
    ficha.append(label);
    form.reset();
    form.querySelector('input')?.focus();
  });
}
