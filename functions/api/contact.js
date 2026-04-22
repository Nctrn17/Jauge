
const TYPE_LABELS = {
  bug: 'Bug',
  suggestion: 'Suggestion',
  autre: 'Autre',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ success: false, error: 'Requête invalide' }, 400)
  }

  const { type, message, email, hp } = body ?? {}

  // Honeypot — les bots remplissent ce champ caché, on fait semblant d'accepter
  if (hp) return json({ success: true })

  if (typeof message !== 'string' || message.trim().length < 3) {
    return json({ success: false, error: 'Message trop court' }, 400)
  }
  if (message.length > 5000) {
    return json({ success: false, error: 'Message trop long' }, 400)
  }
  if (email && !EMAIL_RE.test(email)) {
    return json({ success: false, error: 'Email invalide' }, 400)
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
    return json({ success: false }, 500)
  }

  const typeLabel = TYPE_LABELS[type] ?? 'Autre'
  const from = env.CONTACT_FROM ?? 'Jauge <onboarding@resend.dev>'

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [env.CONTACT_TO],
      reply_to: email || undefined,
      subject: `[Jauge] ${typeLabel}`,
      text: `Type : ${typeLabel}\nEmail : ${email || '(non fourni)'}\n\n${message}`,
    }),
  })

  if (!resp.ok) return json({ success: false }, 500)
  return json({ success: true })
}
