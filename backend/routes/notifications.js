const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// @route   POST api/notifications/broadcast
// @desc    Broadcast a message to all connected clients
// @access  Protected
router.post('/broadcast', protect, (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ msg: 'Message is required' });
  }

  const io = req.app.get('io');
  io.emit('notification', {
    title: 'Broadcast Message',
    message: message,
    timestamp: new Date(),
  });

  res.status(200).json({ success: true, message: 'Notification broadcasted' });
});

module.exports = router;
