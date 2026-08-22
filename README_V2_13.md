# RAQVOR V2.13

## Objetivo
Versão operacional do RAQVOR com Desktop completo, Mobile central, Admin comercial e Supabase como fonte de verdade.

## Desktop
- Dashboard preservado.
- Livro Caixa com abertura por dinheiro/Pix/cartão.
- Crédito: líquido desejado => valor cobrado = líquido / 0,95; se informar valor cobrado, líquido = valor × 0,95.
- Débito: líquido desejado => valor cobrado = líquido / 0,97; se informar valor cobrado, líquido = valor × 0,97.
- Saídas descontadas pelo valor exato.
- Dívidas e Despesas com visão geral, credores individuais, recorrentes e registro rápido.
- Cartões em seção independente.
- Calendário como lista de pagamentos com caixa, total a pagar, saldo devedor e diária.
- Diária calculada de domingo a domingo; somente datas cadastradas como folga são excluídas.
- Configurações: RAQVOR imutável, moeda BRL/USD/EUR, ciclo e folgas.
- Suporte com Assistente e encaminhamento para especialista.
- Perfil com nome, celular e foto.

## Mobile
- Tela inicial central para dia, semana, quinzena, mês e projeção do próximo mês.
- Barra inferior segura para aparelhos com área de navegação.
- Assistente Financeiro com confirmação antes de registrar.
- Suporte IA/especialista em conversa.
- Perfil editável com foto.
- Supabase + Realtime.

## Admin
- Cadastro de usuários.
- Edição de cadastro, autenticação, plano e assinatura.
- Sessão temporária de suporte.
- Edição financeira completa com auditoria.
- Atendimento estilo WhatsApp com texto e voz.
- Realtime e carregamento paralelo para melhor desempenho.

## Supabase obrigatório
1. Crie manualmente o bucket público `profile-avatars` em Storage.
2. Execute `supabase/migrations/20260822_raqvor_v2_13_operational.sql`.
3. Faça deploy das Edge Functions:
   - `raquor-ai`
   - `raqvor-support-ai`
   - `raqvor-admin`
4. Configure os secrets:
   - `OPENAI_API_KEY`
   - `RAQVOR_AI_MODEL=gpt-5.6-luna`
   - `SUPABASE_SERVICE_ROLE_KEY` apenas na Edge Function `raqvor-admin`.

Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` ou `OPENAI_API_KEY` no navegador ou no GitHub.
