const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDb } = require('./config/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const quoteRoutes = require('./routes/quotes');
const serviceRoutes = require('./routes/services');
const galleryRoutes = require('./routes/gallery');
const contactRoutes = require('./routes/contact');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Business Configuration Info API
app.get('/api/business-info', (req, res) => {
  res.json({
    business_name: process.env.BUSINESS_NAME || 'Shree Sai Enterprises',
    owner_name: process.env.OWNER_NAME || 'Samadhan R. Jadhav',
    phone_primary: process.env.PHONE_PRIMARY || '9822414748',
    phone_secondary: process.env.PHONE_SECONDARY || '9422941187',
    email: process.env.EMAIL || 'samadhanj182@gmail.com',
    gstin: process.env.GSTIN || '27AFSPJ0957J1ZX',
    address: process.env.ADDRESS || 'Sai Sankul Apartment, Palkhed Road, A/P & Tal. Dindori, Dist. Nashik - 422202',
    vendor_badge: 'Authorised Vendor: PM Surya Ghar Muft Bijli Yojana (MNRE)'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);

// Clean Page Route Handlers
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/owner', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'owner.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/product/:slugOrId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product-detail.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/quotation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'quotation.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Admin Panel Pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/admin/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'products.html'));
});

app.get('/admin/quotes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'quotes.html'));
});

app.get('/admin/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'gallery.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize Database & Start Server
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`☀️  SHREE SAI ENTERPRISES - SOLAR ENERGY SOLUTIONS`);
    console.log(`📍 Dindori, Nashik | GSTIN: 27AFSPJ0957J1ZX`);
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
    console.log(`🔑 Admin Panel at:    http://localhost:${PORT}/admin`);
    console.log(`📄 Free Quote at:     http://localhost:${PORT}/quotation`);
    console.log(`=======================================================`);
  });
}

startServer();
