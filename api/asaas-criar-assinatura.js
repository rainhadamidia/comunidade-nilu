/* ============================================================
   ILUMINNARE — Serverless function (Vercel) para criar a
   assinatura Premium recorrente no Asaas e devolver o link de
   checkout (invoiceUrl) para o usuário pagar.

   Variáveis de ambiente necessárias no projeto Vercel:
   - ASAAS_API_KEY → gerada em asaas.com > Integrações > Chaves de API
   - ASAAS_ENV     → "sandbox" (padrão/teste) ou "production"
============================================================ */

const PLANO_VALOR = 797;
const PLANO_CICLO = 'MONTHLY';
const PLANO_DESCRICAO = 'Iluminnados Premium — assinatura mensal';

function baseUrl() {
  return process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://api-sandbox.asaas.com/v3';
}

async function asaasFetch(path, options = {}) {
  const resp = await fetch(`${baseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'iluminnare-comunidade-nilu',
      access_token: process.env.ASAAS_API_KEY,
      ...(options.headers || {}),
    },
  });
  const data = await resp.json();
  if (!resp.ok) {
    const msg = data?.errors?.[0]?.description || 'Erro ao chamar a API do Asaas';
    throw new Error(msg);
  }
  return data;
}

function somenteDigitos(v) {
  return (v || '').replace(/\D/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { userId, nome, email, cpf } = req.body || {};
  const cpfCnpj = somenteDigitos(cpf);

  if (!userId || !nome || !email || !cpfCnpj) {
    return res.status(400).json({ error: 'Dados incompletos: userId, nome, email e cpf são obrigatórios' });
  }
  if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
    return res.status(400).json({ error: 'CPF/CNPJ inválido' });
  }
  if (!process.env.ASAAS_API_KEY) {
    return res.status(500).json({ error: 'ASAAS_API_KEY não configurada no ambiente da Vercel' });
  }

  try {
    // 1) Reaproveita o cliente Asaas se esse usuário já tiver um (evita duplicar cadastro a cada tentativa).
    const existentes = await asaasFetch(`/customers?externalReference=${encodeURIComponent(userId)}`);
    let customerId = existentes?.data?.[0]?.id;

    if (!customerId) {
      const customer = await asaasFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({ name: nome, email, cpfCnpj, externalReference: userId }),
      });
      customerId = customer.id;
    }

    // 2) Cria a assinatura mensal recorrente vinculada a esse cliente.
    const hoje = new Date().toISOString().slice(0, 10);
    const subscription = await asaasFetch('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED',
        value: PLANO_VALOR,
        nextDueDate: hoje,
        cycle: PLANO_CICLO,
        description: PLANO_DESCRICAO,
        externalReference: userId,
      }),
    });

    // 3) Busca a primeira cobrança gerada pela assinatura para pegar o link de checkout (invoiceUrl).
    const pagamentos = await asaasFetch(`/payments?subscription=${subscription.id}`);
    const primeiraCobranca = pagamentos?.data?.[0];

    if (!primeiraCobranca?.invoiceUrl) {
      throw new Error('Assinatura criada, mas não foi possível obter o link de pagamento');
    }

    return res.status(200).json({ invoiceUrl: primeiraCobranca.invoiceUrl, subscriptionId: subscription.id });
  } catch (err) {
    console.error('Erro ao criar assinatura Asaas:', err);
    return res.status(500).json({ error: err.message || 'Erro inesperado ao criar assinatura' });
  }
}
