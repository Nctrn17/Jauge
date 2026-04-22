import { calculerPlafondsCASC, PALIERS_QF, indexPalierQF } from '../data/baremes'

const BAREME_LABELS = [
  { key: 'partenaires',        label: 'Partenaires permanents',    desc: 'Séjours, lecture, parcs, musées, cinéma...' },
  { key: 'abonnTotal',         label: 'Abonnements annuels',       desc: 'Sport, activités artistiques, culture... (cumulable par ayant droit)' },
  { key: 'colonies',           label: 'Colonies de vacances',      desc: 'Plafond global pour tous vos enfants de moins de 18 ans' },
  { key: 'ete',                label: 'Opération spéciale été',    desc: 'Hors partenaires - modalités disponibles en mai 2026', hidden: true },
]

export function ResultsCASC({ qf, tranche, situation }) {
  const plafonds = calculerPlafondsCASC(qf, tranche, situation)
  const iqf = indexPalierQF(qf)
  const palier = PALIERS_QF[iqf]

  const visibleKeys = BAREME_LABELS.filter((b) => !b.hidden).map((b) => b.key)
  const totalMax = visibleKeys.reduce((sum, key) => sum + (plafonds[key] ?? 0), 0)

  return (
    <div className="results-casc">
      <div className="results-header">
        <div className="results-summary">
          <div className="results-summary-item">
            <span className="results-summary-label">Tranche</span>
            <span className="results-summary-value">T{Math.min(tranche, 8)}</span>
          </div>
          <div className="results-summary-sep">×</div>
          <div className="results-summary-item">
            <span className="results-summary-label">QF</span>
            <span className="results-summary-value">{qf.toLocaleString('fr-FR')} €</span>
          </div>
          <div className="results-summary-sep">=</div>
          <div className="results-summary-item">
            <span className="results-summary-label">Taux</span>
            <span className="results-summary-value results-taux">{plafonds.taux}%</span>
          </div>
        </div>
        
      </div>

      <div className="results-total">
        <span className="results-total-label">Plafond total cumulable</span>
        <span className="results-total-value">{totalMax}€</span>
      </div>
      <p className="results-categories-hint">Le CASC-SVP rembourse <strong>{plafonds.taux}%</strong> de vos dépenses, dans la limite du plafond indiqué par catégorie.</p>

      <div className="results-baremes">
        {BAREME_LABELS.map(({ key, label, desc, hidden }) => {
          const montant = plafonds[key]
          if (key === 'colonies' && montant === 0) return null
          return (
            <div key={key} className={`results-bareme-row${hidden ? ' results-bareme-row--soon' : ''}`}>
              <div className="results-bareme-info">
                <div className="results-bareme-label">{label}</div>
                <div className="results-bareme-desc">{desc}</div>
                {key === 'abonnTotal' && situation.aConjoint && (
                  <div className="results-bareme-detail">
                    Vous : {plafonds.abonnOD}€ · Conjoint·e : {plafonds.abonnAD}€
                    {(situation.nbEnfantsGardeExclusive + situation.nbEnfantsGardeAlternee) > 0 &&
                      ` · Enfants : ${plafonds.abonnTotalEnfants}€`}
                  </div>
                )}
              </div>
              {hidden
                ? <div className="results-bareme-soon">Bientôt disponible</div>
                : <div className="results-bareme-montant">{montant}<span className="results-bareme-euro">€</span></div>
              }
            </div>
          )
        })}
      </div>

      <div className="results-fonds-cta">
        <a
          href="https://sso.up-cse.fr/authentication/login"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-fonds-cta"
        >
          Accéder à mon espace CASC-SVP →
        </a>
      </div>

      <div className="results-disclaimer">
        Ces plafonds sont indicatifs.
      </div>
    </div>
  )
}
