# RAQVOR V2.11

## Substituições principais
- Desktop: calendário financeiro em lista + fechamento com caixa, total a pagar, saldo devedor e busca diária; suporte corrigido; conversa de suporte; sincronização e identidade RAQVOR.
- Mobile: interface compacta; Supabase como fonte de verdade; Realtime do app_state; Assistente RAQVOR com conversa guiada; suporte estilo mensageria com texto e voz.
- Admin: central profissional de usuários, suporte em tempo real, voz, sessões temporárias, auditoria, bloqueio/reativação, plano/assinatura e edição avançada da conta.
- Supabase: política para edição de app_state durante sessão de suporte, storage de áudio para suporte, Realtime de mensagens e Edge Function `raqvor-admin`.
- Imagens: logo oficial RAQVOR e ícones PNG atualizados.

## Ordem de implantação
1. Substitua os arquivos do repositório pelos arquivos desta versão.
2. Execute `supabase/migrations/20260822_raqvor_commercial_support.sql` no SQL Editor.
3. Faça deploy das Edge Functions `raquor-ai` e `raqvor-admin`.
4. Configure `OPENAI_API_KEY` como secret da Edge Function `raquor-ai`.
5. Promova seu usuário administrativo em `public.admin_users`.
6. Teste Desktop, depois Mobile, depois Admin.

A chave `sb_publishable_*` pode permanecer no cliente com RLS ativo. Nunca coloque uma secret/service_role key no GitHub ou no navegador. As operações administrativas do Auth usam Edge Function server-side.
