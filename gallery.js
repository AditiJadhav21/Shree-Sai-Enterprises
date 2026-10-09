const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const fs = require('fs');
const path = require('path');

// Auto-sync images dropped directly into /public/images/gallery
async function syncGalleryFromFolder() {
  try {
    const galleryDir = path.join(__dirname, '..', 'public', 'images', 'gallery');
    if (!fs.existsSync(galleryDir)) return;

    const files = fs.readdirSync(galleryDir).filter(f => /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(f));
    const existing = await db.query('SELECT * FROM gallery');
    const existingUrls = new Set((existing || []).map(e => e.image_url));

    for (const file of files) {
      const url = `/images/gallery/${file}`;
      if (!existingUrls.has(url)) {
        let cat = 'Installations';
        const lower = file.toLowerCase();
        if (lower.includes('material') || lower.includes('stock') || lower.includes('warehouse') || lower.includes('unboxing')) {
          cat = 'Materials';
        } else if (lower.includes('doc') || lower.includes('cert') || lower.includes('sanction') || lower.includes('meter') || lower.includes('approval') || lower.includes('subsidy')) {
          cat = 'Documentation';
        }

        const title = file
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, l => l.toUpperCase());

        await db.query(
          'INSERT INTO gallery (title, category, description, image_url, location, display_order) VALUES (?, ?, ?, ?, ?, ?)',
          [title, cat, 'Original site photo from Shree Sai Enterprises', url, 'Dindori, Nashik', 0]
        );
        existingUrls.add(url);
      }
    }
  } catch (err) {
    console.error('Folder auto-sync error:', err);
  }
}

// Get gallery images (with category filter and folder sync)
router.get('/', async (req, res) => {
  try {
    await syncGalleryFromFolder();
    const { category } = req.query;
    let items = await db.query('SELECT * FROM gallery');

    if (category && category.toLowerCase() !== 'all') {
      const cat = category.toLowerCase();
      items = items.filter(g => g.category.toLowerCase() === cat);
    }

    res.json({
      success: true,
      count: items.length,
      gallery: items
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new gallery photo (Admin)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, category, description, location, image_url } = req.body;
    let finalImageUrl = image_url;

    if (req.file) {
      finalImageUrl = `/images/gallery/${req.file.filename}`;
    }

    if (!title || !category || !finalImageUrl) {
      return res.status(400).json({ success: false, message: 'Title, category, and image are required.' });
    }

    const result = await db.query(
      'INSERT INTO gallery (title, category, description, image_url, location, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [title, category, description || '', finalImageUrl, location || 'Dindori, Nashik', 0]
    );

    res.status(201).json({
      success: true,
      message: 'Gallery item added successfully.',
      item: { id: result.insertId, title, category, image_url: finalImageUrl }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete gallery photo (Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.query('DELETE FROM gallery WHERE id = ?', [id]);
    res.json({ success: true, message: 'Gallery item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
