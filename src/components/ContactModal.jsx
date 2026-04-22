import { useState } from 'react'
import { createPortal } from 'react-dom'

export function ContactModal({ onClose }) {
  const [type, setType]       = useState('suggestion')
  const [message, setMessage] = useState('')
  const [email, setEmail]     = useState('')
  const [hp, setHp]           = useState('') // honeypot anti-bot
  const [status, setStatus]   = useState('idle') // idle | sending | success | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, email, hp }),
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Contact et retours">
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {status === 'success' ? (
          <div className="modal-success">
            <div className="modal-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="var(--emerald)" strokeWidth="1.5"/>
                <path d="M7 12l3.5 3.5L17 8" stroke="var(--emerald)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="modal-success-title">Message envoyé</p>
            <p className="modal-success-text">Merci pour votre retour !</p>
            <button className="btn-modal-submit" onClick={onClose}>Fermer</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form" noValidate>
            <p className="modal-title">Contact &amp; retours</p>
            <p className="modal-disclaimer">
              Pour toute question sur vos droits ou le fonctionnement des fonds, contactez
              directement le{' '}
              <a href="https://www.casc-svp.fr" target="_blank" rel="noopener noreferrer">CASC-SVP</a>
              {' '}ou le{' '}
              <a href="https://fnas.net" target="_blank" rel="noopener noreferrer">FNAS</a>.
               <br /><strong>Jauge ne remplace pas leur expertise.</strong>
            </p>

            {/* Honeypot — caché visuellement et aux lecteurs d'écran, visible aux bots */}
            <input
              type="text"
              name="hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="sr-only"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
            />

            <label className="modal-label">
              Type de retour
              <select value={type} onChange={(e) => setType(e.target.value)} className="modal-select">
                <option value="bug">Bug ou dysfonctionnement</option>
                <option value="suggestion">Suggestion</option>
                <option value="autre">Autre</option>
              </select>
            </label>

            <label className="modal-label">
              <span> Message<span className="modal-required"> *</span></span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="modal-textarea"
                placeholder="Décrivez le problème ou votre suggestion..."
                required
                rows={5}
              />
            </label>

            <label className="modal-label">
              Votre email
              <span className="modal-optional"> Optionnel, pour que je puisse vous répondre</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modal-input"
                placeholder="ton@email.com"
              />
            </label>

            {status === 'error' && (
              <p className="modal-error">
                Une erreur s'est produite. Réessayez dans un instant.
              </p>
            )}

            <button
              type="submit"
              className="btn-modal-submit"
              disabled={status === 'sending' || !message.trim()}
            >
              {status === 'sending' ? 'Envoi en cours…' : 'Envoyer →'}
            </button>
          </form>
        )}
      </div>
    </>,
    document.body
  )
}
