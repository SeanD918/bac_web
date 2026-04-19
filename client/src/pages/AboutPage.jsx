import { Link } from 'react-router-dom'
import {
  BookOpen, Search, Zap, Globe, Shield,
  Star, ArrowRight, Database, Filter, Download
} from 'lucide-react'

const FEATURES = [
  {
    icon: <Database size={22} />,
    color: '#6366f1',
    title: 'Archives depuis 1994',
    desc: 'Plus de 6 000 sujets d\'examens officiels du Ministère de l\'Éducation tunisien, couvrant 31 années de sessions.'
  },
  {
    icon: <Filter size={22} />,
    color: '#10b981',
    title: 'Filtrage avancé',
    desc: 'Filtrez par année, section, matière et type d\'examen (Principale, Contrôle, Pratique) pour trouver exactement ce dont vous avez besoin.'
  },
  {
    icon: <BookOpen size={22} />,
    color: '#f59e0b',
    title: 'Corrections officielles',
    desc: 'Des corrections officielles sont disponibles pour la plupart des examens, vous aidant à comprendre les attentes et à évaluer vos réponses.'
  },
  {
    icon: <Search size={22} />,
    color: '#3b82f6',
    title: 'Recherche intelligente',
    desc: 'Trouvez instantanément n\'importe quel examen grâce à la recherche par mot-clé couvrant toutes les sections et années.'
  },
  {
    icon: <Globe size={22} />,
    color: '#ec4899',
    title: 'Bilingue FR / AR',
    desc: 'Le contenu est disponible en français et en arabe, reflétant le bilinguisme du système éducatif tunisien.'
  },
  {
    icon: <Download size={22} />,
    color: '#8b5cf6',
    title: 'Accès gratuit',
    desc: 'Toutes les ressources sont entièrement gratuites, sans inscription, sans abonnement.'
  },
]

const SECTIONS = [
  { emoji: '∑',  label: 'Mathématiques',          color: '#6366f1' },
  { emoji: '🔬', label: 'Sciences Expérimentales', color: '#10b981' },
  { emoji: '📈', label: 'Économie & Gestion',      color: '#f59e0b' },
  { emoji: '⚙️', label: 'Technique',               color: '#3b82f6' },
  { emoji: '📚', label: 'Lettres',                 color: '#ec4899' },
  { emoji: '💻', label: 'Informatique',            color: '#8b5cf6' },
  { emoji: '🏃', label: 'Sport',                   color: '#ef4444' },
]

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="container">
        {/* Hero */}
        <div className="about-hero">
          <div className="hero-eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>
            <Star size={13} fill="currentColor" />
            À propos de BacWeb.tn
          </div>
          <h1>
            La plateforme{' '}
            <span className="gradient-text">éducative</span>
            <br />pour les lycéens tunisiens
          </h1>

        </div>

        {/* Features */}
        <div className="about-features">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="feature-icon" style={{ background: `${f.color}15`, color: f.color }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>

            </div>
          ))}
        </div>

        {/* Sections covered */}
        <div style={{ marginBottom: 80 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Sections couvertes
          </h2>


          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {SECTIONS.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}25`,
                  borderRadius: 99,
                  padding: '10px 20px',
                  color: s.color,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                <span style={{ fontSize: 18 }}>{s.emoji}</span>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="glass"
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '48px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))',
            borderColor: 'rgba(99,102,241,0.15)',
          }}
        >
          <Zap size={36} style={{ color: '#6366f1', marginBottom: 16 }} />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            Commencez à réviser maintenant
          </h2>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/browse" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
              <Search size={16} />
              Parcourir les examens
            </Link>
            <Link to="/sections" className="btn btn-ghost" style={{ fontSize: 15, padding: '12px 28px' }}>
              Voir les sections
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
