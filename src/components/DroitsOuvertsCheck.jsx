import { useState } from 'react'
import aemExemplePNG from '../assets/aem-exemple-idcc.png'

// Pédagogie "vos droits sont-ils réellement ouverts ?"
// Constat terrain : beaucoup de salariés découvrent leurs droits fermés au moment
// de les utiliser, parce que l'employeur n'a pas déclaré (DSN non paramétrée le
// plus souvent). Trois signaux sont vérifiables par le salarié avant d'en arriver là.

const NOMS_MOIS = [
  '', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
]

const VERIF_PAR_FONDS = {
  'casc-svp': {
    ligneBulletin: 'une ligne « CASC » (environ 0,40 % du brut)',
    idcc: '3090',
    docIdcc: 'votre AEM (attestation employeur mensuelle) ou votre bulletin de paie',
    espace: 'votre espace CASC-SVP',
    contactEmail: 'beneficiaires@casc-svp.fr',
    contactLabel: 'le service bénéficiaires du CASC-SVP',
    sujet: 'Vérification de mes droits CASC-SVP',
    legendeAem: 'Sur cet exemple, la case du numéro IDCC est entourée en rouge : 3090, la convention du CASC-SVP.',
  },
  fnas: {
    // Taux de la CCNEAC, art. III.3.1 : de 0,825 % a 1,45 % du brut selon la
    // taille de l'entreprise et le statut (intermittent ou non).
    ligneBulletin: 'une ligne « FNAS » (de 0,825 % à 1,45 % du brut selon l\'entreprise)',
    idcc: '1285',
    docIdcc: 'votre AEM (attestation employeur mensuelle) ou votre bulletin de paie',
    espace: 'votre espace bénéficiaire FNAS (eod.fnas.net)',
    contactEmail: 'contact@fnas.net',
    contactLabel: 'le FNAS (contact@fnas.net)',
    sujet: 'Vérification de mes droits FNAS',
    legendeAem: 'Sur cet exemple, la case du numéro IDCC est entourée en rouge (ici 3090). Pour le FNAS, vous devez y lire IDCC 1285, au même endroit.',
  },
}

function moisCoches(selectionsMois, siren) {
  const set = selectionsMois?.[siren]
  if (!set || set.size === 0) return null
  return [...set]
    .map((cle) => {
      const [annee, mois] = String(cle).split('-').map(Number)
      return { annee, mois }
    })
    .sort((a, b) => a.annee - b.annee || a.mois - b.mois)
    .map(({ mois, annee }) => `${NOMS_MOIS[mois] ?? mois} ${annee}`)
    .join(', ')
}

function construireMessage(verif, employers, selectionsMois) {
  const lignes = employers.map((e) => {
    const mois = moisCoches(selectionsMois, e.siren)
    const nom = e.nom_complet ?? e.nom ?? 'Employeur'
    return `- ${nom} (SIREN ${e.siren})${mois ? ` : ${mois}` : ''}`
  })
  return [
    'Bonjour,',
    '',
    'Je n’arrive pas à faire valoir mes droits alors que j’ai travaillé sur la période de référence.',
    'Pourriez-vous vérifier si les déclarations de mon ou mes employeurs vous sont bien parvenues ?',
    '',
    'Employeur(s) et périodes concernées :',
    ...lignes,
    '',
    'Je joins à ce mail une AEM (ou un bulletin de paie) pour chacun de ces employeurs.',
    '',
    'Merci d’avance,',
  ].join('\n')
}

export function DroitsOuvertsCheck({ fonds, employers, selectionsMois }) {
  const [ouvert, setOuvert] = useState(false)
  const [copie, setCopie] = useState(false)
  const verif = VERIF_PAR_FONDS[fonds.id]
  if (!verif) return null

  const message = construireMessage(verif, employers, selectionsMois)
  const mailtoHref = `mailto:${verif.contactEmail}?subject=${encodeURIComponent(verif.sujet)}&body=${encodeURIComponent(message)}`

  const copierMessage = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopie(true)
      setTimeout(() => setCopie(false), 2500)
    } catch {
      window.prompt('Copiez le message ci-dessous :', message)
    }
  }

  return (
    <div className="resultats-pratique-card" style={{ borderLeftColor: fonds.couleur }}>
      <p className="resultats-pratique-titre" style={{ color: fonds.couleur }}>
        {fonds.nom}&nbsp;: vérifier que vos droits s'ouvrent bien
      </p>
      <p className="resultats-pratique-text">
        Vos droits dépendent des déclarations de vos employeurs. Quand une déclaration
        manque, on le découvre en général un an plus tard, au moment d'utiliser ses
        droits. Trois vérifications simples permettent de s'en apercevoir avant.
      </p>

      <button
        className="rfr-help-toggle"
        onClick={() => setOuvert((v) => !v)}
        type="button"
      >
        <span className="rfr-help-icon">?</span>
        Comment vérifier en 5 minutes
        <svg
          className="rfr-help-chevron"
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: ouvert ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {ouvert && (
        <div className="rfr-help-panel">
          <ul className="rfr-help-champs">
            <li>
              <strong>Votre bulletin de paie.</strong> Cherchez {verif.ligneBulletin}.
              Si elle manque sur vos paies du secteur, le logiciel de paie de votre
              employeur n'est probablement pas paramétré&nbsp;: vos droits de l'année
              prochaine sont en jeu dès maintenant. Parlez-en à votre employeur.
            </li>
            <li>
              <strong>La mention IDCC {verif.idcc}.</strong> Vérifiez sur {verif.docIdcc} que
              la convention collective indiquée est bien l'IDCC {verif.idcc}. C'est elle qui
              vous ouvre des droits. Conservez ces documents&nbsp;: ce sont les
              justificatifs qu'on vous demandera en cas de problème.
            </li>
            <li>
              <strong>Votre compte.</strong> Connectez-vous à {verif.espace} en début
              d'année, avant d'avoir besoin de vos droits. Si vos droits n'apparaissent
              pas alors que vous avez travaillé, signalez-le sans attendre.
            </li>
          </ul>

          <div className="rfr-help-avis">
            <p className="rfr-help-avis-label">{verif.legendeAem}</p>
            <img
              src={aemExemplePNG}
              alt={`Exemple d'AEM anonymisée : la case du numéro IDCC, en haut du document sous le SIRET de l'employeur, est entourée en rouge. ${verif.legendeAem}`}
              className="avis-exemple-img"
            />
          </div>

          <p className="resultats-pratique-text">
            Droits fermés alors que vous avez travaillé&nbsp;? Contactez {verif.contactLabel} avec
            le message ci-dessous, pré-rempli avec votre saisie.
            <strong> Joignez une AEM (ou un bulletin de paie) par employeur&nbsp;:</strong> c'est
            la pièce qui permet de vérifier votre situation et de contacter la structure.
            Sans elle, votre demande ne pourra pas aboutir.
          </p>

          <div className="resultats-actions-row">
            <a className="resultats-action-btn" href={mailtoHref}>
              Ouvrir le mail pré-rempli
            </a>
            <button type="button" className="resultats-action-btn" onClick={copierMessage}>
              {copie ? 'Message copié ✓' : 'Copier le message'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
