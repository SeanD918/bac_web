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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [commentInputs, setCommentInputs] = useState({});
  const [commentFiles, setCommentFiles] = useState({});
  const [commentPreviews, setCommentPreviews] = useState({});
  const commentFileInputRefs = useRef({});

  const [replyInputs, setReplyInputs] = useState({});
  const [replyFiles, setReplyFiles] = useState({});
  const [replyPreviews, setReplyPreviews] = useState({});
  const replyFileInputRefs = useRef({});

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
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const validFiles = files.filter(f => allowed.includes(f.type)).slice(0, 5);

    if (validFiles.length < files.length) {
      alert('Some files were ignored. Only images and PDFs are allowed (max 5 files).');
    }

    setSelectedFiles(validFiles);
    
    const newPreviews = validFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return { type: 'image', url: URL.createObjectURL(file) };
      }
      return { type: 'pdf', name: file.name };
    });
    setPreviews(newPreviews);
  };

  const handlePostSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newPost.trim() && selectedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('content', newPost);
      selectedFiles.forEach(file => {
        formData.append('media', file);
      });

      const res = await axios.post(`${API}/community/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setPosts([res.data, ...posts]);
      setNewPost('');
      setSelectedFiles([]);
      setPreviews([]);
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


  const handleCommentFileChange = (e, postId) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const validFiles = files.filter(f => allowed.includes(f.type)).slice(0, 5);
    setCommentFiles({ ...commentFiles, [postId]: validFiles });
    const newPrevs = validFiles.map(file => {
      if (file.type.startsWith('image/')) return { type: 'image', url: URL.createObjectURL(file) };
      return { type: 'pdf', name: file.name };
    });
    setCommentPreviews({ ...commentPreviews, [postId]: newPrevs });
  };

  const handleReplyFileChange = (e, id) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const validFiles = files.filter(f => allowed.includes(f.type)).slice(0, 5);
    setReplyFiles({ ...replyFiles, [id]: validFiles });
    const newPrevs = validFiles.map(file => {
      if (file.type.startsWith('image/')) return { type: 'image', url: URL.createObjectURL(file) };
      return { type: 'pdf', name: file.name };
    });
    setReplyPreviews({ ...replyPreviews, [id]: newPrevs });
  };

  const handleCommentSubmit = async (postId) => {
    const content = commentInputs[postId];
    const files = commentFiles[postId] || [];
    if (!content?.trim() && files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('content', content || '');
      files.forEach(f => formData.append('media', f));
      const res = await axios.post(`${API}/community/posts/${postId}/comment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPosts(posts.map(p => p.id === postId ? res.data : p));
      setCommentInputs({ ...commentInputs, [postId]: '' });
      setCommentFiles({ ...commentFiles, [postId]: [] });
      setCommentPreviews({ ...commentPreviews, [postId]: [] });
    } catch (e) { console.error(e); }
    finally { setIsUploading(false); }
  };

  const handleReplySubmit = async (postId, commentId) => {
    const content = replyInputs[commentId];
    const files = replyFiles[commentId] || [];
    if (!content?.trim() && files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('content', content || '');
      files.forEach(f => formData.append('media', f));
      const res = await axios.post(`${API}/community/posts/${postId}/comments/${commentId}/reply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPosts(posts.map(p => p.id === postId ? res.data : p));
      setReplyInputs({ ...replyInputs, [commentId]: '' });
      setReplyFiles({ ...replyFiles, [commentId]: [] });
      setReplyPreviews({ ...replyPreviews, [commentId]: [] });
      setActiveReplyId(null);
    } catch (e) { console.error(e); }
    finally { setIsUploading(false); }
  };

  const handleNestedReplySubmit = async (postId, commentId, replyId) => {
    const content = replyInputs[replyId];
    const files = replyFiles[replyId] || [];
    if (!content?.trim() && files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('content', content || '');
      files.forEach(f => formData.append('media', f));
      const res = await axios.post(`${API}/community/posts/${postId}/comments/${commentId}/replies/${replyId}/reply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPosts(posts.map(p => p.id === postId ? res.data : p));
      setReplyInputs({ ...replyInputs, [replyId]: '' });
      setReplyFiles({ ...replyFiles, [replyId]: [] });
      setReplyPreviews({ ...replyPreviews, [replyId]: [] });
      setActiveReplyId(null);
    } catch (e) { console.error(e); }
    finally { setIsUploading(false); }
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

            {previews.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                {previews.map((prev, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 'fit-content' }}>
                    {prev.type === 'pdf' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <FileText size={24} color="#ef4444" />
                        <span style={{ fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prev.name}</span>
                      </div>
                    ) : (
                      <img src={prev.url} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                    )}
                    <button 
                      type="button"
                      onClick={() => {
                        const newFiles = [...selectedFiles];
                        newFiles.splice(idx, 1);
                        setSelectedFiles(newFiles);
                        const newPrevs = [...previews];
                        newPrevs.splice(idx, 1);
                        setPreviews(newPrevs);
                      }}
                      style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*,application/pdf" 
                  style={{ display: 'none' }} 
                  multiple
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-ghost"
                  style={{ color: 'var(--text-muted)', padding: '8px' }}
                  title="Add Images or PDFs (Max 5)"
                >
                  <ImageIcon size={20} style={{ marginRight: 6 }} />
                  <span style={{ fontSize: 13 }}>Media</span>
                </button>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isUploading || (!newPost.trim() && selectedFiles.length === 0)}
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

                <p style={{ marginBottom: (post.media && post.media.length > 0) ? 16 : 24, fontSize: 15, lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>

                {post.media && post.media.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: post.media.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: 12, 
                    marginBottom: 24 
                  }}>
                    {post.media.map((m, idx) => (
                      <div key={idx}>
                        {m.type === 'image' ? (
                          <img 
                            src={`${API.replace('/api', '')}${m.url}`} 
                            alt={`Attachment ${idx + 1}`} 
                            style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer', objectFit: 'cover', height: post.media.length > 1 ? '200px' : 'auto' }}
                            onClick={() => window.open(`${API.replace('/api', '')}${m.url}`, '_blank')}
                          />
                        ) : (
                          <a 
                            href={`${API.replace('/api', '')}${m.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="card"
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--surface-lowest)', textDecoration: 'none', border: '1px solid var(--border)', height: '100%' }}
                          >
                            <FileText size={32} color="#ef4444" />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', color: 'var(--text)', fontSize: 14 }}>{m.name || 'PDF Document'}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>View Document</div>
                            </div>
                          </a>
                        )}
                      </div>
                    ))}
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
                                    <div style={{ fontSize: 14, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{c.content}</div>
                                    
                                    {c.media && c.media.length > 0 && (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                                        {c.media.map((m, idx) => (
                                          <div key={idx} style={{ maxWidth: '100%' }}>
                                            {m.type === 'image' ? (
                                              <img 
                                                src={`${API.replace('/api', '')}${m.url}`} 
                                                alt="comment attachment" 
                                                style={{ maxWidth: '120px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }}
                                                onClick={() => window.open(`${API.replace('/api', '')}${m.url}`, '_blank')}
                                              />
                                            ) : (
                                              <a href={`${API.replace('/api', '')}${m.url}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--bg-card2)', borderRadius: 8, fontSize: 11, textDecoration: 'none', color: 'var(--text)', border: '1px solid var(--border)' }}>
                                                <FileText size={14} color="#ef4444" />
                                                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                                              </a>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
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
                                                <div style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{r.content}</div>
                                                
                                                {r.media && r.media.length > 0 && (
                                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                                    {r.media.map((m, idx) => (
                                                      <div key={idx}>
                                                        {m.type === 'image' ? (
                                                          <img 
                                                            src={`${API.replace('/api', '')}${m.url}`} 
                                                            alt="reply attachment" 
                                                            style={{ maxWidth: '100px', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }}
                                                            onClick={() => window.open(`${API.replace('/api', '')}${m.url}`, '_blank')}
                                                          />
                                                        ) : (
                                                          <a href={`${API.replace('/api', '')}${m.url}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'var(--surface-lowest)', borderRadius: 6, fontSize: 10, textDecoration: 'none', color: 'var(--text)', border: '1px solid var(--border)' }}>
                                                            <FileText size={12} color="#ef4444" />
                                                            <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                                                          </a>
                                                        )}
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
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
                                                <div style={{ marginTop: 12 }}>
                                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, paddingLeft: 12 }}>
                                                    {(replyPreviews[r.id] || []).map((p, i) => (
                                                      <div key={i} style={{ position: 'relative' }}>
                                                        {p.type === 'image' ? <img src={p.url} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} /> : <FileText size={20} color="#ef4444" />}
                                                        <button onClick={() => {
                                                          const newF = [...(replyFiles[r.id] || [])]; newF.splice(i, 1); setReplyFiles({...replyFiles, [r.id]: newF});
                                                          const newP = [...(replyPreviews[r.id] || [])]; newP.splice(i, 1); setReplyPreviews({...replyPreviews, [r.id]: newP});
                                                        }} style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 14, height: 14, fontSize: 8 }}>X</button>

                                                      </div>
                                                    ))}
                                                  </div>
                                                  <form 
                                                    onSubmit={(e) => { e.preventDefault(); handleNestedReplySubmit(post.id, c.id, r.id); }}
                                                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                                                  >
                                                    <input type="file" ref={el => replyFileInputRefs.current[r.id] = el} onChange={e => handleReplyFileChange(e, r.id)} style={{ display: 'none' }} multiple accept="image/*,application/pdf" />
                                                    <button type="button" onClick={() => replyFileInputRefs.current[r.id]?.click()} className="btn btn-ghost" style={{ padding: 4 }}><ImageIcon size={14} /></button>
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
                                                      disabled={isUploading || (!replyInputs[r.id]?.trim() && (!replyFiles[r.id] || replyFiles[r.id].length === 0))}
                                                      className="btn btn-ghost" 
                                                      style={{ padding: '6px', color: 'var(--accent-purple)' }}
                                                    >
                                                      <Send size={14} />
                                                    </button>
                                                  </form>
                                                </div>

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
                                <div style={{ marginTop: 12, paddingLeft: 12 }}>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                    {(replyPreviews[c.id] || []).map((p, i) => (
                                      <div key={i} style={{ position: 'relative' }}>
                                        {p.type === 'image' ? <img src={p.url} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} /> : <FileText size={20} color="#ef4444" />}
                                        <button onClick={() => {
                                          const newF = [...(replyFiles[c.id] || [])]; newF.splice(i, 1); setReplyFiles({...replyFiles, [c.id]: newF});
                                          const newP = [...(replyPreviews[c.id] || [])]; newP.splice(i, 1); setReplyPreviews({...replyPreviews, [c.id]: newP});
                                        }} style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 14, height: 14, fontSize: 8 }}>X</button>

                                      </div>
                                    ))}
                                  </div>
                                  <form 
                                    onSubmit={(e) => { e.preventDefault(); handleReplySubmit(post.id, c.id); }}
                                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                                  >
                                    <input type="file" ref={el => replyFileInputRefs.current[c.id] = el} onChange={e => handleReplyFileChange(e, c.id)} style={{ display: 'none' }} multiple accept="image/*,application/pdf" />
                                    <button type="button" onClick={() => replyFileInputRefs.current[c.id]?.click()} className="btn btn-ghost" style={{ padding: 6 }}><ImageIcon size={16} /></button>
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
                                      disabled={isUploading || (!replyInputs[c.id]?.trim() && (!replyFiles[c.id] || replyFiles[c.id].length === 0))}
                                      className="btn btn-ghost" 
                                      style={{ padding: '8px', color: 'var(--accent-purple)' }}
                                    >
                                      <Send size={16} />
                                    </button>
                                  </form>
                                </div>

                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                             <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8, paddingLeft: 40 }}>
                      {(commentPreviews[post.id] || []).map((p, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          {p.type === 'image' ? <img src={p.url} style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover' }} /> : <FileText size={24} color="#ef4444" />}
                          <button onClick={() => {
                            const newF = [...(commentFiles[post.id] || [])]; newF.splice(i, 1); setCommentFiles({...commentFiles, [post.id]: newF});
                            const newP = [...(commentPreviews[post.id] || [])]; newP.splice(i, 1); setCommentPreviews({...commentPreviews, [post.id]: newP});
                          }} style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10 }}>X</button>

                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-grad)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        fontWeight: 'bold', fontSize: 12, flexShrink: 0
                      }}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <form 
                        onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(post.id); }}
                        style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'flex-end' }}
                      >
                        <input type="file" ref={el => commentFileInputRefs.current[post.id] = el} onChange={e => handleCommentFileChange(e, post.id)} style={{ display: 'none' }} multiple accept="image/*,application/pdf" />
                        <button type="button" onClick={() => commentFileInputRefs.current[post.id]?.click()} className="btn btn-ghost" style={{ padding: 8 }}><ImageIcon size={18} /></button>
                        <textarea 
                          placeholder="Write a comment..." 
                          className="search-input"
                          value={commentInputs[post.id] || ''}
                          onChange={e => {
                            setCommentInputs({...commentInputs, [post.id]: e.target.value});
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleCommentSubmit(post.id);
                            }
                          }}
                          style={{ flex: 1, padding: '10px 16px', borderRadius: 20, background: 'var(--surface-lowest)', border: '1px solid var(--border)', resize: 'none', height: 40, minHeight: 40, maxHeight: 120, overflowY: 'auto' }}
                        />
                        <button type="submit" disabled={isUploading || (!commentInputs[post.id]?.trim() && (!commentFiles[post.id] || commentFiles[post.id].length === 0))} className="btn btn-ghost" style={{ padding: '10px', color: 'var(--accent-purple)' }}>
                          <Send size={18} />
                        </button>
                      </form>
                    </div>
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
