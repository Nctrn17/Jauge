import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ContactModal } from './ContactModal'

export function AboutModal({ onClose }) {
  const [showContact, setShowContact] = useState(false)

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="modal-card about-modal-card" role="dialog" aria-modal="true" aria-label="À propos de Jauge">
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="about-content">

          <p className="about-section-titre">Pourquoi Jauge ?</p>
          <p className="about-texte">
            Ce simulateur est une initiative bénévole et indépendante, sans but lucratif.
            Jauge est conçu pour que chaque travailleur·euse de la culture puisse estimer
            ses prestations en quelques clics.
          </p>
          <p className="about-texte">
            L'accès aux acquis sociaux peut sembler parfois complexe. Jauge vient
            comme un outil d'aiguillage complémentaire aux structures officielles.
          </p>

          <p className="about-section-titre">Philosophie</p>
          <p className="about-texte">
            L'outil est gratuit et garantit une confidentialité totale. Aucune donnée n'est
            collectée, stockée, ou transmise. Ce projet a été développé seul, ce qui me
            permet une transparence totale avec le public. Tout le processus reste
            local, au sein de votre navigateur.
          </p>
          <p className="about-texte">
            Jauge s'appuie exclusivement sur des données publiques, mises à disposition de toustes.
          </p>

          <p className="about-section-titre">En soutien aux fonds d'action sociale</p>
          <p className="about-texte">
            Jauge s'appuie sur les grilles de calcul du CASC-SVP et du FNAS, dont le travail
            de solidarité est essentiel à nos métiers. L'objectif est d'encourager le recours
            à ces droits en rendant l'étape du calcul plus accessible et moins intimidante.
          </p>

          <p className="about-section-titre">Qui suis-je ?</p>
          <p className="about-texte">
            Je suis un travailleur de la culture, comme plein de gens. Mon but n'est pas de
            créer une "marque", mais de mettre mes connaissances au service du collectif pour
            que chacun·e puisse mieux comprendre et solliciter ses droits. Je suis donc très
            friand de vos retours, critiques ou suggestions pour faire évoluer l'outil.
          </p>

          <button
            type="button"
            className="about-contact-btn"
            onClick={() => setShowContact(true)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.7"/>
              <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
            Envoyer un retour ou une suggestion
          </button>

        </div>
      </div>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </>,
    document.body
  )
}
