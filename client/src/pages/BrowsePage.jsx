import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Filter, X, FileText, BookOpen, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import axios from 'axios'
import API from '../config/api'
import { SECTIONS as STATIC_SECTIONS, SUBJECTS as STATIC_SUBJECTS } from '../data/constants'

const YEARS = Array.from({ length: 2024 - 1994 + 1 }, (_, i) => 2024 - i)
const TYPES = ['Principale', 'Contrôle', 'Pratique']

const TYPE_BADGE = {
  'Principale': { cls: 'badge-principale', label: 'Principale' },
  'Contrôle':   { cls: 'badge-controle',   label: 'Contrôle' },
  'Pratique':   { cls: 'badge-pratique',   label: 'Pratique' },
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    year:    searchParams.get('year')    || '',
    section: searchParams.get('section') || '',
    subject: searchParams.get('subject') || '',
    type:    searchParams.get('type')    || '',
    q:       searchParams.get('q')       || '',
  })

  const [sections,  setSections]  = useState(STATIC_SECTIONS)
  const [subjects,  setSubjects]  = useState([])
  const [results,   setResults]   = useState([])
  const [total,     setTotal]     = useState(1614)
  const [page,      setPage]      = useState(1)
  const [loading,   setLoading]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const LIMIT = 20

  // Load sections (API enriches static fallback)
  useEffect(() => {
    axios.get(`${API}/sections`).then(r => setSections(r.data)).catch(() => {})
  }, [])

  // Load subjects when section changes
  useEffect(() => {
    if (filters.section) {
      axios.get(`${API}/subjects/${filters.section}`)
        .then(r => setSubjects(r.data))
        .catch(() => setSubjects(STATIC_SUBJECTS[filters.section] || []))
    } else {
      setSubjects([])
    }
    setFilters(f => ({ ...f, subject: '' }))
  }, [filters.section])

  // Fetch results
  const fetchResults = useCallback(async (f, p) => {
    setLoading(true)
    try {
      const params = { page: p, limit: LIMIT }
      if (f.year)    params.year    = f.year
      if (f.section) params.section = f.section
      if (f.subject) params.subject = f.subject
      if (f.type)    params.type    = f.type
      if (f.q)       params.q       = f.q

      const r = await axios.get(`${API}/exams`, { params })
      setResults(r.data.results)
      setTotal(r.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults(filters, page)
  }, [filters, page, fetchResults])

  const handleFilter = (key, val) => {
    const next = { ...filters, [key]: val }
    setFilters(next)
    setPage(1)
    
    // Sync with URL
    const params = {}
    Object.entries(next).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
  }

  const handleSearch = e => {
    e.preventDefault()
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({ year: '', section: '', subject: '', type: '', q: '' })
    setPage(1)
    setSearchParams({})
  }

  const totalPages = Math.ceil(total / LIMIT)

  const getPageRange = () => {
    const range = []
    const delta = 2
    const start = Math.max(1, page - delta)
    const end   = Math.min(totalPages, page + delta)
    for (let i = start; i <= end; i++) range.push(i)
    return range
  }

  const activeFiltersCount = [filters.year, filters.section, filters.subject, filters.type, filters.q]
    .filter(Boolean).length

  return (
    <div>
      {/* Page header */}
      <div className="browse-page-header">
        <div className="container">
          <h1>Parcourir les examens</h1>


          {/* Search */}
          <form onSubmit={handleSearch}>
            <div className="search-wrap" style={{ maxWidth: '100%' }}>
              <Search size={18} className="search-icon" />
              <input
                id="browse-search"
                type="text"
                className="search-input"
                placeholder="Rechercher par matière, section ou année…"
                value={filters.q}
                onChange={e => handleFilter('q', e.target.value)}
              />
              {filters.q && (
                <button
                  type="button"
                  onClick={() => handleFilter('q', '')}
                  style={{
                    position: 'absolute', right: 100, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', color: 'var(--text-faint)',
                    padding: 4, display: 'flex',
                  }}
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="btn btn-primary search-btn">
                Chercher
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container">
        <div className="browse-layout">
          {/* Sidebar */}
          <aside className={`filter-sidebar${sidebarOpen ? ' mobile-open' : ''}`}>
            <h3>
              <Filter size={14} />
              Filtres
              {activeFiltersCount > 0 && (
                <span
                  className="badge"
                  style={{
                    background: 'var(--accent-grad)',
                    color: '#fff',
                    marginLeft: 'auto',
                    fontSize: 10,
                    padding: '2px 8px',
                  }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </h3>

            <div className="filter-group">
              <label>Année</label>
              <select
                id="filter-year"
                className="filter-select"
                value={filters.year}
                onChange={e => handleFilter('year', e.target.value)}
              >
                <option value="">Toutes les années</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Section</label>
              <select
                id="filter-section"
                className="filter-select"
                value={filters.section}
                onChange={e => handleFilter('section', e.target.value)}
              >
                <option value="">Toutes les sections</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Matière</label>
              <select
                id="filter-subject"
                className="filter-select"
                value={filters.subject}
                onChange={e => handleFilter('subject', e.target.value)}
                disabled={!filters.section}
              >
                <option value="">Toutes les matières</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Type d'examen</label>
              <select
                id="filter-type"
                className="filter-select"
                value={filters.type}
                onChange={e => handleFilter('type', e.target.value)}
              >
                <option value="">Tous les types</option>
                {TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <>
                <div className="filter-divider" />
                <button id="reset-filters-btn" className="filter-reset-btn" onClick={resetFilters}>
                  <RotateCcw size={13} />
                  Réinitialiser les filtres
                </button>
              </>
            )}
          </aside>

          {/* Results */}
          <div>
            <div className="browse-results-header">
              <p className="results-count">
                <strong>{total.toLocaleString()}</strong> examen{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
                {page > 1 && ` — Page ${page} / ${totalPages}`}
              </p>

              <button
                id="mobile-filter-toggle"
                className="mobile-filter-btn"
                onClick={() => setSidebarOpen(v => !v)}
              >
                <Filter size={14} />
                Filtres
                {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
            </div>

            {loading ? (
              <div className="loading-wrap">
                <div className="spinner" />
                <span>Chargement des examens…</span>
              </div>
            ) : results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>Aucun résultat trouvé</h3>
                <p>Essayez de modifier vos filtres ou votre recherche.</p>
              </div>
            ) : (
              <div className="browse-results-list">
                {results.map(exam => (
                  <ExamListItem key={exam.id} exam={exam} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Page précédente"
                >
                  <ChevronLeft size={14} />
                </button>

                {page > 3 && (
                  <>
                    <button className="page-btn" onClick={() => setPage(1)}>1</button>
                    {page > 4 && <span style={{ color: 'var(--text-faint)', padding: '0 4px' }}>…</span>}
                  </>
                )}

                {getPageRange().map(pn => (
                  <button
                    key={pn}
                    className={`page-btn${pn === page ? ' active' : ''}`}
                    onClick={() => setPage(pn)}
                  >
                    {pn}
                  </button>
                ))}

                {page < totalPages - 2 && (
                  <>
                    {page < totalPages - 3 && <span style={{ color: 'var(--text-faint)', padding: '0 4px' }}>…</span>}
                    <button className="page-btn" onClick={() => setPage(totalPages)}>{totalPages}</button>
                  </>
                )}

                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Page suivante"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ExamListItem({ exam }) {
  const badge = TYPE_BADGE[exam.type] || TYPE_BADGE['Principale']

  return (
    <div className="exam-list-item">
      <div className="exam-list-content">
        <div className="exam-list-header">
          <span className="exam-list-year">{exam.year}</span>
          <span className="exam-list-subject">{exam.subject}</span>
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
          {exam.hasCorrection && (
            <span className="badge-check">
              ✓
            </span>
          )}
        </div>
        <div className="exam-list-section">{exam.sectionLabel}</div>
      </div>

      <div className="exam-list-actions">
        {exam.exists !== false ? (
          <Link
            to={`/view/${exam.id}`}
            className="icon-btn icon-btn-exam"
          >
            <FileText size={14} /> Sujet
          </Link>
        ) : (
          <button className="icon-btn icon-btn-disabled" disabled style={{ opacity: 0.5 }}>
            <FileText size={14} /> Aucun
          </button>
        )}
        {exam.hasCorrection && exam.correctionExists !== false ? (
          <Link
            to={`/view/${exam.id}?mode=correction`}
            className="icon-btn icon-btn-corr"
          >
            <BookOpen size={14} /> Corrigé
          </Link>
        ) : (
          <button className="icon-btn icon-btn-disabled" disabled title={exam.hasCorrection ? "Fichier non trouvé" : "Pas de corrigé"}>
            <BookOpen size={14} /> —
          </button>
        )}
      </div>

    </div>
  )
}
