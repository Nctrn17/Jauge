import { useState, useEffect } from 'react'
import { SaisieView } from './components/SaisieView'
import { ResultatsView } from './components/ResultatsView'
import { Sidebar } from './components/Sidebar'
import { getFondsForIdcc, getIdccFromEmployer } from './data/fonds'
import { buildShareUrl, readShareFromUrl, clearShareFromUrl } from './share'

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

export default function SimulatorApp({ onHome }) {
  const [restored] = useState(readShareFromUrl)
  const [saisieStep, setSaisieStep] = useState(restored ? 2 : 1)
  const [vue, setVue] = useState('saisie')
  const [employers, setEmployers] = useState(() =>
    restored?.e.map((x) => ({ siren: x.s, nom_complet: x.n })) ?? [])
  const [idccOverrides, setIdccOverrides] = useState(() =>
    restored ? Object.fromEntries(restored.e.map((x) => [x.s, x.i])) : {})
  const [selectionsMois, setSelectionsMois] = useState(() =>
    restored
      ? Object.fromEntries(Object.entries(restored.m ?? {}).map(([s, arr]) => [s, new Set(arr)]))
      : {})
  const [taillesSalaries, setTaillesSalaries] = useState(() => restored?.t ?? {})
  const [resultats, setResultats] = useState({})
  const [qfSaved, setQfSaved] = useState(restored?.q ?? null)

  // L'URL est nettoyée après restauration : la saisie ne survit pas à un refresh.
  useEffect(() => { clearShareFromUrl() }, [])

  const addEmployer = (employer) =>
    setEmployers((prev) => prev.some((e) => e.siren === employer.siren) ? prev : [...prev, employer])

  const removeEmployer = (siren) => {
    setEmployers((prev) => prev.filter((e) => e.siren !== siren))
    setIdccOverrides((prev) => { const next = { ...prev }; delete next[siren]; return next })
    setSelectionsMois((prev) => { const next = { ...prev }; delete next[siren]; return next })
    setTaillesSalaries((prev) => { const next = { ...prev }; delete next[siren]; return next })
  }

  const overrideIdcc = (siren, idcc) =>
    setIdccOverrides((prev) => ({ ...prev, [siren]: idcc }))

  const updateMois = (siren, sel) =>
    setSelectionsMois((prev) => ({ ...prev, [siren]: sel }))

  const updateTaille = (siren, taille) =>
    setTaillesSalaries((prev) => ({ ...prev, [siren]: taille }))

  const updateResultat = (fondsId, data) =>
    setResultats((prev) => ({ ...prev, [fondsId]: data }))

  const resetAll = () => {
    setVue('saisie')
    setSaisieStep(1)
    setEmployers([])
    setIdccOverrides({})
    setSelectionsMois({})
    setTaillesSalaries({})
    setResultats({})
    setQfSaved(null)
  }

  const fonds    = fondsDetectes(employers, idccOverrides)
  const hasFNAS  = fonds.some((f) => f.id === 'fnas')
  const qfReady  = fonds.some((f) => resultats[f.id]?.qf > 0)

  const tranchesByFond = Object.fromEntries(fonds.map((f) => {
    const sirens = employers
      .filter((emp) => {
        const idcc = idccOverrides[emp.siren] ?? getIdccFromEmployer(emp)
        return getFondsForIdcc(idcc)?.id === f.id
      })
      .map((emp) => emp.siren)
    const union = new Set(sirens.flatMap((s) => [...(selectionsMois[s] ?? new Set())]))
    return [f.id, union]
  }))

  const taillesByFond = Object.fromEntries(fonds.map((f) => {
    const emp = employers.find((e) => {
      const idcc = idccOverrides[e.siren] ?? getIdccFromEmployer(e)
      return getFondsForIdcc(idcc)?.id === f.id && taillesSalaries[e.siren]
    })
    return [f.id, emp ? taillesSalaries[emp.siren] : 'A']
  }))

  useEffect(() => {
    if (employers.length === 0) setSaisieStep(1)
  }, [employers.length])

  const currentStep = vue === 'resultats' ? 3 : saisieStep

  const totalMois = new Set(
    employers.flatMap((e) => [...(selectionsMois[e.siren] ?? new Set())])
  ).size
  const qfValue = Object.values(resultats).find((r) => r?.qf > 0)?.qf ?? null
  const sidebarStats = {
    employerCount: employers.length,
    totalMois,
    qf: qfValue,
  }

  useEffect(() => { window.scrollTo(0, 0) }, [vue, saisieStep])

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

  return (
    <>
      <div className="app">
        <Sidebar
          step={currentStep}
          fonds={fonds}
          stats={sidebarStats}
          onNavigate={(targetStep) => {
            if (targetStep === 1) { setVue('saisie'); setSaisieStep(1) }
            if (targetStep === 2) { setVue('saisie'); setSaisieStep(2) }
          }}
          onReset={resetAll}
          onHome={onHome}
        />

        <main className="app-content">
          <div className={vue === 'saisie' ? 'view-panel view-panel--active' : 'view-panel view-panel--inactive'}>
            <SaisieView
              saisieStep={saisieStep}
              onNextStep={() => setSaisieStep(2)}
              onPrevStep={() => setSaisieStep(1)}
              employers={employers}
              idccOverrides={idccOverrides}
              onAdd={addEmployer}
              onRemove={removeEmployer}
              onIdccOverride={overrideIdcc}
              fonds={fonds}
              selectionsMois={selectionsMois}
              onMoisChange={updateMois}
              taillesSalaries={taillesSalaries}
              onTailleChange={updateTaille}
              onResultat={updateResultat}
              hasFNAS={hasFNAS}
              qfReady={qfReady}
              qfSaved={qfSaved}
              onQfSave={setQfSaved}
              onVoirDroits={() => setVue('resultats')}
            />
          </div>

          <div className={vue === 'resultats' ? 'view-panel view-panel--active' : 'view-panel view-panel--inactive'}>
            <ResultatsView
              fonds={fonds}
              employers={employers}
              idccOverrides={idccOverrides}
              selectionsMois={selectionsMois}
              tranchesByFond={tranchesByFond}
              taillesByFond={taillesByFond}
              resultats={resultats}
              shareUrl={shareUrl}
              onRetour={() => { setVue('saisie'); setSaisieStep(2) }}
            />
          </div>
        </main>
      </div>
    </>
  )
}
