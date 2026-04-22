import { useState, lazy, Suspense } from 'react'
import { LandingPage } from './components/LandingPage'

const SimulatorApp = lazy(() => import('./SimulatorApp'))

export default function App() {
  const [vue, setVue] = useState('landing')

  if (vue === 'landing') {
    return (
      <LandingPage
        onStart={() => setVue('simulator')}
      />
    )
  }

  return (
    <Suspense fallback={null}>
      <SimulatorApp onHome={() => setVue('landing')} />
    </Suspense>
  )
}
