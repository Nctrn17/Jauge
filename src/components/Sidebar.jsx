import { useState, useRef } from 'react'
import { AboutModal } from './AboutModal'

const STEPS = [
  { id: 1, label: 'Employeurs' },
  { id: 2, label: 'Calcul' },
  { id: 3, label: 'Résultats', highlight: true },
]



export function Sidebar({ step, fonds, onNavigate, onReset, onHome }) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const confirmTimerRef = useRef(null)

  const handleResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      confirmTimerRef.current = setTimeout(() => setConfirmReset(false), 4000)
    } else {
      clearTimeout(confirmTimerRef.current)
      setConfirmReset(false)
      onReset?.()
    }
  }

  const canClick = (id) => {
    if (id === 1) return step > 1
    if (id === 2) return step > 2 || (step === 1 && fonds.length > 0)
    return false
  }
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <button type="button" className="sidebar-logo" onClick={onHome} aria-label="Retour à l'accueil">
          <svg width="56" height="52" viewBox="0 0 44 38" fill="none">
            <path d="M 5.5 4 C 5.6 13 5.8 22 6 31"    stroke="white" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
            <path d="M 14 3 C 14 12 13.8 21 13.5 30"   stroke="white" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
            <path d="M 22 5 C 22.1 14 22.3 22 22.5 31" stroke="white" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
            <path d="M 30.5 4 C 30.6 13 30.4 22 30 30" stroke="white" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
            <path d="M 1 32 C 12 26 25 18 40 8"         stroke="white" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
          </svg>
        </button>
      </div>

      {/* Étapes */}
      <nav className="sidebar-steps" aria-label="Progression">
        {STEPS.map((s) => {
          const isDone = step > s.id
          const isActive = step === s.id
          return (
            <div
              key={s.id}
              className={[
                'sidebar-step',
                isActive ? 'sidebar-step--active' : '',
                isDone ? 'sidebar-step--done' : '',
                canClick(s.id) ? 'sidebar-step--clickable' : '',
                s.highlight ? 'sidebar-step--highlight' : '',
              ].join(' ')}
              onClick={() => canClick(s.id) && onNavigate?.(s.id)}
              role={canClick(s.id) ? 'button' : undefined}
              tabIndex={canClick(s.id) ? 0 : undefined}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Étape ${s.id} : ${s.label}${isActive ? ' (en cours)' : isDone ? ' (terminée)' : ''}`}
              onKeyDown={(e) => e.key === 'Enter' && canClick(s.id) && onNavigate?.(s.id)}
            >
              <div className="sidebar-step-track">
                <div className="sidebar-step-dot">
                  {isDone ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <polyline
                        points="2,5 4.2,7.2 8,3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span>{s.id}</span>
                  )}
                </div>
                {s.id < STEPS.length && <div className="sidebar-step-line" />}
              </div>
              <div className="sidebar-step-text">
                <span className="sidebar-step-label">{s.label}</span>
                <span className="sidebar-step-desc">{s.desc}</span>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Fonds détectés */}
      {fonds.length > 0 && (
        <div className="sidebar-fonds">
          <span className="sidebar-fonds-title">Fonds détectés</span>
          {fonds.map((f) => (
            <div key={f.id} className="sidebar-fonds-item">
              <span className="sidebar-fonds-dot" style={{ background: f.couleur }} />
              <span className="sidebar-fonds-nom">{f.nom}</span>
            </div>
          ))}
        </div>
      )}


      {/* Reset */}
      {(step > 1 || fonds.length > 0) && (
        <button
          className={`sidebar-reset${confirmReset ? ' sidebar-reset--confirm' : ''}`}
          onClick={handleResetClick}
          type="button"
        >
          {confirmReset ? 'Confirmer la réinitialisation ?' : 'Tout recommencer'}
        </button>
      )}

      {/* À propos */}
      <button
        type="button"
        className="sidebar-about-btn"
        onClick={() => setShowAbout(true)}
      >
        À propos de Jauge
      </button>

      {/* Footer */}
      <div className="sidebar-footer">
        <a href="/mentions-legales.html" className="sidebar-legal-link">Mentions légales</a>
        <span className="sidebar-legal-sep" aria-hidden="true">·</span>
        <a href="/politique-de-confidentialite.html" className="sidebar-legal-link">Confidentialité</a>
      </div>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </aside>
  )
}
