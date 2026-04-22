import { useState } from 'react'
import avisExemplePNG from '../assets/avis jauge.png'

const AIDE_PAR_SITUATION = {
  celibataire: {
    titre: 'Célibataire',
    texte: 'Utilisez votre propre avis d\'imposition 2025 (sur revenus 2024). Repérez la ligne "Revenu fiscal de référence" en bas de la première page.',
    champs: ['Votre RFR uniquement'],
  },
  celibataire_seul: {
    titre: 'Célibataire vivant seul',
    texte: 'Utilisez votre propre avis d\'imposition 2025. Vous devrez également fournir un certificat sur l\'honneur attestant que vous viviez seul·e sans colocation au 01/01/2025.',
    champs: ['Votre RFR uniquement'],
  },
  parent_isole: {
    titre: 'Parent isolé',
    texte: 'Utilisez votre propre avis d\'imposition 2025. La case T doit apparaître sur votre avis pour valider la situation de parent isolé.',
    champs: ['Votre RFR uniquement', 'Case T visible sur l\'avis'],
  },
  couple: {
    titre: 'Couple marié·e ou pacsé·e',
    texte: 'Si vous avez une déclaration commune, un seul avis suffit avec le RFR total. Si vous avez des déclarations séparées, entrez votre RFR ET celui de votre conjoint·e.',
    champs: ['Votre RFR', 'RFR de votre conjoint·e si déclarations séparées'],
  },
  colocataire: {
    titre: 'Concubin·e / Couple non déclaré',
    texte: 'Chacun·e a son propre avis d\'imposition. Vous devez fournir votre avis ET l\'avis de votre concubin·e, à condition qu\'il·elle soit à la même adresse fiscale que vous. L\'avis d\'imposition est le seul document accepté.',
    champs: ['Votre RFR', 'RFR de votre concubin·e (même adresse fiscale obligatoire)'],
  },
}

export function RFRHelp({ situation }) {
  const [ouvert, setOuvert] = useState(false)
  const aide = AIDE_PAR_SITUATION[situation] ?? AIDE_PAR_SITUATION.celibataire

  return (
    <div className="rfr-help">
      <button
        className="rfr-help-toggle"
        onClick={() => setOuvert((v) => !v)}
        type="button"
      >
        <span className="rfr-help-icon">?</span>
        Où trouver mon Revenu Fiscal de Référence ?
        <svg
          className="rfr-help-chevron"
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: ouvert ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {ouvert && (
        <div className="rfr-help-panel">
          <div className="rfr-help-situation">
            <strong>{aide.titre}</strong> - {aide.texte}
          </div>

          <ul className="rfr-help-champs">
            {aide.champs.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <div className="rfr-help-avis">
            <p className="rfr-help-avis-label">
              Repérez la ligne entourée en rouge sur votre avis d'imposition :
            </p>
            <img
              src={avisExemplePNG}
              alt="Exemple d'avis d'imposition - le RFR est entouré en rouge"
              className="avis-exemple-img"
            />
          </div>
        </div>
      )}
    </div>
  )
}
