import { useState, useEffect, lazy, Suspense } from 'react'
import { LandingPage } from './components/LandingPage'
import { ContactModal } from './components/ContactModal'

const SimulatorApp = lazy(() => import('./SimulatorApp'))

export default function App() {
  const [vue, setVue] = useState('landing')
  const [contactFromUrl, setContactFromUrl] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('contact') === 'open') {
      setContactFromUrl(true)
      params.delete('contact')
      const search = params.toString()
      const newUrl = window.location.pathname + (search ? `?${search}` : '') + window.location.hash
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

  return (
    <>
      {vue === 'landing' ? (
        <LandingPage onStart={() => setVue('simulator')} />
      ) : (
        <Suspense fallback={null}>
          <SimulatorApp onHome={() => setVue('landing')} />
        </Suspense>
      )}
      {contactFromUrl && <ContactModal onClose={() => setContactFromUrl(false)} />}
    </>
  )
}
