
-- ============================================================
-- GESTÃO FINANCEIRA NEXORA
-- Supabase / PostgreSQL - estrutura V1 sem login
-- ============================================================
-- IMPORTANTE:
-- Esta V1 usa um único workspace porque o aplicativo ainda não
-- terá login/cadastro. As políticas anon permitem acesso ao workspace.
-- NÃO usar esta política aberta para uma versão comercial multiusuário.
-- Quando adicionarmos Auth, as políticas serão migradas para auth.uid().
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- utilitário ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- workspace ----------
create table if not exists public.finance_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Minha Vida Financeira',
  currency text not null default 'BRL',
  initial_balance numeric(14,2) not null default 0,
  start_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- cria exatamente um workspace inicial para a V1 sem login
insert into public.finance_workspaces (name, currency, initial_balance)
select 'Minha Vida Financeira', 'BRL', 0
where not exists (select 1 from public.finance_workspaces);

-- ---------- fontes de dinheiro ----------
create table if not exists public.financial_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  name text not null,
  type text not null default 'outro'
    check (type in ('caixa','conta_bancaria','pix','carteira','poupanca','investimento','outro')),
  initial_balance numeric(14,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- categorias ----------
create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('receita','despesa','ambos')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, name, kind)
);

-- ---------- credores / beneficiários / origens ----------
create table if not exists public.financial_contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  name text not null,
  kind text not null default 'outro'
    check (kind in ('pessoa_fisica','instituicao','banco','cartao','empresa','outro')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, name)
);

-- ---------- receitas ----------
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  category_id uuid references public.financial_categories(id) on delete set null,
  source_id uuid references public.financial_sources(id) on delete set null,
  contact_id uuid references public.financial_contacts(id) on delete set null,
  description text not null,
  amount numeric(14,2) not null check (amount >= 0),
  due_date date,
  received_at timestamptz,
  status text not null default 'prevista'
    check (status in ('prevista','recebida','cancelada')),
  needs_repayment boolean not null default false,
  repayment_due_date date,
  repayment_note text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- compromissos financeiros ----------
create table if not exists public.financial_commitments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  category_id uuid references public.financial_categories(id) on delete set null,
  creditor_id uuid references public.financial_contacts(id) on delete set null,
  payment_source_id uuid references public.financial_sources(id) on delete set null,
  description text not null,
  kind text not null
    check (kind in ('despesa','divida','emprestimo','cartao')),
  amount numeric(14,2) not null check (amount >= 0),
  due_date date,
  status text not null default 'previsto'
    check (status in ('previsto','pendente','pago','atrasado','cancelado')),
  priority text not null default 'normal'
    check (priority in ('normal','media','alta','critica')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- dívidas ----------
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  creditor_id uuid references public.financial_contacts(id) on delete set null,
  payment_source_id uuid references public.financial_sources(id) on delete set null,
  description text not null,
  original_amount numeric(14,2) not null check (original_amount >= 0),
  current_amount numeric(14,2) not null check (current_amount >= 0),
  status text not null default 'aberta'
    check (status in ('prevista','aberta','quitada','cancelada')),
  first_due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- empréstimos ----------
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  creditor_id uuid references public.financial_contacts(id) on delete set null,
  payment_source_id uuid references public.financial_sources(id) on delete set null,
  credit_card_id uuid,
  description text not null,
  received_amount numeric(14,2) not null check (received_amount >= 0),
  installment_count integer not null default 1 check (installment_count > 0),
  installment_amount numeric(14,2) not null check (installment_amount >= 0),
  total_to_pay numeric(14,2) generated always as
    (installment_count * installment_amount) stored,
  first_due_date date,
  status text not null default 'previsto'
    check (status in ('previsto','recebido','quitado','cancelado')),
  received_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- cartões de crédito ----------
create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  name text not null,
  issuer text,
  limit_amount numeric(14,2) not null default 0,
  closing_day integer check (closing_day between 1 and 31),
  due_day integer check (due_day between 1 and 31),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- FK tardia do empréstimo para cartão
alter table public.loans
  drop constraint if exists loans_credit_card_id_fkey;
alter table public.loans
  add constraint loans_credit_card_id_fkey
  foreign key (credit_card_id) references public.credit_cards(id) on delete set null;

-- ---------- compras no cartão ----------
create table if not exists public.credit_card_purchases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  credit_card_id uuid not null references public.credit_cards(id) on delete restrict,
  creditor_id uuid references public.financial_contacts(id) on delete set null,
  description text not null,
  purchase_date date not null default current_date,
  total_amount numeric(14,2) not null check (total_amount >= 0),
  installment_count integer not null default 1 check (installment_count > 0),
  installment_amount numeric(14,2) not null check (installment_amount >= 0),
  first_due_date date,
  status text not null default 'aberta'
    check (status in ('prevista','aberta','quitada','cancelada')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- parcelas ----------
create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  debt_id uuid references public.debts(id) on delete cascade,
  loan_id uuid references public.loans(id) on delete cascade,
  purchase_id uuid references public.credit_card_purchases(id) on delete cascade,
  installment_number integer not null check (installment_number > 0),
  due_date date not null,
  amount numeric(14,2) not null check (amount >= 0),
  payment_source_id uuid references public.financial_sources(id) on delete set null,
  status text not null default 'prevista'
    check (status in ('prevista','paga','atrasada','cancelada')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (case when debt_id is not null then 1 else 0 end) +
    (case when loan_id is not null then 1 else 0 end) +
    (case when purchase_id is not null then 1 else 0 end) = 1
  )
);

-- ---------- livro caixa ----------
create table if not exists public.cash_registers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  business_date date not null,
  opening_balance numeric(14,2) not null default 0,
  closing_balance numeric(14,2),
  total_in numeric(14,2) not null default 0,
  total_out numeric(14,2) not null default 0,
  net_result numeric(14,2) not null default 0,
  status text not null default 'aberto'
    check (status in ('aberto','fechado')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, business_date)
);

