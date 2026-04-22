import { useState, useCallback, useRef } from 'react'

const API_BASE = 'https://recherche-entreprises.api.gouv.fr'

export const DEBOUNCE_MS = 400

const isSiren = (query) => /^\d{9}$/.test(query.trim())

export function cleanNom(nom) {
  if (!nom) return nom
  return nom.replace(/\s*\(([^)]+)\)\s*$/, (match, inner) => {
    const base = nom.slice(0, nom.length - match.length).trim().toUpperCase()
    return inner.trim().toUpperCase() === base ? '' : match
  }).trim()
}

export function useSearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  const search = useCallback((query) => {
    const trimmed = query.trim()

    if (trimmed.length < 3) {
      setResults([])
      setError(null)
      return
    }

    clearTimeout(debounceRef.current)

    const delay = isSiren(trimmed) ? 0 : DEBOUNCE_MS

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const q = encodeURIComponent(trimmed)
        const res = await fetch(`${API_BASE}/search?q=${q}&page=1&per_page=6`)
        if (!res.ok) throw new Error(`Erreur ${res.status}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {
        setError('Impossible de contacter le service. Vérifiez votre connexion.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, delay)
  }, [])

  const clear = useCallback(() => {
    clearTimeout(debounceRef.current)
    setResults([])
    setError(null)
    setLoading(false)
  }, [])

  return { results, loading, error, search, clear }
}
