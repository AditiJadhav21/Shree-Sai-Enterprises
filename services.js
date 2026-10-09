const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await db.query('SELECT * FROM services ORDER BY display_order ASC');
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get service by slug or ID
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let service = null;

    if (!isNaN(idOrSlug)) {
      const rows = await db.query('SELECT * FROM services WHERE id = ?', [idOrSlug]);
      if (rows && rows.length > 0) service = rows[0];
    }
    if (!service) {
      const rows = await db.query('SELECT * FROM services WHERE slug = ?', [idOrSlug]);
      if (rows && rows.length > 0) service = rows[0];
    }

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    if (typeof service.key_features === 'string') {
      try { service.key_features = JSON.parse(service.key_features); } catch (e) {}
    }

    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
