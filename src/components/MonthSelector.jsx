import { useState } from 'react'

const NOMS_MOIS = [
  '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const cle = ({ mois, annee }) => `${annee}-${mois}`

export function MonthSelector({ fonds, employeur, selection, onChange, tailleSalaries, onTailleChange }) {
  const [demandePermanent, setDemandePermanent] = useState(false)
  const tranche = Math.min(selection.size, fonds.trancheMax)
  const plafonne = selection.size > fonds.trancheMax
  const isFNAS = fonds.id === 'fnas'
  const allKeys = fonds.periodeRef.map(cle)
  const allSelected = allKeys.every((k) => selection.has(k))

  const toggleMois = (item) => {
    const k = cle(item)
    const next = new Set(selection)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    onChange(next)
  }

  const toggleAll = () => {
    if (allSelected) {
      onChange(new Set())
    } else {
      onChange(new Set(allKeys))
    }
  }

  const pct = Math.min((selection.size / fonds.trancheMax) * 100, 100)

  return (
    <div className="month-card" style={{ '--card-accent': fonds.couleur }}>
      <div className="month-card-header">
        <div className="month-card-title-row">
          <span className="month-card-nom">
            {employeur?.nom_complet ?? employeur?.nom ?? fonds.nom}
          </span>
          <span className="month-card-tag">
            {fonds.nom}
          </span>
        </div>
        <div className="month-card-actions">
          <button
            type="button"
            className="month-select-all"
            onClick={toggleAll}
          >
            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
          <span className="month-card-hint">1 mois compté dès 1h de présence</span>
        </div>
      </div>

      <div className="month-grid">
        {fonds.periodeRef.map((item) => {
          const k = cle(item)
          const checked = selection.has(k)
          return (
            <button
              key={k}
              className={`month-btn ${checked ? 'month-btn--active' : ''}`}
              style={checked ? {
                background: fonds.couleur,
                borderColor: fonds.couleur,
                color: 'white',
              } : {}}
              onClick={() => toggleMois(item)}
              type="button"
              aria-pressed={checked}
            >
              <span className="month-btn-nom">{NOMS_MOIS[item.mois]}</span>
              <span className="month-btn-annee">{item.annee}</span>
            </button>
          )
        })}
      </div>

      <div className="month-card-footer">
        <div className="month-card-progress" aria-hidden="true">
          <div className="month-card-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className={`month-card-count${plafonne ? ' month-card-count--max' : ''}`}>
          {selection.size === 0
            ? 'Aucun mois sélectionné'
            : `${tranche}/${fonds.trancheMax} mois cotisés${plafonne ? ' · max atteint' : ''}`}
        </span>
      </div>

      {isFNAS && !demandePermanent && tailleSalaries === 'A' && (
        <button className="fnas-permanent-link" type="button" onClick={() => setDemandePermanent(true)}>
          Vous êtes salarié·e permanent·e ?
        </button>
      )}

      {isFNAS && demandePermanent && (
        <div className="fnas-permanent-question">
          <span className="fnas-permanent-label">Votre employeur a-t-il un CSE actif ?</span>
          <div className="fnas-permanent-btns">
            <button type="button" className="fnas-permanent-btn"
              onClick={() => { onTailleChange('B'); setDemandePermanent(false) }}>Oui</button>
            <button type="button" className="fnas-permanent-btn"
              onClick={() => { onTailleChange('C'); setDemandePermanent(false) }}>Non</button>
            <button type="button" className="fnas-permanent-btn fnas-permanent-btn--cancel"
              onClick={() => setDemandePermanent(false)}>Annuler</button>
          </div>
        </div>
      )}

      {isFNAS && tailleSalaries !== 'A' && (
        <div className="fnas-permanent-active">
          Salarié·e permanent·e - CSE {tailleSalaries === 'B' ? 'actif' : 'absent'}
          <button type="button" className="fnas-permanent-reset"
            onClick={() => onTailleChange('A')}>Modifier</button>
        </div>
      )}
    </div>
  )
}

/* unused — kept for reference */
function formatPeriode(periodeRef) {
  if (!periodeRef?.length) return ''
  const debut = periodeRef[0]
  const fin = periodeRef[periodeRef.length - 1]
  const NOMS = ['', 'jan.', 'fév.', 'mar.', 'avr.', 'mai', 'jun.', 'jul.', 'aoû.', 'sep.', 'oct.', 'nov.', 'déc.']
  return `${NOMS[debut.mois]} ${debut.annee} – ${NOMS[fin.mois]} ${fin.annee}`
}
