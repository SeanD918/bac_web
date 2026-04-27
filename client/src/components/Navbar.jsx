import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Search, GraduationCap, Menu, X, LayoutGrid, Info, UploadCloud, Calculator, Users, LogIn, LogOut } from 'lucide-react'

import Notifications from './Notifications'

const NAV_ITEMS = [
  { to: '/',         label: 'Accueil',   icon: <GraduationCap size={15} /> },
  { to: '/browse',   label: 'Parcourir', icon: <Search size={15} /> },
  { to: '/sections', label: 'Sections',  icon: <LayoutGrid size={15} /> },
  { to: '/community',label: 'Communauté',icon: <Users size={15} /> },
  { to: '/calculator', label: 'Calculateur', icon: <Calculator size={15} /> },
  { to: '/about',    label: 'À propos',  icon: <Info size={15} /> },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">🎓</div>
            <span className="nav-logo-text">BacWeb.tn</span>
          </Link>

          <ul className="nav-links">
            {NAV_ITEMS.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [isActive ? 'active' : '', item.highlight ? 'nav-upload-link' : ''].join(' ').trim()
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {user && <Notifications />}

            {user ? (
              <div className="nav-user-desktop">
                <span style={{ fontSize: 14, fontWeight: 500 }}>{user.username}</span>
                <button onClick={logout} className="btn btn-ghost" style={{ padding: '8px 12px' }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn btn-primary">
                <LogIn size={14} /> Connexion
              </Link>
            )}

            <button
              id="nav-mobile-btn"
              className="nav-mobile-toggle"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>


      {mobileOpen && (
        <nav className="nav-mobile-menu">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/browse"
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={() => setMobileOpen(false)}
          >
            <Search size={14} />
            Rechercher des examens
          </Link>
        </nav>
      )}
    </>
  )
}
