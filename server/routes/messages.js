const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const getStore = require('../db/jsonStore');
const { authMiddleware } = require('./auth');

// ─── Multer config for Messaging Media ──────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `chat_${Date.now()}_${crypto.randomUUID().slice(0, 8)}${ext}`);
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
router.post('/:userId', authMiddleware, upload.single('media'), (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.id;
  const { content } = req.body;

  if (!content && !req.file) return res.status(400).json({ error: 'Message content or media required' });

  const allMessages = messagesStore.load();
  const newMessage = {
    id: crypto.randomUUID(),
    senderId: currentUserId,
    receiverId: targetUserId,
    content: content || '',
    timestamp: new Date().toISOString()
  };

  if (req.file) {
    newMessage.mediaUrl = `/uploads/${req.file.filename}`;
    newMessage.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';
    newMessage.mediaName = req.file.originalname;
  }

  allMessages.push(newMessage);
  messagesStore.save(allMessages);

  res.json(newMessage);
});


module.exports = router;
