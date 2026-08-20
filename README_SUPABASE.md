# Gestão financeira NEXORA — sincronização Supabase

Esta versão usa o Supabase como armazenamento compartilhado do estado atual do aplicativo, mantendo localStorage como cache/offline.

## Configuração

1. No Supabase SQL Editor, execute `03_app_state_sync.sql`.
2. Abra o aplicativo pela versão desta pasta.
3. O rodapé do menu deve mudar para `V1.11 • Supabase conectado`.
4. Cadastre uma receita/despesa em um navegador/dispositivo.
5. Abra o aplicativo em outro navegador/dispositivo usando a mesma versão. O registro deverá aparecer após o carregamento.

## Importante

Esta versão está sem autenticação, conforme definido para a fase de testes. A política anônima da tabela `app_state` é intencionalmente aberta para o workspace único de desenvolvimento. Antes de vender o produto ou permitir múltiplos usuários, essa política deve ser substituída por autenticação + RLS por usuário/workspace.

O armazenamento normalizado das tabelas financeiras continua sendo a próxima etapa. A `app_state` é uma ponte de sincronização para validar primeiro o funcionamento híbrido sem quebrar a versão existente.


## V1.12 — sincronização contínua
- Supabase é a fonte compartilhada do estado.
- Realtime atualiza outras abas/dispositivos.
- Ao voltar para a aba ou recuperar a internet, o app consulta o estado remoto.
- Service Worker usa estratégia network-first para HTML/JS/CSS e limpa caches antigos.
- Execute novamente `03_app_state_sync.sql` para habilitar a publicação Realtime de `app_state`.
