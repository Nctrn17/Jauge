// Barèmes CASC-SVP - Chapitre C (01/04/2026)
// Axe 1 : Tranche QF (6 paliers)
// Axe 2 : Tranche registre du personnel (1 à 8+)

// Paliers QF : [min, max] - max null = infini
export const PALIERS_QF = [
  { label: '0 – 600',        min: 0,       max: 600,    taux: 70 },
  { label: '600 – 800',      min: 600.01,  max: 800,    taux: 60 },
  { label: '800 – 1 200',    min: 800.01,  max: 1200,   taux: 50 },
  { label: '1 200 – 1 400',  min: 1200.01, max: 1400,   taux: 40 },
  { label: '1 400 – 1 600',  min: 1400.01, max: 1600,   taux: 30 },
  { label: '1 600+',         min: 1600.01, max: null,   taux: 15 },
]

// Index tranche registre : 0=T1 … 7=T8+
// Partenaires permanents - plafond global mensuel
export const BAREME_PARTENAIRES = [
  [ 31,  38,  46,  56, 110, 143, 186, 250],
  [ 28,  34,  41,  50, 100, 130, 169, 220],
  [ 25,  30,  36,  44,  80, 104, 136, 180],
  [ 20,  24,  29,  35,  70,  91, 119, 160],
  [ 13,  16,  20,  24,  50,  65,  85, 120],
  [  5,   6,   8,  10,  20,  26,  34,  50],
]

// Abonnements annuels OD + par enfant (plafond par personne, non transférable)
export const BAREME_ABONNEMENTS_OD = [
  [ 13,  16,  20,  24,  50,  65,  85, 120],
  [ 12,  15,  18,  22,  45,  59,  77, 110],
  [ 11,  14,  17,  21,  40,  52,  68,  90],
  [  9,  11,  14,  17,  30,  39,  51,  70],
  [  6,   8,  10,  12,  20,  26,  34,  50],
  [  3,   4,   5,   6,  10,  13,  17,  30],
]

// Abonnements annuels AD conjoint (plafond pour le/la conjoint.e)
export const BAREME_ABONNEMENTS_AD = [
  [  6,   7,   8,   9,  14,  15,  16,  35],
  [  5,   6,   7,   8,  13,  14,  15,  30],
  [  4,   5,   6,   7,  12,  13,  14,  25],
  [  3,   4,   5,   6,  11,  12,  13,  20],
  [  2,   3,   4,   5,  10,  11,  12,  15],
  [  1,   2,   3,   4,   9,  10,  11,  12],
]

// Colonies de vacances - plafond global pour tous enfants < 18 ans
export const BAREME_COLONIES = [
  [ 59,  71,  86, 104, 200, 260, 338, 440],
  [ 53,  64,  77,  93, 180, 234, 305, 400],
  [ 48,  58,  70,  84, 160, 208, 271, 360],
  [ 38,  46,  56,  68, 130, 169, 220, 290],
  [ 25,  30,  36,  44,  80, 104, 136, 180],
  [ 10,  12,  15,  18,  30,  39,  51,  70],
]

// Opération spéciale été - hors partenaires
export const BAREME_ETE = [
  [ 25,  30,  36,  44,  80, 104, 136, 180],
  [ 22,  27,  33,  40,  76,  99, 129, 170],
  [ 20,  24,  29,  35,  70,  91, 119, 160],
  [ 16,  20,  24,  29,  60,  78, 102, 140],
  [ 10,  12,  15,  18,  30,  39,  51,  70],
  [  4,   5,   6,   8,  20,  26,  34,  50],
]

// Retourne l'index du palier QF (0-5) pour un QF donné
// QF est arrondi au supérieur avant lookup
export function indexPalierQF(qf) {
  const qfArrondi = Math.ceil(qf)
  if (qfArrondi <= 600)  return 0
  if (qfArrondi <= 800)  return 1
  if (qfArrondi <= 1200) return 2
  if (qfArrondi <= 1400) return 3
  if (qfArrondi <= 1600) return 4
  return 5
}

// Retourne l'index tranche (0-7) depuis une tranche 1-8+
export function indexTranche(tranche) {
  return Math.min(tranche, 8) - 1
}

// Calcule tous les plafonds CASC pour un QF et une tranche donnés
export function calculerPlafondsCASC(qf, tranche, situation) {
  const iqf = indexPalierQF(qf)
  const it  = indexTranche(tranche)
  const taux = PALIERS_QF[iqf].taux

  const partenaires = BAREME_PARTENAIRES[iqf][it]

  const abonnOD = BAREME_ABONNEMENTS_OD[iqf][it]
  const abonnEnfants = situation.nbEnfantsGardeExclusive + situation.nbEnfantsGardeAlternee
  const abonnTotalEnfants = abonnEnfants * BAREME_ABONNEMENTS_OD[iqf][it]
  const abonnAD = situation.aConjoint ? BAREME_ABONNEMENTS_AD[iqf][it] : 0

  const colonies = (abonnEnfants > 0) ? BAREME_COLONIES[iqf][it] : 0

  const ete = BAREME_ETE[iqf][it]

  return {
    taux,
    palierLabel: PALIERS_QF[iqf].label,
    partenaires,
    abonnOD,
    abonnTotalEnfants,
    abonnAD,
    abonnTotal: abonnOD + abonnTotalEnfants + abonnAD,
    colonies,
    ete,
  }
}
