// Table de correspondance IDCC → Fonds d'action sociale
// À compléter au fur et à mesure des conventions couvertes

export const FONDS_MAP = {
  3090: {
    id: 'casc-svp',
    nom: 'CASC-SVP',
    nomComplet: "Comité d'Action Sociale et Culturelle du Spectacle Vivant Privé",
    url: 'https://www.casc-svp.fr',
    // Couleur alignée sur la landing page (audience-fund--casc → --violet-mid)
    couleur: '#7c3aed',
    convention: 'Spectacle vivant privé',
    trancheMax: 8,
    // Heures de référence : année civile 2025
    // Droits ouverts : 1er avril 2026 → 31 mars 2027
    periodeRef: genererMois(1, 2025, 12, 2025),
  },
  1285: {
    id: 'fnas',
    nom: 'FNAS',
    nomComplet: 'Fonds National d\'Activités Sociales',
    url: 'https://fnas.net',
    // Couleur alignée sur la landing page (audience-fund--fnas)
    couleur: '#0284c7',
    convention: 'Entreprises artistiques et culturelles (CCNEAC)',
    trancheMax: 6,
    // Période de référence FNAS 2026 (nouveau système au 1er janvier 2026) :
    // - La présence en novembre 2025 → DSN reçue le 15/01/2026 → droits 2026
    // - La présence en décembre 2025 → DSN reçue ~15/02/2026 → droits 2026
    // - La présence en 2026 → droits utilisables jusqu'au 31/12/2026
    // - Remise à zéro au 1er janvier de chaque année
    periodeRef: genererMois(11, 2025, 12, 2026),
  },
}

// Génère la liste ordonnée des mois d'une période
// ex: genererMois(4, 2025, 3, 2026) → [{mois:4,annee:2025}, ..., {mois:3,annee:2026}]
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

// Retourne tous les IDCCs déclarés pour un employeur (dédupliqués)
// Sources : conventions_collectives[].idcc + complements.liste_idcc[]
export function getAllIdccsFromEmployer(emp) {
  const fromConventions = (emp.conventions_collectives ?? [])
    .map((c) => parseInt(c.idcc))
    .filter((n) => Number.isFinite(n))
  const fromComplements = (emp.complements?.liste_idcc ?? [])
    .map((id) => parseInt(id))
    .filter((n) => Number.isFinite(n))
  return [...new Set([...fromConventions, ...fromComplements])]
}

// Retourne le meilleur IDCC pour un employeur :
// préfère un IDCC couvert par un fonds, sinon le premier connu
export function getIdccFromEmployer(emp) {
  const all = getAllIdccsFromEmployer(emp)
  return all.find((idcc) => getFondsForIdcc(idcc) != null) ?? all[0] ?? null
}

// Liste des conventions couvertes pour le sélecteur manuel
export const CONVENTIONS_COUVERTES = Object.entries(FONDS_MAP).map(([idcc, fonds]) => ({
  idcc: parseInt(idcc),
  label: `IDCC ${idcc} - ${fonds.convention}`,
  fonds,
}))
