/**
 * COMPETÊNCIAS: "DESDE AAAA" E "EM USO", DERIVADOS
 * ══════════════════════════════════════════════════════════════════════════
 * Nada aqui é escrito à mão nem é nota. Para cada tecnologia:
 *
 *   desde   o ano do primeiro cargo ou projeto que a cita;
 *   emUso   citada num cargo em curso, num projeto em curso, ou em algo que
 *           terminou nos últimos 12 meses;
 *   fonte   'cargo' quando há cargo; 'projeto' quando só projetos a citam
 *           (honestidade: Python vem de projeto pessoal, não de emprego).
 *
 * É o mesmo cálculo que os robôs de recrutador fazem com as datas de cada
 * cargo; fazê-lo aqui garante que o site diga o mesmo que eles vão concluir.
 * Sem dependência de DOM: roda no build e no navegador.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { EXPERIENCIAS, PROJETOS, TECNOLOGIAS, AREAS } from '../dados/perfil.js';
import { paraMeses, hoje } from './tempo.js';

const DOZE_MESES = 12;

export function calcularCompetencias(ref = new Date()) {
  const agora = paraMeses(hoje(ref));
  const fontes = [
    ...EXPERIENCIAS.filter((e) => e.contaComoDev).map((e) => ({ ...e, tipo: 'cargo' })),
    ...PROJETOS.map((p) => ({ ...p, tipo: 'projeto' })),
  ];

  const lista = TECNOLOGIAS.map((t) => {
    const usos = fontes.filter((f) => f.stack.includes(t.id));
    if (t.semData || !usos.length) {
      return { ...t, desde: null, emUso: false, fonte: usos.length ? usos[0].tipo : null };
    }
    const desde = usos.map((u) => u.inicio).sort()[0].slice(0, 4);
    const emUso = usos.some((u) => u.fim == null
      || agora - paraMeses(u.fim) < DOZE_MESES);
    const fonte = usos.some((u) => u.tipo === 'cargo') ? 'cargo' : 'projeto';
    return { ...t, desde, emUso, fonte };
  });

  return AREAS.map((area) => ({ area, itens: lista.filter((t) => t.area === area) }));
}
