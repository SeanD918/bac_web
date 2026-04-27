import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API from '../config/api';
import { MessageSquare, Heart, Send, UserPlus, UserCheck, MessageCircle, Reply as ReplyIcon, Image as ImageIcon, FileText, X } from 'lucide-react';


export default function CommunityPage() {
  const { user, followUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [commentInputs, setCommentInputs] = useState({});

  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const postRefs = useRef({});

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchPosts();
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postId = params.get('postId');
    if (postId && posts.length > 0) {
      const el = postRefs.current[postId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
        setTimeout(() => {
          el.style.boxShadow = 'none';
        }, 2000);
      }
    }
  }, [location, posts]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/community/posts`);
      setPosts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Only PDF and image files are allowed');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview('pdf');
    }
  };

  const handlePostSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newPost.trim() && !selectedFile) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('content', newPost);
      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      const res = await axios.post(`${API}/community/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setPosts([res.data, ...posts]);
      setNewPost('');
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || 'Failed to post');
    } finally {
      setIsUploading(false);
    }
  };


  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${API}/community/posts/${postId}/like`);
      setPosts(posts.map(p => p.id === postId ? res.data : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    try {
      const res = await axios.post(`${API}/community/posts/${postId}/comment`, { content });
      setPosts(posts.map(p => p.id === postId ? res.data : p));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentLike = async (postId, commentId) => {
    try {
      const res = await axios.post(`${API}/community/posts/${postId}/comments/${commentId}/like`);
      setPosts(posts.map(p => p.id === postId ? res.data : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplyLike = async (postId, commentId, replyId) => {
    try {
      const res = await axios.post(`${API}/community/posts/${postId}/comments/${commentId}/replies/${replyId}/like`);
      setPosts(posts.map(p => p.id === postId ? res.data : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplySubmit = async (postId, commentId) => {
    const content = replyInputs[commentId];
    if (!content?.trim()) return;
    try {
      const res = await axios.post(`${API}/community/posts/${postId}/comments/${commentId}/reply`, { content });
      setPosts(posts.map(p => p.id === postId ? res.data : p));
      setReplyInputs({ ...replyInputs, [commentId]: '' });
      setActiveReplyId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNestedReplySubmit = async (postId, commentId, replyId) => {
    const content = replyInputs[replyId];
    if (!content?.trim()) return;
    try {
      const res = await axios.post(`${API}/community/posts/${postId}/comments/${commentId}/replies/${replyId}/reply`, { content });
      setPosts(posts.map(p => p.id === postId ? res.data : p));
      setReplyInputs({ ...replyInputs, [replyId]: '' });
      setActiveReplyId(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <div className="page-container" style={{ paddingTop: 100, paddingBottom: 80, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 700 }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', background: 'var(--accent-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', marginBottom: 8 }}>
            Community Feed
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Share resources, ask questions, and connect with other students.</p>
        </div>
        
        <div className="card" style={{ padding: 24, marginBottom: 32, display: 'flex', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            fontWeight: 'bold', fontSize: 16, flexShrink: 0
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <form onSubmit={handlePostSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea 
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePostSubmit(e);
                }
              }}
              placeholder="What's on your mind?"
              className="search-input"
              style={{ resize: 'vertical', minHeight: 80, padding: 16, background: 'var(--surface-lowest)' }}
            />

            {filePreview && (
              <div style={{ position: 'relative', width: 'fit-content', marginTop: 8 }}>
                {filePreview === 'pdf' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <FileText size={24} color="#ef4444" />
                    <span style={{ fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile?.name}</span>
                  </div>
                ) : (
                  <img src={filePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                )}
                <button 
                  type="button"
                  onClick={() => { setSelectedFile(null); setFilePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  style={{ position: 'absolute', top: -10, right: -10, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
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
                  <ImageIcon size={20} style={{ marginRight: 6 }} />
                  <span style={{ fontSize: 13 }}>Media</span>
                </button>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isUploading || (!newPost.trim() && !selectedFile)}
                style={{ padding: '8px 24px' }}
              >
                {isUploading ? 'Posting...' : <><Send size={16} /> Post</>}
              </button>
            </div>
          </form>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {posts.map(post => {
            const isFollowing = user.following?.includes(post.authorId);
            const isMe = post.authorId === user.id;

            return (
              <div 
                key={post.id} 
                ref={el => postRefs.current[post.id] = el}
                className="card" 
                style={{ padding: '24px 24px 16px 24px', transition: 'box-shadow 0.5s ease' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
                      fontWeight: 'bold', fontSize: 16, border: '1px solid var(--border)'
                    }}>
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 15 }}>{post.authorName}</div>
                      <div style={{ color: 'var(--text-faint)', fontSize: 12 }}>
                        {new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                  
                  {!isMe && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/messages/${post.authorId}`} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>
                        <MessageCircle size={14} /> Chat
                      </Link>
                      <button 
                        onClick={() => followUser(post.authorId)}
                        className={`btn ${isFollowing ? 'btn-ghost' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: 13 }}
                      >
                        {isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                      </button>
                    </div>
                  )}
                </div>

                <p style={{ marginBottom: post.mediaUrl ? 16 : 24, fontSize: 15, lineHeight: 1.6, color: 'var(--text)' }}>
                  {post.content}
                </p>

                {post.mediaUrl && (
                  <div style={{ marginBottom: 24 }}>
                    {post.mediaType === 'image' ? (
                      <img 
                        src={`${API.replace('/api', '')}${post.mediaUrl}`} 
                        alt="Post attachment" 
                        style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer' }}
                        onClick={() => window.open(`${API.replace('/api', '')}${post.mediaUrl}`, '_blank')}
                      />
                    ) : (
                      <a 
                        href={`${API.replace('/api', '')}${post.mediaUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="card"
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--surface-lowest)', textDecoration: 'none', border: '1px solid var(--border)' }}
                      >
                        <FileText size={32} color="#ef4444" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: 'var(--text)', fontSize: 14 }}>{post.mediaName || 'PDF Document'}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Click to view document</div>
                        </div>
                      </a>
                    )}
                  </div>
                )}

                
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="btn btn-ghost" 
                    style={{ color: post.likes.includes(user.id) ? '#ef4444' : 'var(--text-muted)', padding: '6px 12px' }}
                  >
                    <Heart size={18} fill={post.likes.includes(user.id) ? '#ef4444' : 'none'} /> 
                    {post.likes.length}
                  </button>
                  <span className="btn btn-ghost" style={{ cursor: 'default', color: 'var(--text-muted)', padding: '6px 12px' }}>
                    <MessageSquare size={18} /> {post.comments.length}
                  </span>
                </div>

                {/* Comments Section */}
                <div>
                  {post.comments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
                      {post.comments.map(c => {
                        const hasLikedComment = c.likes?.includes(user.id);
                        return (
                          <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
                                fontWeight: 'bold', fontSize: 12, flexShrink: 0
                              }}>
                                {c.authorName.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ background: 'var(--surface-lowest)', padding: '10px 14px', borderRadius: 16, borderTopLeftRadius: 4 }}>
                                  <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>{c.authorName}</div>
                                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{c.content}</div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: 12, marginTop: 4, paddingLeft: 8 }}>
                                  <button 
                                    onClick={() => handleCommentLike(post.id, c.id)}
                                    className="btn btn-ghost" 
                                    style={{ fontSize: 12, padding: '4px 8px', color: hasLikedComment ? '#ef4444' : 'var(--text-faint)' }}
                                  >
                                    <Heart size={12} fill={hasLikedComment ? '#ef4444' : 'none'} style={{ marginRight: 4 }} /> {c.likes?.length || 0}
                                  </button>
                                  <button 
                                    onClick={() => setActiveReplyId(activeReplyId === c.id ? null : c.id)}
                                    className="btn btn-ghost" 
                                    style={{ fontSize: 12, padding: '4px 8px', color: 'var(--text-faint)' }}
                                  >
                                    <ReplyIcon size={12} style={{ marginRight: 4 }} /> Répondre
                                  </button>
                                </div>

                                {/* Replies List */}
                                {c.replies && c.replies.length > 0 && (
                                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                                    {c.replies.map(r => {
                                      const hasLikedReply = r.likes?.includes(user.id);
                                      return (
                                        <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                          <div style={{ display: 'flex', gap: 10 }}>
                                            <div style={{
                                              width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-card2)',
                                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
                                              fontWeight: 'bold', fontSize: 10, flexShrink: 0
                                            }}>
                                              {r.authorName.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ background: 'var(--bg-card2)', padding: '8px 12px', borderRadius: 14, borderTopLeftRadius: 4 }}>
                                                <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 1 }}>
                                                  {r.authorName}
                                                  {r.replyTo && <span style={{ color: 'var(--accent-purple)', fontSize: 11, marginLeft: 6, fontWeight: 'normal' }}>en réponse à {r.replyTo}</span>}
                                                </div>
                                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.content}</div>
                                              </div>
                                              <div style={{ display: 'flex', gap: 8 }}>
                                                <button 
                                                  onClick={() => handleReplyLike(post.id, c.id, r.id)}
                                                  className="btn btn-ghost" 
                                                  style={{ fontSize: 11, padding: '2px 6px', marginTop: 2, color: hasLikedReply ? '#ef4444' : 'var(--text-faint)' }}
                                                >
                                                  <Heart size={10} fill={hasLikedReply ? '#ef4444' : 'none'} style={{ marginRight: 3 }} /> {r.likes?.length || 0}
                                                </button>
                                                <button 
                                                  onClick={() => setActiveReplyId(activeReplyId === r.id ? null : r.id)}
                                                  className="btn btn-ghost" 
                                                  style={{ fontSize: 11, padding: '2px 6px', marginTop: 2, color: 'var(--text-faint)' }}
                                                >
                                                  <ReplyIcon size={10} style={{ marginRight: 3 }} /> Répondre
                                                </button>
                                              </div>

                                              {/* Nested Reply Input */}
                                              {activeReplyId === r.id && (
                                                <form 
                                                  onSubmit={(e) => { e.preventDefault(); handleNestedReplySubmit(post.id, c.id, r.id); }}
                                                  style={{ display: 'flex', gap: 8, marginTop: 12 }}
                                                >
                                                  <input 
                                                    type="text" 
                                                    placeholder={`Répondre à ${r.authorName}...`} 
                                                    className="search-input"
                                                    value={replyInputs[r.id] || ''}
                                                    onChange={e => setReplyInputs({...replyInputs, [r.id]: e.target.value})}
                                                    style={{ flex: 1, padding: '8px 12px', fontSize: 12, borderRadius: 20, background: 'var(--surface-lowest)' }}
                                                  />
                                                  <button 
                                                    type="submit"
                                                    disabled={!replyInputs[r.id]?.trim()}
                                                    className="btn btn-ghost" 
                                                    style={{ padding: '6px', color: 'var(--accent-purple)' }}
                                                  >
                                                    <Send size={14} />
                                                  </button>
                                                </form>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Comment Reply Input */}
                                {activeReplyId === c.id && (
                                  <form 
                                    onSubmit={(e) => { e.preventDefault(); handleReplySubmit(post.id, c.id); }}
                                    style={{ display: 'flex', gap: 8, marginTop: 12, paddingLeft: 12 }}
                                  >
                                    <input 
                                      type="text" 
                                      placeholder={`Répondre à ${c.authorName}...`} 
                                      className="search-input"
                                      value={replyInputs[c.id] || ''}
                                      onChange={e => setReplyInputs({...replyInputs, [c.id]: e.target.value})}
                                      style={{ flex: 1, padding: '8px 12px', fontSize: 13, borderRadius: 20, background: 'var(--surface-lowest)' }}
                                    />
                                    <button 
                                      type="submit"
                                      disabled={!replyInputs[c.id]?.trim()}
                                      className="btn btn-ghost" 
                                      style={{ padding: '8px', color: 'var(--accent-purple)' }}
                                    >
                                      <Send size={16} />
                                    </button>
                                  </form>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-grad)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                      fontWeight: 'bold', fontSize: 12, flexShrink: 0
                    }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(post.id); }}
                      style={{ flex: 1, display: 'flex', gap: 8 }}
                    >
                      <input 
                        type="text" 
                        placeholder="Write a comment..." 
                        className="search-input"
                        value={commentInputs[post.id] || ''}
                        onChange={e => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                        style={{ flex: 1, padding: '10px 16px', borderRadius: 20, background: 'var(--surface-lowest)', border: '1px solid var(--border)' }}
                      />
                      <button type="submit" disabled={!commentInputs[post.id]?.trim()} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--accent-purple)' }}>
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
