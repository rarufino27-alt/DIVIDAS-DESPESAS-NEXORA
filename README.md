# FINANCE NEXORA V1.1

Aplicativo financeiro pessoal local/offline em HTML + CSS + JavaScript, preparado para posterior integração com Supabase.

## Funcionalidades implementadas
- Dashboard com saldo atual, saldo projetado, receitas, despesas, dívidas e próximos compromissos.
- Movimentações, receitas e despesas com cadastro, edição, exclusão, status e observações.
- Organização semanal de segunda a sexta; semana automática pelo vencimento e semana financeira manualmente realocável.
- Dívidas com parcelas automáticas, edição, exclusão e cálculo de saldo em aberto conforme parcelas pagas.
- Cartões com limite, fechamento, vencimento e compras parceladas.
- Empréstimos recebidos/concedidos com parcelas lançadas no fluxo financeiro.
- Receitas e despesas recorrentes com geração de 12 meses de lançamentos previstos.
- Planejamento mensal por semanas, calendário financeiro e relatórios por categoria.
- Configurações de saldo inicial, projeto e categorias.
- Modo claro/escuro, desktop e mobile/PWA.

## Observação
Os dados desta versão ficam no navegador via localStorage. A próxima etapa será substituir o armazenamento local por Supabase/Auth/RLS, sem alterar a lógica financeira já definida.
