# Gestão financeira NEXORA V1.13

## Autenticação
- Cadastro: nome, celular e senha.
- Login: celular + senha.
- Sem confirmação de telefone nesta fase.

## Supabase
Execute `04_auth_phone_login.sql` no SQL Editor.
Depois, no Supabase Dashboard: Authentication > Providers > Phone: habilite Phone e deixe Confirm phone desativado.

A chave publishable permanece no frontend. Nunca coloque service_role/secret key no aplicativo.
