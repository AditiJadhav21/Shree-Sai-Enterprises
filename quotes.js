const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Helper to convert number to Indian words
function numberToIndianWords(num) {
  num = Math.round(num);
  if (num === 0) return 'Rupees Zero Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n < 20) return single[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
  }

  function convertThreeDigits(n) {
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += single[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      str += convertTwoDigits(n);
    }
    return str.trim();
  }

  let result = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundredAndRest = num;

  if (crore > 0) {
    result += convertTwoDigits(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (hundredAndRest > 0) {
    result += convertThreeDigits(hundredAndRest);
  }

  return 'Rupees ' + result.trim() + ' Only';
}

// Generate unique quotation number
function generateQuoteNumber(totalCount) {
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = (year + 1).toString().slice(-2);
  const finYear = `${year}-${nextYear}`;
  const seq = (totalCount + 1).toString().padStart(4, '0');
  return `SSE/${finYear}/${seq}`;
}

// Create new quotation (Public / Cart checkout)
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      city,
      district,
      pincode,
      customer_notes,
      discount_amount,
      items
    } = req.body;

    if (!customer_name || !customer_phone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone number, and at least one quotation item are required.'
      });
    }

    const allQuotes = await db.query('SELECT * FROM quotes');
    const quoteNumber = generateQuoteNumber(allQuotes.length);

    let calculatedItems = [];
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    for (const item of items) {
      const qty = parseInt(item.quantity, 10) || 1;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const itemDiscount = parseFloat(item.discount) || 0;
      const taxable = (unitPrice * qty) - itemDiscount;
      const gstRate = parseFloat(item.gst_rate) || 12.0;

      const halfGstRate = gstRate / 2;
      const cgst = Math.round((taxable * (halfGstRate / 100)) * 100) / 100;
      const sgst = Math.round((taxable * (halfGstRate / 100)) * 100) / 100;
      const totalAmount = taxable + cgst + sgst;

      subtotal += taxable;
      totalCgst += cgst;
      totalSgst += sgst;

      calculatedItems.push({
        product_id: item.product_id || null,
        product_name: item.product_name,
        category_name: item.category_name || 'Solar Energy Systems',
        hsn_code: item.hsn_code || '85414011',
        quantity: qty,
        unit_price: unitPrice,
        discount: itemDiscount,
        taxable_amount: taxable,
        gst_rate: gstRate,
        cgst_amount: cgst,
        sgst_amount: sgst,
        total_amount: totalAmount
      });
    }

    const discountVal = parseFloat(discount_amount) || 0;
    const finalTaxable = Math.max(0, subtotal - discountVal);
    const totalGst = totalCgst + totalSgst;
    const grandTotal = Math.round(finalTaxable + totalGst);
    const grandTotalWords = numberToIndianWords(grandTotal);

    const quoteRes = await db.query(
      `INSERT INTO quotes 
      (quote_number, customer_name, customer_phone, customer_email, customer_address, city, district, pincode, customer_notes, subtotal, discount_amount, taxable_amount, cgst_amount, sgst_amount, total_gst, grand_total, grand_total_words, validity_days, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quoteNumber,
        customer_name,
        customer_phone,
        customer_email || '',
        customer_address || 'Dindori, Nashik',
        city || 'Dindori',
        district || 'Nashik',
        pincode || '422202',
        customer_notes || '',
        subtotal,
        discountVal,
        finalTaxable,
        totalCgst,
        totalSgst,
        totalGst,
        grandTotal,
        grandTotalWords,
        15,
        'Pending'
      ]
    );

    const quoteId = quoteRes.insertId || quoteRes.id || (allQuotes.length + 1);

    // Insert quote items
    for (const it of calculatedItems) {
      await db.query(
        `INSERT INTO quote_items 
        (quote_id, product_id, product_name, category_name, hsn_code, quantity, unit_price, discount, taxable_amount, gst_rate, cgst_amount, sgst_amount, total_amount) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quoteId,
          it.product_id,
          it.product_name,
          it.category_name,
          it.hsn_code,
          it.quantity,
          it.unit_price,
          it.discount,
          it.taxable_amount,
          it.gst_rate,
          it.cgst_amount,
          it.sgst_amount,
          it.total_amount
        ]
      );
    }

    const createdQuote = {
      id: quoteId,
      quote_number: quoteNumber,
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      city: city || 'Dindori',
      district: district || 'Nashik',
      pincode: pincode || '422202',
      customer_notes,
      subtotal,
      discount_amount: discountVal,
      taxable_amount: finalTaxable,
      cgst_amount: totalCgst,
      sgst_amount: totalSgst,
      total_gst: totalGst,
      grand_total: grandTotal,
      grand_total_words: grandTotalWords,
      validity_days: 15,
      status: 'Pending',
      created_at: new Date().toISOString(),
      items: calculatedItems
    };

    return res.status(201).json({
      success: true,
      message: 'Quotation generated and saved successfully.',
      quote: createdQuote
    });
  } catch (err) {
    console.error('Error generating quote:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get all quotes (Admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search } = req.query;
    let quotes = await db.query('SELECT * FROM quotes');

    if (status && status !== 'all') {
      quotes = quotes.filter(q => q.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      quotes = quotes.filter(item => 
        item.quote_number.toLowerCase().includes(q) ||
        item.customer_name.toLowerCase().includes(q) ||
        item.customer_phone.includes(q)
      );
    }

    res.json({
      success: true,
      count: quotes.length,
      quotes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single quote by ID or Quote Number
router.get('/:idOrNumber', async (req, res) => {
  try {
    const { idOrNumber } = req.params;
    let quote = null;

    if (!isNaN(idOrNumber)) {
      const rows = await db.query('SELECT * FROM quotes WHERE id = ?', [idOrNumber]);
      if (rows && rows.length > 0) quote = rows[0];
    }

    if (!quote) {
      const rows = await db.query('SELECT * FROM quotes WHERE quote_number = ?', [idOrNumber]);
      if (rows && rows.length > 0) quote = rows[0];
    }

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    // Load items if not already attached
    if (!quote.items || quote.items.length === 0) {
      const items = await db.query('SELECT * FROM quote_items WHERE quote_id = ?', [quote.id]);
      quote.items = items || [];
    }

    res.json({
      success: true,
      quote
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Quote Status & Admin Notes (Admin)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, admin_notes } = req.body;

    await db.query(
      'UPDATE quotes SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ success: true, message: 'Quotation status updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
