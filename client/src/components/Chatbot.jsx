import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Bonjour ! Je suis l\'assistant BacWeb. Je peux vous aider à trouver des examens par matière, section, année et session (Principale/Contrôle). Par exemple: "Math 2023 info principale".' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && sections.length === 0) {
      fetch('/api/sections')
        .then(res => res.json())
        .then(data => setSections(data))
        .catch(err => console.error('Error fetching sections:', err));
    }
  }, [isOpen, sections.length]);

  const addMessage = (type, text, options = null, results = null) => {
    setMessages(prev => [...prev, { type, text, options, results }]);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText('');
    addMessage('user', userMsg);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await response.json();
      
      addMessage('bot', data.text, null, data.results);
    } catch (err) {
      addMessage('bot', 'Désolé, je rencontre un problème de connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (opt) => {
    if (opt.action) {
      opt.action();
    } else if (opt.id) { // Section clicked
      setInputText(opt.label);
      // We'll just trigger the chat logic with the label
      setTimeout(() => handleSend(), 10);
    } else {
      setInputText(opt);
      setTimeout(() => handleSend(), 10);
    }
  };

  const resetChat = () => {
    setMessages([
      { type: 'bot', text: 'C\'est reparti ! De quel examen avez-vous besoin ?' }
    ]);
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="chat-window animate-fade-up">
          <div className="chat-header">
            <div className="header-info">
              <div className="bot-avatar">🤖</div>
              <div>
                <h3>Assistant Scolaire</h3>
                <span className="status">En ligne</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.type}`}>
                <div className="message-bubble">
                  {msg.text}
                  
                  {msg.results && msg.results.length > 0 && (
                    <div className="chat-results">
                      {msg.results.map((exam, idx) => (
                        <div key={idx} className="chat-result-card">
                          <div className="result-info">
                            <span className="result-year">{exam.year} — {exam.sectionLabel}</span>
                            <span className="result-subject">{exam.subject}</span>
                            <span className="result-type">{exam.type}</span>
                          </div>
                          <div className="result-actions">
                            <Link to={`/view/${exam.id}`} className="action-btn pdf" onClick={() => setIsOpen(false)}>
                              Examen
                            </Link>
                            {exam.correctionUrl && (
                              <Link to={`/view/${exam.id}`} className="action-btn sol" onClick={() => setIsOpen(false)}>
                                Corrigé
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.options && (
                    <div className="options-container">
                      {msg.options.map((opt, j) => (
                        <button key={j} className="option-btn" onClick={() => handleOptionClick(opt)}>
                          {opt.label || opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {messages.length === 1 && sections.length > 0 && (
              <div className="message-wrapper bot">
                <div className="message-bubble no-bg">
                  <div className="options-container">
                    {sections.map(s => (
                      <button key={s.id} className="option-btn" onClick={() => handleOptionClick(s)}>
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="message-wrapper bot">
                <div className="message-bubble typing">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Posez votre question ici..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" disabled={loading || !inputText.trim()}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      <button 
        className={`chat-toggle ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Assistant"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <div className="toggle-icon">
             <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="notification-dot"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
