// Pages assets-first middleware
// Sans ça, toute requête sans handler explicite (par ex. /) tombe dans la Worker
// et retourne 500. On délègue à env.ASSETS pour le static, fallback index.html.
export const onRequest = async ({ request, next, env }) => {
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) {
    return next()
  }

  const assetResponse = await env.ASSETS.fetch(request)
  if (assetResponse.status !== 404) {
    return assetResponse
  }

  return env.ASSETS.fetch(new URL('/index.html', url))
}
