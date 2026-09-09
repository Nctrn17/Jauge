import { useState, useEffect, useRef, useCallback } from 'react'
import { JaugeBackground } from './components/JaugeBackground'
import { SearchBar } from './components/SearchBar'
import { EmployerList } from './components/EmployerList'
import { MonthSelector } from './components/MonthSelector'
import { QFCalculator } from './components/QFCalculator'
import { ResultsCASC } from './components/ResultsCASC'
import { ResultsFNAS } from './components/ResultsFNAS'
import { DroitsOuvertsCheck } from './components/DroitsOuvertsCheck'
import { ContactModal } from './components/ContactModal'
import { getFondsForIdcc, getIdccFromEmployer, getAllIdccsFromEmployer } from './data/fonds'
import { buildShareUrl, readShareFromUrl, clearShareFromUrl } from './share'

const EXEMPLES_STRUCTURES = [
  'Jolie Môme',
  'Théâtre du Peuple',
  'Les Ateliers Frappaz',
  'La Maroquinerie',
  "Mains d'Œuvres",
]

const FONDS_PRATIQUE = {
  'casc-svp': {
    liens: [
      { label: 'CASC-SVP : site officiel', url: 'https://www.casc-svp.fr' },
      { label: 'Convention IDCC 3090 : Légifrance', url: 'https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000045198616/' },
      { label: 'Formulaire de contact CASC-SVP', url: 'https://casc-svp.portailce.com/Article/Article/44' },
    ],
    etapes: [
      "Créer un compte sur casc-svp.fr si ce n'est pas encore fait : les démarches se font en ligne.",
      'Conserver toutes les factures.',
      'Les modalités varient selon les aides : consulter le mode d\'emploi sur casc-svp.fr.',
    ],
  },
  fnas: {
    liens: [
      { label: 'FNAS : site officiel', url: 'https://fnas.net' },
      { label: 'Convention CCNEAC, IDCC 1285 (PDF)', url: 'https://www.ccneac.fr/wp-content/uploads/2022/11/20220615_CCNEAC-1.pdf' },
      { label: 'Accès espace bénéficiaire FNAS', url: 'https://eod.fnas.net/' },
    ],
    etapes: [
      "Les demandes se déposent sur eod.fnas.net : créer un compte si ce n'est pas encore fait.",
      'Conserver toutes les factures.',
      'Consulter le règlement sur fnas.net.',
    ],
  },
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function scrollToRef(ref) {
  const el = ref.current
  if (!el) return
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

function fondsDetectes(employers, idccOverrides) {
  const found = new Map()
  for (const emp of employers) {
    const hasOverride = Object.hasOwn(idccOverrides, emp.siren)
    const idcc = hasOverride ? idccOverrides[emp.siren] : getIdccFromEmployer(emp)
    if (!idcc) continue
    const fonds = getFondsForIdcc(idcc)
    if (fonds && !found.has(fonds.id)) found.set(fonds.id, fonds)
  }
  return [...found.values()]
}

// Une fiche employeur détaillée n'est utile que si un choix reste à faire :
// convention non couverte, ou plusieurs conventions couvertes déclarées.
function demandeArbitrage(emp, idccOverrides) {
  const couvertes = getAllIdccsFromEmployer(emp).filter((i) => getFondsForIdcc(i) != null)
  const hasOverride = Object.hasOwn(idccOverrides, emp.siren)
  if (couvertes.length > 1 && (!hasOverride || idccOverrides[emp.siren] == null)) return true
  const idcc = hasOverride ? idccOverrides[emp.siren] : getIdccFromEmployer(emp)
  return getFondsForIdcc(idcc) == null
}

function Logo() {
  return (
    <svg width="22" height="19" viewBox="0 0 44 38" fill="none" aria-hidden="true">
      <path
        d="M5.5 4C5.6 13 5.8 22 6 31M14 3c0 9-.2 18-.5 27M22 5c.1 9 .3 17 .5 26M30.5 4c.1 9-.1 18-.5 26M1 32C12 26 25 18 40 8"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round"
      />
    </svg>
  )
}

function ResultActions({ shareUrl }) {
  const [copied, setCopied] = useState(false)
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copiez le lien ci-dessous :', shareUrl)
    }
  }
  return (
    <span className="rideau-footer-links">
      <button type="button" className="rideau-linkbtn" onClick={() => window.print()}>
        Imprimer / enregistrer en PDF
      </button>
      <button type="button" className="rideau-linkbtn" onClick={copier}>
        {copied ? 'Lien copié ✓' : 'Copier le lien'}
      </button>
    </span>
  )
}

