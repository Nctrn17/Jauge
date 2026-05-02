import { useState, useRef } from 'react'
import { AboutModal } from './AboutModal'

const STEPS = [
  { id: 1, label: 'Vos employeurs' },
  { id: 2, label: 'Mois et foyer' },
  { id: 3, label: 'Vos droits' },
]

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

export function Sidebar({ step, fonds, onNavigate, onReset, onHome, stats }) {
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
      <div className="sidebar-brand">
        <button
          type="button"
          className="sidebar-logo"
          onClick={onHome}
          aria-label="Retour à l'accueil"
        >
          <svg className="sidebar-brand-mark" width="32" height="28" viewBox="0 0 44 38" fill="none" aria-hidden="true">
            <path d="M 5.5 4 C 5.6 13 5.8 22 6 31"    stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
            <path d="M 14 3 C 14 12 13.8 21 13.5 30"   stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
            <path d="M 22 5 C 22.1 14 22.3 22 22.5 31" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
            <path d="M 30.5 4 C 30.6 13 30.4 22 30 30" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
            <path d="M 1 32 C 12 26 25 18 40 8"        stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
          </svg>
          <span className="sidebar-brand-name">Jauge</span>
        </button>
      </div>

      <nav className="sidebar-steps" aria-label="Progression">
        <div className="sidebar-section-tag">Estimation</div>
        {STEPS.map((s) => {
          const isDone = step > s.id
          const isActive = step === s.id
          const clickable = canClick(s.id)
          return (
            <div
              key={s.id}
              className={[
                'sidebar-step',
                isActive ? 'sidebar-step--active' : '',
                isDone ? 'sidebar-step--done' : '',
                clickable ? 'sidebar-step--clickable' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => clickable && onNavigate?.(s.id)}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Étape ${s.id} : ${s.label}${isActive ? ' (en cours)' : isDone ? ' (terminée)' : ''}`}
              onKeyDown={(e) => e.key === 'Enter' && clickable && onNavigate?.(s.id)}
            >
              <span className="sidebar-step-dot" aria-hidden="true">
                {isDone ? <CheckIcon /> : <span>{s.id}</span>}
              </span>
              <span className="sidebar-step-label">{s.label}</span>
            </div>
          )
        })}
      </nav>

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

      {stats && (stats.employerCount > 0 || stats.totalMois > 0 || stats.qf != null) && (
        <dl className="sidebar-stats" aria-label="Récapitulatif de votre saisie">
          <span className="sidebar-stats-title">Votre saisie</span>
          {stats.employerCount > 0 && (
            <div className="sidebar-stat">
              <dt>Employeurs</dt>
              <dd>{stats.employerCount}</dd>
            </div>
          )}
          {stats.totalMois > 0 && (
            <div className="sidebar-stat">
              <dt>Mois cochés</dt>
              <dd>{stats.totalMois}<span className="sidebar-stat-unit"> / 12</span></dd>
            </div>
          )}
          {stats.qf != null && (
            <div className="sidebar-stat">
              <dt>Quotient familial</dt>
              <dd>{stats.qf.toLocaleString('fr-FR')}<span className="sidebar-stat-unit"> €</span></dd>
            </div>
          )}
        </dl>
      )}

      <div className="sidebar-foot-actions">
        {(step > 1 || fonds.length > 0) && (
          <button
            className={`sidebar-reset${confirmReset ? ' sidebar-reset--confirm' : ''}`}
            onClick={handleResetClick}
            type="button"
          >
            {confirmReset ? 'Confirmer la réinitialisation ?' : 'Tout recommencer'}
          </button>
        )}
      </div>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-about-link"
          onClick={() => setShowAbout(true)}
        >
          À propos de Jauge
        </button>
        <div className="sidebar-legal">
          <a href="/mentions-legales.html" className="sidebar-legal-link">Mentions légales</a>
          <span aria-hidden="true">·</span>
          <a href="/politique-de-confidentialite.html" className="sidebar-legal-link">Confidentialité</a>
        </div>
      </div>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </aside>
  )
}
