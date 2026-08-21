# Gestão financeira NEXORA V1.15 — Finalização UX

## O que mudou
- Menu reduzido para Dashboard, Livro Caixa, Dívidas e Despesas, Calendário Financeiro, Relatórios e Configurações.
- Dívidas e Despesas reorganizadas em abas: Visão geral, Cartões, Empréstimos e Despesas/Dívidas.
- Cada cartão cadastrado possui sua própria aba.
- Compras do cartão aparecem em lista vertical com data da compra, vencimento, descrição, parcela, parcelas restantes e saldo restante.
- Calendário financeiro agrupado por semanas financeiras, com semana atual destacada, consolidação por credor, receitas, caixa e busca diária.
- Livro Caixa abre diretamente o formulário de lançamento.
- Animações discretas de entrada, hover e destaque; sem excesso de movimento.
- Service Worker atualizado para não prender a interface em cache antigo.
- V1.15 preparada para hardening de RLS.

## Supabase
Execute `05_supabase_security_hardening.sql` depois de `04_auth_e-mail + senha_login.sql`.

A V1.15 ainda usa `app_state` como sincronização do estado do aplicativo. As tabelas normalizadas permanecem preparadas para a migração final, que será feita depois de validarmos a UX.
