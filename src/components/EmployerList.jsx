import { getFondsForIdcc, getAllIdccsFromEmployer, getIdccFromEmployer, CONVENTIONS_COUVERTES } from '../data/fonds'
import { cleanNom } from '../hooks/useSearch'

export function EmployerList({ employers, onRemove, idccOverrides, onIdccOverride }) {
  if (employers.length === 0) return null

  return (
    <ul className="employer-cards">
      {employers.map((emp) => {
        const allIdccs = getAllIdccsFromEmployer(emp)
        const coveredIdccs = allIdccs.filter((idcc) => getFondsForIdcc(idcc) != null)
        const idccApi = getIdccFromEmployer(emp)
        const titreApi = emp.conventions_collectives?.[0]?.titre

        const hasOverride = Object.hasOwn(idccOverrides ?? {}, emp.siren)
        const idccOverride = hasOverride ? idccOverrides[emp.siren] : undefined
        const idcc = hasOverride ? idccOverride : idccApi
        const fonds = idcc != null ? getFondsForIdcc(idcc) : null

        const multiCovered = coveredIdccs.length > 1 && !hasOverride
        const showManual = !fonds

        const hintManuel = multiCovered
          ? 'Plusieurs conventions couvertes détectées. Laquelle s\'applique à votre activité ?'
          : idccApi && !getFondsForIdcc(idccApi) && !hasOverride
          ? `Convention non couverte (IDCC ${idccApi}${titreApi ? ` - ${titreApi}` : ''}). Si vous pensez que c'est une erreur, précisez ci-dessous :`
          : 'Convention collective non renseignée dans l\'API. Précisez si cet employeur relève d\'une convention couverte :'

        return (
          <li key={emp.siren} className="employer-card">
            <div className="employer-card-header">
              <div>
                <div className="employer-nom">{cleanNom(emp.nom_complet)}</div>
                <div className="employer-siren">SIREN {emp.siren}</div>
              </div>
              <button
                className="btn-remove"
                onClick={() => onRemove(emp.siren)}
                aria-label={`Supprimer ${emp.nom_complet}`}
                title="Retirer cet employeur"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="employer-card-body">
              {idcc != null && !hasOverride && (
                <div className="convention-label">
                  <span className="badge badge-idcc">IDCC {idcc}</span>
                  {titreApi && (
                    <span className="convention-titre">{titreApi}</span>
                  )}
                </div>
              )}

              {fonds ? (
                <div
                  className="fonds-found"
                  style={{ borderLeftColor: fonds.couleur }}
                >
                  <div className="fonds-nom" style={{ color: fonds.couleur }}>
                    {fonds.nom}
                  </div>
                  <div className="fonds-complet">{fonds.nomComplet}</div>
                  <a
                    href={fonds.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fonds-link"
                  >
                    Voir les prestations
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                  {hasOverride && (
                    <button
                      className="btn-reset-idcc"
                      onClick={() => onIdccOverride(emp.siren, null)}
                    >
                      Modifier
                    </button>
                  )}
                </div>
              ) : (
                <div className="idcc-manual">
                  <p className="idcc-manual-hint">{hintManuel}</p>
                  <div className="idcc-manual-options">
                    {CONVENTIONS_COUVERTES.map((c) => (
                      <label
                        key={c.idcc}
                        className={`idcc-option ${idccOverride === c.idcc ? 'idcc-option--active' : ''}`}
                        style={idccOverride === c.idcc ? { borderColor: c.fonds.couleur, background: `${c.fonds.couleur}10` } : {}}
                      >
                        <input
                          type="radio"
                          name={`idcc-${emp.siren}`}
                          value={c.idcc}
                          checked={idccOverride === c.idcc}
                          onChange={() => onIdccOverride(emp.siren, c.idcc)}
                        />
                        <span className="idcc-option-badge" style={{ background: c.fonds.couleur }}>
                          {c.fonds.nom}
                        </span>
                        <span className="idcc-option-label">{c.label}</span>
                      </label>
                    ))}
                    <label className="idcc-option">
                      <input
                        type="radio"
                        name={`idcc-${emp.siren}`}
                        value=""
                        checked={hasOverride && idccOverride === null}
                        onChange={() => onIdccOverride(emp.siren, null)}
                      />
                      <span className="idcc-option-label idcc-option-label--none">
                        Autre convention / non concerné
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
