const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const getStore = require('../db/jsonStore');
const { authMiddleware } = require('./auth');

// ─── Multer config for Community Media ───────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `community_${Date.now()}_${crypto.randomUUID().slice(0, 8)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF and image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max for community
});


const postsStore = getStore('community_posts.json');

const { createNotification } = require('./notifications');

router.get('/posts', authMiddleware, (req, res) => {
  const posts = postsStore.load();
  res.json(posts);
});

router.post('/posts', authMiddleware, upload.single('media'), (req, res) => {
  const { content, tag } = req.body;
  if (!content && !req.file) return res.status(400).json({ error: 'Content or media required' });

  const posts = postsStore.load();
  const newPost = {
    id: crypto.randomUUID(),
    authorId: req.user.id,
    authorName: req.user.username,
    content: content || '',
    tag: tag || 'General',
    likes: [],
    comments: [],
    timestamp: new Date().toISOString()
  };

  if (req.file) {
    newPost.mediaUrl = `/uploads/${req.file.filename}`;
    newPost.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';
    newPost.mediaName = req.file.originalname;
  }

  posts.unshift(newPost);
  postsStore.save(posts);
  res.json(newPost);
});


router.post('/posts/:id/like', authMiddleware, (req, res) => {
  const posts = postsStore.load();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const hasLiked = post.likes.includes(req.user.id);
  if (hasLiked) {
    post.likes = post.likes.filter(id => id !== req.user.id);
  } else {
    post.likes.push(req.user.id);
    if (post.authorId !== req.user.id) {
      createNotification(post.authorId, req.user.username, 'LIKE', post.id);
    }
  }

  postsStore.save(posts);
  res.json(post);
});

router.post('/posts/:id/comment', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment required' });

  const posts = postsStore.load();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comment = {
    id: crypto.randomUUID(),
    authorId: req.user.id,
    authorName: req.user.username,
    content,
    likes: [],
    replies: [],
    timestamp: new Date().toISOString()
  };

  post.comments.push(comment);
  postsStore.save(posts);

  if (post.authorId !== req.user.id) {
    createNotification(post.authorId, req.user.username, 'COMMENT', post.id);
  }

  res.json(post);
});

router.post('/posts/:postId/comments/:commentId/like', authMiddleware, (req, res) => {
  const posts = postsStore.load();
  const post = posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comment = post.comments.find(c => c.id === req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  if (!comment.likes) comment.likes = [];
  
  const hasLiked = comment.likes.includes(req.user.id);
  if (hasLiked) {
    comment.likes = comment.likes.filter(id => id !== req.user.id);
  } else {
    comment.likes.push(req.user.id);
    if (comment.authorId !== req.user.id) {
      createNotification(comment.authorId, req.user.username, 'LIKE_COMMENT', post.id);
    }
  }

  postsStore.save(posts);
  res.json(post);
});

router.post('/posts/:postId/comments/:commentId/reply', authMiddleware, (req, res) => {
  const { content, replyTo } = req.body;
  if (!content) return res.status(400).json({ error: 'Reply required' });

  const posts = postsStore.load();
  const post = posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comment = post.comments.find(c => c.id === req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  const reply = {
    id: crypto.randomUUID(),
    authorId: req.user.id,
    authorName: req.user.username,
    content,
    replyTo: replyTo || null, // Name of the user being replied to
    likes: [],
    timestamp: new Date().toISOString()
  };

  if (!comment.replies) comment.replies = [];
  comment.replies.push(reply);
  postsStore.save(posts);

  // Notify the comment author
  if (comment.authorId !== req.user.id) {
    createNotification(comment.authorId, req.user.username, 'REPLY', post.id);
  }

  res.json(post);
});

router.post('/posts/:postId/comments/:commentId/replies/:replyId/reply', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Reply required' });

  const posts = postsStore.load();
  const post = posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comment = post.comments.find(c => c.id === req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  const targetReply = comment.replies.find(r => r.id === req.params.replyId);
  if (!targetReply) return res.status(404).json({ error: 'Reply not found' });

  const reply = {
    id: crypto.randomUUID(),
    authorId: req.user.id,
    authorName: req.user.username,
    content,
    replyTo: targetReply.authorName,
    likes: [],
    timestamp: new Date().toISOString()
  };

  comment.replies.push(reply);
  postsStore.save(posts);

  // Notify the reply author
  if (targetReply.authorId !== req.user.id) {
    createNotification(targetReply.authorId, req.user.username, 'REPLY', post.id);
  }

  res.json(post);
});


router.post('/posts/:postId/comments/:commentId/replies/:replyId/like', authMiddleware, (req, res) => {
  const posts = postsStore.load();
  const post = posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comment = post.comments.find(c => c.id === req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  const reply = comment.replies.find(r => r.id === req.params.replyId);
  if (!reply) return res.status(404).json({ error: 'Reply not found' });

  if (!reply.likes) reply.likes = [];
  
  const hasLiked = reply.likes.includes(req.user.id);
  if (hasLiked) {
    reply.likes = reply.likes.filter(id => id !== req.user.id);
  } else {
    reply.likes.push(req.user.id);
    if (reply.authorId !== req.user.id) {
      createNotification(reply.authorId, req.user.username, 'LIKE_REPLY', post.id);
    }
  }

  postsStore.save(posts);
  res.json(post);
});




module.exports = router;
