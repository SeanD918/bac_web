const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const getStore = require('../db/jsonStore');

const usersStore = getStore('users.json');

router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const users = usersStore.load();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    username,
    password, // Storing in plain text since it's a simple mock backend
    followers: [],
    following: [],
    token: crypto.randomBytes(16).toString('hex')
  };

  users.push(newUser);
  usersStore.save(users);

  res.json({ token: newUser.token, user: { id: newUser.id, username: newUser.username } });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = usersStore.load();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ token: user.token, user: { id: user.id, username: user.username, following: user.following, followers: user.followers } });
});

// Middleware to mock authentication
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const users = usersStore.load();
  const user = users.find(u => u.token === token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  req.user = user;
  next();
};

router.get('/me', authMiddleware, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, following: req.user.following, followers: req.user.followers });
});

router.get('/users', authMiddleware, (req, res) => {
  const users = usersStore.load();
  const safeUsers = users.map(u => ({ id: u.id, username: u.username, followers: u.followers }));
  res.json(safeUsers);
});

router.post('/follow/:id', authMiddleware, (req, res) => {
  const targetId = req.params.id;
  if (req.user.id === targetId) return res.status(400).json({ error: 'Cannot follow yourself' });

  let users = usersStore.load();
  let currentUser = users.find(u => u.id === req.user.id);
  let targetUser = users.find(u => u.id === targetId);

  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  if (!currentUser.following.includes(targetId)) {
    currentUser.following.push(targetId);
    targetUser.followers.push(currentUser.id);
    usersStore.save(users);

    try {
      const { createNotification } = require('./notifications');
      createNotification(targetId, currentUser.username, 'FOLLOW', null);
    } catch (e) {
      console.error('Failed to create follow notification:', e);
    }
  }


  res.json({ success: true, following: currentUser.following });
});

router.post('/unfollow/:id', authMiddleware, (req, res) => {
  const targetId = req.params.id;

  let users = usersStore.load();
  let currentUser = users.find(u => u.id === req.user.id);
  let targetUser = users.find(u => u.id === targetId);

  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  currentUser.following = currentUser.following.filter(id => id !== targetId);
  targetUser.followers = targetUser.followers.filter(id => id !== currentUser.id);
  
  usersStore.save(users);

  res.json({ success: true, following: currentUser.following });
});

module.exports = { router, authMiddleware };
