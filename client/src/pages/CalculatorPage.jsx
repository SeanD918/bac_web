import { useState, useMemo } from 'react'
import {
  Calculator, Award, GraduationCap, Percent, Beaker, Code, Database,
  MonitorSmartphone, Languages, FileText, Microscope, BookHeadphones, Cpu, Map, TrendingUp, Trophy
} from 'lucide-react'
import './CalculatorPage.css'

const SECTIONS_CONFIG = {
  info: {
    label: 'Bac Informatique',
    totalCoef: 16,
    subjects: [
      { key: 'math', label: 'Mathématiques', coef: 3, icon: Calculator },
      { key: 'algo', label: 'Algorithmique', coef: 3, icon: Code },
      { key: 'phy', label: 'Sciences Physiques', coef: 2, icon: Beaker },
      { key: 'base', label: 'Bases de Données', coef: 1.5, icon: Database },
      { key: 'fr', label: 'Français', coef: 1, icon: BookHeadphones },
      { key: 'an', label: 'Anglais', coef: 1, icon: Languages },
      { key: 'ar', label: 'Arabe', coef: 1, icon: FileText },
      { key: 'philo', label: 'Philosophie', coef: 1, noControle: true, icon: FileText },
      { key: 'tic', label: 'TIC', coef: 1.5, noControle: true, icon: MonitorSmartphone },
      { key: 'sport', label: 'Sport', coef: 1, noControle: true, icon: GraduationCap, hasDispense: true },
      { key: 'option', label: 'Matière Optionnelle', coef: '1 (si >10)', noControle: true, icon: Award }
    ],
    calculateScore: (moy, notes) => {
      const fb = moy * 4
      const fs = (1.5 * notes.math) + (0.5 * notes.phy) + (1.5 * notes.algo) + (0.25 * (notes.tic + notes.base)) + notes.an + notes.fr
      return fb + fs
    }
  },
  sciences: {
    label: 'Bac Sciences Exp',
    totalCoef: 17,
    subjects: [
      { key: 'math', label: 'Mathématiques', coef: 3, icon: Calculator },
      { key: 'phy', label: 'Sciences Physiques', coef: 4, icon: Beaker },
      { key: 'sc', label: 'Sciences Naturelles', coef: 4, icon: Microscope },
      { key: 'fr', label: 'Français', coef: 1, icon: BookHeadphones },
      { key: 'an', label: 'Anglais', coef: 1, icon: Languages },
      { key: 'ar', label: 'Arabe', coef: 1, icon: FileText },
      { key: 'it', label: 'Informatique', coef: 1, noControle: true, icon: MonitorSmartphone },
      { key: 'philo', label: 'Philosophie', coef: 1, noControle: true, icon: FileText },
      { key: 'sport', label: 'Sport', coef: 1, noControle: true, icon: GraduationCap, hasDispense: true },
      { key: 'option', label: 'Matière Optionnelle', coef: '1 (si >10)', noControle: true, icon: Award }
    ],
    calculateScore: (moy, notes) => {
      const fb = moy * 4
      const fs = (1 * notes.math) + (1.5 * notes.phy) + (1.5 * notes.sc) + notes.an + notes.fr
      return fb + fs
    }
  },
  tech: {
    label: 'Bac Technique',
    totalCoef: 16,
    subjects: [
      { key: 'math', label: 'Mathématiques', coef: 3, icon: Calculator },
      { key: 'phy', label: 'Sciences Physiques', coef: 3, icon: Beaker },
      { key: 'te', label: 'Technologie', coef: 3, icon: Cpu },
      { key: 'tp', label: 'Technologie (Pratique)', coef: 1, noControle: true, icon: Database },
      { key: 'fr', label: 'Français', coef: 1, icon: BookHeadphones },
      { key: 'an', label: 'Anglais', coef: 1, icon: Languages },
      { key: 'ar', label: 'Arabe', coef: 1, icon: FileText },
      { key: 'in', label: 'Informatique', coef: 1, noControle: true, icon: MonitorSmartphone },
      { key: 'philo', label: 'Philosophie', coef: 1, noControle: true, icon: FileText },
      { key: 'sport', label: 'Sport', coef: 1, noControle: true, icon: GraduationCap, hasDispense: true },
      { key: 'option', label: 'Matière Optionnelle', coef: '1 (si >10)', noControle: true, icon: Award }
    ],
    calculateScore: (moy, notes) => {
      const fb = moy * 4
      const fs = (1.5 * notes.math) + (1 * notes.phy) + (1.5 * notes.te) + notes.an + notes.fr
      return fb + fs
    }
  },
  eco: {
    label: 'Bac Economie',
    totalCoef: 16,
    subjects: [
      { key: 'ge', label: 'Gestion', coef: 3, icon: TrendingUp },
      { key: 'ec', label: 'Economie', coef: 3, icon: Database },
      { key: 'math', label: 'Mathématiques', coef: 2, icon: Calculator },
      { key: 'hg', label: 'Histoire-Géo', coef: 2, icon: Map },
      { key: 'fr', label: 'Français', coef: 1, icon: BookHeadphones },
      { key: 'an', label: 'Anglais', coef: 1, icon: Languages },
      { key: 'ar', label: 'Arabe', coef: 1, icon: FileText },
      { key: 'in', label: 'Informatique', coef: 1, noControle: true, icon: MonitorSmartphone },
      { key: 'philo', label: 'Philosophie', coef: 1, noControle: true, icon: FileText },
      { key: 'sport', label: 'Sport', coef: 1, noControle: true, icon: GraduationCap, hasDispense: true },
      { key: 'option', label: 'Matière Optionnelle', coef: '1 (si >10)', noControle: true, icon: Award }
    ],
    calculateScore: (moy, notes) => {
      const fb = moy * 4
      const fs = (0.5 * notes.math) + (1.5 * notes.ec) + (1.5 * notes.ge) + (0.5 * notes.hg) + notes.an + notes.fr
      return fb + fs
    }
  },
  math: {
    label: 'Bac Mathématiques',
    totalCoef: 15,
    subjects: [
      { key: 'math', label: 'Mathématiques', coef: 4, icon: Calculator },
      { key: 'phy', label: 'Sciences Physiques', coef: 4, icon: Beaker },
      { key: 'sc', label: 'Sciences Naturelles', coef: 1, icon: Microscope },
      { key: 'fr', label: 'Français', coef: 1, icon: BookHeadphones },
      { key: 'an', label: 'Anglais', coef: 1, icon: Languages },
      { key: 'ar', label: 'Arabe', coef: 1, icon: FileText },
      { key: 'in', label: 'Informatique', coef: 1, noControle: true, icon: MonitorSmartphone },
      { key: 'philo', label: 'Philosophie', coef: 1, noControle: true, icon: FileText },
      { key: 'sport', label: 'Sport', coef: 1, noControle: true, icon: GraduationCap, hasDispense: true },
      { key: 'option', label: 'Matière Optionnelle', coef: '1 (si >10)', noControle: true, icon: Award }
    ],
    calculateScore: (moy, notes) => {
      const fb = moy * 4
      const fs = (2 * notes.math) + (1.5 * notes.phy) + (0.5 * notes.sc) + notes.an + notes.fr
      return fb + fs
    }
  },
  sport: {
    label: 'Bac Sport',
    totalCoef: 14.5,
    subjects: [
      { key: 'bio', label: 'Scalp Biologique', coef: 3, icon: Microscope },
      { key: 'sp', label: 'Sport (Pratique)', coef: 2.5, noControle: true, icon: Trophy },
      { key: 'fr', label: 'Français', coef: 1.5, icon: BookHeadphones },
      { key: 'an', label: 'Anglais', coef: 1.5, icon: Languages },
      { key: 'philo', label: 'Philosophie', coef: 1.5, noControle: true, icon: FileText },
      { key: 'ma', label: 'Mathématiques', coef: 1, icon: Calculator },
      { key: 'phy', label: 'Physique', coef: 1, icon: Beaker },
      { key: 'ar', label: 'Arabe', coef: 1, icon: FileText },
      { key: 'ep', label: 'Ed. Physique', coef: 1, noControle: true, icon: GraduationCap },
      { key: 'st', label: 'Sport (Théorique)', coef: 0.5, icon: FileText },
      { key: 'option', label: 'Matière Optionnelle', coef: '1 (si >10)', noControle: true, icon: Award }
    ],
    calculateScore: (moy, notes) => {
      const fb = moy * 4
      const fs = (1.5 * notes.bio) + (0.5 * notes.phy) + (0.5 * notes.philo) + (0.5 * notes.sp) + notes.an + notes.fr + (notes.ep || 0) + notes.st
      return fb + fs
    }
  },
  lettres: {
    label: 'Bac Lettres',
    totalCoef: 18,
    subjects: [
      { key: 'ar', label: 'Arabe', coef: 4, icon: FileText },
      { key: 'philo', label: 'Philosophie', coef: 4, icon: FileText },
      { key: 'hg', label: 'Histoire-Géo', coef: 3, icon: Map },
      { key: 'fr', label: 'Français', coef: 2, icon: BookHeadphones },
      { key: 'an', label: 'Anglais', coef: 2, icon: Languages },
      { key: 'pn', label: 'Pensée Islamique', coef: 1, noControle: true, icon: Award },
      { key: 'in', label: 'Informatique', coef: 1, noControle: true, icon: MonitorSmartphone },
      { key: 'sport', label: 'Sport', coef: 1, noControle: true, icon: GraduationCap, hasDispense: true },
      { key: 'option', label: 'Matière Optionnelle', coef: '1 (si >10)', noControle: true, icon: Award }
    ],
    calculateScore: (moy, notes) => {
      const fb = moy * 4
      const fs = (1.5 * notes.ar) + (1.5 * notes.philo) + notes.hg + notes.an + notes.fr
      return fb + fs
    }
  }
}

