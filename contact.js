const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Submit contact message (Public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Name, phone number, and message are required.' });
    }

    const result = await db.query(
      'INSERT INTO contact_messages (name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email || '', subject || 'Website Inquiry', message]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will contact you shortly.',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all contact messages (Admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const messages = await db.query('SELECT * FROM contact_messages');
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark contact message as read (Admin)
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.query('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Message marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
