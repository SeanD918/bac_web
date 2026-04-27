import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API from '../config/api';
import { Send, ArrowLeft } from 'lucide-react';

export default function MessagesPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`${API}/messages/${userId}`, { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (e) {
      console.error(e);
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
                maxWidth: '70%'
              }}>
                {m.content}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="search-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
