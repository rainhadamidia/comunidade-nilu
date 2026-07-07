/* ============================================================
   ILUMINNARE — Serverless function (Vercel) que recebe os
   eventos de pagamento do Asaas e promove o usuário pra Premium
   automaticamente quando a cobrança é confirmada.

   Variáveis de ambiente necessárias no projeto Vercel:
   - ASAAS_WEBHOOK_TOKEN       → gerado por nós, colado no painel do Asaas
                                  (Integrações > Webhooks > authToken)
   - ASAAS_API_KEY / ASAAS_ENV → usados apenas no fallback (buscar a
                                  subscription quando o payment não vem
                                  com externalReference)
   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY → permitem escrever em
                                  profiles.plan ignorando RLS, com
                                  segurança, pois só roda no servidor
============================================================ */

import { createClient } from '@supabase/supabase-js';

const EVENTOS_QUE_LIBERAM_PREMIUM = ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'];

function baseUrl() {
  return process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://api-sandbox.asaas.com/v3';
}

async function buscarExternalReferenceDaSubscription(subscriptionId) {
  const resp = await fetch(`${baseUrl()}/subscriptions/${subscriptionId}`, {
    headers: {
      'User-Agent': 'iluminnare-comunidade-nilu',
      access_token: process.env.ASAAS_API_KEY,
    },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data?.externalReference || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const tokenRecebido = req.headers['asaas-access-token'];
  if (!process.env.ASAAS_WEBHOOK_TOKEN || tokenRecebido !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Token de webhook inválido' });
  }

  const { event, payment } = req.body || {};
  if (!event || !payment) {
    return res.status(400).json({ error: 'Payload inesperado' });
  }

  // Confirma o recebimento mesmo para eventos que não nos interessam,
  // pra evitar que o Asaas fique reenviando o mesmo evento sem parar.
  if (!EVENTOS_QUE_LIBERAM_PREMIUM.includes(event)) {
    return res.status(200).json({ ignored: event });
  }

  try {
    let userId = payment.externalReference;
    if (!userId && payment.subscription) {
      userId = await buscarExternalReferenceDaSubscription(payment.subscription);
    }
    if (!userId) {
      console.error('Webhook Asaas sem externalReference (payment.id):', payment.id);
      return res.status(200).json({ warning: 'sem externalReference, ignorado' });
    }

    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabaseAdmin.from('profiles').update({ plan: 'premium' }).eq('user_id', userId);
    if (error) throw error;

    return res.status(200).json({ success: true, userId });
  } catch (err) {
    console.error('Erro ao processar webhook Asaas:', err);
    return res.status(500).json({ error: 'Erro inesperado ao processar webhook' });
  }
}
