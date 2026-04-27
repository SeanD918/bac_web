import { FileText, BookOpen, Download } from 'lucide-react'
import { Link } from 'react-router-dom'

const TYPE_BADGE = {
  'Principale': 'badge-principale',
  'Contrôle':   'badge-controle',
  'Pratique':   'badge-pratique',
}

export default function ExamCard({ exam }) {
  const badgeClass = TYPE_BADGE[exam.type] || 'badge-principale'

  return (
    <div className="exam-card animate-fade-up">
      <div className="exam-card-top">
        <div className="exam-card-meta">
          <span className="exam-year">{exam.year}</span>
          <span className={`badge ${badgeClass}`}>{exam.type}</span>
        </div>
        {exam.hasCorrection && (
          <span className="badge" style={{
            background: 'rgba(16,185,129,0.1)',
            color: '#34d399',
          }}>✓ Correction</span>
        )}
      </div>

      <h3>{exam.subject}</h3>

      <div className="exam-card-actions">
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
            className="exam-action-btn secondary"
          >
            <BookOpen size={14} />
            Corrigé
          </Link>
        ) : (
          <button className="exam-action-btn disabled" disabled title={exam.hasCorrection ? "Non disponible" : "Pas de corrigé"}>
            <BookOpen size={14} />
            —
          </button>
        )}
      </div>

    </div>
  )
}
