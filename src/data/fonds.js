// IDCC → Fonds d'action sociale.

export const FONDS_MAP = {
  3090: {
    id: 'casc-svp',
    nom: 'CASC-SVP',
    nomComplet: "Comité d'Action Sociale et Culturelle du Spectacle Vivant Privé",
    url: 'https://www.casc-svp.fr',
    couleur: '#7c3aed',
    convention: 'Spectacle vivant privé',
    trancheMax: 8,
    periodeRef: genererMois(1, 2025, 12, 2025),
  },
  1285: {
    id: 'fnas',
    nom: 'FNAS',
    nomComplet: 'Fonds National d\'Activités Sociales',
    url: 'https://fnas.net',
    couleur: '#0284c7',
    convention: 'Entreprises artistiques et culturelles (CCNEAC)',
    trancheMax: 6,
    // Calendrier annuel depuis 2026 : la présence de nov–déc 2025 entre via
    // les DSN de janvier–février 2026, droits utilisables jusqu'au 31/12/2026.
    periodeRef: genererMois(11, 2025, 12, 2026),
  },
}

function genererMois(moisDebut, anneeDebut, moisFin, anneeFin) {
  const mois = []
  let m = moisDebut
  let a = anneeDebut
  while (a < anneeFin || (a === anneeFin && m <= moisFin)) {
    mois.push({ mois: m, annee: a })
    m++
    if (m > 12) { m = 1; a++ }
  }
  return mois
}

export const getFondsForIdcc = (idcc) => FONDS_MAP[idcc] ?? null

export function getAllIdccsFromEmployer(emp) {
  const fromConventions = (emp.conventions_collectives ?? [])
    .map((c) => parseInt(c.idcc))
    .filter((n) => Number.isFinite(n))
  const fromComplements = (emp.complements?.liste_idcc ?? [])
    .map((id) => parseInt(id))
    .filter((n) => Number.isFinite(n))
  return [...new Set([...fromConventions, ...fromComplements])]
}

export function getIdccFromEmployer(emp) {
  const all = getAllIdccsFromEmployer(emp)
  return all.find((idcc) => getFondsForIdcc(idcc) != null) ?? all[0] ?? null
}

export const CONVENTIONS_COUVERTES = Object.entries(FONDS_MAP).map(([idcc, fonds]) => ({
  idcc: parseInt(idcc),
  label: `IDCC ${idcc} - ${fonds.convention}`,
  fonds,
}))
