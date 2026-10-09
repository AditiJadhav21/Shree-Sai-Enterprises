# Shree Sai Enterprises - Solar Energy Business Website, Inventory & Quotation System

A production-quality, mobile-responsive web platform with full inventory management, GST quotation generator, and administrative control built for **Shree Sai Enterprises**, an authorised vendor for the **PM Surya Ghar Muft Bijli Yojana (MNRE)** located in **Dindori, Nashik, Maharashtra**.

---

## 🏢 Business Profile

| Property | Details |
| :--- | :--- |
| **Business Name** | **Shree Sai Enterprises** |
| **Proprietor / Owner** | **Samadhan R. Jadhav** |
| **Primary Mobile** | **+91 9822414748** |
| **Alternate Mobile** | **+91 9422941187** |
| **Email Address** | **samadhanj182@gmail.com** |
| **GSTIN** | **27AFSPJ0957J1ZX** |
| **Authorised Vendor** | **PM Surya Ghar Muft Bijli Yojana (MNRE)** |
| **Head Office Address** | Sai Sankul Apartment, Palkhed Road, A/P & Tal. Dindori, Dist. Nashik - 422202, Maharashtra |

---

## ⚡ Tech Stack & Architecture

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (ES6+), Google Poppins Typography, Crisp Vector SVGs.
- **Backend**: Node.js, Express.js RESTful APIs.
- **Database**: MySQL 8.0+ (`schema.sql` and `seed.sql` provided) with automatic local store fallback so the application is immediately testable without database pre-configuration.
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt password hashing for Admin Portal.
- **Image Handling**: Multer file uploads to `/public/images/uploads` with DB storing clean relative paths.
- **Deployment**: Multi-stage `Dockerfile` + `docker-compose.yml` with healthchecks.

---

## 🚀 Key Features

### 1. Public Pages
1. **Home (`/`)**: Hero section with solar installation graphics, PM Surya Ghar authorized vendor badge, subsidy breakdown (1kW = ₹30,000, 2kW = ₹60,000, 3kW+ = ₹78,000), featured products, services preview, client testimonials, and WhatsApp/Call Floating buttons.
2. **About Business (`/about`)**: Company journey in Dindori and Nashik, mission, vision, trust pillars, and comprehensive PM Surya Ghar subsidy guide.
3. **About Owner (`/owner`)**: Samadhan R. Jadhav's leadership profile, vision, direct contact details, GSTIN, and MNRE accreditation.
4. **Products Catalog (`/products`)**: Live instant search, category filters (*Solar Panels, Solar Water Heaters, Inverters, Batteries*), price sorting (*Low-High, High-Low, Name*), stock badges (*In Stock, Limited Stock, Out of Stock*), approximate pricing notice, and "+ Add to Quote" buttons.
5. **Product Detail (`/product/:slug`)**: High-resolution image showcase, full descriptions, key bullet features, structured technical specifications table, warranty details, and direct quote cart integration.
6. **Services (`/services`)**: Turnkey Rooftop Installation, Solar Water Heater Plumbing, Solar Maintenance & AMC, Consultation & Net-Metering Liaison (MSEDCL Mahavitaran), Repair Support, and Agricultural Solar Pumps with modal service request forms.
7. **Photo Gallery (`/gallery`)**: Masonry grid of original photos categorized by *Installations, Materials, Documentation*, with click-to-zoom interactive lightbox.
8. **Quotation & Billing Engine (`/quotation`)**:
   - Interactive quote cart with live subtotal.
   - Customer site details form.
   - Live Maharashtra GST calculation (CGST + SGST split) per product.
   - Amount in words formatted according to the Indian numbering system (*Crores, Lakhs, Thousands, Rupees*).
   - Printable & downloadable A4 GST Quotation Invoice with official Shree Sai Enterprises letterhead, quote number (e.g., `SSE/2024-25/0002`), bank details, terms, and signature block.
   - Direct quote sharing to WhatsApp.
9. **Contact & Location (`/contact`)**: Contact details, contact form that saves to database, and embedded Google Maps of Palkhed Road, Dindori.

### 2. Admin Portal (`/admin`)
- **Secure JWT Login**: Protected access using Bcrypt-hashed credentials.
- **Dashboard**: Real-time KPI counters (Total Products, Low Stock Alerts, Total Quotes, Pending Quotes, Quoted Pipeline Volume).
- **Inventory Management (`/admin/products`)**: Add new products with file upload, edit specifications, delete products, and quick-update stock quantities.
- **Quotation CRM (`/admin/quotes`)**: View all customer quote requests, inspect itemized GST breakdown, toggle status (*Pending / Replied / Closed*), and print invoices.
- **Gallery Manager (`/admin/gallery`)**: Upload new installation photos and organize by category.

---

## 🛠️ Quick Start & Setup

### Option 1: Native Run with Node.js

1. **Clone or enter the directory:**
   ```bash
   cd shree-sai-enterprises
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   copy .env.example .env
   ```
   *(Update your MySQL credentials if using an existing local MySQL server).*

4. **Initialize Database (Optional if using local MySQL):**
   ```bash
   npm run seed
   ```
   *Note: If MySQL is not running or credentials are not yet configured, the system automatically uses its built-in local store (`data/local_store.json`), allowing instant full testing of all pages, APIs, and the Admin Panel without any setup.*

5. **Start the Application:**
   ```bash
   npm start
   ```
   Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

### Option 2: Docker & Docker Compose (Recommended for Production)

Run both the Node.js application and MySQL 8.0 containerized with persistent volumes and auto-seeding:

```bash
docker-compose up --build -d
```

- **Application URL:** [http://localhost:3000](http://localhost:3000)
- **MySQL Container:** Port `3306` (Database: `shree_sai_enterprises`)

To stop:
```bash
docker-compose down
```

---

## 🔑 Default Admin Credentials

| Parameter | Value |
| :--- | :--- |
| **Admin Portal URL** | `http://localhost:3000/admin` |
| **Username** | `admin` *(or `samadhanj182@gmail.com`)* |
| **Password** | `admin123` |

---

## 📡 REST API Summary

### Public Endpoints
- `GET /api/business-info` - Business contact and GSTIN details
- `GET /api/products` - List products with `?category=`, `?search=`, `?sort=`
- `GET /api/products/:slugOrId` - Single product specifications
- `GET /api/services` - List services
- `GET /api/gallery` - List gallery photos
- `POST /api/quotes` - Submit and generate GST quotation
- `GET /api/quotes/:idOrNumber` - Retrieve quotation invoice details
- `POST /api/contact` - Submit contact inquiry message

### Admin Endpoints (Require Bearer JWT Token)
- `POST /api/auth/login` - Admin authentication
- `GET /api/stats/dashboard` - Dashboard KPIs and alert metrics
- `POST /api/products` - Add product with image upload
- `PUT /api/products/:id` - Update product
- `PATCH /api/products/:id/stock` - Quick-update inventory quantity
- `DELETE /api/products/:id` - Delete product
- `GET /api/quotes` - View all quotes with status filter
- `PATCH /api/quotes/:id/status` - Update quote status (`Pending`, `Replied`, `Closed`)
- `POST /api/gallery` - Upload new gallery photo
- `DELETE /api/gallery/:id` - Delete gallery photo
- `GET /api/contact` - View all incoming customer messages

---

## 📄 License & Ownership
Created for **Shree Sai Enterprises**, Dindori, Nashik.
Proprietor: **Samadhan R. Jadhav** | Mobile: 9822414748
