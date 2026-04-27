const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const getStore = require('../db/jsonStore');
const { authMiddleware } = require('./auth');

const notificationsStore = getStore('notifications.json');

// Get user's notifications
router.get('/', authMiddleware, (req, res) => {
  const allNotifications = notificationsStore.load();
  const userNotifications = allNotifications
    .filter(n => n.targetUserId === req.user.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(userNotifications);
});

// Mark all as read
router.post('/read', authMiddleware, (req, res) => {
  const allNotifications = notificationsStore.load();
  let updated = false;

  allNotifications.forEach(n => {
    if (n.targetUserId === req.user.id && !n.isRead) {
      n.isRead = true;
      updated = true;
    }
  });

  if (updated) {
    notificationsStore.save(allNotifications);
  }
  
  res.json({ success: true });
});

// Mark specific as read
router.post('/:id/read', authMiddleware, (req, res) => {
  const allNotifications = notificationsStore.load();
  const notif = allNotifications.find(n => n.id === req.params.id && n.targetUserId === req.user.id);
  if (notif) {
    notif.isRead = true;
    notificationsStore.save(allNotifications);
  }
  res.json({ success: true });
});


// Helper to create notifications (used internally by other routes)
const createNotification = (targetUserId, actorName, type, postId) => {
  if (!targetUserId) return;
  const allNotifications = notificationsStore.load();
  allNotifications.push({
    id: crypto.randomUUID(),
    targetUserId,
    actorName,
    type, // 'LIKE', 'COMMENT', 'FOLLOW'
    postId,
    isRead: false,
    timestamp: new Date().toISOString()
  });
  notificationsStore.save(allNotifications);
};

module.exports = { router, createNotification };
