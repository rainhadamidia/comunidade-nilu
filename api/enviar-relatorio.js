/* ============================================================
   ILUMINNARE — Serverless function (Vercel) para envio do
   relatório PCI em PDF por e-mail via Resend.

   Variáveis de ambiente necessárias no projeto Vercel:
   - RESEND_API_KEY   → gerada em resend.com/api-keys
   - RESEND_FROM_EMAIL → ex: "ILUMINNARE <relatorio@iluminnare.rainhadamidia.online>"
                          (precisa ser um domínio verificado no Resend;
                          sem isso, cai no sandbox onboarding@resend.dev,
                          que só entrega para o e-mail dono da conta Resend)
============================================================ */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { nome, email, pdfBase64 } = req.body || {};
  if (!nome || !email || !pdfBase64) {
    return res.status(400).json({ error: 'Dados incompletos: nome, email e pdfBase64 são obrigatórios' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'ILUMINNARE <onboarding@resend.dev>';

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurada no ambiente da Vercel' });
  }

  const conteudoBase64 = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64;
  const primeiroNome = nome.trim().split(' ')[0];

  try {
    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `${primeiroNome}, seu Mapa Comportamental ILUMINNARE chegou`,
        html: `
          <div style="font-family:sans-serif;color:#1a1a2e;line-height:1.6;">
            <h2 style="margin-bottom:4px;">Olá, ${primeiroNome}!</h2>
            <p>Seu relatório completo de mapeamento comportamental está em anexo, em PDF.</p>
            <p>Este diagnóstico é uma ferramenta de autoconhecimento baseada em autoavaliação e não substitui acompanhamento psicológico ou psiquiátrico profissional.</p>
            <p style="margin-top:24px;color:#64748B;font-size:13px;">Equipe ILUMINNARE · dados tratados conforme a LGPD (Lei 13.709/2018)</p>
          </div>
        `,
        attachments: [{ filename: 'relatorio-iluminnare.pdf', content: conteudoBase64 }],
      }),
    });

    const data = await resendResp.json();
    if (!resendResp.ok) {
      return res.status(resendResp.status).json({ error: data.message || 'Falha ao enviar e-mail pelo Resend' });
    }
    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    return res.status(500).json({ error: 'Erro inesperado ao enviar e-mail' });
  }
}
