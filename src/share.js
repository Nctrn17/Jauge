// Lien partageable : toute la saisie est encodée dans l'URL (base64url),
// rien n'est stocké côté serveur ni dans le navigateur.

export function buildShareUrl(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${window.location.origin}/?s=${b64}`
}

export function readShareFromUrl() {
  const s = new URLSearchParams(window.location.search).get('s')
  if (!s) return null
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    const data = JSON.parse(new TextDecoder().decode(bytes))
    return Array.isArray(data.e) ? data : null
  } catch {
    return null
  }
}

export function clearShareFromUrl() {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('s')) return
  params.delete('s')
  const search = params.toString()
  window.history.replaceState({}, '', window.location.pathname + (search ? `?${search}` : '') + window.location.hash)
}