export default function RideauApp() {
  const [restored] = useState(readShareFromUrl)
  const [employers, setEmployers] = useState(() =>
    restored?.e.map((x) => ({ siren: x.s, nom_complet: x.n })) ?? [])
  const [idccOverrides, setIdccOverrides] = useState(() =>
    restored ? Object.fromEntries(restored.e.map((x) => [x.s, x.i])) : {})
  const [selectionsMois, setSelectionsMois] = useState(() =>
    restored
      ? Object.fromEntries(Object.entries(restored.m ?? {}).map(([s, arr]) => [s, new Set(arr)]))
      : {})
  const [taillesSalaries, setTaillesSalaries] = useState(() => restored?.t ?? {})
  const [qfSaved, setQfSaved] = useState(restored?.q ?? null)
  const [resultats, setResultats] = useState({})
  const [disclaimerOk, setDisclaimerOk] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showContact, setShowContact] = useState(false)

  const secMois = useRef(null)
  const secFoyer = useRef(null)
  const secResultats = useRef(null)

  // L'URL est nettoyée après restauration : la saisie ne survit pas à un refresh.
  useEffect(() => { clearShareFromUrl() }, [])

  const addEmployer = (employer) => {
    setEmployers((prev) => prev.some((e) => e.siren === employer.siren) ? prev : [...prev, employer])
    setTimeout(() => scrollToRef(secMois), 260)
  }

  const removeEmployer = (siren) => {
    setEmployers((prev) => prev.filter((e) => e.siren !== siren))
    setIdccOverrides((prev) => { const next = { ...prev }; delete next[siren]; return next })
    setSelectionsMois((prev) => { const next = { ...prev }; delete next[siren]; return next })
    setTaillesSalaries((prev) => { const next = { ...prev }; delete next[siren]; return next })
  }

  const onResultat = useCallback((data) => {
    setResultats((prev) => ({ ...prev, data }))
  }, [])

  const fonds = fondsDetectes(employers, idccOverrides)
  const hasFNAS = fonds.some((f) => f.id === 'fnas')
  const hasBoth = fonds.length === 2
  const res = resultats.data
  const qfReady = (res?.qf ?? 0) > 0

  const sirensDuFonds = (fondsId) => employers
    .filter((emp) => {
      const idcc = idccOverrides[emp.siren] ?? getIdccFromEmployer(emp)
      return getFondsForIdcc(idcc)?.id === fondsId
    })

  const tranchesByFond = Object.fromEntries(fonds.map((f) => [
    f.id,
    new Set(sirensDuFonds(f.id).flatMap((e) => [...(selectionsMois[e.siren] ?? new Set())])),
  ]))

  const taillesByFond = Object.fromEntries(fonds.map((f) => {
    const emp = sirensDuFonds(f.id).find((e) => taillesSalaries[e.siren])
    return [f.id, emp ? taillesSalaries[emp.siren] : 'A']
  }))

  // Les clés de sélection sont "annee-mois" ; le fond ne retient que le mois.
  const clesMois = new Set(
    employers.flatMap((e) => [...(selectionsMois[e.siren] ?? new Set())])
  )
  const numerosMois = new Set([...clesMois].map((k) => Number(k.split('-')[1])))
  const totalMois = clesMois.size
  const hasMois = totalMois > 0
  const canSubmit = hasMois && qfReady && disclaimerOk

  const shareUrl = buildShareUrl({
    e: employers.map((emp) => ({
      s: emp.siren,
      n: emp.nom_complet ?? emp.nom,
      i: idccOverrides[emp.siren] ?? getIdccFromEmployer(emp),
    })),
    m: Object.fromEntries(employers.map((e) => [e.siren, [...(selectionsMois[e.siren] ?? new Set())]])),
    t: taillesSalaries,
    q: qfSaved,
  })

  const resultatsVisibles = showResults && fonds.length > 0 && qfReady

  return (
    <>
      <JaugeBackground moisAllumes={numerosMois} demo={employers.length === 0} />

      <div className="rideau">
        <div className="rideau-header">
          <a className="rideau-brand" href="/">
            <Logo />
            Jauge
          </a>
          <nav className="rideau-nav">
            <a href="/guides">Guides</a>
            <a href="/casc-ou-fnas">CASC ou FNAS</a>
            <a href="/a-propos">À propos</a>
          </nav>
          <span className="rideau-count">
            {employers.length === 0
              ? '12 mois'
              : `${totalMois} mois ${totalMois > 1 ? 'cochés' : 'coché'}`}
          </span>
        </div>

        <section className="rideau-hero">
          <h1>Douze mois de droits. Jamais demandés.</h1>
          <div className="rideau-hero-grid">
            <p className="rideau-hero-lede">
              Estimez vos droits d'action sociale au CASC-SVP et au FNAS : deux fonds
              qui financent des aides que la plupart des salarié·es du spectacle ne
              réclament jamais. Chaque mois travaillé allume une barre. Sans compte,
              rien ne quitte votre navigateur.
            </p>
            <div className="rideau-panel rideau-panel--search">
              <SearchBar
                onSelect={addEmployer}
                alreadyAdded={employers.map((e) => e.siren)}
                suggestions={employers.length === 0 ? EXEMPLES_STRUCTURES : undefined}
              />
            </div>
          </div>
        </section>

        <div className="rideau-flow">

          {/* 02 : employeurs et mois travaillés */}
          {employers.length > 0 && (
            <section className="rideau-panel" ref={secMois}>
              <div className="rideau-panel-head">
                <h2>
                  <span className="rideau-step">02</span>
                  Vos mois travaillés
                </h2>
                <span className="rideau-panel-note">
                  Un mois est compté dès une heure de présence. La tranche se lit sur
                  l'ensemble de vos employeurs d'un même fonds.
                </span>
              </div>

              <EmployerList
                employers={employers.filter((e) => demandeArbitrage(e, idccOverrides))}
                onRemove={removeEmployer}
                idccOverrides={idccOverrides}
                onIdccOverride={(siren, idcc) =>
                  setIdccOverrides((prev) => ({ ...prev, [siren]: idcc }))}
              />

              {fonds.length === 0 ? (
                <div className="rideau-nofonds" role="status">
                  <p className="rideau-nofonds-title">Aucun fonds détecté pour le moment</p>
                  <p>
                    Jauge couvre uniquement le CASC-SVP (convention du spectacle vivant privé,
                    IDCC 3090) et le FNAS (entreprises artistiques et culturelles, IDCC 1285).
                    Si aucun de vos employeurs ne relève de ces deux conventions, nous ne
                    pouvons pas estimer vos droits.
                  </p>
                  <p>
                    La convention prise en compte est celle déclarée par l'employeur dans la base
                    SIRENE. Si cette déclaration est erronée, les droits ne s'ouvrent de toute
                    façon qu'après régularisation par l'employeur.{' '}
                    <a href="/idcc-spectacle-vivant">Comprendre les conventions du spectacle vivant</a>
                  </p>
                </div>
              ) : (
                <div className="rideau-stack" style={{ marginTop: 28 }}>
                  {employers.map((emp) => {
                    const idcc = idccOverrides[emp.siren] ?? getIdccFromEmployer(emp)
                    const f = getFondsForIdcc(idcc)
                    // Tant qu'un arbitrage de convention reste à faire, on ne
                    // préjuge pas du fonds : pas de grille de mois.
                    if (!f || demandeArbitrage(emp, idccOverrides)) return null
                    return (
                      <MonthSelector
                        key={emp.siren}
                        fonds={f}
                        employeur={emp}
                        selection={selectionsMois[emp.siren] ?? new Set()}
                        onChange={(sel) => setSelectionsMois((p) => ({ ...p, [emp.siren]: sel }))}
                        tailleSalaries={taillesSalaries[emp.siren] ?? 'A'}
                        onTailleChange={(t) => setTaillesSalaries((p) => ({ ...p, [emp.siren]: t }))}
                      />
                    )
                  })}
                </div>
              )}

              <div className="rideau-add">
                <span className="rideau-add-label">+ AJOUTER UN AUTRE EMPLOYEUR</span>
                <SearchBar onSelect={addEmployer} alreadyAdded={employers.map((e) => e.siren)} />
              </div>
            </section>
          )}

          {/* 03 : foyer */}
          {hasMois && (
            <section className="rideau-panel" ref={secFoyer}>
              <div className="rideau-panel-head">
                <h2>
                  <span className="rideau-step">03</span>
                  Votre foyer
                </h2>
                <span className="rideau-panel-note">
                  Revenu fiscal de référence de votre avis d'impôt 2025 (revenus 2024).
                  Le quotient familial fixe le taux de prise en charge.
                </span>
              </div>

              <QFCalculator
                showFNASFields={hasFNAS}
                initialValues={qfSaved}
                onSave={setQfSaved}
                onResult={onResultat}
              />

              <div className="rideau-submit">
                <label className="rideau-check">
                  <input
                    type="checkbox"
                    checked={disclaimerOk}
                    onChange={(e) => setDisclaimerOk(e.target.checked)}
                  />
                  <span>
                    Je comprends que ces résultats sont une <strong>estimation indicative</strong>{' '}
                    et ne constituent pas une garantie de droits.
                  </span>
                </label>
                <button
                  type="button"
                  className="rideau-cta"
                  disabled={!canSubmit}
                  onClick={() => {
                    setShowResults(true)
                    setTimeout(() => scrollToRef(secResultats), 80)
                  }}
                >
                  Lire la jauge →
                </button>
                {!qfReady && (
                  <p className="rideau-submit-hint">
                    Renseignez votre revenu fiscal de référence pour continuer.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* 04 : résultats */}
          {resultatsVisibles && (
            <section className="rideau-results" ref={secResultats}>
              <div className="rideau-panel-head" style={{ marginBottom: 4 }}>
                <h2>
                  <span className="rideau-step">04</span>
                  Vous pouvez demander
                </h2>
                <span className="rideau-panel-note">
                  Ces montants supposent que vos employeurs sont à jour de leurs
                  déclarations nominatives (DSN).{' '}
                  <a href="#verifier-droits">Comment vérifier&nbsp;?</a>
                  <span className="print-only">
                    Document généré par Jauge (jauge.app) à partir des informations
                    saisies par l'utilisateur, supposées exactes.
                  </span>
                </span>
              </div>

              <div className="rideau-results-grid">
                {fonds.map((f) => {
                  const tranche = Math.min(tranchesByFond[f.id]?.size ?? 0, f.trancheMax)
                  if (tranche === 0) return null
                  return (
                    <div
                      key={f.id}
                      className="rideau-result-card"
                      style={{ '--card-accent': f.couleur }}
                    >
                      <div className="rideau-result-head" style={{ color: f.couleur }}>
                        <span>{f.nom}</span>
                        <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: f.couleur }}>
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
                          <p className="results-disclaimer">QF FNAS non calculé.</p>
                        )
                      ) : (
                        <ResultsCASC qf={res.qf} tranche={tranche} situation={res} />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="rideau-footnote">
                <span>
                  Estimation indicative. Le droit réel dépend de votre situation vérifiée
                  par chaque fonds.
                </span>
                <ResultActions shareUrl={shareUrl} />
              </div>

              <div className="rideau-pratique">
                {fonds.map((f) => {
                  const info = FONDS_PRATIQUE[f.id]
                  if (!info) return null
                  return (
                    <div key={f.id} className="rideau-note">
                      <p className="rideau-note-title" style={{ color: f.couleur }}>
                        {f.nom} : pour accéder aux aides
                      </p>
                      <ul>{info.etapes.map((e, i) => <li key={i}>{e}</li>)}</ul>
                      {info.liens.map((l) => (
                        <a key={l.url} className="ctx-link-row" href={l.url} target="_blank" rel="noopener noreferrer">
                          <span>{l.label}</span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      ))}
                    </div>
                  )
                })}

                {hasBoth && (
                  <div className="rideau-note">
                    <p className="rideau-note-title">Cumul CASC-SVP et FNAS</p>
                    <p>
                      Vous pouvez présenter <strong>la même facture aux deux fonds</strong>, mais
                      chacun ne prend en charge que la part non couverte par l'autre. Joignez
                      l'attestation de prise en charge du premier fonds au dossier du second.
                    </p>
                  </div>
                )}
              </div>

              <div id="verifier-droits" className="rideau-pratique">
                {fonds.map((f) => (
                  <DroitsOuvertsCheck
                    key={f.id}
                    fonds={f}
                    employers={sirensDuFonds(f.id)}
                    selectionsMois={selectionsMois}
                  />
                ))}
              </div>

              <div className="rideau-footnote">
                <span>
                  Pour toute question sur vos droits réels, contactez directement{' '}
                  <a href="https://www.casc-svp.fr" target="_blank" rel="noopener noreferrer">le CASC-SVP</a>{' '}
                  ou <a href="https://fnas.net" target="_blank" rel="noopener noreferrer">le FNAS</a>.
                  Jauge ne remplace pas leur expertise.{' '}
                  <button type="button" className="rideau-linkbtn" onClick={() => setShowContact(true)}>
                    Un bug ou une suggestion&nbsp;?
                  </button>
                </span>
              </div>
            </section>
          )}

          <div className="rideau-footer">
            <span>
              © 2026 Jauge, outil indépendant, non affilié au CASC-SVP ni au FNAS. AGPL-3.0.
            </span>
            <span className="rideau-footer-links">
              <a href="/guides">Guides</a>
              <a href="/glossaire">Glossaire</a>
              <a href="/mentions-legales">Mentions légales</a>
              <a href="/politique-de-confidentialite">Confidentialité</a>
            </span>
          </div>
        </div>
      </div>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </>
  )
}
