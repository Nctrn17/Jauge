// Le fond de page EST la jauge : douze colonnes, une par mois travaillé.
// Décoratif uniquement, masqué aux lecteurs d'écran et à l'impression.


import { RAMPE_MOIS, MOIS_ETEINT } from '../data/rampe'

// `moisAllumes` est un Set de numéros de mois (1 à 12) : la barre 8 est août,
// quelle que soit l'année ou le fonds d'où vient le mois.
export function JaugeBackground({ moisAllumes, demo = false }) {
  return (
    <div className="rideau-bg" aria-hidden="true">
      {RAMPE_MOIS.map((color, i) => {
        const on = demo || moisAllumes.has(i + 1)
        return (
          <div key={i} className="rideau-bg-col">
            <div
              className="rideau-bg-fill"
              style={{
                height: on ? `${14 + i * 7.5}%` : '6%',
                background: on ? color : MOIS_ETEINT,
                '--delay': `${i * 70}ms`,
              }}
            />
          </div>
        )
      })}
      <div className="rideau-bg-veil" />
    </div>
  )
}
