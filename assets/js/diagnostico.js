/**
 * DIAGNÓSTICO — o painel lendo os próprios números
 * ══════════════════════════════════════════════════════════════════════════
 * Responde a uma pergunta só: "o portfólio está indo bem, e se não está, o
 * que conserta?". Tudo aqui existe para que a resposta seja honesta quando a
 * resposta for desagradável — inclusive "ainda não dá para saber".
 *
 * TRÊS REGRAS, e as três nasceram de um erro real.
 *
 * 1. AMOSTRA ANTES DE VEREDITO. O painel já mostrou 41 visitas com 76% de
 *    robô e levou à conclusão "o site não converte" — quando o que havia era
 *    "quase ninguém entrou". Abaixo do mínimo de sessões, este módulo não
 *    opina sobre conversão. Não opinar é o resultado correto; um veredito
 *    calculado sobre seis sessões é chute com aparência de medida.
 *
 * 2. UM GARGALO, NÃO UMA LISTA. Os degraus são encadeados: não adianta
 *    mexer no texto do contato se ninguém rola até lá, nem mexer na página se
 *    ninguém chega. O veredito aponta o degrau MAIS ALTO que falhou, e só
 *    ele. Cinco problemas de uma vez é o mesmo que nenhum.
 *
 * 3. RÉGUA DECLARADA. Os cortes abaixo são de bolso — portfólio pessoal de
 *    desenvolvedor, não mediana de mercado, que não existe publicada para
 *    este caso. Estão todos num lugar só, com o raciocínio ao lado, para
 *    poderem ser discutidos em vez de obedecidos.
 * ══════════════════════════════════════════════════════════════════════════
 */

/* ── A régua ───────────────────────────────────────────────────────────────
   MIN_AMOSTRA é o único número aqui que não é opinião. Com 30 sessões, uma
   taxa observada de 20% tem intervalo de confiança de 95% indo de ~8% a ~39%;
   com 10, vai de ~3% a ~56% — larga demais para separar "ótimo" de "péssimo".
   Abaixo de 30 não se mede conversão, e é isso que o portão faz cumprir. */
const MIN_AMOSTRA = 30;

/* Alcance: visitas humanas em 30 dias. Um portfólio que só recebe o que o
   dono manda vive na primeira faixa; a terceira supõe alguma descoberta
   acontecendo sozinha. */
const ALCANCE = { ruim: 20, bom: 80 };

/* Leitura: das sessões, quantas chegaram à seção de contato. Rolar um
   currículo inteiro é decisão deliberada — abaixo de 25% a página está
   perdendo as pessoas no caminho. */
const LEITURA = { ruim: 0.25, bom: 0.50 };

/* Ação: dos que leram até o fim, quantos clicaram em contato ou levaram o
   currículo. Quem chegou ao pé da página e não fez nada viu tudo e passou. */
const ACAO = { ruim: 0.08, bom: 0.20 };

const pct = (parte, todo) => (todo > 0 ? parte / todo : 0);
const emPct = (n) => `${Math.round(n * 100)}%`;

/** Compara contra a régua e devolve o nível. Maior é melhor, sempre. */
function nivelDe(valor, { ruim, bom }) {
  if (valor < ruim) return 'ruim';
  if (valor < bom) return 'atencao';
  return 'bom';
}

/**
 * @param {object} d  a resposta inteira de /api/painel
 * @returns {{nivel, veredito, detalhe, acao, degraus, sinais}}
 */