export default function CalculatorPage() {
  const [activeSection, setActiveSection] = useState(null)
  const [session, setSession] = useState('principale')
  const [grades, setGrades] = useState({})
  const [dispenseSport, setDispenseSport] = useState(false)
  const [results, setResults] = useState(null)

  const config = activeSection ? SECTIONS_CONFIG[activeSection] : null

  const handleChange = (e) => {
    const { name, value } = e.target
    if (value === '' || (/^(\d+(\.\d{0,2})?|\.\d{1,2})$/.test(value) && parseFloat(value) <= 20)) {
      setGrades(prev => ({ ...prev, [name]: value }))
    }
  }

  const parseValue = (val) => {
    const parsed = parseFloat(val)
    return isNaN(parsed) ? 0 : parsed
  }

  const handleSectionTabClick = (sectionKey) => {
    if (activeSection === sectionKey) {
      setActiveSection(null)
    } else {
      setActiveSection(sectionKey)
    }
    setGrades({})
    setResults(null)
    setDispenseSport(false)
  }

  const calculate = () => {
    const notesPrincipale = {}
    const notesControle = {}
    const notesMax = {}
    const notesScore = {}

    config.subjects.forEach(sub => {
      const g1 = parseValue(grades[`${sub.key}_1`])
      const g2 = sub.noControle ? g1 : parseValue(grades[`${sub.key}_2`])

      let val1 = g1
      let val2 = g2

      if (sub.key === 'sport' && dispenseSport) {
        val1 = 10
        val2 = 10
      }

      if (sub.key === 'option') {
        val1 = val1 > 10 ? val1 - 10 : 0
        val2 = val2 > 10 ? val2 - 10 : 0
      }

      notesPrincipale[sub.key] = val1
      notesControle[sub.key] = sub.noControle ? val1 : Math.max(val1, val2)

      // For score calculations in control session
      if (session === 'controle') {
        notesMax[sub.key] = Math.max(val1, val2)
        // Average for score ( (2*P + C) / 3 )
        notesScore[sub.key] = sub.noControle ? val1 : ((val1 * 2) + val2) / 3
      } else {
        notesScore[sub.key] = val1
      }
    })

    // Calculate sum for Principale
    let sum1 = 0
    config.subjects.forEach(sub => {
      const coef = typeof sub.coef === 'number' ? sub.coef : 1
      sum1 += notesPrincipale[sub.key] * coef
    })
    const moy1 = sum1 / config.totalCoef

    if (session === 'principale') {
      const score = config.calculateScore(moy1, notesScore)
      setResults({
        moyennePrincipale: moy1,
        moyenneFinale: moy1,
        score: score,
        score7: score * 1.07
      })
    } else {
      if (moy1 >= 10) {
        alert("Votre moyenne de la session principale est >= 10. Vous êtes déjà admis(e) !")
        return
      }

      // Calculate sum for Controle (Best of)
      let sum2 = 0
      config.subjects.forEach(sub => {
        const coef = typeof sub.coef === 'number' ? sub.coef : 1
        sum2 += notesControle[sub.key] * coef
      })
      const moy2 = sum2 / config.totalCoef

      // Final Average ( (2*M1 + M2) / 3 )
      const moyFinale = ((moy1 * 2) + moy2) / 3
      const score = config.calculateScore(moyFinale, notesScore)

      setResults({
        moyennePrincipale: moy1,
        moyenneControle: moy2,
        moyenneFinale: moyFinale,
        score: score,
        score7: score * 1.07
      })
    }
  }

  const getResultColor = (val) => {
    if (!val) return 'var(--text)'
    if (val >= 10) return '#34d399'
    if (val >= 9.5) return '#fbbf24'
    return '#ef4444'
  }

  return (
    <div className="calc-page">
      <div className="calc-hero">
        <div className="calc-hero__badge">{activeSection ? config.label : "Bienvenue"}</div>
        <h1 className="calc-hero__title">Calculer Moyenne & Score</h1>
      </div>

      <div className="calc-section-tabs">
        {Object.keys(SECTIONS_CONFIG).map(key => (
          <button
            key={key}
            className={`calc-section-tab ${activeSection === key ? 'active' : ''}`}
            onClick={() => handleSectionTabClick(key)}
          >
            {SECTIONS_CONFIG[key].label}
          </button>
        ))}
      </div>

      {activeSection && (
        <div className="calc-active-content fade-in">
          <div className="calc-tabs">
            <button
              className={`calc-tab ${session === 'principale' ? 'active' : ''}`}
              onClick={() => { setSession('principale'); setResults(null) }}
            >
              Session Principale
            </button>
            <button
              className={`calc-tab ${session === 'controle' ? 'active' : ''}`}
              onClick={() => { setSession('controle'); setResults(null) }}
            >
              Session de Contrôle
            </button>
          </div>

          <div className="calc-layout">
            <div className="calc-form-container">
              <div className="calc-card">
                <div className="calc-grid-headers">
                  <div className="calc-grid-header subject-col">Matière</div>
                  <div className="calc-grid-header">Note P.</div>
                  {session === 'controle' && <div className="calc-grid-header">Note C.</div>}
                </div>

                {config.subjects.map((sub) => {
                  const Icon = sub.icon || Calculator
                  const isDispense = sub.key === 'sport' && dispenseSport

                  return (
                    <div className="calc-row" key={sub.key}>
                      <div className="calc-subject">
                        <div className="calc-subject-icon"><Icon size={16} /></div>
                        <div className="calc-subject-info">
                          <span className="calc-subject-name">{sub.label}</span>
                          <span className="calc-subject-coef">Coef: {sub.coef}</span>
                        </div>
                        {sub.hasDispense && (
                          <div className="calc-subject-extra">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={dispenseSport}
                                onChange={(e) => {
                                  setDispenseSport(e.target.checked)
                                  if (e.target.checked) setGrades(p => ({ ...p, [`${sub.key}_1`]: '' }))
                                }}
                              />
                              Dispensé(e)?
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="calc-input-wrap">
                        <input
                          type="number"
                          name={`${sub.key}_1`}
                          value={grades[`${sub.key}_1`] || ''}
                          onChange={handleChange}
                          placeholder={isDispense ? '10' : '0-20'}
                          disabled={isDispense}
                          className="calc-input"
                          step="0.25"
                        />
                      </div>

                      {session === 'controle' && (
                        <div className="calc-input-wrap">
                          {!sub.noControle ? (
                            <input
                              type="number"
                              name={`${sub.key}_2`}
                              value={grades[`${sub.key}_2`] || ''}
                              onChange={handleChange}
                              placeholder="Note C."
                              className="calc-input"
                              step="0.25"
                            />
                          ) : (
                            <div className="calc-input-placeholder">—</div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                <button className="calc-btn-submit" onClick={calculate}>
                  <Calculator size={18} /> Calculer
                </button>
              </div>
            </div>

            <div className="calc-results-container">
              <div className="calc-card calc-results-card">
                <h2 className="calc-results-title">Vos Résultats</h2>

                {results ? (
                  <div className="calc-results-display fade-in">
                    {session === 'controle' && (
                      <>
                        <div className="result-item small">
                          <span>Moyenne P.</span>
                          <span style={{ color: getResultColor(results.moyennePrincipale) }}>
                            {results.moyennePrincipale.toFixed(2)}
                          </span>
                        </div>
                        <div className="result-item small">
                          <span>Moyenne C.</span>
                          <span style={{ color: getResultColor(results.moyenneControle) }}>
                            {results.moyenneControle.toFixed(2)}
                          </span>
                        </div>
                        <div className="result-divider"></div>
                      </>
                    )}

                    <div className="result-item highlight">
                      <span>Moyenne Finale</span>
                      <span style={{ color: getResultColor(results.moyenneFinale) }}>
                        {results.moyenneFinale.toFixed(2)}
                      </span>
                    </div>

                    <div className="result-item">
                      <span>Score (FG)</span>
                      <span>{results.score.toFixed(2)}</span>
                    </div>

                    <div className="result-item primary">
                      <span>Score + 7%</span>
                      <span>{results.score7.toFixed(2)}</span>
                    </div>

                    {results.moyenneFinale >= 10 ? (
                      <div className="calc-success-msg">Admis(e) ! 🎉</div>
                    ) : (
                      <div className="calc-fail-msg">Refusé(e) / À revoir.</div>
                    )}
                  </div>
                ) : (
                  <div className="calc-results-empty">
                    Entrez vos notes pour voir votre moyenne et score.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {!activeSection && (
        <div className="calc-empty-state fade-in">
          <div className="calc-empty-icon">
            <Calculator size={48} strokeWidth={1.5} />
          </div>
          <h3>Prêt à calculer votre moyenne ?</h3>
          <p>Choisissez votre branche ci-dessus pour commencer.</p>
        </div>
      )}
    </div>
  )
}
