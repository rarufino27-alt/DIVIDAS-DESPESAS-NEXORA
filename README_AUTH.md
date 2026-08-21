# Gestão Financeira NEXORA — autenticação V1.15

## Desenvolvimento atual
- Login: e-mail + senha
- Cadastro: nome + e-mail + telefone + senha
- O telefone é armazenado no perfil e não é usado como provedor de autenticação nesta fase.
- Para entrar imediatamente após o cadastro, desative **Confirm email** em Authentication > Sign In / Providers > Email.

## Supabase
Execute `06_auth_email_login.sql` depois das etapas de workspace/autenticação já concluídas.
Depois mantenha `05_supabase_security_hardening.sql` para RLS, permissões e Realtime.

## Futuro comercial
Quando houver provedor SMS configurado, podemos migrar o login para telefone + senha sem alterar o vínculo de workspace/dados.