export function diagnosticar(d) {
  const f = d?.funil || {};
  const t = d?.totais || {};

  const sessoes = +f.sessoes || 0;
  const leram = +f.leram || 0;
  const agiram = +f.agiram || 0;
  const chamaram = +f.chamaram || 0;
  const visitas30d = +t.visitas_30d || 0;

  const taxaLeitura = pct(leram, sessoes);
  const taxaAcao = pct(agiram, leram);

  /* Os degraus saem sempre, mesmo sem amostra: ver "3 → 1 → 0" é informação,
     e é bem menos enganoso do que ver "33% de conversão". A taxa é que fica
     de fora enquanto o número for pequeno demais para sustentá-la. */
  const bastante = sessoes >= MIN_AMOSTRA;
  const degraus = [
    {
      rotulo: 'chegaram',
      valor: sessoes,
      taxa: null,
      nivel: bastante ? nivelDe(visitas30d, ALCANCE) : 'neutro',
    },
    {
      rotulo: 'leram até o contato',
      valor: leram,
      taxa: bastante ? emPct(taxaLeitura) : null,
      nivel: bastante ? nivelDe(taxaLeitura, LEITURA) : 'neutro',
    },
    {
      rotulo: 'chamaram ou levaram o CV',
      valor: agiram,
      taxa: bastante ? emPct(taxaAcao) : null,
      nivel: bastante ? nivelDe(taxaAcao, ACAO) : 'neutro',
    },
  ];

  const sinais = sinaisDe(d, { sessoes, chamaram, bastante });

  /* ── O portão ─────────────────────────────────────────────────────────── */
  if (!bastante) {
    return {
      nivel: 'neutro',
      veredito: 'Ainda não dá para dizer.',
      detalhe:
        `${sessoes} ${sessoes === 1 ? 'sessão humana' : 'sessões humanas'} em 90 dias. `
        + `São necessárias ${MIN_AMOSTRA} para que qualquer taxa aqui signifique algo — `
        + 'com menos que isso, uma pessoa a mais ou a menos vira dezenas de pontos '
        + 'percentuais, e o painel passaria a inventar tendência onde só há acaso.',
      acao:
        'O gargalo é alcance, e ele não se resolve mexendo na página. Enquanto '
        + 'este número não subir, não há o que otimizar aqui.',
      degraus,
      sinais,
    };
  }

  /* ── O gargalo, de cima para baixo ────────────────────────────────────── */
  const alcance = nivelDe(visitas30d, ALCANCE);
  if (alcance === 'ruim') {
    return {
      nivel: 'ruim',
      veredito: 'Chega pouca gente.',
      detalhe:
        `${visitas30d} visitas humanas em 30 dias. A página pode estar ótima — `
        + 'não é ela que está sendo testada com esse volume.',
      acao:
        'Distribuição, não design: onde o link aparece, com que frequência, e '
        + 'para quem. Os degraus abaixo só passam a valer depois disso.',
      degraus,
      sinais,
    };
  }

  const leitura = nivelDe(taxaLeitura, LEITURA);
  if (leitura === 'ruim') {
    return {
      nivel: 'ruim',
      veredito: 'Chegam, mas não descem.',
      detalhe:
        `Só ${emPct(taxaLeitura)} das sessões alcançam a seção de contato. `
        + 'As pessoas estão entrando e desistindo antes do fim — o problema '
        + 'está no que segura a atenção nas primeiras telas.',
      acao:
        'O começo da página é o que precisa mudar, não o contato. Quem sai '
        + 'antes nunca viu o botão para poder ignorá-lo.',
      degraus,
      sinais,
    };
  }

  const acao = nivelDe(taxaAcao, ACAO);
  if (acao === 'ruim') {
    return {
      nivel: 'ruim',
      veredito: 'Leem tudo e não chamam.',
      detalhe:
        `${leram} sessões chegaram ao fim e apenas ${agiram} fizeram alguma coisa `
        + `(${emPct(taxaAcao)}). Este é o único caso em que a culpa é mesmo da `
        + 'página: elas viram o convite e escolheram não aceitar.',
      acao:
        'Agora sim vale mexer no contato — no que é oferecido, no que se pede '
        + 'em troca, e em quanto esforço a pessoa precisa fazer para responder.',
      degraus,
      sinais,
    };
  }

  if (alcance === 'bom' && leitura === 'bom' && acao === 'bom') {
    return {
      nivel: 'bom',
      veredito: 'Está funcionando.',
      detalhe:
        `${visitas30d} visitas em 30 dias, ${emPct(taxaLeitura)} chegam ao fim e `
        + `${emPct(taxaAcao)} desses agem. Os três degraus estão acima da régua.`,
      acao: 'Nada a consertar. O que dá retorno agora é aumentar o volume no topo.',
      degraus,
      sinais,
    };
  }

  return {
    nivel: 'atencao',
    veredito: 'Nada quebrado, nada folgado.',
    detalhe:
      `${visitas30d} visitas em 30 dias, ${emPct(taxaLeitura)} chegam ao fim e `
      + `${emPct(taxaAcao)} desses agem. Nenhum degrau reprova, nenhum sobra.`,
    acao:
      'O degrau mais fraco é o que paga melhor mexer primeiro — veja qual está '
      + 'em âmbar na coluna ao lado.',
    degraus,
    sinais,
  };
}

/* ── Sinais laterais ───────────────────────────────────────────────────────
   Não entram no veredito porque não são degraus do funil: são observações
   que continuam valendo em qualquer cenário, inclusive sem amostra.        */

function sinaisDe(d, { sessoes, chamaram, bastante }) {
  const sinais = [];
  const origens = d?.origens || [];

  const totalOrigens = origens.reduce((s, o) => s + (+o.total || 0), 0);
  const busca = origens
    .filter((o) => /google|bing|duckduckgo|ecosia|yahoo|brave/i.test(o.origem || ''))
    .reduce((s, o) => s + (+o.total || 0), 0);

  if (totalOrigens > 0) {
    const taxa = pct(busca, totalOrigens);
    sinais.push(busca === 0
      ? {
        nivel: 'atencao',
        rotulo: 'descoberta',
        texto: 'Nenhuma visita veio de busca. O site só existe quando você manda '
             + 'o link — não há ninguém encontrando sozinho.',
      }
      : {
        nivel: taxa < 0.15 ? 'atencao' : 'bom',
        rotulo: 'descoberta',
        texto: `${emPct(taxa)} das visitas vieram de busca.`,
      });
  }

  const marcados = d?.marcados || [];
  if (marcados.length) {
    const semAbrir = marcados.filter((m) => !+m.aberturas).length;
    if (semAbrir) {
      sinais.push({
        nivel: 'atencao',
        rotulo: 'links marcados',
        texto: `${semAbrir} de ${marcados.length} links enviados `
             + `${semAbrir === 1 ? 'nunca foi aberto' : 'nunca foram abertos'}. `
             + 'Isso é sinal sobre o canal, não sobre a página.',
      });
    }
  }

  const aparelhos = d?.aparelhos || [];
  const totalAp = aparelhos.reduce((s, a) => s + (+a.total || 0), 0);
  const movel = aparelhos
    .filter((a) => a.dispositivo === 'mobile' || a.dispositivo === 'tablet')
    .reduce((s, a) => s + (+a.total || 0), 0);
  if (totalAp >= 10) {
    const taxa = pct(movel, totalAp);
    if (taxa > 0.5) {
      sinais.push({
        nivel: 'bom',
        rotulo: 'aparelhos',
        texto: `${emPct(taxa)} das visitas são de celular — a leitura no telefone `
             + 'é o caso principal, não a exceção.',
      });
    }
  }

  if (bastante && sessoes > 0 && chamaram === 0) {
    sinais.push({
      nivel: 'ruim',
      rotulo: 'contato direto',
      texto: 'Nenhum clique em WhatsApp, e-mail ou LinkedIn no período, com amostra '
           + 'suficiente para isso significar alguma coisa.',
    });
  }

  return sinais;
}
