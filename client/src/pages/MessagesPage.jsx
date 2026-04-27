import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API from '../config/api';
import { Send, ArrowLeft, Image as ImageIcon, FileText, X } from 'lucide-react';


export default function MessagesPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [targetUser, setTargetUser] = useState(null);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTargetUser();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll for new messages
    return () => clearInterval(interval);
  }, [user, userId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchTargetUser = async () => {
    try {
      const res = await axios.get(`${API}/auth/users`);
      const u = res.data.find(u => u.id === userId);
      setTargetUser(u);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/messages/${userId}`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const validFiles = files.filter(f => allowed.includes(f.type)).slice(0, 5);
    setSelectedFiles(validFiles);
    const newPrevs = validFiles.map(file => {
      if (file.type.startsWith('image/')) return { type: 'image', url: URL.createObjectURL(file) };
      return { type: 'pdf', name: file.name };
    });
    setPreviews(newPrevs);
  };


  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('content', newMessage);
      selectedFiles.forEach(f => formData.append('media', f));

      const res = await axios.post(`${API}/messages/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages([...messages, res.data]);
      setNewMessage('');
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || 'Failed to send message');
    } finally {
      setIsUploading(false);
    }
  };



  if (!user || !targetUser) return null;

  return (
    <div className="page-container" style={{ paddingTop: 100, paddingBottom: 80, display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: 600, height: '70vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Chat Header */}
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/community')} className="btn btn-ghost" style={{ padding: 8 }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>{targetUser.username}</div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-faint)', marginTop: 40 }}>
              No messages yet. Start the conversation!
            </div>
          )}
          {messages.map(m => {
            const isMe = m.senderId === user.id;
            return (
              <div key={m.id} style={{ 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                background: isMe ? 'var(--accent-grad)' : 'var(--bg-card2)',
                color: isMe ? 'white' : 'var(--text)',
                padding: '10px 16px',
                borderRadius: 16,
                borderBottomRightRadius: isMe ? 4 : 16,
                borderBottomLeftRadius: isMe ? 16 : 4,
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                {(m.media || (m.mediaUrl ? [{url: m.mediaUrl, type: m.mediaType, name: m.mediaName}] : [])).length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: m.content ? 8 : 0 }}>
                    {(m.media || [{url: m.mediaUrl, type: m.mediaType, name: m.mediaName}]).map((file, idx) => (
                      <div key={idx}>
                        {file.type === 'image' ? (
                          <img 
                            src={file.url.startsWith('data:') ? file.url : `${API.replace('/api', '')}${file.url}`} 
                            alt="Shared media" 
                            style={{ maxWidth: '100%', borderRadius: 8, cursor: 'pointer', border: isMe ? 'none' : '1px solid var(--border)' }}
                            onClick={() => window.open(file.url.startsWith('data:') ? file.url : `${API.replace('/api', '')}${file.url}`, '_blank')}
                          />
                        ) : (
                          <a 
                            href={file.url.startsWith('data:') ? file.url : `${API.replace('/api', '')}${file.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 10, 
                              padding: '8px 12px', 
                              background: isMe ? 'rgba(255,255,255,0.1)' : 'var(--surface-lowest)', 
                              borderRadius: 8, 
                              textDecoration: 'none',
                              color: isMe ? 'white' : 'var(--text)',
                              border: isMe ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)'
                            }}
                          >
                            <FileText size={24} color={isMe ? 'white' : '#ef4444'} />
                            <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name || 'Document'}</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {m.content && <div>{m.content}</div>}
              </div>
            );

          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          {previews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, marginLeft: 8 }}>
              {previews.map((p, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  {p.type === 'image' ? (
                    <img src={p.url} alt="Preview" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'var(--bg-card2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                      <FileText size={16} color="#ef4444" />
                      <span style={{ fontSize: 10, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => {
                      const newF = [...selectedFiles]; newF.splice(i, 1); setSelectedFiles(newF);
                      const newP = [...previews]; newP.splice(i, 1); setPreviews(newP);
                      if (newF.length === 0 && fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 16, height: 16, cursor: 'pointer', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*,application/pdf" 
              style={{ display: 'none' }} 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost"
              style={{ color: 'var(--text-muted)', padding: '8px' }}
              title="Add Image or PDF"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="search-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={isUploading || (!newMessage.trim() && selectedFiles.length === 0)}>

              {isUploading ? '...' : <Send size={18} />}
            </button>
          </form>
        </div>


      </div>
    </div>
  );
}
