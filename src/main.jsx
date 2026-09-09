import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const BUILD = '2026-05-20-r1'
if (typeof window !== 'undefined') window.__JAUGE_BUILD__ = BUILD

import '@fontsource/geist/400.css'
import '@fontsource/geist/500.css'
import '@fontsource/geist/700.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'
import '@fontsource/unbounded/400.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/nothing-you-could-do/400.css'

import './App.css'
import './rideau.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
