# RAQVOR Central Administrativa

Acesso restrito a usuários presentes em `public.admin_users`.

## Funções
- usuários e status de acesso;
- bloqueio/reativação;
- suporte;
- tickets com SLA de 72h;
- mensagens de texto e voz;
- sessão temporária de suporte;
- visualização de `app_state` em tempo real durante a sessão;
- auditoria.

## Segurança
O painel usa apenas a chave publishable do Supabase no navegador. Operações privilegiadas devem ser feitas por RLS/Edge Functions. Nunca coloque a secret/service-role key no frontend.
