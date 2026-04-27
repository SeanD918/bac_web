import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API from '../config/api';
import { Bell, Check, UserPlus, Heart, MessageSquare, Reply as ReplyIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);
  const { user } = useAuth();
  const lastFetchedCount = React.useRef(0);


  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 3000); // Poll every 3s for "real-time" feel
      return () => clearInterval(interval);
    }
  }, [user]);


  // Removed unread check effect in favor of logic in fetchNotifications


  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/notifications`);
      const newData = res.data;
      const unseen = newData.filter(n => !n.isSeen);
      
      // If we have new notifications that we didn't have before, show a toast
      if (unseen.length > lastFetchedCount.current) {
        const latest = unseen[0];
        setActiveToast(latest);
        setTimeout(() => setActiveToast(null), 5000); // Hide toast after 5s
      }
      
      lastFetchedCount.current = unseen.length;
      setNotifications(newData);
      setUnreadCount(unseen.length);
    } catch (e) {
      console.error(e);
    }
  };


  const markAllAsSeen = async () => {
    try {
      await axios.post(`${API}/notifications/seen`);
      setUnreadCount(0);
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
    const nextState = !open;
    setOpen(nextState);
    if (nextState && unreadCount > 0) {
      markAllAsSeen();
    }
  };


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
      <button onClick={toggleDropdown} className="btn btn-ghost" style={{ padding: '8px', position: 'relative', overflow: 'visible' }}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2, 
            background: 'var(--accent-red, #ef4444)', color: 'white',
            borderRadius: '50%', minWidth: 16, height: 16, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 'bold', padding: '0 4px',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
            border: '2px solid var(--bg-card, #ffffff)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div 
          className="card shadow-2xl" 
          style={{
            position: 'absolute', top: 'calc(100% + 12px)', right: 0, 
            width: 360, maxWidth: 'calc(100vw - 32px)', maxHeight: 520, overflowY: 'auto', 
            zIndex: 1000, padding: 0,
            border: '1px solid var(--border)',
            background: 'var(--bg-card, #0e1221)',
            borderRadius: 20,
            animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex', flexDirection: 'column',
            color: 'var(--text)'
          }}
        >
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid var(--border)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <span style={{ fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Notifications</span>

            {unreadCount > 0 && (
              <span style={{ 
                fontSize: 11, 
                fontWeight: 600,
                color: 'white', 
                background: 'var(--accent-purple, #8b5cf6)', 
                padding: '4px 10px', 
                borderRadius: 20 
              }}>
                {unreadCount} Nouvelles
              </span>
            )}
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
            {notifications.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-faint)' }}>
                <div style={{ 
                  width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-lowest)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' 
                }}>
                  <Bell size={32} style={{ opacity: 0.3 }} />
                </div>
                <p style={{ fontWeight: 500 }}>Tout est calme ici</p>
                <span style={{ fontSize: 12 }}>Vous n'avez pas encore de notifications.</span>
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
                        padding: '16px 20px', 
                        borderBottom: '1px solid var(--border)',
                        background: n.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.08)',
                        display: 'flex', gap: 16, alignItems: 'flex-start',
                        textDecoration: 'none', color: 'inherit',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        borderLeft: n.isRead ? '4px solid transparent' : '4px solid #3b82f6'
                      }}
                      className="notif-item"
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: '14px', 
                        background: 'var(--bg-card2)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: 'var(--text)', fontWeight: 'bold', fontSize: 16, flexShrink: 0,
                        position: 'relative',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}>
                        {n.actorName.charAt(0).toUpperCase()}
                        <div style={{
                          position: 'absolute', bottom: -4, right: -4,
                          background: 'var(--bg-card)', borderRadius: '50%', padding: 4,
                          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid var(--border)'
                        }}>

                          {getIcon(n.type)}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text)' }}>
                          <span style={{ fontWeight: 700 }}>{n.actorName}</span>
                          <span style={{ marginLeft: 4 }}>
                            {n.type === 'FOLLOW' && 'a commencé à vous suivre'}
                            {n.type === 'LIKE' && 'a aimé votre publication'}
                            {n.type === 'LIKE_COMMENT' && 'a aimé votre commentaire'}
                            {n.type === 'LIKE_REPLY' && 'a aimé votre réponse'}
                            {n.type === 'COMMENT' && 'a commenté votre publication'}
                            {n.type === 'REPLY' && 'a répondu à votre commentaire'}
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: 12, 
                          color: 'var(--text-faint)', 
                          marginTop: 6, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between'
                        }}>
                          <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                          {!n.isRead && (
                            <span style={{ 
                              fontSize: 9, 
                              fontWeight: 900, 
                              background: '#3b82f6', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: 4,
                              letterSpacing: '0.5px'
                            }}>NOUVEAU</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          <div style={{ 
            padding: '12px', 
            textAlign: 'center', 
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid var(--border)' 
          }}>
            <button 
              onClick={() => setOpen(false)}
              style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Fermer
            </button>
          </div>

        </div>
      )}

      {/* Real-time Toast Notification Popup */}
      {activeToast && (
        <div style={{
          position: 'fixed', bottom: 30, left: 30, 
          zIndex: 9999, background: 'var(--bg-card)', 
          border: '1px solid var(--accent)', borderRadius: 16,
          padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          animation: 'toastPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer'
        }} onClick={() => { setActiveToast(null); setOpen(true); }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: '50%', 
            background: 'var(--accent-grad)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: 'white' 
          }}>
            {getIcon(activeToast.type)}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 'bold' }}>Nouvelle interaction !</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {activeToast.actorName} {activeToast.type === 'LIKE' ? 'a aimé votre post' : 'a interagi avec vous'}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastPop {
          from { opacity: 0; transform: translateY(40px) scale(0.8); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .notif-item:hover {
          background: rgba(0, 0, 0, 0.02) !important;
          transform: translateX(4px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>


  );
}
