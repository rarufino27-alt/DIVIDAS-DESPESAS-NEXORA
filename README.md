# RAQVOR V2.10 — Desktop + Mobile + Assistente + Central Administrativa

Esta versão parte da V1.15 como base funcional e incorpora a arquitetura definida na conversa.

## 1. Desktop
- Sistema financeiro completo.
- Dashboard, Livro Caixa, Dívidas e Despesas, Cartões, Empréstimos, Calendário, Planejamento, Relatórios e Configurações.
- Suporte integrado.
- Preparado para ciclos financeiros configuráveis, pagamentos único/parcelado/recorrente e credores separados.

## 2. Mobile
- Interface própria e compacta.
- Hoje, Semana, Mês e Ciclo.
- Caixa, a pagar, a receber e busca diária.
- Assistente Financeiro conversacional.
- Respostas guiadas + texto livre + reconhecimento de voz do navegador.
- Suporte ao cliente com tickets e mensagens de voz.
- O assistente mostra resumo e exige confirmação antes de registrar uma operação.
- Há fallback local guiado caso a Edge Function de IA ainda não esteja implantada.

## 3. Assistente Financeiro IA
O Mobile chama `supabase/functions/raquor-ai` quando disponível. A função devolve uma operação estruturada; o cliente confirma antes de executar.

Para IA real, configure no Supabase Edge Functions:
- `OPENAI_API_KEY`
- opcional `RAQVOR_AI_MODEL`

A chave da IA **não deve** aparecer no APK, navegador ou GitHub. Supabase recomenda manter chaves secretas somente em componentes server-side/Edge Functions; a chave publishable é apropriada para clientes com RLS. A Edge Function usa a Responses API com Structured Outputs para manter a resposta em um formato previsível. citeturn0search0turn0search5turn1search0

## 4. Central Administrativa
Em `admin/`:
- login administrativo separado;
- usuários;
- bloquear/reativar acesso;
- tickets e SLA de até 72h;
- respostas de texto e voz;
- sessões temporárias de suporte;
- visão em tempo real do `app_state` durante sessão autorizada;
- auditoria das ações administrativas.

O acesso de suporte é temporário e auditado. O painel não recebe service-role/secret key no navegador.

## 5. Supabase
Execute:
`supabase/migrations/20260822_raqvor_commercial_support.sql`

Depois crie o primeiro administrador usando o bootstrap no final da migration.

Depois implante a Edge Function `raquor-ai` e configure `OPENAI_API_KEY` nos Secrets do Supabase.

## 6. Internacionalização/comercial
A migration inclui `customer_accounts` para país, idioma, moeda, fuso e plano/status de assinatura. Isso deixa o produto preparado para Brasil, EUA e Europa sem amarrar a lógica financeira ao BRL.

Para cobrança do SaaS, a arquitetura deve usar um gateway internacional por trás de Edge Functions/webhooks. Stripe atualmente lista Brasil, EUA e muitos países europeus entre as regiões suportadas; Mercado Pago tem forte cobertura na América Latina; Adyen possui cobertura internacional ampla. A escolha definitiva do gateway deve ser feita na fase de billing conforme país da empresa, impostos, métodos de pagamento e App Store/Google Play. citeturn3search0turn3search6turn3search8
