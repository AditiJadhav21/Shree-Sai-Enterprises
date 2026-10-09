const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Helper to make slug
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, featured, stock } = req.query;
    let products = await db.query('SELECT * FROM products');

    // Filter by Category
    if (category && category !== 'all') {
      const catVal = category.toString().toLowerCase();
      products = products.filter(p => {
        const catSlug = (p.category_slug || '').toLowerCase();
        const catName = (p.category_name || '').toLowerCase();
        return p.category_id == category || catSlug === catVal || catName.includes(catVal);
      });
    }

    // Filter by Search
    if (search) {
      const q = search.toString().toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.short_info && p.short_info.toLowerCase().includes(q)) ||
        (p.category_name && p.category_name.toLowerCase().includes(q))
      );
    }

    // Filter by Stock Status
    if (stock) {
      products = products.filter(p => p.stock_status === stock);
    }

    // Filter Featured
    if (featured === '1' || featured === 'true') {
      products = products.filter(p => p.is_featured == 1);
    }

    // Sort
    if (sort === 'price_asc') {
      products.sort((a, b) => parseFloat(a.approx_price) - parseFloat(b.approx_price));
    } else if (sort === 'price_desc') {
      products.sort((a, b) => parseFloat(b.approx_price) - parseFloat(a.approx_price));
    } else if (sort === 'name_asc') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name_desc') {
      products.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // default: featured first, then id
      products.sort((a, b) => (b.is_featured || 0) - (a.is_featured || 0) || a.id - b.id);
    }

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single product by ID or Slug
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    let product = null;

    if (!isNaN(slugOrId)) {
      const rows = await db.query('SELECT * FROM products WHERE id = ?', [slugOrId]);
      if (rows && rows.length > 0) product = rows[0];
    }

    if (!product) {
      const rows = await db.query('SELECT * FROM products WHERE slug = ?', [slugOrId]);
      if (rows && rows.length > 0) product = rows[0];
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Parse JSON specs if string
    if (typeof product.specifications === 'string') {
      try { product.specifications = JSON.parse(product.specifications); } catch (e) {}
    }
    if (typeof product.key_features === 'string') {
      try { product.key_features = JSON.parse(product.key_features); } catch (e) {}
    }

    // Fetch related products in same category
    let related = await db.query('SELECT * FROM products WHERE category_id = ? AND id != ? LIMIT 4', [product.category_id, product.id]);
    if (!related || related.length === 0) {
      const all = await db.query('SELECT * FROM products WHERE id != ? LIMIT 4', [product.id]);
      related = all.slice(0, 4);
    }

    res.json({
      success: true,
      product,
      related: related || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create product (Admin)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      category_id,
      short_info,
      full_description,
      approx_price,
      gst_rate,
      hsn_code,
      stock_qty,
      stock_status,
      warranty,
      specifications,
      key_features,
      is_featured,
      image_url
    } = req.body;

    if (!name || !category_id || !approx_price) {
      return res.status(400).json({ success: false, message: 'Name, Category, and Approximate Price are required.' });
    }

    const slug = generateSlug(name) + '-' + Date.now().toString().slice(-4);
    let primaryImage = image_url || '/images/products/mono-perc-550w.svg';
    if (req.file) {
      primaryImage = `/images/products/${req.file.filename}`;
    }

    let parsedSpecs = {};
    if (specifications) {
      parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    }

    let parsedFeatures = [];
    if (key_features) {
      parsedFeatures = typeof key_features === 'string' ? JSON.parse(key_features) : key_features;
    }

    const result = await db.query(
      `INSERT INTO products 
      (category_id, name, slug, short_info, full_description, approx_price, gst_rate, hsn_code, stock_qty, stock_status, primary_image, warranty, specifications, key_features, is_featured) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(category_id, 10),
        name,
        slug,
        short_info || name,
        full_description || short_info || name,
        parseFloat(approx_price),
        parseFloat(gst_rate || 12.00),
        hsn_code || '85414011',
        parseInt(stock_qty || 10, 10),
        stock_status || 'in_stock',
        primaryImage,
        warranty || 'Standard Manufacturer Warranty',
        JSON.stringify(parsedSpecs),
        JSON.stringify(parsedFeatures),
        is_featured ? 1 : 0
      ]
    );

    res.json({
      success: true,
      message: 'Product created successfully.',
      productId: result.insertId || result.id
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update product (Admin)
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      name,
      category_id,
      short_info,
      full_description,
      approx_price,
      gst_rate,
      stock_qty,
      stock_status,
      warranty,
      specifications,
      key_features,
      is_featured,
      image_url
    } = req.body;

    let primaryImage = image_url;
    if (req.file) {
      primaryImage = `/images/products/${req.file.filename}`;
    }

    let parsedSpecs = {};
    if (specifications) {
      parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    }

    let parsedFeatures = [];
    if (key_features) {
      parsedFeatures = typeof key_features === 'string' ? JSON.parse(key_features) : key_features;
    }

    await db.query(
      `UPDATE products SET 
      category_id = ?, name = ?, short_info = ?, full_description = ?, approx_price = ?, gst_rate = ?, stock_qty = ?, stock_status = ?, primary_image = ?, warranty = ?, specifications = ?, key_features = ?, is_featured = ?
      WHERE id = ?`,
      [
        parseInt(category_id, 10),
        name,
        short_info,
        full_description,
        parseFloat(approx_price),
        parseFloat(gst_rate || 12),
        parseInt(stock_qty, 10),
        stock_status,
        primaryImage,
        warranty,
        JSON.stringify(parsedSpecs),
        JSON.stringify(parsedFeatures),
        is_featured ? 1 : 0,
        id
      ]
    );

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quick Update Stock Status (Admin)
router.patch('/:id/stock', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { stock_qty, stock_status } = req.body;

    await db.query(
      'UPDATE products SET stock_qty = ?, stock_status = ? WHERE id = ?',
      [parseInt(stock_qty, 10), stock_status, id]
    );

    res.json({ success: true, message: 'Stock updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete product (Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
