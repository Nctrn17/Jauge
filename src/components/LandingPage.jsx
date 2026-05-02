import { useEffect, useRef, useState } from 'react'

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

export function LandingPage({ onStart }) {
  const [scrolled, setScrolled] = useState(false)
  const revealRefs = useRef(new Set())

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    document.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.dataset.shown = 'true'
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    revealRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const trackReveal = (el) => {
    if (el) revealRefs.current.add(el)
  }

  return (
    <div className="emil-landing">
      <nav className="emil-nav" data-scrolled={scrolled ? 'true' : 'false'}>
        <div className="emil-nav-inner">
          <button type="button" className="emil-brand" onClick={onStart} aria-label="Jauge">
            <svg className="emil-brand-mark" width="32" height="28" viewBox="0 0 44 38" fill="none" aria-hidden="true">
              <path d="M 5.5 4 C 5.6 13 5.8 22 6 31"    stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
              <path d="M 14 3 C 14 12 13.8 21 13.5 30"   stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
              <path d="M 22 5 C 22.1 14 22.3 22 22.5 31" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
              <path d="M 30.5 4 C 30.6 13 30.4 22 30 30" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
              <path d="M 1 32 C 12 26 25 18 40 8"        stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" />
            </svg>
            Jauge
          </button>
          <div className="emil-nav-links">
            <a className="emil-nav-link" href="#pour-qui">Pour qui</a>
            <a className="emil-nav-link" href="#methode">Méthode</a>
            <button type="button" className="emil-nav-link" onClick={onStart}>Commencer</button>
          </div>
        </div>
      </nav>

      <header className="emil-hero">
        <div className="emil-wrap">
          <span ref={trackReveal} data-d="1" className="emil-eyebrow emil-reveal">
            <span className="dot" aria-hidden="true" />
            Barèmes mis à jour le 1er avril 2026
          </span>
          <h1 ref={trackReveal} data-d="2" className="emil-reveal">
            Estimez vos droits<br />
            <em>d'action sociale.</em>
          </h1>
          <p ref={trackReveal} data-d="3" className="emil-hero-sub emil-reveal">
            Jauge calcule, à partir de vos employeurs et mois travaillés, les aides
            auxquelles vous pouvez prétendre auprès du CASC-SVP et du FNAS.
            Gratuit, sans inscription, sans collecte. Tout est calculé dans votre navigateur.
          </p>
          <div ref={trackReveal} data-d="4" className="emil-hero-cta emil-reveal">
            <button type="button" className="emil-btn emil-btn-primary" onClick={onStart}>
              Commencer l'estimation <span className="arrow" aria-hidden="true">→</span>
            </button>
            <a className="emil-btn emil-btn-ghost" href="#methode">Comment ça marche</a>
          </div>
          <div ref={trackReveal} data-d="4" className="emil-hero-meta emil-reveal">
            <span><Check /> Calcul client-side</span>
            <span><Check /> Aucune donnée stockée</span>
            <span><Check /> Open source</span>
          </div>
        </div>
      </header>

      <hr className="emil-rule" />

      <section className="emil-section" id="pour-qui">
        <div className="emil-wrap">
          <div className="emil-section-head">
            <div>
              <div className="emil-section-tag">Pour qui</div>
              <h2 className="emil-section-title">Deux fonds. Un seul outil.</h2>
              <p className="emil-section-lede">
                Salarié·es du spectacle, intermittent·es comme permanent·es.
                Le fonds applicable dépend de la convention collective de
                votre employeur.
              </p>
            </div>
          </div>

          <div className="emil-grid-2">
            <article className="emil-card">
              <div className="emil-card-kicker">CASC-SVP</div>
              <h3 className="emil-card-title">Spectacle vivant privé</h3>
              <p className="emil-card-desc">
                Si votre employeur relève de la convention collective
                nationale du spectacle vivant privé.
              </p>
              <div className="emil-card-tags">
                <span className="emil-tag emil-tag-accent">IDCC 3090</span>
              </div>
            </article>

            <article className="emil-card">
              <div className="emil-card-kicker">FNAS</div>
              <h3 className="emil-card-title">Entreprises artistiques et culturelles</h3>
              <p className="emil-card-desc">
                Si votre employeur relève de la convention collective
                des entreprises artistiques et culturelles.
              </p>
              <div className="emil-card-tags">
                <span className="emil-tag emil-tag-accent">IDCC 1285</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="emil-section" id="methode" style={{ paddingTop: 0 }}>
        <div className="emil-wrap">
          <div className="emil-section-head">
            <div>
              <div className="emil-section-tag">Méthode</div>
              <h2 className="emil-section-title">Trois étapes. Cinq minutes.</h2>
            </div>
          </div>

          <div className="emil-steps">
            <div className="emil-step">
              <div className="emil-step-num">01</div>
              <h3 className="emil-step-title">Vos employeurs</h3>
              <p className="emil-step-desc">
                Recherche par nom ou SIREN. Le fonds est détecté automatiquement
                via l'IDCC. Vous pouvez le corriger.
              </p>
            </div>
            <div className="emil-step">
              <div className="emil-step-num">02</div>
              <h3 className="emil-step-title">Vos mois travaillés</h3>
              <p className="emil-step-desc">
                Pour chaque employeur, sélectionnez les mois travaillés.
                Renseignez vos revenus et la composition du foyer pour affiner
                votre quotient familial.
              </p>
            </div>
            <div className="emil-step">
              <div className="emil-step-num">03</div>
              <h3 className="emil-step-title">Vos droits estimés</h3>
              <p className="emil-step-desc">
                Détail par fonds, montant indicatif, et les conditions à vérifier
                auprès des organismes pour confirmer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="emil-section" style={{ paddingTop: 0 }}>
        <div className="emil-wrap">
          <div className="emil-cta-band">
            <h2>Prêt·e à savoir ce que vous pouvez demander ?</h2>
            <p>
              L'estimation prend cinq minutes. Vous repartez avec le détail
              des droits par fonds, et les pièces utiles pour faire votre demande.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="emil-btn emil-btn-primary" onClick={onStart}>
                Commencer <span className="arrow" aria-hidden="true">→</span>
              </button>
              <a className="emil-btn emil-btn-ghost" href="#methode">Lire la méthode complète</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="emil-footer">
        <div className="emil-foot-inner">
          <div>© 2026 Jauge. Outil indépendant, non affilié au CASC-SVP ni au FNAS.</div>
          <div className="emil-foot-links">
            <a
              href="https://github.com/Nctrn17/Jaugeapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Code source sur GitHub"
              className="emil-foot-icon"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.04c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.99 0 1.98.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.13v3.16c0 .31.21.66.79.55C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z" />
              </svg>
            </a>
            <a
              href="https://x.com/jaugeapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Jauge sur X (anciennement Twitter)"
              className="emil-foot-icon"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <span className="emil-foot-sep" aria-hidden="true">·</span>
            <a href="/mentions-legales.html">Mentions légales</a>
            <a href="/politique-de-confidentialite.html">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
