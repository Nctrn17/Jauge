import { useState } from 'react'
import { ResultsCASC } from './ResultsCASC'
import { ResultsFNAS } from './ResultsFNAS'
import { ContactModal } from './ContactModal'
import { ResourcesCard } from './SaisieView'

/* Règles pratiques par fonds */
const FONDS_PRATIQUE = {
  'casc-svp': [
    'Créer un compte sur casc-svp.fr si ce n\'est pas encore fait - les démarches se font en ligne.',
    'Conserver toutes les factures.',
    'Les modalités varient selon les aides - consulter le mode d\'emploi sur casc-svp.fr.',
  ],
  fnas: [
    'Les demandes se déposent sur eod.fnas.net - créer un compte si ce n\'est pas encore fait.',
    'Conserver toutes les factures.',
    'Consulter le règlement sur fnas.net.',
  ],
}

/* Liens par fonds */
const FONDS_LINKS = {
  'casc-svp': {
    site:        { label: 'CASC-SVP - site officiel',           url: 'https://www.casc-svp.fr' },
    convention:  { label: 'Convention IDCC 3090 - Légifrance',  url: 'https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000045198616/' },
    contact:     { label: 'Formulaire de contact CASC-SVP',      url: 'https://casc-svp.portailce.com/Article/Article/44' },
  },
  fnas: {
    site:       { label: 'FNAS - site officiel',                url: 'https://fnas.net' },
    convention: { label: 'Convention CCNEAC - IDCC 1285 (PDF)', url: 'https://www.ccneac.fr/wp-content/uploads/2022/11/20220615_CCNEAC-1.pdf' },
    contact:    { label: 'Accès espace bénéficiaire FNAS',      url: 'https://eod.fnas.net/' },
  },
}

function LinkRow({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ctx-link-row"
    >
      <span>{children}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </a>
  )
}


function RecapAside({ employerCount, totalMois, qf, onRetour }) {
  return (
    <aside className="saisie-aside">
      <div className="ctx-card recap-card">
        <p className="ctx-card-title">Votre saisie</p>
        <dl className="recap-stats">
          <div className="recap-stat">
            <dt>Employeurs</dt>
            <dd><strong>{employerCount}</strong></dd>
          </div>
          <div className="recap-stat">
            <dt>Mois cochés</dt>
            <dd><strong>{totalMois}</strong> <span className="recap-stat-unit">sur 12</span></dd>
          </div>
          {qf != null && (
            <div className="recap-stat">
              <dt>Quotient familial</dt>
              <dd><strong>{qf.toLocaleString('fr-FR')} €</strong></dd>
            </div>
          )}
        </dl>
        <button type="button" className="recap-edit" onClick={onRetour}>
          ← Modifier ma situation
        </button>
      </div>
    </aside>
  )
}

export function ResultatsView({ fonds, employers, selectionsMois, tranchesByFond, taillesByFond, resultats, onRetour }) {
  const [showContact, setShowContact] = useState(false)
  const hasBoth = fonds.some((f) => f.id === 'casc-svp') && fonds.some((f) => f.id === 'fnas')

  const totalMois = new Set(
    employers.flatMap((e) => [...(selectionsMois[e.siren] ?? new Set())])
  ).size
  const qfValue = Object.values(resultats).find((r) => r?.qf > 0)?.qf ?? null

  return (
    <div className="saisie-layout saisie-layout--resultats">
      <div className="saisie-form">
        <div className="resultats-view">

          <div className="estimation-banner">
            <div className="estimation-banner-titre">Estimation de vos droits</div>
            <p className="estimation-banner-texte">
              Ces montants sont <strong>indicatifs</strong>. Ils{' '}
              <strong>
                supposent que vos employeurs sont à jour de leurs cotisations et déclarations
                nominatives (DSN)
              </strong>. En cas de doute, contactez directement le fonds concerné.
            </p>
          </div>

          <div className="resultats-fonds">
            {fonds.map((f) => {
              const tranche = Math.min(tranchesByFond[f.id]?.size ?? 0, f.trancheMax)
              const res = resultats[f.id]
              if (!res || tranche === 0) return null

              return (
                <div key={f.id} className="resultats-fonds-bloc">
                  <div className="resultats-fonds-header" style={{ borderLeftColor: f.couleur }}>
                    <span className="resultats-fonds-nom" style={{ color: f.couleur }}>{f.nom}</span>
                    <span className="resultats-fonds-convention">{f.convention}</span>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resultats-fonds-lien"
                    >
                      {f.url.replace('https://', '')} →
                    </a>
                  </div>

                  {f.id === 'fnas' ? (
                    res.qfFnas != null ? (
                      <ResultsFNAS
                        qfFnas={res.qfFnas}
                        tranche={tranche}
                        situation={res}
                        tailleSalaries={taillesByFond[f.id] ?? 'A'}
                      />
                    ) : (
                      <p className="resultats-no-qf">QF FNAS non calculé.</p>
                    )
                  ) : (
                    <ResultsCASC
                      qf={res.qf}
                      tranche={tranche}
                      situation={res}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Infos pratiques par fonds — intégrées sous les résultats */}
          <div className="resultats-pratique">
            {fonds.map((f) => {
              const links = FONDS_LINKS[f.id]
              const pratique = FONDS_PRATIQUE[f.id]
              if (!links) return null
              return (
                <div key={f.id} className="resultats-pratique-card" style={{ borderLeftColor: f.couleur }}>
                  <p className="resultats-pratique-titre" style={{ color: f.couleur }}>{f.nom} — pour accéder aux aides</p>
                  <ul className="resultats-pratique-list">
                    {pratique?.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <div className="resultats-pratique-links">
                    <LinkRow href={links.site.url}>{links.site.label}</LinkRow>
                    <LinkRow href={links.convention.url}>{links.convention.label}</LinkRow>
                    <LinkRow href={links.contact.url}>{links.contact.label}</LinkRow>
                  </div>
                </div>
              )
            })}

            {hasBoth && (
              <div className="resultats-pratique-card resultats-pratique-card--cumul">
                <p className="resultats-pratique-titre">Cumul CASC-SVP + FNAS</p>
                <p className="resultats-pratique-text">
                  Vous pouvez présenter <strong>la même facture aux deux fonds</strong>, mais chacun
                  ne prend en charge que la part non couverte par l'autre.
                  Joignez l'attestation de prise en charge du premier fonds au dossier du second.
                </p>
              </div>
            )}
          </div>

          {/* Footer contact */}
          <div className="resultats-contact-footer">
            <p>
              Un bug ou une suggestion ?{' '}
              <button type="button" className="resultats-contact-btn" onClick={() => setShowContact(true)}>
                Contactez-nous
              </button>
            </p>
            <p>
              Pour toute question sur vos droits réels, contactez directement{' '}
              <a href="https://www.casc-svp.fr" target="_blank" rel="noopener noreferrer">le CASC-SVP</a>{' '}
              ou <a href="https://fnas.net" target="_blank" rel="noopener noreferrer">le FNAS</a> —{' '}
              Jauge ne remplace pas leur expertise.
            </p>
          </div>

          {showContact && <ContactModal onClose={() => setShowContact(false)} />}

        </div>
      </div>

      <RecapAside
        employerCount={employers.length}
        totalMois={totalMois}
        qf={qfValue}
        onRetour={onRetour}
      />

      <aside className="saisie-resources">
        <ResourcesCard />
      </aside>
    </div>
  )
}
