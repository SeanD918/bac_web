const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const getStore = require('../db/jsonStore');
const { authMiddleware } = require('./auth');

// ─── Multer config (Memory for Vercel compatibility) ────────────────────────
const storage = multer.memoryStorage();


const fileFilter = (_req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF and image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});


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
router.post('/:userId', authMiddleware, upload.array('media', 5), (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.id;
  const { content } = req.body;

  if (!content && (!req.files || req.files.length === 0)) {
    return res.status(400).json({ error: 'Message content or media required' });
  }

  const allMessages = messagesStore.load();
  const newMessage = {
    id: crypto.randomUUID(),
    senderId: currentUserId,
    receiverId: targetUserId,
    content: content || '',
    media: [],
    timestamp: new Date().toISOString()
  };

  if (req.files && req.files.length > 0) {
    newMessage.media = req.files.map(file => ({
      url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'pdf',
      name: file.originalname
    }));
  }


  allMessages.push(newMessage);
  messagesStore.save(allMessages);

  res.json(newMessage);
});



module.exports = router;
