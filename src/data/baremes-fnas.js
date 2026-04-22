// Barèmes FNAS 2026 - Fonds National d'Activités Sociales
// 15 paliers QF × plafond mensuel global + grilles catégorielles

export const PALIERS_QF_FNAS = [
  { label: '< 300',         max: 299      },
  { label: '300 – 399',     max: 399      },
  { label: '400 – 519',     max: 519      },
  { label: '520 – 639',     max: 639      },
  { label: '640 – 759',     max: 759      },
  { label: '760 – 919',     max: 919      },
  { label: '920 – 1 079',   max: 1079     },
  { label: '1 080 – 1 249', max: 1249     },
  { label: '1 250 – 1 449', max: 1449     },
  { label: '1 450 – 1 649', max: 1649     },
  { label: '1 650 – 1 849', max: 1849     },
  { label: '1 850 – 2 049', max: 2049     },
  { label: '2 050 – 2 249', max: 2249     },
  { label: '2 250 – 2 499', max: 2499     },
  { label: '> 2 500',       max: Infinity },
]

// Plafond mensuel global (€) - s'accumule jusqu'à 6 mois/an
const PLAFOND_MENSUEL = [112, 104, 97, 87, 87, 75, 62, 54, 52, 42, 32, 29, 27, 27, 24]

// Séjours 1 - taux de prise en charge (%) et plafond annuel par personne (€)
const SEJOURS_1_TAUX    = [60, 55, 50, 45, 44, 39, 34, 30, 29, 25, 20, 16, 15, 14, 13]
const SEJOURS_1_PLAFOND = [470, 440, 420, 380, 380, 340, 280, 240, 230, 190, 140, 130, 120, 120, 110]

// Séjours 2
const SEJOURS_2_TAUX    = [47, 43, 38, 34, 33, 29, 24, 20, 19, 16, 12, 8, 7, 6, 5]
const SEJOURS_2_PLAFOND = [360, 350, 330, 290, 290, 260, 210, 180, 170, 130, 100, 80, 70, 70, 70]

// Séjours 3
const SEJOURS_3_TAUX    = [39, 34, 31, 27, 26, 21, 17, 14, 13, 9, 5, 2, 2, 1, 1]
const SEJOURS_3_PLAFOND = [240, 220, 210, 170, 170, 140, 100, 100, 100, 60, 60, 60, 60, 60, 50]

// Colonies (enfants de moins de 18 ans) - taux et plafond annuel par enfant
const COLONIES_TAUX    = [60, 55, 50, 45, 44, 39, 33, 28, 26, 21, 15, 10, 8, 7, 6]
const COLONIES_PLAFOND = [470, 440, 420, 380, 380, 340, 300, 250, 250, 210, 170, 150, 150, 150, 150]

// Loisirs Grille A : intermittent ou employeur < 11 salariés
// Source : MODE-DEMPLOI-COMPLET.pdf p.12 - "Plafond Loisir... Intermittent"
// Colonnes : [1 membre, 2, 3, 4, 5, +1 par membre supplémentaire au-delà de 5]
const LOISIRS_A = [
  [260, 420, 580, 740, 900, 160],   // < 300
  [230, 380, 530, 680, 830, 150],   // 300–399
  [200, 340, 480, 620, 760, 140],   // 400–519
  [190, 320, 450, 580, 710, 130],   // 520–639
  [190, 320, 450, 580, 710, 130],   // 640–759
  [160, 280, 400, 520, 640, 120],   // 760–919
  [140, 240, 340, 440, 540, 100],   // 920–1 079
  [120, 210, 300, 390, 480,  90],   // 1 080–1 249
  [110, 200, 290, 380, 470,  90],   // 1 250–1 449
  [100, 180, 260, 340, 420,  80],   // 1 450–1 649
  [ 70, 130, 190, 250, 310,  60],   // 1 650–1 849
  [ 60, 110, 160, 210, 260,  50],   // 1 850–2 049
  [ 60, 110, 160, 210, 260,  50],   // 2 050–2 249
  [ 60, 110, 160, 210, 260,  50],   // 2 250–2 499
  [ 50, 100, 150, 200, 250,  50],   // > 2 500
]

// Plafond loisirs selon nombre de membres du foyer (1-5+) à partir d'une ligne LOISIRS_A
function loisirsPourMembres(row, nbMembres) {
  const n = Math.max(1, nbMembres)
  if (n <= 5) return row[n - 1]
  return Math.max(0, row[4] + row[5] * (n - 5))
}

// Index du palier QF (0–14)
export function indexPalierQFFNAS(qf) {
  const idx = PALIERS_QF_FNAS.findIndex((p) => qf <= p.max)
  return idx === -1 ? 14 : idx
}

// QF FNAS = ⌊(RFR − 8 000) ÷ 12 ÷ coefficient⌋
// Coefficient = 1,4 + 0,3×(couple deux actifs) + 0,6×dépendants exclusifs
//             + 0,3×dépendants alternés + 0,6×personnes handicapées (≥ 50%)
export function calculerQFFNAS({ rfr, conjointActif, nbEnfantsExclusifs, nbEnfantsAlternee, nbHandicap }) {
  const coeff = 1.4
    + (conjointActif ? 0.3 : 0)
    + nbEnfantsExclusifs * 0.6
    + nbEnfantsAlternee * 0.3
    + nbHandicap * 0.6
  return Math.max(0, Math.floor((rfr - 8000) / 12 / coeff))
}

// Calcule tous les plafonds FNAS pour un QF, un nombre de mois et une configuration foyer
// tailleSalaries : 'A' (<11 sal. / intermittent) | 'B' (≥11 avec CSE) | 'C' (≥11 sans CSE)
export function calculerPlafondsFNAS(qf, tranches, tailleSalaries, nbMembres) {
  const i = indexPalierQFFNAS(qf)
  const plafondMensuel = PLAFOND_MENSUEL[i]
  const plafondGlobal = plafondMensuel * Math.min(tranches, 6)

  // Grille B = Grille A − 60 € par colonne (5 premières), incrément inchangé
  // Source : MODE-DEMPLOI-COMPLET.pdf p.12 - "CSEC opérationnel"
  const loisirsRowB = LOISIRS_A[i].map((v, j) => j < 5 ? Math.max(0, v - 60) : v)

  let loisirsRow
  if (tailleSalaries === 'B') {
    loisirsRow = loisirsRowB
  } else if (tailleSalaries === 'C') {
    // Grille C = 50 % de la Grille B (pas de A)
    // Source : MODE-DEMPLOI-COMPLET.pdf p.13 - "CARENCE ou assimilé"
    loisirsRow = loisirsRowB.map((v) => Math.round(v / 2))
  } else {
    loisirsRow = LOISIRS_A[i]
  }

  const cap = (v) => Math.min(v, plafondGlobal)

  return {
    plafondMensuel,
    plafondGlobal,
    palierLabel: PALIERS_QF_FNAS[i].label,
    sejours1: { taux: SEJOURS_1_TAUX[i], plafond: cap(SEJOURS_1_PLAFOND[i]) },
    sejours2: { taux: SEJOURS_2_TAUX[i], plafond: cap(SEJOURS_2_PLAFOND[i]) },
    sejours3: { taux: SEJOURS_3_TAUX[i], plafond: cap(SEJOURS_3_PLAFOND[i]) },
    colonies: { taux: COLONIES_TAUX[i],  plafond: cap(COLONIES_PLAFOND[i])  },
    loisirs:  cap(loisirsPourMembres(loisirsRow, nbMembres)),
  }
}
