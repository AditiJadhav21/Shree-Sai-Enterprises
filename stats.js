const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get Dashboard KPIs & Overview (Admin)
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const products = await db.query('SELECT * FROM products');
    const quotes = await db.query('SELECT * FROM quotes');
    const messages = await db.query('SELECT * FROM contact_messages');

    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock_qty <= 15 || p.stock_status === 'limited_stock');
    const outOfStockProducts = products.filter(p => p.stock_qty <= 0 || p.stock_status === 'out_of_stock');
    
    const totalQuotes = quotes.length;
    const pendingQuotes = quotes.filter(q => q.status === 'Pending').length;
    const repliedQuotes = quotes.filter(q => q.status === 'Replied').length;
    const closedQuotes = quotes.filter(q => q.status === 'Closed').length;

    const totalRevenueQuoted = quotes.reduce((acc, q) => acc + (parseFloat(q.grand_total) || 0), 0);
    const unreadMessages = messages.filter(m => !m.is_read).length;

    // Recent 5 quotes
    const recentQuotes = [...quotes].slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalQuotes,
        pendingQuotes,
        repliedQuotes,
        closedQuotes,
        totalRevenueQuoted,
        totalMessages: messages.length,
        unreadMessages
      },
      lowStockItems: lowStockProducts.slice(0, 6),
      recentQuotes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
