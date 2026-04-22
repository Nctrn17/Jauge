import { useState, useRef } from 'react'
import { SearchBar }     from './SearchBar'
import { EmployerList }  from './EmployerList'
import { MonthSelector } from './MonthSelector'
import { QFCalculator }  from './QFCalculator'
import { ContactModal }  from './ContactModal'
import { getFondsForIdcc, getIdccFromEmployer, FONDS_MAP } from '../data/fonds'
import { cleanNom } from '../hooks/useSearch'

const EXEMPLES_STRUCTURES = [
  'Jolie Môme',                 // IDCC 1285 — compagnie militante, St-Denis
  'Théâtre du Peuple',          // Bussang — Maurice Pottecher
  'Les Ateliers Frappaz',       // Villeurbanne — arts de la rue
  'La Maroquinerie',            // Paris 20e — musiques actuelles privées
  'Mains d\'Œuvres',            // Saint-Ouen — fabrique de culture
]

/* Aperçu ghost (préfiguration liste employeurs) */
function GhostPreview() {
  return (
    <div className="ghost-preview" aria-hidden="true">
      <span className="ghost-preview-label">Vos structures apparaîtront ici</span>
      <div className="ghost-preview-list">
        {[65, 78, 55].map((w, i) => (
          <div key={i} className="ghost-preview-item">
            <span className="ghost-preview-num">{i + 1}</span>
            <span className="ghost-preview-bar" style={{ width: `${w}%` }} />
            <span className="ghost-preview-tag" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* Teaser année 2025 (grille 12 mois, aperçu étape 2) */
const TRIMESTRES = [
  { label: 'T1', mois: ['Janv.', 'Févr.', 'Mars'] },
  { label: 'T2', mois: ['Avr.',  'Mai',   'Juin'] },
  { label: 'T3', mois: ['Juil.', 'Août',  'Sept.'] },
  { label: 'T4', mois: ['Oct.',  'Nov.',  'Déc.'] },
]

function YearPreview() {
  return (
    <div className="ctx-card year-preview">
      <div className="year-preview-head">
        <span className="year-preview-title">Activité 2025</span>
        <span className="year-preview-sub">12 mois à cocher</span>
      </div>
      <div className="year-preview-grid">
        {TRIMESTRES.map((t) => (
          <div key={t.label} className="year-preview-trim">
            <span className="year-preview-trim-label">{t.label}</span>
            <div className="year-preview-trim-cells">
              {t.mois.map((m) => (
                <div key={m} className="year-preview-cell">{m}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="year-preview-foot">
        <span className="year-preview-arrow" aria-hidden="true">→</span>
        Étape 2 : cochez vos mois travaillés par employeur
      </div>
    </div>
  )
}

/* Compteur base INSEE + répartition fonds */
function DataCount() {
  const fondsEntries = Object.entries(FONDS_MAP) // [idcc, fonds]
  return (
    <div className="ctx-card data-count">
      <div className="data-count-head">
        <span className="data-count-num">{fondsEntries.length}</span>
        <span className="data-count-label">conventions couvertes</span>
      </div>
      <div className="data-count-split" aria-hidden="true">
        {fondsEntries.map(([idcc, f]) => (
          <span
            key={idcc}
            className="data-count-split-cell"
            style={{ background: f.couleur }}
          />
        ))}
      </div>
      <div className="data-count-legend">
        {fondsEntries.map(([idcc, f]) => (
          <span key={idcc} className="data-count-legend-item">
            <span className="data-count-legend-dot" style={{ background: f.couleur }} />
            {f.nom}
            <span className="data-count-legend-idcc">IDCC {idcc}</span>
          </span>
        ))}
      </div>

      <dl className="data-count-stats">
        {fondsEntries.map(([idcc, f]) => (
          <div key={idcc} className="data-count-stat">
            <dt>
              <span className="data-count-stat-dot" style={{ background: f.couleur }} />
              Droits max
            </dt>
            <dd>
              <strong>{f.trancheMax}</strong>
              <span className="data-count-stat-unit">mois</span>
              <span className="data-count-stat-sub">· {f.nom}</span>
            </dd>
          </div>
        ))}
        <div className="data-count-stat">
          <dt>Barèmes à jour</dt>
          <dd><strong>Avril 2026</strong></dd>
        </div>
      </dl>

      <p className="data-count-src">
        Recherche en temps réel · base SIRENE / INSEE
      </p>
    </div>
  )
}

/* Lien ressource */
function ResLink({ href, tag, tagColor, children }) {
  const arrow = (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="ctx-resource-arrow">
      <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="ctx-resource-link">
      {tag && (
        <span className="ctx-resource-tag" style={{ background: tagColor + '1e', color: tagColor }}>{tag}</span>
      )}
      <span className="ctx-resource-label">{children}</span>
      {arrow}
    </a>
  )
}

/* Lexique item (toujours visible) */
function LexiqueItem({ term, children }) {
  return (
    <div className="ctx-lexique-item">
      <dt>{term}</dt>
      <dd className="ctx-lexique-dd">{children}</dd>
    </div>
  )
}

/* Carte ressources permanente */
export function ResourcesCard() {
  const [showContact, setShowContact] = useState(false)
  const [openRes, setOpenRes]         = useState(false)

  return (
    <div className="ctx-card ctx-card--resources">

      {/* En-tête cliquable */}
      <button
        type="button"
        className="ctx-res-toggle"
        onClick={() => setOpenRes(o => !o)}
        aria-expanded={openRes}
        aria-controls="ctx-res-body"
      >
        <span className="ctx-card-title">Ressources utiles</span>
        <svg
          className={`ctx-res-chevron${openRes ? ' ctx-res-chevron--open' : ''}`}
          width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
        >
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Contenu collapsible */}
      <div id="ctx-res-body" className={`ctx-res-body${openRes ? ' ctx-res-body--open' : ''}`}>
        <div className="ctx-res-inner">
          <ResLink href="https://www.ccneac.fr/wp-content/uploads/2022/11/20220615_CCNEAC-1.pdf" tag="FNAS" tagColor="#0284c7">
            CCNEAC - Convention IDCC 1285 (PDF)
          </ResLink>
          <ResLink href="https://synptac-cgt.com/wp-content/uploads/2021/04/ClausesCommunesCCNSVP.pdf" tag="CASC" tagColor="#7c3aed">
            CCNSVP - Convention IDCC 3090 (PDF)
          </ResLink>
          <div className="ctx-resource-separator"/>
          <ResLink href="https://www.afdas.com/" tag="AFDAS" tagColor="#059669">
            Formation professionnelle
          </ResLink>
          <ResLink href="https://www.audiens.org/" tag="Audiens" tagColor="#d97706">
            Mutuelle · prévoyance · retraite
          </ResLink>
          <div className="ctx-resource-separator"/>
          <p className="ctx-card-title">Lexique</p>
          <dl className="ctx-lexique">
            <LexiqueItem term="SIREN">Identifiant employeur (9 chiffres), disponible sur votre fiche de paie ou AEM</LexiqueItem>
            <LexiqueItem term="RFR">Revenu Fiscal de Référence, page 1 de votre avis d'imposition</LexiqueItem>
            <LexiqueItem term="QF">Quotient Familial - RFR ÷ nombre de parts fiscales</LexiqueItem>
            <LexiqueItem term="DSN">Déclaration Sociale Nominative - obligatoire pour ouvrir vos droits, responsabilité de l'employeur</LexiqueItem>
          </dl>
        </div>
      </div>

      {/* Contact & retours - toujours visible */}
      <div className="ctx-resource-separator"/>
      <p className="ctx-card-title">Contact &amp; retours</p>
      <button type="button" className="ctx-contact-link" onClick={() => setShowContact(true)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.7"/>
          <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
        <span className="ctx-contact-link-label">Bug, suggestion, retour…</span>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="ctx-resource-arrow">
          <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <p className="ctx-contact-disclaimer">
        Pour toute question sur vos droits ou le fonctionnement des fonds, contactez directement le{' '}
        <a href="https://www.casc-svp.fr" target="_blank" rel="noopener noreferrer">CASC-SVP</a>{' '}
        ou le <a href="https://fnas.net" target="_blank" rel="noopener noreferrer">FNAS</a> -{' '}
        Jauge ne remplace pas leur expertise.
      </p>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

    </div>
  )
}

/* Comment ça fonctionne (collapsible) */
function HowItWorks({ faded = false }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`ctx-card ctx-card--how${faded ? ' ctx-card--how-faded' : ''}`}>
      <button
        type="button"
        className="ctx-how-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="ctx-how-body"
      >
        <span className="ctx-card-title--big">Besoin d'aide&nbsp;?</span>
        <svg
          className={`ctx-how-chevron${open ? ' ctx-how-chevron--open' : ''}`}
          width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
        >
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <ol id="ctx-how-body" className="ctx-steps-list--big">
          <li>Ajoutez chacun de vos employeurs de l'année 2025.</li>
          <li>Indiquez vos mois de présence. 1h de présence dans le mois suffit.</li>
          <li>Indiquez vos revenus ainsi que la composition de votre foyer.</li>
          <li>Obtenez une estimation de vos droits.</li>
        </ol>
      )}
    </div>
  )
}

/* Panneau droit : panier live */
function SaisieAside({ saisieStep, fonds, employers, idccOverrides, selectionsMois }) {
  const hasEmployers = employers.length > 0

  return (
    <aside className="saisie-aside">

      <HowItWorks faded={hasEmployers} />

      {/* Panier - toujours présent */}
      <div className="ctx-card ctx-panier">
        <div className="ctx-panier-header">
          <p className="ctx-card-title">Votre saisie</p>
          {hasEmployers && (
            <span className="ctx-panier-badge">{employers.length}</span>
          )}
        </div>

        {!hasEmployers ? (
          <p className="ctx-panier-empty">
            Ajoutez un employeur pour voir votre récapitulatif ici.
          </p>
        ) : (
          <div className="ctx-panier-list">
            {employers.map((emp) => {
              const idcc = idccOverrides[emp.siren] ?? getIdccFromEmployer(emp)
              const f = getFondsForIdcc(idcc)
              const moisCount = selectionsMois[emp.siren]?.size ?? 0
              const tranche   = f ? Math.min(moisCount, f.trancheMax) : 0
              const isMax     = f && moisCount >= f.trancheMax

              return (
                <div key={emp.siren} className="ctx-panier-item">
                  <div className="ctx-panier-item-header">
                    <span className="ctx-panier-nom" title={cleanNom(emp.nom_complet ?? emp.nom)}>
                      {cleanNom(emp.nom_complet ?? emp.nom)}
                    </span>
                    {f && (
                      <span className="ctx-panier-fonds" style={{ color: f.couleur }}>
                        {f.nom}
                      </span>
                    )}
                  </div>
                  {saisieStep === 2 && f && (
                    <div className="ctx-panier-mois-row">
                      <div className="ctx-fonds-recap-bar" aria-hidden="true">
                        <div
                          className="ctx-fonds-recap-fill"
                          style={{
                            width: `${Math.min((moisCount / f.trancheMax) * 100, 100)}%`,
                            background: f.couleur,
                          }}
                        />
                      </div>
                      <span className={`ctx-panier-mois-label${isMax ? ' ctx-panier-mois--max' : ''}`}>
                        {moisCount === 0
                          ? 'Aucun mois sélectionné'
                          : `${tranche}/${f.trancheMax} mois cotisés${isMax ? ' · max atteint' : ''}`}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Hint étape 1 - intégré au panier quand un fonds est détecté */}
      {saisieStep === 1 && fonds.length > 0 && (
        <p className="ctx-aside-hint">
          <span className="ctx-aside-hint-check" aria-hidden="true">✓</span>
          {fonds.length === 1
            ? `Fonds détecté : ${fonds[0].nom}. Continuez pour sélectionner vos mois.`
            : `${fonds.length} fonds détectés. Continuez pour sélectionner vos mois.`}
        </p>
      )}

      {/* Teaser année 2025 : on l'affiche à l'étape 1 quand aucun employeur, pour préfigurer l'étape 2 */}
      {saisieStep === 1 && !hasEmployers && <YearPreview />}

    </aside>
  )
}

/* Vue principale */
export function SaisieView({
  saisieStep, onNextStep, onPrevStep,
  employers, idccOverrides, onAdd, onRemove, onIdccOverride,
  fonds, selectionsMois, onMoisChange, taillesSalaries, onTailleChange,
  onResultat, hasFNAS, qfReady, onVoirDroits,
  qfSaved, onQfSave,
}) {
  const [showSearch, setShowSearch] = useState(employers.length === 0)
  const [disclaimerOk, setDisclaimerOk] = useState(false)
  const ajouterRef = useRef(null)

  const handleSelect = (emp) => {
    onAdd(emp)
    setShowSearch(false)
  }

  /* hasMois : au moins un employeur avec au moins un mois sélectionné */
  const hasMois = employers.some((emp) => (selectionsMois[emp.siren]?.size ?? 0) > 0)
  const canSubmit = qfReady && hasMois

  /* Tranches max atteintes : calculées par fonds (union des mois de tous les employeurs du fonds) */
  const tranchesMaxAtteintes = fonds.filter((f) => {
    const sirens = employers
      .filter((emp) => {
        const idcc = idccOverrides[emp.siren] ?? getIdccFromEmployer(emp)
        return getFondsForIdcc(idcc)?.id === f.id
      })
      .map((emp) => emp.siren)
    const union = new Set(sirens.flatMap((s) => [...(selectionsMois[s] ?? new Set())]))
    return union.size >= f.trancheMax
  })

  const aside = (
    <SaisieAside
      saisieStep={saisieStep}
      fonds={fonds}
      employers={employers}
      idccOverrides={idccOverrides}
      selectionsMois={selectionsMois}
    />
  )

  /* ÉTAPE 1 : Employeurs */
  if (saisieStep === 1) {
    return (
      <div className="saisie-layout">
        <div className="saisie-form">
          <div className="saisie-view">
            <section className="saisie-section">
              <h2 className="saisie-section-title">Vos employeurs</h2>
              <p className="saisie-hint">
                Entrez le nom ou le SIREN de chaque structure pour laquelle vous avez travaillé.{' '}
              
              </p>

              {employers.length === 0 ? (
                <>
                  <SearchBar
                    onSelect={handleSelect}
                    alreadyAdded={[]}
                    suggestions={EXEMPLES_STRUCTURES}
                  />
                  <GhostPreview />
                </>
              ) : (
                <EmployerList
                  employers={employers}
                  onRemove={onRemove}
                  idccOverrides={idccOverrides}
                  onIdccOverride={onIdccOverride}
                />
              )}
            </section>

            {employers.length > 0 && (
              <div className="saisie-ajouter" ref={ajouterRef}>
                {showSearch ? (
                  <div className="saisie-search-bloc">
                    <SearchBar onSelect={handleSelect} alreadyAdded={employers.map((e) => e.siren)} />
                    <button className="btn-ajouter-cancel" type="button" onClick={() => setShowSearch(false)}>
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button className="btn-ajouter-employeur" type="button" onClick={() => setShowSearch(true)}>
                    + Ajouter un employeur
                  </button>
                )}
              </div>
            )}

            {/* Bouton Continuer - toujours visible dès qu'un fonds est détecté */}
            {fonds.length > 0 && (
              <div className="saisie-cta">
                <button className="btn-voir-droits" type="button" onClick={onNextStep}>
                  Continuer - sélectionner les périodes →
                </button>
              </div>
            )}
          </div>
        </div>
        {aside}
        <aside className="saisie-resources">
          <ResourcesCard />
          {/* Compteur base INSEE : uniquement quand aucun employeur, pour remplir la colonne et rassurer */}
          {employers.length === 0 && <DataCount />}
        </aside>
      </div>
    )
  }

  /* ÉTAPE 2 : Périodes + QF */
  return (
    <div className="saisie-layout">
      <div className="saisie-form">
        <div className="saisie-view">
          <button className="btn-retour" type="button" onClick={onPrevStep}>
            ← Modifier mes employeurs
          </button>

          <section className="saisie-section">
            <h2 className="saisie-section-title">Vos périodes d'activité</h2>
            {tranchesMaxAtteintes.length > 0 && (
              <p className="saisie-hint saisie-hint--plafond">
                {tranchesMaxAtteintes.map((f) => `${f.nom} : tranche maximale atteinte.`).join(' ')}
              </p>
            )}
            <div className="month-cards">
              {employers.map((emp) => {
                const idcc = idccOverrides[emp.siren] ?? getIdccFromEmployer(emp)
                const f    = getFondsForIdcc(idcc)
                if (!f) return null
                return (
                  <MonthSelector
                    key={emp.siren}
                    fonds={f}
                    employeur={emp}
                    selection={selectionsMois[emp.siren] ?? new Set()}
                    onChange={(sel) => onMoisChange(emp.siren, sel)}
                    tailleSalaries={taillesSalaries[emp.siren] ?? 'A'}
                    onTailleChange={(t) => onTailleChange(emp.siren, t)}
                  />
                )
              })}
            </div>
          </section>

          {hasMois && (
            <section className="saisie-section">
              <h2 className="saisie-section-title">Votre quotient familial</h2>
              <p className="saisie-hint">
                Reportez le Revenu Fiscal de Référence de votre avis d'impôt 2025 (revenus 2024).
              </p>
              <QFCalculator
                showFNASFields={hasFNAS}
                initialValues={qfSaved}
                onSave={onQfSave}
                onResult={(data) => fonds.forEach((f) => onResultat(f.id, data))}
              />
            </section>
          )}

          {hasMois && (
            <div className="saisie-cta">
              <label className="disclaimer-check">
                <input
                  type="checkbox"
                  checked={disclaimerOk}
                  onChange={(e) => setDisclaimerOk(e.target.checked)}
                />
                <span>Je comprends que ces résultats sont une <strong>estimation indicative</strong> et ne constituent pas une garantie de droits.</span>
              </label>
              <button
                className="btn-voir-droits"
                disabled={!canSubmit || !disclaimerOk}
                onClick={onVoirDroits}
                type="button"
              >
                Voir mes droits →
              </button>
              {!canSubmit && !qfReady && (
                <p className="saisie-cta-hint">Renseignez votre quotient familial pour continuer.</p>
              )}
            </div>
          )}
        </div>
      </div>
      {aside}
      <aside className="saisie-resources">
        <ResourcesCard />
      </aside>
    </div>
  )
}
