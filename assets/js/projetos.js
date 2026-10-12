/**
 * PÁGINA DE PROJETOS
 * · Passar o ponteiro (ou o foco) num projeto do índice mostra a imagem da
 *   prévia dele no painel fixo, com um recorte que se abre. Projeto sem
 *   página pública (código sob pedido) mostra o próprio nome, nunca a
 *   imagem de outro projeto.
 * · O Cronômetro roda embutido, mas só depois do clique: um iframe a mais no
 *   carregamento custaria tempo de quem nem vai usar.
 */

export function iniciarProjetos() {
  const painel = document.querySelector('[data-painel-previa]');
  const img = painel?.querySelector('img');
  const texto = painel?.querySelector('.indice-projetos__sem-imagem');
  const itens = document.querySelectorAll('.indice-projetos__item');

  if (painel && img && texto && itens.length && matchMedia('(pointer: fine)').matches) {
    let atual = null;
    const mostrar = (item) => {
      if (item === atual) return;
      atual = item;
      const src = item.dataset.previa;
      painel.toggleAttribute('data-sem-imagem', !src);
      texto.textContent = src ? '' : item.dataset.nome;
      if (!src) return;
      painel.setAttribute('data-trocando', '');
      img.src = src;
      img.decode().catch(() => {}).finally(() => requestAnimationFrame(() => painel.removeAttribute('data-trocando')));
    };
    mostrar(itens[0]);
    for (const item of itens) {
      item.addEventListener('pointerenter', () => mostrar(item));
      item.addEventListener('focus', () => mostrar(item));
    }
  }

  for (const caixa of document.querySelectorAll('[data-demo-embutido]')) {
    caixa.querySelector('[data-demo-abrir]')?.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = caixa.dataset.demoEmbutido;
      iframe.title = 'Cronômetro de Oradores';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-downloads');
      caixa.replaceChildren(iframe);
    }, { once: true });
  }
}
