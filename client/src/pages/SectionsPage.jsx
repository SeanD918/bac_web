import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ChevronRight, Search } from 'lucide-react'
import axios from 'axios'
import { SECTIONS as STATIC_SECTIONS } from '../data/constants'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function SectionsPage() {
  const [sections, setSections] = useState(STATIC_SECTIONS)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    axios.get(`${API}/sections`)
      .then(r => setSections(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="sections-page">
      <div className="container">
        <h1 className="page-title">
          Toutes les{' '}
          <span className="gradient-text">sections</span>
        </h1>


        {loading ? (
          <div className="sections-grid">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 160 }} />
            ))}
          </div>
        ) : (
          <div className="sections-grid">
            {sections.map((s, i) => (
              <Link
                key={s.id}
                to={`/sections/${s.id}`}
                id={`section-card-${s.id}`}
                className="section-card"
                style={{
                  '--card-color': s.color,
                  animationDelay: `${i * 0.06}s`,
                  animation: 'fadeUp 0.4s ease both',
                }}
              >
                <div
                  className="section-card-icon"
                  style={{ background: `${s.color}20` }}
                >
                  {s.icon}
                </div>
                <h3>{s.label}</h3>

                <div className="section-card-count">
                  <FileText size={12} />
                  {s.count.toLocaleString()} examens
                  <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Search size={11} />
                    Parcourir
                  </span>
                </div>
                <ChevronRight size={16} className="section-card-arrow" />
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && sections.length > 0 && (
          <div className="stats-banner" style={{ marginTop: 64 }}>
            <div className="stat-item">
              <div className="stat-num">{sections.length}</div>
              <div className="stat-label">Sections disponibles</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">
                {sections.reduce((sum, s) => sum + s.count, 0).toLocaleString()}+
              </div>
              <div className="stat-label">Total des examens</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">31</div>
              <div className="stat-label">Années d'archives</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">100%</div>
              <div className="stat-label">Accès gratuit</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
