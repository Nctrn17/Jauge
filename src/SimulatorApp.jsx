import { useState, useEffect } from 'react'
import { SaisieView } from './components/SaisieView'
import { ResultatsView } from './components/ResultatsView'
import { Sidebar } from './components/Sidebar'
import { getFondsForIdcc, getIdccFromEmployer } from './data/fonds'

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
  const [saisieStep, setSaisieStep] = useState(1)
  const [vue, setVue] = useState('saisie')
  const [employers, setEmployers] = useState([])
  const [idccOverrides, setIdccOverrides] = useState({})
  const [selectionsMois, setSelectionsMois] = useState({})
  const [taillesSalaries, setTaillesSalaries] = useState({})
  const [resultats, setResultats] = useState({})
  const [qfSaved, setQfSaved] = useState(null)

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

  useEffect(() => { window.scrollTo(0, 0) }, [vue, saisieStep])

  useEffect(() => {
    if (window.innerWidth <= 768) return
    const root = document.documentElement
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      root.style.setProperty('--mesh-scroll', (window.scrollY / max).toFixed(3))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      root.style.removeProperty('--mesh-scroll')
    }
  }, [])

  return (
    <>
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-blob landing-blob--1" />
        <div className="landing-blob landing-blob--2" />
        <div className="landing-blob landing-blob--3" />
        <div className="landing-blob landing-blob--4" />
        <div className="landing-blob landing-blob--5" />
      </div>
      <div className="app">
        <Sidebar
          step={currentStep}
          fonds={fonds}
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
              selectionsMois={selectionsMois}
              tranchesByFond={tranchesByFond}
              taillesByFond={taillesByFond}
              resultats={resultats}
              onRetour={() => { setVue('saisie'); setSaisieStep(2) }}
            />
          </div>
        </main>
      </div>
    </>
  )
}
