import { useEffect, useRef, useState } from 'react'
import { RFRHelp } from './RFRHelp'
import { calculerQFFNAS } from '../data/baremes-fnas'

/* Stepper custom */
function Stepper({ value, onChange, min = 0, max = 10 }) {
  const n = parseInt(value) || 0
  return (
    <div className="qf-stepper">
      <button
        type="button"
        className="qf-stepper-btn"
        onClick={() => onChange(String(Math.max(min, n - 1)))}
        disabled={n <= min}
        aria-label="Diminuer"
      >−</button>
      <input
        type="number"
        className="qf-stepper-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onChange(String(Math.max(min, Math.min(max, parseInt(e.target.value) || 0))))}
        min={min}
        max={max}
      />
      <button
        type="button"
        className="qf-stepper-btn"
        onClick={() => onChange(String(Math.min(max, n + 1)))}
        disabled={n >= max}
        aria-label="Augmenter"
      >+</button>
    </div>
  )
}

const SITUATIONS = [
  { value: 'celibataire',      label: 'Célibataire',                               parts: 1 },
  { value: 'celibataire_seul', label: 'Célibataire vivant seul (avec certificat)', parts: 1.5 },
  { value: 'parent_isole',     label: 'Parent isolé (case T avis d\'impôt)',        parts: 1.5 },
  { value: 'couple',           label: 'Couple (marié·e / pacsé·e / concubin·e)',    parts: 2 },
  { value: 'colocataire',      label: 'Couple non déclaré / colocataire',           parts: 1 },
]

function calculerParts(situation, enfantsExclusifs, enfantsAlternee, handicapOD, handicapAD) {
  const base = SITUATIONS.find((s) => s.value === situation)?.parts ?? 1
  return base + enfantsExclusifs * 0.5 + enfantsAlternee * 0.25 + (handicapOD ? 0.5 : 0) + (handicapAD ? 0.5 : 0)
}

function calculerQFCASC(rfrOD, rfrAD, parts) {
  return Math.ceil(((rfrOD + rfrAD) * 0.8) / 12 / parts)
}

