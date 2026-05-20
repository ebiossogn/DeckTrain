import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = process.env.SMTP_FROM ?? 'DeckTrain <noreply@decktrain.com>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Confirmez votre inscription — DeckTrain',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#111111;font-family:'DM Sans',Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#1C1C1C;border-radius:16px;overflow:hidden;border:1px solid #2E2E2E;">
          <div style="padding:28px 32px 20px;border-bottom:1px solid #2E2E2E;">
            <span style="font-size:20px;font-weight:700;color:#ffffff;">Deck</span><span style="font-size:20px;font-weight:700;color:#C8B89A;">Train</span>
          </div>
          <div style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#CCCCCC;">Bonjour ${name} 👋</h1>
            <p style="margin:0 0 24px;color:#888888;line-height:1.6;font-size:15px;">
              Merci de vous être inscrit(e) sur DeckTrain. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.
            </p>
            <a href="${url}" style="display:inline-block;padding:14px 28px;background:#00D4FF;color:#111111;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
              Confirmer mon email
            </a>
            <p style="margin:24px 0 0;color:#555555;font-size:12px;line-height:1.6;">
              Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.<br>
              Ou copiez ce lien : <span style="color:#00D4FF;">${url}</span>
            </p>
          </div>
          <div style="padding:16px 32px;border-top:1px solid #2E2E2E;text-align:center;">
            <p style="margin:0;font-size:11px;color:#555555;">© CHRIST J. — DeckTrain</p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}
