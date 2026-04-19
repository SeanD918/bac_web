import { useState, useEffect } from 'react'
import axios from 'axios'
import { UploadCloud, Trash2, ShieldCheck, Lock, AlertCircle, CheckCircle, FileText, Calendar, Tag } from 'lucide-react'
import { SECTIONS, SUBJECTS, EXAM_TYPES } from '../data/constants'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('bacweb_admin_token') || '')
  const [password, setPassword] = useState('')
  const [isLogged, setIsLogged] = useState(!!token)
  
  // States for Upload
  const [formData, setFormData] = useState({ year: 2024, section: '', subject: '', type: 'Principale' })
  const [files, setFiles] = useState({ examFile: null, correctionFile: null })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // States for Management
  const [myUploads, setMyUploads] = useState([])
  const [fetching, setFetching] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    if (password) {
      localStorage.setItem('bacweb_admin_token', password)
      setToken(password)
      setIsLogged(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('bacweb_admin_token')
    setToken('')
    setIsLogged(false)
  }

  const fetchMyUploads = async () => {
    if (!token) return
    setFetching(true)
    try {
      const r = await axios.get(`${API}/admin/items`)
      setMyUploads(r.data.results)
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (isLogged) fetchMyUploads()
  }, [isLogged])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!files.examFile) return setMessage({ type: 'error', text: 'Sujet (PDF) requis.' })
    
    setLoading(true)
    setMessage(null)

    const data = new FormData()
    data.append('year', formData.year)
    data.append('section', formData.section)
    data.append('subject', formData.subject)
    data.append('type', formData.type)
    data.append('examFile', files.examFile)
    if (files.correctionFile) data.append('correctionFile', files.correctionFile)

    try {
      await axios.post(`${API}/admin/add`, data, {
        headers: { 'x-admin-token': token }
      })
      setMessage({ type: 'success', text: 'Examen ajouté avec succès !' })
      setFiles({ examFile: null, correctionFile: null })
      fetchMyUploads()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur lors de l\'upload.' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet examen ?')) return
    try {
      await axios.delete(`${API}/admin/items/${id}`, {
        headers: { 'x-admin-token': token }
      })
      fetchMyUploads()
    } catch (err) {
      alert('Erreur de suppression')
    }
  }

  if (!isLogged) {
    return (
      <div className="container" style={{ maxWidth: 450, padding: '100px 20px' }}>
        <div className="admin-login-card card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div className="admin-icon-circle"><Lock size={24} /></div>
            <h2>Administration</h2>

          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Mot de passe</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>
              Se connecter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldCheck className="text-primary" /> Panel Admin
          </h1>

        </div>
        <button className="btn btn-ghost" onClick={handleLogout}>Déconnexion</button>
      </header>

      <div className="admin-grid">
        {/* Left: Upload Form */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <UploadCloud size={18} /> Ajouter un examen
          </h3>
          
          {message && (
            <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
              {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-grid">
              <div className="form-group">
                <label><Calendar size={14} /> Année</label>
                <input 
                  type="number" className="form-input" value={formData.year} 
                  onChange={e => setFormData({...formData, year: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label><Tag size={14} /> Type</label>
                <select className="form-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Section</label>
              <select className="form-input" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}>
                <option value="">Sélectionner...</option>
                {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Matière</label>
              <select className="form-input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} disabled={!formData.section}>
                <option value="">Sélectionner...</option>
                {(SUBJECTS[formData.section] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Fichier Sujet (PDF)</label>
              <input type="file" accept=".pdf" onChange={e => setFiles({...files, examFile: e.target.files[0]})} />
            </div>

            <div className="form-group">
              <label>Fichier Correction (Optionnel)</label>
              <input type="file" accept=".pdf" onChange={e => setFiles({...files, correctionFile: e.target.files[0]})} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Upload en cours...' : 'Ajouter à la base'}
            </button>
          </form>
        </div>

        {/* Right: Uploaded List */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <FileText size={18} /> Vos uploads récents
          </h3>
          
          {fetching ? <div className="spinner" /> : (
            <div className="admin-list">
              {myUploads.length === 0 ? <p className="text-faint">Aucun upload manuel trouvé.</p> : (
                myUploads.map(ex => (
                  <div key={ex.id} className="admin-list-item">
                    <div>
                      <strong>{ex.subject}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {ex.year} • {ex.sectionLabel} • {ex.type}
                      </div>
                    </div>
                    <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(ex.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
