import { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../config/api';
import { Bell, Check, UserPlus, Heart, MessageSquare, Reply as ReplyIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [hasNewSinceOpen, setHasNewSinceOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length > 0 && !open) {
      setHasNewSinceOpen(true);
    }
  }, [notifications, open]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/notifications`);
      setNotifications(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const markOneAsRead = async (id) => {
    try {
      await axios.post(`${API}/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDropdown = () => {
    if (!open) {
      setHasNewSinceOpen(false);
    }
    setOpen(!open);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'FOLLOW': return <UserPlus size={14} />;
      case 'LIKE': 
      case 'LIKE_COMMENT':
      case 'LIKE_REPLY': return <Heart size={14} fill="#ef4444" color="#ef4444" />;
      case 'COMMENT': return <MessageSquare size={14} />;
      case 'REPLY': return <ReplyIcon size={14} />;
      default: return <Bell size={14} />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={toggleDropdown} className="btn btn-ghost" style={{ padding: '8px', position: 'relative' }}>
        <Bell size={18} />
        {hasNewSinceOpen && unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 6, right: 6, 
            background: '#3b82f6', border: '2px solid var(--bg-card)',
            borderRadius: '50%', width: 10, height: 10, 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} />
        )}
      </button>

      {open && (
        <div className="card shadow-lg" style={{
          position: 'absolute', top: '120%', right: 0, 
          width: 340, maxHeight: 480, overflowY: 'auto', 
          marginTop: 8, zIndex: 100, padding: 0,
          border: '1px solid var(--border)',
          animation: 'slideDown 0.2s ease-out'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: 16 }}>Notifications</span>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{unreadCount} nouvelles</span>
          </div>
          
          {notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>
              <Bell size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map(n => {
                const link = n.postId ? `/community?postId=${n.postId}` : '/community';
                return (
                  <Link 
                    key={n.id} 
                    to={link} 
                    onClick={() => { markOneAsRead(n.id); setOpen(false); }} 
                    style={{
                      padding: '14px 16px', 
                      borderBottom: '1px solid var(--border)',
                      background: n.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                      display: 'flex', gap: 14, alignItems: 'flex-start',
                      textDecoration: 'none', color: 'inherit',
                      transition: 'background 0.2s'
                    }}
                    className="notif-item"
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', 
                      background: 'var(--bg-card2)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: 'var(--text)', fontWeight: 'bold', fontSize: 14, flexShrink: 0,
                      position: 'relative'
                    }}>
                      {n.actorName.charAt(0).toUpperCase()}
                      <div style={{
                        position: 'absolute', bottom: -2, right: -2,
                        background: 'var(--surface)', borderRadius: '50%', padding: 3,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {getIcon(n.type)}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 'bold' }}>{n.actorName}</span>
                        {n.type === 'FOLLOW' && ' a commencé à vous suivre'}
                        {n.type === 'LIKE' && ' a aimé votre publication'}
                        {n.type === 'LIKE_COMMENT' && ' a aimé votre commentaire'}
                        {n.type === 'LIKE_REPLY' && ' a aimé votre réponse'}
                        {n.type === 'COMMENT' && ' a commenté votre publication'}
                        {n.type === 'REPLY' && ' a répondu à votre commentaire'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {new Date(n.timestamp).toLocaleDateString()}
                        {!n.isRead && (
                          <span style={{ width: 6, height: 6, background: '#3b82f6', borderRadius: '50%' }} />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notif-item:hover {
          background: var(--bg-card2) !important;
        }
      `}</style>
    </div>
  );
}
