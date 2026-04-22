import { calculerPlafondsFNAS, PALIERS_QF_FNAS, indexPalierQFFNAS } from '../data/baremes-fnas'


export function ResultsFNAS({ qfFnas, tranche, situation, tailleSalaries }) {
  const taille = tailleSalaries ?? 'A'
  const nbMembres = situation.nbMembres ?? 1
  const plafonds = calculerPlafondsFNAS(qfFnas, tranche, taille, nbMembres)
  const palierIdx = indexPalierQFFNAS(qfFnas)
  const palierLabel = PALIERS_QF_FNAS[palierIdx].label

  const nbEnfants = (situation.nbEnfantsGardeExclusive ?? 0) + (situation.nbEnfantsGardeAlternee ?? 0)

  return (
    <div className="results-casc results-fnas">
      <div className="results-header">
        <div className="results-summary">
          <div className="results-summary-item">
            <span className="results-summary-label">Plafonds mensuels</span>
            <span className="results-summary-value">× {Math.min(tranche, 6)}</span>
          </div>
          <div className="results-summary-sep">=</div>
          <div className="results-summary-item">
            <span className="results-summary-label">Plafond global</span>
            <span className="results-summary-value results-taux">{plafonds.plafondGlobal} €</span>
          </div>
          <div className="results-summary-sep">·</div>
          <div className="results-summary-item">
            <span className="results-summary-label">QF FNAS</span>
            <span className="results-summary-value">{qfFnas.toLocaleString('fr-FR')} €</span>
          </div>
        </div>
      </div>

      <div className="results-total">
        <span className="results-total-label">Enveloppe annuelle disponible</span>
        <span className="results-total-value">{plafonds.plafondGlobal} €</span>
      </div>
      <p className="results-categories-hint">C'est votre budget total pour l'année - vous ne pouvez pas dépasser cette somme, quelle que soit la catégorie. Les montants indiqués ci-dessous sont des plafonds par poste, pas des enveloppes séparées.</p>

      <div className="results-baremes">

        {/* Séjours */}
        <div className="results-section-title">Séjours vacances</div>

        {[
          { key: 'sejours1', label: 'Résidences FNAS et partenaires premium' },
          { key: 'sejours2', label: 'Partenaires agréés' },
          { key: 'sejours3', label: 'Autres hébergements éligibles' },
        ].map(({ key, label }) => {
          const s = plafonds[key]
          return (
            <div key={key} className="results-bareme-row">
              <div className="results-bareme-info">
                <div className="results-bareme-label">{label}</div>
                <div className="results-bareme-desc">
                  Le FNAS rembourse {s.taux}% de votre séjour
                </div>
              </div>
              <div className="results-bareme-montant results-bareme-montant--max">
                <span className="results-bareme-jusqua">max.</span>
                <span>{s.plafond}<span className="results-bareme-euro">€</span></span>
                <span className="results-bareme-par">/ personne / an</span>
              </div>
            </div>
          )
        })}

        {/* Loisirs */}
        <div className="results-section-title">Loisirs</div>
        <div className="results-bareme-row">
          <div className="results-bareme-info">
            <div className="results-bareme-label">Activités de loisirs</div>
            <div className="results-bareme-desc">
              Plafond annuel pour votre foyer ({nbMembres} membre{nbMembres > 1 ? 's' : ''})
            </div>
          </div>
          <div className="results-bareme-montant">
            {plafonds.loisirs}<span className="results-bareme-euro">€</span>
          </div>
        </div>

        {/* Colonies */}
        {nbEnfants > 0 && (
          <>
            <div className="results-section-title">Colonies et séjours enfants</div>
            <div className="results-bareme-row">
              <div className="results-bareme-info">
                <div className="results-bareme-label">Colonies de vacances (enfants &lt; 18 ans)</div>
                <div className="results-bareme-desc">
                  Le FNAS rembourse {plafonds.colonies.taux}% du coût du séjour
                </div>
              </div>
              <div className="results-bareme-montant results-bareme-montant--max">
                <span className="results-bareme-jusqua">jusqu'à</span>
                <span>{plafonds.colonies.plafond} <span className="results-bareme-euro">€</span></span>
                <span className="results-bareme-par">/ enfant / an</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="results-fonds-cta">
        <a
          href="https://eod.fnas.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-fonds-cta"
        >
          Accéder à l'espace bénéficiaire FNAS →
        </a>
      </div>

      <div className="results-disclaimer">
        Votre enveloppe de {plafonds.plafondGlobal} € est à utiliser librement entre les différentes
        catégories. Les montants affichés par catégorie sont des plafonds —
        vous ne pouvez pas dépenser plus sur un poste donné, mais vous pouvez répartir le reste
        comme vous le souhaitez. Ces montants sont indicatifs.
      </div>
    </div>
  )
}
