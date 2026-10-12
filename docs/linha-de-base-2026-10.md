# Linha de base: visitas até 12/out/2026

Retrato do painel antes da renovação, para comparar depois. Só agregados, sem dado
pessoal. Fonte: `GET /api/painel` em 2026-10-12, rastreio ativo desde ~20/ago/2026.

## O que o painel dizia

| | Valor |
|---|---|
| Visitas contadas como humanas | 48 (30 únicos por dia, 47 sessões) |
| Descartadas como robô | 41 |
| Funil 90 dias | 46 sessões, 15 "leram até o contato", 2 agiram (0 contatos, 2 CVs) |
| Tempo mediano de visita | 36 s |
| Aparelhos | 44 desktop, 4 celular |
| Origens | direto 39, LinkedIn 6, Facebook 2, Instagram 1 |

## O que de fato era

| Grupo | Visitas | Leitura |
|---|---|---|
| Dulles Town Center (AWS us-east-1) | 16 | scanners de ATS/e-mail abrindo `?ref=curriculo-*` 4 a 8 vezes em 2 min |
| Moses Lake, Altoona, Luleå, EUA sem cidade | 10 | datacenters (Altoona e Luleå são da Meta: prévia de link) |
| Campo Grande, desktop, direto, pt-BR | 14 | quase certamente o próprio Bruno |
| **Pessoas externas reais** | **~8 a 10** | LinkedIn (São Roque, Paracambi, Campos dos Goytacazes, Santa Maria, Imperatriz), WhatsApp (Picos, celular), Rio de Janeiro, Instagram |

## O que os robôs viam

Num navegador headless que não rola a página, **145 de 179 blocos de texto (81%)**
ficavam com opacidade < 0,2 por causa da revelação por scroll. O print de página inteira
saía praticamente em branco. Corrigido no commit `93912fe` (versão `2026-10-correcao`).

## Como comparar

A partir da versão `2026-10-correcao`, cada evento leva `versao`. O bloco "Antes e
depois" do painel mostra sessões, pessoas confirmadas (com interação real) e tempo
ativo por versão. Metas para 90 dias após o redesign estão no plano.
