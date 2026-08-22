import { withSupabase } from 'npm:@supabase/server'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    assistant_text: { type: 'string' },
    choices: { type: 'array', items: { type: 'string' } },
    ready: { type: 'boolean' },
    missing_fields: { type: 'array', items: { type: 'string' } },
    operation: {
      type: 'object', additionalProperties: false,
      properties: {
        kind: { type: 'string' },
        intent: { type: 'string' },
        amount: { type: 'number' },
        creditor: { type: 'string' },
        card_id: { type: 'string' },
        description: { type: 'string' },
        date: { type: 'string' },
        first_due_date: { type: 'string' },
        installments: { type: 'integer' },
        installment_value: { type: 'number' },
        interest: { type: 'number' },
        total_payable: { type: 'number' },
        payment_type: { type: 'string' },
        source: { type: 'string' },
        repayment_needed: { type: 'boolean' },
        linked_payments: { type: 'array', items: { type: 'object', additionalProperties: true } },
      },
      required: ['kind','intent','amount','creditor','card_id','description','date','first_due_date','installments','installment_value','interest','total_payable','payment_type','source','repayment_needed','linked_payments']
    }
  },
  required: ['assistant_text','choices','ready','missing_fields','operation']
}

export default withSupabase({ auth: 'user' }, async (req, ctx) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors })

  const body = await req.json().catch(() => ({}))
  const context = body.context ?? {}
  const messages = Array.isArray(body.messages) ? body.messages : []
  const today = new Date().toISOString().slice(0, 10)

  const system = `Você é o Assistente Financeiro do RAQVOR. Sua função é organizar operações financeiras do usuário, não tomar decisões silenciosas.

REGRAS:
1. Faça perguntas curtas e guiadas quando faltarem dados. O usuário pode responder por texto, voz transcrita ou opções.
2. Nunca invente credor, cartão, valor, data, parcelas, juros ou fonte.
3. Para uma operação financeira composta, represente todas as consequências: entrada, nova obrigação e pagamentos vinculados.
4. Diferencie pagamento único, parcelado/mensal e recorrente.
5. Em cartão, respeite o cartão específico e não misture cartões diferentes.
6. Em empréstimo recebido, diferencie principal recebido, juros/custo e total a devolver. Se o dinheiro foi usado para quitar dívidas, coloque essas quitações em linked_payments.
7. O vencimento contratual e a data planejada de pagamento podem ser diferentes; preserve ambos quando aplicável.
8. Quando houver uma pergunta com poucas respostas naturais, preencha choices com até 6 opções curtas.
9. Só marque ready=true quando houver dados suficientes para registrar com segurança.
10. O sistema só executará a operação depois que o usuário confirmar o resumo.
11. Responda em português brasileiro, simples e profissional.

Hoje: ${today}
Perfil/configurações do usuário: ${JSON.stringify(context.profile ?? {})}
Credores cadastrados: ${JSON.stringify(context.creditors ?? [])}
Cartões cadastrados: ${JSON.stringify(context.cards ?? [])}
Ciclo financeiro: ${JSON.stringify(context.cycle ?? {})}`

  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) return Response.json({ error: 'OPENAI_API_KEY não configurada na Edge Function.' }, { status: 503, headers: cors })

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
    body: JSON.stringify({
      model: Deno.env.get('RAQVOR_AI_MODEL') || 'gpt-5.6-luna',
      store: false,
      instructions: system,
      input: messages,
      text: { format: { type: 'json_schema', name: 'raquor_operation', strict: true, schema } },
    }),
  })
  if (!response.ok) return Response.json({ error: await response.text() }, { status: 502, headers: cors })
  const data = await response.json()
  const raw = data.output?.flatMap((x: any) => x.content ?? []).find((x: any) => x.type === 'output_text')?.text
  if (!raw) return Response.json({ error: 'Resposta estruturada não retornada.' }, { status: 502, headers: cors })
  return new Response(raw, { headers: { ...cors, 'Content-Type': 'application/json' } })
})
