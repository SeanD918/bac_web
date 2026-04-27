const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const getStore = require('../db/jsonStore');
const { authMiddleware } = require('./auth');

const postsStore = getStore('community_posts.json');

const { createNotification } = require('./notifications');

router.get('/posts', authMiddleware, (req, res) => {
  const posts = postsStore.load();
  res.json(posts);
});

router.post('/posts', authMiddleware, (req, res) => {
  const { content, tag } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  const posts = postsStore.load();
  const newPost = {
    id: crypto.randomUUID(),
    authorId: req.user.id,
    authorName: req.user.username,
    content,
    tag: tag || 'General',
    likes: [],
    comments: [],
    timestamp: new Date().toISOString()
  };

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
