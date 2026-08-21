# RAFLO FINANCE V1.19

Base: Gestão Financeira NEXORA V1.15 enviada pelo usuário.

## Alterações desta versão
- Nome e identidade visual: RAFLO FINANCE.
- Refinamento visual minimalista e responsivo, sem remoção dos módulos ou fluxos existentes.
- Menu lateral e cabeçalho compactados.
- Cartões, empréstimos, dívidas/despesas, Livro Caixa, Receitas, Planejamento, Calendário Financeiro, Relatórios, Configurações, autenticação, workspace, Supabase, Realtime e cache/offline preservados.
- Pagamento recorrente passa a ser uma opção de "Tipo de pagamento" no lançamento: Único, Parcelado ou Recorrente — mesmo valor e mesma data.
- A estrutura existente `db.recurring` é reutilizada; não foi criada uma nova tabela Supabase nesta versão.

## Importante
Nenhuma migration do Supabase é necessária para a V1.19. A versão reaproveita a estrutura de estado e sincronização já existente na V1.15.
