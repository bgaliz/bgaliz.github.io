/**
 * CONFIGURAÇÃO — o único lugar a editar depois do deploy da API
 * ══════════════════════════════════════════════════════════════════════════
 * Enquanto API_BASE for null, o rastreamento fica inteiro desligado e o
 * aviso de privacidade não aparece. O portfólio funciona 100% assim — o
 * painel é um extra, não uma dependência.
 *
 * Depois de importar o repositório na Vercel, troque por algo como:
 *   export const API_BASE = 'https://bruno-portfolio.vercel.app/api';
 * ══════════════════════════════════════════════════════════════════════════
 */

export const API_BASE = null;

export const urlDe = (rota) => (API_BASE ? `${API_BASE}/${rota}` : null);

/** Endereço público do portfólio — usado pelo gerador de links marcados. */
export const SITE = 'https://bgaliz.github.io';
