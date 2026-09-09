import { useState, useEffect } from 'react'
import RideauApp from './RideauApp'
import { ContactModal } from './components/ContactModal'

export default function App() {
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
      <RideauApp />
      {contactFromUrl && <ContactModal onClose={() => setContactFromUrl(false)} />}
    </>
  )
}
