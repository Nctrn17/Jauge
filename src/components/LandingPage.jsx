import { useEffect } from 'react'
import { useReveal } from '../hooks/useReveal'

export function LandingPage({ onStart }) {
  useReveal()

  useEffect(() => {
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
    <div className="landing">

      <div className="landing-bg" aria-hidden="true">
        <div className="landing-blob landing-blob--1" />
        <div className="landing-blob landing-blob--2" />
        <div className="landing-blob landing-blob--3" />
        <div className="landing-blob landing-blob--4" />
        <div className="landing-blob landing-blob--5" />
      </div>

      <header className="landing-header">
        <div className="landing-logo" aria-hidden="true">
          <svg width="88" height="76" viewBox="0 0 44 38" fill="none">
            <path d="M 5.5 4 C 5.6 13 5.8 22 6 31"   stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
            <path d="M 14 3 C 14 12 13.8 21 13.5 30"  stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
            <path d="M 22 5 C 22.1 14 22.3 22 22.5 31" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
            <path d="M 30.5 4 C 30.6 13 30.4 22 30 30" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
            <path d="M 1 32 C 12 26 25 18 40 8"  stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <span className="landing-brand">Jauge</span>
      </header>

      <main className="landing-main">

        <section className="landing-hero">
          <h1 className="landing-titre hero-anim" style={{ '--delay': '0.1s' }}>
            Vos droits, en clair.
          </h1>
          <p className="landing-accroche hero-anim" style={{ '--delay': '0.2s' }}>
            Jauge chiffre vos droits d'action sociale auprès du CASC-SVP et du FNAS, en deux minutes. Gratuit, confidentiel, sans inscription.
          </p>
        </section>

        {/* Pour qui — layout staggeré */}
        <section className="landing-audience" data-reveal>
          <div className="audience-row">
            <span className="audience-fund audience-fund--casc">CASC-SVP</span>
            <div className="audience-desc">
              <strong>Spectacle vivant privé</strong>
              <p>Intermittent·e·s et permanent·e·s relevant de la convention collective du spectacle vivant privé.</p>
            </div>
          </div>

          <div className="audience-row">
            <div className="audience-desc audience-desc--right">
              <strong>Entreprises artistiques et culturelles</strong>
              <p>Intermittent·e·s et permanent·e·s relevant de la convention collective des entreprises artistiques et culturelles.</p>
            </div>
            <span className="audience-fund audience-fund--fnas">FNAS</span>
          </div>
        </section>

        {/* Comment ça marche */}
        <div className="landing-how" data-reveal>
          <div className="how-row">
            <span className="how-num" aria-label="Étape 1">
              <svg width="26" height="38" viewBox="0 0 26 38" fill="none" aria-hidden="true">
                <path d="M 10 5 C 9.5 14 9.2 24 10.4 33" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                <circle cx="18" cy="30" r="1.7" fill="currentColor"/>
              </svg>
              <span className="how-step-name">Employeurs</span>
            </span>
            <span className="how-text">Recherchez vos employeurs</span>
          </div>
          <div className="how-row">
            <span className="how-num" aria-label="Étape 2">
              <svg width="32" height="38" viewBox="0 0 32 38" fill="none" aria-hidden="true">
                <path d="M 8 4.5 C 8.4 14 7.7 24 8.3 33" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                <path d="M 18 5.5 C 17.5 14 18.2 23 17.4 33.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                <circle cx="25" cy="29.5" r="1.6" fill="currentColor"/>
              </svg>
              <span className="how-step-name">Calcul</span>
            </span>
            <span className="how-text">Indiquez vos mois travaillés et votre quotient familial</span>
          </div>
          <div className="how-row">
            <span className="how-num" aria-label="Étape 3">
              <svg width="40" height="38" viewBox="0 0 40 38" fill="none" aria-hidden="true">
                <path d="M 6 5 C 6.4 14 5.8 24 6.6 33" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                <path d="M 16.5 4 C 16 14 16.5 24 15.8 33.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                <path d="M 27 5.5 C 27.5 14 27 24 26.4 33" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                <circle cx="33.5" cy="30.2" r="1.7" fill="currentColor"/>
              </svg>
              <span className="how-step-name">Résultats</span>
            </span>
            <span className="how-text">Consultez vos estimations CASC-SVP et FNAS</span>
          </div>
        </div>

        {/* Bas de landing : confidentialité + précision côte à côte */}
        <div className="landing-footer-blocks" data-reveal>
          <div className="landing-confidentialite">
            <ul>
              <li>Aucune donnée personnelle collectée</li>
              <li>Aucun stockage, aucune inscription</li>
              <li>Aucune publicité, gratuit</li>
            </ul>
          </div>

          <div className="landing-precision">
            <strong>Estimation indicative.</strong>{' '}
            Les montants s'appuient sur des barèmes publics. Votre accès réel aux prestations peut
            différer selon votre situation. En cas de doute, contactez directement le CASC-SVP ou le FNAS.
          </div>
        </div>

        <div className="landing-cta-bas" data-reveal>
          <button className="landing-cta" onClick={onStart}>
            Commencer l'estimation
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </main>

      <footer className="landing-footer">
        <p>Outil indépendant à visée informative basé sur des données publiques. Barèmes mis à jour au 1er avril 2026.</p>
        <nav className="landing-footer-links" aria-label="Pages légales">
          <a href="/a-propos.html">À propos</a>
          <span aria-hidden="true">·</span>
          <a href="/mentions-legales.html">Mentions légales</a>
          <span aria-hidden="true">·</span>
          <a href="/politique-de-confidentialite.html">Politique de confidentialité</a>
        </nav>
        <div className="landing-footer-socials">
          <a
            href="https://github.com/Nctrn17/Jauge"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-footer-github"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            GitHub
          </a>
          <a
            href="https://x.com/jaugeapp"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-footer-github"
            aria-label="Jauge sur X"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </a>
        </div>
      </footer>

    </div>
  )
}
