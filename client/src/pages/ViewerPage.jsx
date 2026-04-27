import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Download, ExternalLink, Printer, Info, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import API from '../config/api';
import './ViewerPage.css';

const ViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('exam'); // 'exam' or 'correction'
  const [fileBroken, setFileBroken] = useState(false);

  useEffect(() => {
    const fetchAndVerify = async () => {
      try {
        setLoading(true);
        // 1. Fetch Exam Data
        const response = await axios.get(`${API}/exams/${id}`);
        const data = response.data;
        setExam(data);

        // 2. Verify link existence via backend proxy
        const url = viewMode === 'exam' ? data.examUrl : data.correctionUrl;
        if (url) {
          try {
            const verify = await axios.get(`${API}/verify-link?url=${encodeURIComponent(url)}`);
            setFileBroken(!verify.data.exists);
          } catch (vErr) {
            console.error('Verification failed', vErr);
            setFileBroken(false); // Assume fine if verification itself fails
          }
        } else {
          setFileBroken(true);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching exam:', err);
        setError('Examen introuvable ou erreur de connexion.');
        setLoading(false);
      }
    };

    fetchAndVerify();
  }, [id, viewMode]);

  if (loading) {
    return (
      <div className="viewer-loading">
        <div className="spinner"></div>
        <p>Chargement de l'examen...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="viewer-error">
        <div className="error-card">
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2>Oops!</h2>
          <p>{error || "Nous n'avons pas pu trouver cet examen."}</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Retourner
          </button>
        </div>
      </div>
    );
  }

  const currentUrl = viewMode === 'exam' ? exam.examUrl : exam.correctionUrl;
  const proxyUrl = `${API}/proxy-pdf?url=${encodeURIComponent(currentUrl)}`;
  const title = `${exam.subject} — ${exam.sectionLabel} ${exam.year}`;

  return (
    <div className="viewer-page">
      <header className="viewer-header">
        <div className="viewer-header-left">
          <button onClick={() => navigate(-1)} className="back-btn" title="Retour">
            <ChevronLeft size={20} />
          </button>
          <div className="viewer-title-area">
            <h1>{exam.subject}</h1>
            <div className="viewer-subtitle">
              <span>{exam.sectionLabel}</span>
              <span className="dot">•</span>
              <span>{exam.year}</span>
              <span className="dot">•</span>
              <span className={`session-badge ${exam.type.toLowerCase()}`}>{exam.type}</span>
            </div>
          </div>
        </div>

        <div className="viewer-header-actions">
          {exam.hasCorrection && (
            <div className="view-toggle">
              <button 
                className={viewMode === 'exam' ? 'active' : ''} 
                onClick={() => setViewMode('exam')}
              >
                Sujet
              </button>
              <button 
                className={viewMode === 'correction' ? 'active' : ''} 
                onClick={() => setViewMode('correction')}
              >
                Corrigé
              </button>
            </div>
          )}
          
          <div className="action-buttons">
            <a href={currentUrl} download className="icon-btn-viewer" title="Télécharger">
              <Download size={18} />
            </a>
            <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="icon-btn-viewer" title="Ouvrir dans un nouvel onglet">
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </header>

      <main className="viewer-main">
        <div className="iframe-container">
          {fileBroken ? (
            <div className="viewer-error-overlay">
              <AlertTriangle size={48} color="#f59e0b" />
              <h2>Fichier non trouvé</h2>
              <p>Désolé, ce fichier n'est plus disponible sur la source officielle (bacweb.tn).</p>
              <button onClick={() => navigate(-1)} className="btn btn-primary">Retourner au catalogue</button>
            </div>
          ) : (
            <iframe 
              src={`${proxyUrl}#toolbar=0&navpanes=0`} 
              title={title}
              className="pdf-iframe"
            />
          )}
        </div>

        <aside className="viewer-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <Info size={16} />
              <h3>Détails</h3>
            </div>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Année</span>
                <span className="value">{exam.year}</span>
              </div>
              <div className="detail-item">
                <span className="label">Section</span>
                <span className="value">{exam.sectionLabel}</span>
              </div>
              <div className="detail-item">
                <span className="label">Session</span>
                <span className="value">{exam.type}</span>
              </div>
              <div className="detail-item">
                <span className="label">Correction</span>
                <span className="value">
                  {exam.hasCorrection ? (
                    <span className="text-success"><CheckCircle size={14} /> Disponible</span>
                  ) : 'Non disponible'}
                </span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Actions rapides</h3>
            <div className="quick-actions">
              <a href={exam.examUrl} target="_blank" rel="noopener noreferrer" className="quick-btn">
                <FileText size={16} />
                Voir le sujet (PDF)
              </a>
              {exam.hasCorrection && (
                <a href={exam.correctionUrl} target="_blank" rel="noopener noreferrer" className="quick-btn">
                  <CheckCircle size={16} />
                  Voir le corrigé (PDF)
                </a>
              )}
            </div>
          </div>

          <div className="viewer-ad-space">
            <p>Révisez avec BacWeb pour réussir votre Bac !</p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ViewerPage;
