/**
 * /privacidade.html: o que é registrado, o que não é, e como recusar.
 * Texto jurídico preservado como estava (LGPD); só a casca mudou. O botão de
 * ligar e desligar o registro vive em assets/js/privacidade.js, fora do HTML,
 * para a CSP não precisar liberar script inline.
 */

import { documento } from './base.mjs';

export function paginaPrivacidade() {
  const corpo = `<main id="conteudo" class="doc">

  <h1>Privacidade</h1>
  <p class="doc__selo">Sem cookies, sem IP guardado, sem rastreadores de terceiros</p>

  <h2>O que eu registro</h2>
  <p>
    Quando alguém abre este site, eu registro que houve uma visita. Isso me diz se o
    que eu envio está sendo aberto, que é a única coisa que eu quero
    saber. Concretamente, cada visita grava:
  </p>
  <ul>
    <li>data e hora;</li>
    <li>de onde veio o acesso (LinkedIn, GitHub, WhatsApp, busca ou direto);</li>
    <li>país e cidade aproximados, vindos do servidor;</li>
    <li>tipo de aparelho (celular, computador, tablet ou robô de busca) e idioma do navegador;</li>
    <li>qual página do site foi aberta e qual versão do site estava no ar;</li>
    <li>quais seções foram lidas e até onde a página foi rolada (25, 50, 75 ou 100%);</li>
    <li>se houve alguma interação (mexer o mouse, tocar, rolar ou usar o teclado). Serve
      só para separar uma pessoa de um robô que abre a página sozinho;</li>
    <li>quanto tempo a visita durou e quanto desse tempo foi de leitura ativa (a aba
      visível e alguém interagindo nos últimos 30 segundos);</li>
    <li>cliques em contato e no currículo, cópia do e-mail, e quais casos ou projetos
      foram abertos para ler em detalhe;</li>
    <li>a etiqueta <code>?ref=</code> do link, quando existe. É como eu sei a qual contato
      ou proposta aquele acesso corresponde.</li>
  </ul>

  <h2>O que eu não registro</h2>
  <ul>
    <li><strong>Seu endereço IP não é gravado.</strong> O servidor o usa por um instante,
      em memória, para montar um código embaralhado que serve só para não contar a mesma
      pessoa duas vezes no mesmo dia. O ingrediente desse embaralhamento muda todo dia,
      então o código de hoje não pode ser ligado ao de ontem nem revertido para o IP.</li>
    <li><strong>Nenhum cookie.</strong> A identificação da sessão vive na memória da aba e
      morre quando você a fecha.</li>
    <li><strong>Nenhum rastreador de terceiros.</strong> Sem Google Analytics, sem pixel de
      rede social, sem nada carregado de fora: nenhuma outra empresa é avisada da sua
      visita.</li>
    <li><strong>Seu nome, e-mail ou perfil.</strong> Não tenho como saber, e não tento
      descobrir.</li>
  </ul>

  <h2>Quem processa, onde, e por quanto tempo</h2>
  <p>
    Não há rastreador de terceiros, mas o registro precisa rodar em algum lugar, e
    seria desonesto chamar isso de "infraestrutura própria". Duas empresas atuam como
    <strong>operadoras</strong> destes dados, no sentido da LGPD:
  </p>
  <ul>
    <li><strong>Vercel</strong> executa a função que recebe o registro. Ela também é
      quem informa o país e a cidade aproximados, a partir da conexão.</li>
    <li><strong>Neon</strong> armazena o banco de dados. Conforme a região do
      servidor, o armazenamento pode ocorrer fora do Brasil.</li>
  </ul>
  <p>
    Nenhuma das duas recebe dado que identifique você: elas processam exatamente as
    mesmas linhas descritas acima, sem IP e sem nome.
  </p>
  <p>
    <strong>Prazo:</strong> cada registro é apagado automaticamente após
    <strong>18 meses</strong>. Não há arquivo histórico: passado esse prazo o dado
    deixa de existir, sem eu precisar fazer nada.
  </p>

  <h2>Como recusar</h2>
  <p>
    O botão abaixo desliga o registro neste navegador, para sempre. A escolha fica salva
    localmente no seu aparelho, e eu não fico sabendo dela. O site funciona exatamente
    igual com o registro desligado.
  </p>
  <p>
    Se o seu navegador manda o sinal <em>Do Not Track</em> ou <em>Global Privacy
    Control</em>, o registro já vem desligado sem você precisar fazer nada.
  </p>

  <div class="doc__estado">
    <p id="estado-rastro">Verificando…</p>
    <button class="botao" type="button" id="alternar-rastro">
      <span id="rotulo-rastro">-</span>
      <span class="botao__seta" aria-hidden="true">→</span>
    </button>
  </div>

  <h2>Seus direitos</h2>
  <p>
    Pela LGPD (Lei 13.709/2018) você pode pedir acesso, correção ou eliminação dos seus
    dados. Como nada aqui identifica você pessoalmente, na prática não há o que devolver
    ou apagar em nome de alguém. Mas se tiver qualquer dúvida, escreva para
    <a href="mailto:brunogaliz2@gmail.com">brunogaliz2@gmail.com</a> e eu respondo.
  </p>
</main>`;
  return documento({
    idioma: 'pt',
    chave: 'privacidade',
    titulo: 'Privacidade | Bruno Galiz',
    descricao: 'O que este site registra, o que não registra, e como recusar.',
    corpo,
    classe: 'pagina-doc',
  });
}
