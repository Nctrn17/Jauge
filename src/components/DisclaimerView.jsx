export function DisclaimerView({ onContinue, onRetour }) {
  return (
    <div className="disclaimer-view">
      <div className="disclaimer-card">

        <div className="disclaimer-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 20h20L12 2z"
              stroke="currentColor" strokeWidth="1.6"
              strokeLinejoin="round" fill="none"
            />
            <line x1="12" y1="9" x2="12" y2="14"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="12" cy="17.5" r="0.9" fill="currentColor"/>
          </svg>
        </div>

        <h1 className="disclaimer-titre">Ces résultats sont une estimation</h1>

        <div className="disclaimer-corps">
          <p>
            Les montants affichés sont calculés sur la base des informations
            que vous avez renseignées.
          </p>
          <p>
            Ils supposent que <strong>vos employeurs sont à jour de leurs cotisations
            et déclarations nominatives (DSN)</strong>, ce que Jauge ne peut pas vérifier.
          </p>
          <p>
            En cas de question,{' '}
            <strong>contactez directement le CASC-SVP ou le FNAS</strong>,
            eux seuls peuvent confirmer vos droits réels.
          </p>
        </div>

        <button className="btn-disclaimer-continuer" onClick={onContinue}>
          J'ai compris - voir mes résultats →
        </button>

        <button className="btn-disclaimer-retour" type="button" onClick={onRetour}>
          ← Modifier ma saisie
        </button>

      </div>
    </div>
  )
}
