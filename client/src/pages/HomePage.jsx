import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, BookOpen, FileText, ChevronRight, Sparkles } from 'lucide-react'
import axios from 'axios'
import ExamCard from '../components/ExamCard'
import { SECTIONS as STATIC_SECTIONS } from '../data/constants'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function HomePage() {
  const [stats, setStats]       = useState(null)
  const [sections, setSections] = useState(STATIC_SECTIONS)
  const [featured, setFeatured] = useState([])
  const [query, setQuery]       = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, sec, f] = await Promise.all([
          axios.get(`${API}/stats`),
          axios.get(`${API}/sections`),
          axios.get(`${API}/exams/featured`),
        ])
        setStats(s.data)
        setSections(sec.data)
        setFeatured(f.data)
      } catch (err) {
        console.error(err)
        // Static sections already loaded as default — they'll still render
      }
    }
    fetchData()
  }, [])

  const handleSearch = e => {
    e.preventDefault()
    if (query.trim()) navigate(`/browse?q=${encodeURIComponent(query)}`)
  }

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="container hero-inner">
          <div className="hero-eyebrow">
            <Sparkles size={13} />
            Archives officielles depuis 1994
          </div>

          <h1>
            Réussis ton{' '}
            <span className="gradient-text">Baccalauréat</span>
            <br />avec BacWeb.tn
          </h1>



          <div className="hero-actions">
            <form onSubmit={handleSearch} className="search-wrap" style={{ maxWidth: 520, flex: 1 }}>
              <Search size={18} className="search-icon" />
              <input
                id="hero-search"
                type="text"
                className="search-input"
                placeholder="Rechercher matière, section, année…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary search-btn">
                Chercher
              </button>
            </form>
          </div>

          {stats && (
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num">{stats.totalExams.toLocaleString()}+</div>
                <div className="hero-stat-label">Sujets d'examen</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">{stats.totalCorrections.toLocaleString()}+</div>
                <div className="hero-stat-label">Corrections</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">30+</div>
                <div className="hero-stat-label">Années d'archives</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">{stats.totalSections}</div>
                <div className="hero-stat-label">Sections</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">100%</div>
                <div className="hero-stat-label">Gratuit</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Sections ─────────────────────────────────────────── */}
      <section className="home-sections">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Toutes les sections</h2>

            </div>
            <Link to="/sections" className="btn btn-ghost">
              Voir toutes <ArrowRight size={14} />
            </Link>
          </div>

          <div className="sections-grid">
            {sections.length === 0
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 140 }} />
                ))
              : sections.map((s, i) => (
                  <Link
                    key={s.id}
                    to={`/sections/${s.id}`}
                    className="section-card"
                    style={{
                      '--card-color': s.color,
                      animationDelay: `${i * 0.05}s`,
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
                      {s.count.toLocaleString()} examens disponibles
                    </div>
                    <ChevronRight size={16} className="section-card-arrow" />
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Exams ───────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="featured-exams">
          <div className="container">
            <div className="section-header">
              <div>
                <h2>Examens récents populaires</h2>

              </div>
              <Link to="/browse" className="btn btn-ghost">
                Parcourir tout <ArrowRight size={14} />
              </Link>
            </div>

            <div className="exam-cards-grid">
              {featured.map(exam => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA Banner ───────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div
            className="stats-banner"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
              borderColor: 'rgba(99,102,241,0.2)',
              textAlign: 'center',
            }}
          >
            <div style={{ gridColumn: '1 / -1' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 32,
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                Prêt à réviser ?
              </h2>

              <Link to="/browse" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
                <BookOpen size={16} />
                Commencer maintenant
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
