import { useState, useRef, useEffect } from 'react'
import { useSearch, cleanNom, DEBOUNCE_MS } from '../hooks/useSearch'
import { getFondsForIdcc, getIdccFromEmployer, getAllIdccsFromEmployer } from '../data/fonds'

function normalizeInput(raw) {
  const stripped = raw.replace(/\s+/g, '')
  if (/^\d{14}$/.test(stripped)) return stripped.slice(0, 9)  // SIRET → SIREN
  if (/^\d{9}$/.test(stripped))  return stripped              // SIREN avec espaces → SIREN
  return raw                                                   // nom : on ne touche à rien
}

function looksNumeric(raw) {
  const stripped = raw.replace(/\s+/g, '')
  return /^\d{9}$/.test(stripped) || /^\d{14}$/.test(stripped)
}

function looksLikeSiret(raw) {
  return /^\d{14}$/.test(raw.replace(/\s+/g, ''))
}

export function SearchBar({ onSelect, alreadyAdded, suggestions }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const { results, loading, error, search, clear } = useSearch()
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const typingRef = useRef(null)

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setOpen(true)
    const normalized = normalizeInput(value)
    setIsTyping(true)
    clearTimeout(typingRef.current)
    typingRef.current = setTimeout(
      () => setIsTyping(false),
      looksNumeric(value) ? 0 : DEBOUNCE_MS
    )
    search(normalized)
  }

  const handleSuggestionClick = (text) => {
    setQuery(text)
    setOpen(true)
    setIsTyping(false)
    search(normalizeInput(text))
    inputRef.current?.focus()
  }

  const handleSelect = (employer) => {
    onSelect(employer)
    setQuery('')
    setOpen(false)
    clear()
  }

  const handleClear = () => {
    setQuery('')
    setOpen(false)
    setIsTyping(false)
    clearTimeout(typingRef.current)
    clear()
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hint = looksLikeSiret(query)
    ? 'SIRET détecté - réduit au SIREN'
    : looksNumeric(query)
    ? 'Recherche par SIREN'
    : query.length > 0 && query.length < 3
    ? '3 caractères minimum pour lancer la recherche'
    : query.length >= 3
    ? 'Recherche par nom'
    : null

  const filtered = results.filter((r) => !alreadyAdded.includes(r.siren))
  const coveredResults = filtered.filter((r) => getFondsForIdcc(getIdccFromEmployer(r)) != null)
  const uncoveredResults = filtered.filter((r) => getFondsForIdcc(getIdccFromEmployer(r)) == null)
  const hasResults = filtered.length > 0

  const renderItem = (r, uncovered = false) => {
    const idcc = getIdccFromEmployer(r)
    const allIdccs = getAllIdccsFromEmployer(r)
    const fonds = idcc ? getFondsForIdcc(idcc) : null
    const commune = r.siege?.libelle_commune
    const cp = r.siege?.code_postal
    const titreConvention = r.conventions_collectives?.[0]?.titre

    return (
      <li
        key={r.siren}
        className={`search-dropdown-item ${uncovered ? 'search-dropdown-item--uncovered' : 'search-dropdown-item--covered'}`}
        onMouseDown={() => handleSelect(r)}
      >
        <div className="dropdown-header">
          <div className="dropdown-nom">{cleanNom(r.nom_complet)}</div>
          {fonds && (
            <span className="dropdown-badge-fonds" style={{ background: fonds.couleur }}>
              {fonds.nom}
            </span>
          )}
        </div>
        <div className="dropdown-meta">
          <span className="dropdown-siren">SIREN {r.siren}</span>
          {(commune || cp) && (
            <span className="dropdown-commune">{cp && `${cp} `}{commune}</span>
          )}
          {allIdccs.length > 0 && (
            <span className={`dropdown-idcc ${uncovered ? 'dropdown-idcc--uncovered' : fonds ? 'dropdown-idcc--covered' : ''}`}>
              {allIdccs.length === 1
                ? `IDCC ${allIdccs[0]}${uncovered && titreConvention ? ` - ${titreConvention}` : ''}`
                : `IDCC ${allIdccs.join(', ')}`}
              {uncovered && <span className="dropdown-idcc-tag">non couvert</span>}
            </span>
          )}
        </div>
      </li>
    )
  }

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Nom de l'employeur, SIREN ou SIRET"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 3 && setOpen(true)}
          autoComplete="off"
        />
        {loading && <span className="search-spinner" />}
        {!loading && query.length > 0 && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
            aria-label="Effacer la recherche"
            title="Effacer"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {hint && <p className="search-hint">{hint}</p>}
      {error && <p className="search-error">{error}</p>}

      {suggestions && suggestions.length > 0 && query.length === 0 && (
        <div className="search-suggestions">
          <span className="search-suggestions-label">Exemples pour démarrer</span>
          <div className="search-suggestions-row">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="search-suggestion-chip"
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {open && hasResults && (
        <ul className="search-dropdown">
          {coveredResults.length > 0 && uncoveredResults.length > 0 && (
            <li className="dropdown-separator">Structures couvertes</li>
          )}
          {coveredResults.map((r) => renderItem(r, false))}

          {uncoveredResults.length > 0 && (
            <li className="dropdown-separator dropdown-separator--uncovered">
              Autres structures - convention non couverte
            </li>
          )}
          {uncoveredResults.map((r) => renderItem(r, true))}
        </ul>
      )}

      {open && !loading && !isTyping && query.length >= 3 && !hasResults && !error && (
        <div className="search-empty">Aucun résultat pour « {query} »</div>
      )}
    </div>
  )
}
