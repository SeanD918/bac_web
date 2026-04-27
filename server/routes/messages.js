const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const getStore = require('../db/jsonStore');
const { authMiddleware } = require('./auth');

const messagesStore = getStore('messages.json');

// Get conversation with a specific user
router.get('/:userId', authMiddleware, (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.id;

  const allMessages = messagesStore.load();
  
  const conversation = allMessages.filter(m => 
    (m.senderId === currentUserId && m.receiverId === targetUserId) ||
    (m.senderId === targetUserId && m.receiverId === currentUserId)
  );

  res.json(conversation);
});

// Send a message
router.post('/:userId', authMiddleware, (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.id;
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: 'Message content required' });

  const allMessages = messagesStore.load();
  const newMessage = {
    id: crypto.randomUUID(),
    senderId: currentUserId,
    receiverId: targetUserId,
    content,
    timestamp: new Date().toISOString()
  };

  allMessages.push(newMessage);
  messagesStore.save(allMessages);

  res.json(newMessage);
});

module.exports = router;