export function QFCalculator({ onResult, showFNASFields = false, initialValues = null, onSave }) {
  const iv = initialValues ?? {}
  const [situation, setSituation] = useState(iv.situation ?? 'celibataire')
  const [rfrOD, setRfrOD] = useState(iv.rfrOD ?? '')
  const [rfrAD, setRfrAD] = useState(iv.rfrAD ?? '')
  const [enfantsExclusifs, setEnfantsExclusifs] = useState(String(iv.enfantsExclusifs ?? 0))
  const [enfantsAlternee, setEnfantsAlternee] = useState(String(iv.enfantsAlternee ?? 0))
  const [handicapOD, setHandicapOD] = useState(iv.handicapOD ?? false)
  const [handicapAD, setHandicapAD] = useState(iv.handicapAD ?? false)
  const [conjointActif, setConjointActif] = useState(iv.conjointActif ?? false)

  // Phase 3 (enfants / handicap) masquée par défaut sauf si déjà renseignée
  const hasExistingDetail = (parseInt(iv.enfantsExclusifs) || 0) > 0
    || (parseInt(iv.enfantsAlternee) || 0) > 0
    || iv.handicapOD || iv.handicapAD
  const [showMore, setShowMore] = useState(hasExistingDetail)

  const onResultRef = useRef(onResult)
  useEffect(() => { onResultRef.current = onResult })

  // Persiste les valeurs du formulaire vers App.jsx à chaque changement
  useEffect(() => {
    onSave?.({ situation, rfrOD, rfrAD, enfantsExclusifs, enfantsAlternee, handicapOD, handicapAD, conjointActif })
  }, [situation, rfrOD, rfrAD, enfantsExclusifs, enfantsAlternee, handicapOD, handicapAD, conjointActif, onSave])

  const aConjoint = ['couple', 'colocataire'].includes(situation)
  const nbExclusifs = parseInt(enfantsExclusifs) || 0
  const nbAlternee  = parseInt(enfantsAlternee)  || 0
  const parts = calculerParts(situation, nbExclusifs, nbAlternee, handicapOD, handicapAD)
  const rfr = parseFloat(rfrOD) || 0
  const rfrADVal = aConjoint ? (parseFloat(rfrAD) || 0) : 0
  const totalRFR = rfr + rfrADVal
  const qf = rfr > 0 ? calculerQFCASC(rfr, rfrADVal, parts) : null
  const nbHandicap = (handicapOD ? 1 : 0) + (handicapAD ? 1 : 0)
  const qfFnas = showFNASFields && rfr > 0
    ? calculerQFFNAS({ rfr: totalRFR, conjointActif: aConjoint && conjointActif, nbEnfantsExclusifs: nbExclusifs, nbEnfantsAlternee: nbAlternee, nbHandicap })
    : null
  const nbMembres = 1 + (aConjoint ? 1 : 0) + nbExclusifs + nbAlternee

  // Remonte le résultat dès que le QF est valide, sans bouton
  useEffect(() => {
    if (!qf || qf <= 0) return
    onResultRef.current({
      qf, qfFnas, parts, situation, aConjoint,
      conjointActif: aConjoint && conjointActif,
      nbEnfantsGardeExclusive: nbExclusifs,
      nbEnfantsGardeAlternee: nbAlternee,
      nbMembres,
    })
  }, [qf, qfFnas, situation, aConjoint, conjointActif, enfantsExclusifs, enfantsAlternee, handicapOD, handicapAD, parts, nbMembres])

  return (
    <div className="qf-calculator">
      <div className="qf-field">
        <label className="qf-label">Situation familiale</label>
        <select className="qf-select" value={situation} onChange={(e) => setSituation(e.target.value)}>
          {SITUATIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <RFRHelp situation={situation} />

      <div className="qf-row">
        <div className="qf-field">
          <label className="qf-label">
            Revenu Fiscal de Référence (RFR)
          
          </label>
          <div className="qf-input-wrapper">
            <input type="number" inputMode="numeric" className="qf-input" placeholder="ex : 18 000"
              value={rfrOD} onChange={(e) => setRfrOD(e.target.value)} min="0" />
            <span className="qf-unit">€</span>
          </div>
        </div>

        {aConjoint && (
          <div className="qf-field">
            <label className="qf-label">
              RFR conjoint·e si déclaration séparée
            </label>
            <div className="qf-input-wrapper">
              <input type="number" inputMode="numeric" className="qf-input" placeholder="ex : 12 000"
                value={rfrAD} onChange={(e) => setRfrAD(e.target.value)} min="0" />
              <span className="qf-unit">€</span>
            </div>
          </div>
        )}
      </div>

      

      {/* Phase 3 : enfants, handicap, conjoint actif — masquée par défaut */}
      {!showMore ? (
        <button
          type="button"
          className="qf-show-more"
          onClick={() => setShowMore(true)}
        >
          Enfants, handicap, situation spécifique… Affiner mon estimation
        </button>
      ) : (
        <div className="qf-more">
          <div className="qf-row">
            <div className="qf-field">
              <label className="qf-label">Enfants en garde exclusive</label>
              <Stepper value={enfantsExclusifs} onChange={setEnfantsExclusifs} />
              <span className="qf-parts-hint">+0,5 part par enfant</span>
            </div>
            <div className="qf-field">
              <label className="qf-label">Enfants en garde alternée</label>
              <Stepper value={enfantsAlternee} onChange={setEnfantsAlternee} />
              <span className="qf-parts-hint">+0,25 part par enfant</span>
            </div>
          </div>

          <div className="qf-row">
            <label className="qf-checkbox">
              <input type="checkbox" checked={handicapOD} onChange={(e) => setHandicapOD(e.target.checked)} />
              Invalidité ou handicap ≥ 80% (vous)
            </label>
            {aConjoint && (
              <label className="qf-checkbox">
                <input type="checkbox" checked={handicapAD} onChange={(e) => setHandicapAD(e.target.checked)} />
                Invalidité ou handicap ≥ 80% (conjoint·e)
              </label>
            )}
          </div>

          {showFNASFields && aConjoint && (
            <div className="qf-row qf-row--fnas">
              <label className="qf-checkbox">
                <input type="checkbox" checked={conjointActif} onChange={(e) => setConjointActif(e.target.checked)} />
                <span>Votre conjoint·e est également salarié·e</span>
              </label>
            </div>
          )}
        </div>
      )}

      {qf !== null && (
        <div className="qf-preview">
          <span className="qf-preview-label">Quotient familial estimé</span>
          <span className="qf-preview-value">{qf.toLocaleString('fr-FR')} €</span>
        </div>
      )}
    </div>
  )
}