create table if not exists public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  cash_register_id uuid not null references public.cash_registers(id) on delete cascade,
  workspace_id uuid not null references public.finance_workspaces(id) on delete cascade,
  direction text not null check (direction in ('entrada','saida')),
  amount numeric(14,2) not null check (amount > 0),
  description text not null,
  category_id uuid references public.financial_categories(id) on delete set null,
  source_id uuid references public.financial_sources(id) on delete set null,
  contact_id uuid references public.financial_contacts(id) on delete set null,
  occurred_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- configurações ----------
create table if not exists public.project_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.finance_workspaces(id) on delete cascade,
  default_currency text not null default 'BRL',
  first_day_of_week integer not null default 1 check (first_day_of_week between 0 and 6),
  workweek_enabled boolean not null default false,
  theme text not null default 'light' check (theme in ('light','dark','system')),
  updated_at timestamptz not null default now()
);

-- ---------- índices ----------
create index if not exists idx_sources_workspace on public.financial_sources(workspace_id);
create index if not exists idx_categories_workspace on public.financial_categories(workspace_id);
create index if not exists idx_contacts_workspace on public.financial_contacts(workspace_id);
create index if not exists idx_receipts_workspace_date on public.receipts(workspace_id, due_date);
create index if not exists idx_commitments_workspace_date on public.financial_commitments(workspace_id, due_date);
create index if not exists idx_debts_workspace on public.debts(workspace_id);
create index if not exists idx_loans_workspace on public.loans(workspace_id);
create index if not exists idx_cards_workspace on public.credit_cards(workspace_id);
create index if not exists idx_purchases_workspace on public.credit_card_purchases(workspace_id, purchase_date);
create index if not exists idx_installments_workspace_date on public.installments(workspace_id, due_date);
create index if not exists idx_cash_registers_workspace_date on public.cash_registers(workspace_id, business_date);
create index if not exists idx_cash_movements_register on public.cash_movements(cash_register_id);

-- ---------- updated_at triggers ----------
drop trigger if exists trg_workspace_updated on public.finance_workspaces;
create trigger trg_workspace_updated before update on public.finance_workspaces
for each row execute function public.set_updated_at();

drop trigger if exists trg_sources_updated on public.financial_sources;
create trigger trg_sources_updated before update on public.financial_sources
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated on public.financial_categories;
create trigger trg_categories_updated before update on public.financial_categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_contacts_updated on public.financial_contacts;
create trigger trg_contacts_updated before update on public.financial_contacts
for each row execute function public.set_updated_at();

drop trigger if exists trg_receipts_updated on public.receipts;
create trigger trg_receipts_updated before update on public.receipts
for each row execute function public.set_updated_at();

drop trigger if exists trg_commitments_updated on public.financial_commitments;
create trigger trg_commitments_updated before update on public.financial_commitments
for each row execute function public.set_updated_at();

drop trigger if exists trg_debts_updated on public.debts;
create trigger trg_debts_updated before update on public.debts
for each row execute function public.set_updated_at();

drop trigger if exists trg_loans_updated on public.loans;
create trigger trg_loans_updated before update on public.loans
for each row execute function public.set_updated_at();

drop trigger if exists trg_cards_updated on public.credit_cards;
create trigger trg_cards_updated before update on public.credit_cards
for each row execute function public.set_updated_at();

drop trigger if exists trg_purchases_updated on public.credit_card_purchases;
create trigger trg_purchases_updated before update on public.credit_card_purchases
for each row execute function public.set_updated_at();

drop trigger if exists trg_installments_updated on public.installments;
create trigger trg_installments_updated before update on public.installments
for each row execute function public.set_updated_at();

drop trigger if exists trg_cash_registers_updated on public.cash_registers;
create trigger trg_cash_registers_updated before update on public.cash_registers
for each row execute function public.set_updated_at();

drop trigger if exists trg_cash_movements_updated on public.cash_movements;
create trigger trg_cash_movements_updated before update on public.cash_movements
for each row execute function public.set_updated_at();

drop trigger if exists trg_project_settings_updated on public.project_settings;
create trigger trg_project_settings_updated before update on public.project_settings
for each row execute function public.set_updated_at();

-- ---------- dados iniciais ----------
do $$
declare
  ws uuid;
