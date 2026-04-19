import { Link } from 'react-router-dom'
import { GraduationCap, Heart } from 'lucide-react'

const FOOTER_LINKS = {
  Sections: [
    { label: 'Mathématiques', to: '/sections/math' },
    { label: 'Sciences Exp.', to: '/sections/sciences' },
    { label: 'Économie & Gestion', to: '/sections/eco' },
    { label: 'Informatique', to: '/sections/info' },
    { label: 'Lettres', to: '/sections/lettres' },
  ],
  Navigation: [
    { label: 'Accueil', to: '/' },
    { label: 'Parcourir', to: '/browse' },
    { label: 'Toutes les sections', to: '/sections' },
    { label: 'À propos', to: '/about' },
  ],
  Ressources: [
    { label: 'Examens 2024', to: '/browse?year=2024' },
    { label: 'Examens 2023', to: '/browse?year=2023' },
    { label: 'Avec corrections', to: '/browse' },
    { label: 'Examens pratiques', to: '/browse?type=Pratique' },
  ],
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo" style={{ display: 'inline-flex' }}>
              <div className="nav-logo-icon">🎓</div>
              <span className="nav-logo-text">BacWeb.tn</span>
            </Link>
            <p>
              La référence des archives du Baccalauréat tunisien depuis 1994.
              Accédez à des milliers de sujets et corrections officiels.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="footer-col">
              <h4>{group}</h4>
              <ul>
                {links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p>© {year} BacWeb.tn — Développé Par Iheb Rouini</p>
          <div className="footer-tn">
            <span>Fait Avec</span>
            <Heart size={16} style={{ color: '#ef4444' }} />
            <span>Pour Les Lycéens Tunisiens</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
