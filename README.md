# Gestão financeira NEXORA — Supabase V1 sem login

## Objetivo
Criar toda a estrutura PostgreSQL do aplicativo antes de integrar o frontend.

## Como executar
1. Abra o Dashboard do seu projeto Supabase.
2. Vá em SQL Editor.
3. Crie uma nova query.
4. Abra `01_schema_gestao_financeira_nexora.sql`.
5. Copie TODO o conteúdo.
6. Cole no SQL Editor.
7. Clique em Run.
8. No final deve aparecer uma tabela de verificação com as tabelas e quantidade de registros.

## Importante
Esta versão está SEM login/cadastro, portanto existe um único workspace inicial e as políticas RLS permitem acesso anônimo a ele.

Isso é aceitável apenas para a fase de desenvolvimento/teste pessoal. Antes de disponibilizar para outros usuários, vamos substituir essas políticas por Auth + RLS por usuário.

## Tabelas principais
- finance_workspaces
- financial_sources
- financial_categories
- financial_contacts
- receipts
- financial_commitments
- debts
- loans
- credit_cards
- credit_card_purchases
- installments
- cash_registers
- cash_movements
- project_settings

## Próxima etapa
Depois de executar o SQL e confirmar que não houve erro, não altere as tabelas manualmente. A próxima etapa será conectar o aplicativo a essas tabelas e retirar gradualmente o localStorage como fonte principal dos dados.
