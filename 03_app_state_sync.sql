-- Gestão financeira NEXORA
-- ETAPA 11: ponte de sincronização do estado atual do aplicativo.
-- Sem login/cadastro, esta tabela usa o workspace único de desenvolvimento.
-- NÃO usar esta política aberta em produção multiusuário.

CREATE TABLE IF NOT EXISTS public.app_state (
  workspace_id UUID PRIMARY KEY
    REFERENCES public.finance_workspaces(id)
    ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.app_state TO anon;

DROP POLICY IF EXISTS app_state_anon_select ON public.app_state;
CREATE POLICY app_state_anon_select
ON public.app_state
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS app_state_anon_insert ON public.app_state;
CREATE POLICY app_state_anon_insert
ON public.app_state
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS app_state_anon_update ON public.app_state;
CREATE POLICY app_state_anon_update
ON public.app_state
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- O aplicativo precisa localizar o workspace único enquanto não houver login.
GRANT SELECT ON public.finance_workspaces TO anon;

DROP POLICY IF EXISTS finance_workspaces_anon_select ON public.finance_workspaces;
CREATE POLICY finance_workspaces_anon_select
ON public.finance_workspaces
FOR SELECT
TO anon
USING (true);

-- Garante que o workspace atual tenha uma linha de estado.
INSERT INTO public.app_state (workspace_id, state)
SELECT id, '{}'::jsonb
FROM public.finance_workspaces
ORDER BY created_at
LIMIT 1
ON CONFLICT (workspace_id) DO NOTHING;
