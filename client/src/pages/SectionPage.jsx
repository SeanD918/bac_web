import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, FileText, BookOpen, Filter } from 'lucide-react'
import axios from 'axios'
import { SECTIONS as STATIC_SECTIONS, SUBJECTS as STATIC_SUBJECTS } from '../data/constants'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const YEARS = Array.from({ length: 2024 - 1994 + 1 }, (_, i) => 2024 - i)
const TYPES = ['Principale', 'Contrôle', 'Pratique']

const TYPE_BADGE = {
  'Principale': 'badge-principale',
  'Contrôle':   'badge-controle',
  'Pratique':   'badge-pratique',
}

export default function SectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Initialize with static data so the page renders even without API
  const staticSection = STATIC_SECTIONS.find(s => s.id === id)
  const staticSubjects = STATIC_SUBJECTS[id] || []

  const [section,  setSection]  = useState(staticSection || null)
  const [subjects, setSubjects] = useState(staticSubjects)
  const [results,  setResults]  = useState([])
  const [total,    setTotal]    = useState(staticSection?.count || 0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [page,     setPage]     = useState(1)
  const [filters,  setFilters]  = useState({ year: '', subject: '', type: '' })

  const LIMIT = 20

  useEffect(() => {
    if (!staticSection) navigate('/sections')

    // Try to get live data, but static fallback already renders
    axios.get(`${API}/sections`).then(r => {
      const found = r.data.find(s => s.id === id)
      if (found) setSection(found)
    }).catch(() => {})

    axios.get(`${API}/subjects/${id}`).then(r => setSubjects(r.data)).catch(() => {})
  }, [id, navigate])

  useEffect(() => {
    setLoading(true)
    setError(false)
    const params = { section: id, page, limit: LIMIT }
    if (filters.year)    params.year    = filters.year
    if (filters.subject) params.subject = filters.subject
    if (filters.type)    params.type    = filters.type

    axios.get(`${API}/exams`, { params })
      .then(r => { setResults(r.data.results); setTotal(r.data.total) })
      .catch((err) => { 
        console.error('Fetch error:', err);
        setError(true);
      })
      .finally(() => setLoading(false))
  }, [id, filters, page])

  const handleFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  const totalPages = Math.ceil(total / LIMIT)

  if (!section) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="section-detail">
      <div className="container">
        <Link to="/sections" className="back-link">
          <ChevronLeft size={16} />
          Retour aux sections
        </Link>

        {/* Section hero */}
        <div className="section-detail-hero">
          <div
            className="section-detail-icon"
            style={{ background: `${section.color}20` }}
          >
            {section.icon}
          </div>
          <div className="section-detail-info">
            <h1 style={{ color: section.color }}>{section.label}</h1>
          </div>
          <div className="section-detail-stats">
            <div className="detail-stat">
              <div className="detail-stat-num" style={{ color: section.color }}>
                {total.toLocaleString()}
              </div>
              <div className="detail-stat-label">Examens</div>
            </div>
            <div className="detail-stat">
              <div className="detail-stat-num" style={{ color: section.color }}>31</div>
              <div className="detail-stat-label">Années</div>
            </div>
          </div>
        </div>

        {/* Filters row */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Filtrer:</span>

          <select
            id="section-filter-year"
            className="filter-select"
            style={{ width: 'auto', flex: '0 0 auto', minWidth: 160 }}
            value={filters.year}
            onChange={e => handleFilter('year', e.target.value)}
          >
            <option value="">Toutes les années</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            id="section-filter-subject"
            className="filter-select"
            style={{ width: 'auto', flex: '0 0 auto', minWidth: 200 }}
            value={filters.subject}
            onChange={e => handleFilter('subject', e.target.value)}
          >
            <option value="">Toutes les matières</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            id="section-filter-type"
            className="filter-select"
            style={{ width: 'auto', flex: '0 0 auto', minWidth: 160 }}
            value={filters.type}
            onChange={e => handleFilter('type', e.target.value)}
          >
            <option value="">Tous les types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <span style={{ fontSize: 13, color: 'var(--text-faint)', marginLeft: 'auto' }}>
            {total.toLocaleString()} résultat{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Erreur de connexion</h3>
            <p>Le serveur est injoignable. Veuillez vérifier qu'il est en cours d'exécution.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Aucun examen trouvé</h3>
          </div>
        ) : (
          <div className="browse-results-list">
            {results.map(exam => (
              <SectionExamRow key={exam.id} exam={exam} color={section.color} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              ‹
            </button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const pn = i + Math.max(1, page - 3)
              if (pn > totalPages) return null
              return (
                <button key={pn} className={`page-btn${pn === page ? ' active' : ''}`} onClick={() => setPage(pn)}>
                  {pn}
                </button>
              )
            })}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionExamRow({ exam, color }) {
  const badge = TYPE_BADGE[exam.type] || 'badge-principale'

  return (
    <div className="exam-list-item" style={{ borderLeftColor: color }}>
      <div className="exam-list-content">
        <div className="exam-list-header">
          <span className="exam-list-year">{exam.year}</span>
          <span className="exam-list-subject">{exam.subject}</span>
          <span className={`badge ${badge}`}>{exam.type}</span>
          {exam.hasCorrection && (
            <span className="badge-check">
              ✓
            </span>
          )}
        </div>
      </div>
      <div className="exam-list-actions">
        {exam.hasExam !== false ? (
          <Link
            to={`/view/${exam.id}`}
            className="icon-btn icon-btn-exam"
          >
            <FileText size={14} /> Sujet
          </Link>
        ) : (
          <button className="icon-btn icon-btn-disabled" disabled>
            <FileText size={14} /> —
          </button>
        )}
        {exam.hasCorrection ? (
          <Link
            to={`/view/${exam.id}`}
            className="icon-btn icon-btn-corr"
          >
            <BookOpen size={14} /> Corrigé
          </Link>
        ) : (
          <button className="icon-btn icon-btn-disabled" disabled>
            <BookOpen size={14} /> —
          </button>
        )}
      </div>
    </div>
  )
}