begin
  select id into ws from public.finance_workspaces order by created_at limit 1;

  insert into public.project_settings (workspace_id)
  values (ws)
  on conflict (workspace_id) do nothing;

  insert into public.financial_sources (workspace_id, name, type)
  select ws, v.name, v.type
  from (values
    ('Caixa','caixa'),
    ('Conta bancária','conta_bancaria'),
    ('Pix','pix'),
    ('Carteira','carteira')
  ) as v(name,type)
  where not exists (
    select 1 from public.financial_sources s
    where s.workspace_id=ws and s.name=v.name
  );

  insert into public.financial_categories (workspace_id, name, kind)
  select ws, v.name, v.kind
  from (values
    ('Salário','receita'),
    ('Trabalho','receita'),
    ('Freelance','receita'),
    ('Outros recebimentos','receita'),
    ('Moradia','despesa'),
    ('Alimentação','despesa'),
    ('Transporte','despesa'),
    ('Saúde','despesa'),
    ('Educação','despesa'),
    ('Lazer','despesa'),
    ('Assinaturas','despesa'),
    ('Cartão de crédito','despesa'),
    ('Empréstimos','despesa'),
    ('Impostos','despesa'),
    ('Outras despesas','despesa')
  ) as v(name,kind)
  where not exists (
    select 1 from public.financial_categories c
    where c.workspace_id=ws and c.name=v.name and c.kind=v.kind
  );
end $$;

-- ---------- atraso automático ----------
create or replace function public.refresh_overdue_statuses()
returns void
language plpgsql
as $$
begin
  update public.financial_commitments
     set status='atrasado',
         priority=case
           when current_date - due_date >= 8 then 'critica'
           when current_date - due_date >= 3 then 'alta'
           else 'media'
         end
   where due_date < current_date
     and status in ('previsto','pendente');

  update public.installments
     set status='atrasada'
   where due_date < current_date
     and status='prevista';
end;
$$;

-- ---------- RLS ----------
-- V1 sem login: acesso público controlado ao workspace único.
-- Quando Auth for implantado, estas policies deverão ser substituídas
-- por policies usando auth.uid().

alter table public.finance_workspaces enable row level security;
alter table public.financial_sources enable row level security;
alter table public.financial_categories enable row level security;
alter table public.financial_contacts enable row level security;
alter table public.receipts enable row level security;
alter table public.financial_commitments enable row level security;
alter table public.debts enable row level security;
alter table public.loans enable row level security;
alter table public.credit_cards enable row level security;
alter table public.credit_card_purchases enable row level security;
alter table public.installments enable row level security;
alter table public.cash_registers enable row level security;
alter table public.cash_movements enable row level security;
alter table public.project_settings enable row level security;

-- Remove policies da V1 caso o script seja executado novamente.
do $$
declare
  t text;
begin
  foreach t in array array[
    'finance_workspaces','financial_sources','financial_categories',
    'financial_contacts','receipts','financial_commitments','debts',
    'loans','credit_cards','credit_card_purchases','installments',
    'cash_registers','cash_movements','project_settings'
  ] loop
    execute format('drop policy if exists "v1 anon full access" on public.%I', t);
    execute format('create policy "v1 anon full access" on public.%I for all to anon using (true) with check (true)', t);
  end loop;
end $$;

-- Permissões para a Data API.
grant select, insert, update, delete on all tables in schema public to anon;
grant usage, select on all sequences in schema public to anon;

-- ---------- views úteis ----------
create or replace view public.v_finance_summary as
select
  w.id as workspace_id,
  w.name,
  w.currency,
  w.initial_balance,
  coalesce((select sum(r.amount) from public.receipts r
            where r.workspace_id=w.id and r.status='recebida'),0) as received_total,
  coalesce((select sum(c.amount) from public.financial_commitments c
            where c.workspace_id=w.id and c.status='pago'),0) as paid_total,
  coalesce((select sum(c.amount) from public.financial_commitments c
            where c.workspace_id=w.id and c.status in ('previsto','pendente','atrasado')),0) as open_commitments,
  coalesce((select sum(r.amount) from public.receipts r
            where r.workspace_id=w.id and r.status='prevista'),0) as expected_receipts
from public.finance_workspaces w;

grant select on public.v_finance_summary to anon;

-- Verificação rápida:
select 'finance_workspaces' as table_name, count(*) as rows from public.finance_workspaces
union all select 'financial_sources', count(*) from public.financial_sources
union all select 'financial_categories', count(*) from public.financial_categories
union all select 'financial_contacts', count(*) from public.financial_contacts
union all select 'receipts', count(*) from public.receipts
union all select 'financial_commitments', count(*) from public.financial_commitments
union all select 'debts', count(*) from public.debts
union all select 'loans', count(*) from public.loans
union all select 'credit_cards', count(*) from public.credit_cards
union all select 'credit_card_purchases', count(*) from public.credit_card_purchases
union all select 'installments', count(*) from public.installments
union all select 'cash_registers', count(*) from public.cash_registers
union all select 'cash_movements', count(*) from public.cash_movements
union all select 'project_settings', count(*) from public.project_settings;
