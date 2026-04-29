'use strict';
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'demure-bakes-secret-2026';
const BACKEND_URL = process.env.BACKEND_URL || 'https://demure-bakes-backend-production.up.railway.app';

const uploadUrl = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (raw.includes('/uploads/')) {
    return `${BACKEND_URL}/uploads/${raw.split('/uploads/').pop()}`;
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${BACKEND_URL}/uploads/${raw.replace(/^\/+/, '')}`;
};

const uploadFilename = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  if (raw.includes('/uploads/')) return raw.split('/uploads/').pop();
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.replace(/^\/+/, '');
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Database setup
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'demure.db');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// ==================== SCHEMA ====================
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL DEFAULT 0,
    category TEXT DEFAULT 'other',
    images TEXT DEFAULT '[]',
    available INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    flavours TEXT DEFAULT '[]',
    portion_sizes TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    visible INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bank_details (
    id INTEGER PRIMARY KEY DEFAULT 1,
    bank_name TEXT DEFAULT '',
    account_name TEXT DEFAULT '',
    account_number TEXT DEFAULT '',
    sort_code TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS gallery_images (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    alt TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT DEFAULT '',
    product_id TEXT DEFAULT '',
    product_name TEXT DEFAULT '',
    quantity INTEGER DEFAULT 1,
    special_requests TEXT DEFAULT '',
    delivery_date TEXT DEFAULT '',
    total REAL DEFAULT 0,
    deposit REAL DEFAULT 0,
    deposit_paid INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS slot_availability (
    id INTEGER PRIMARY KEY DEFAULT 1,
    slots_remaining INTEGER DEFAULT 5,
    slots_total INTEGER DEFAULT 5,
    week_label TEXT DEFAULT 'This Weekend',
    show_counter INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pending_reviews (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    order_reference TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Safe migrations for new columns
try { db.exec('ALTER TABLE products ADD COLUMN allergens TEXT DEFAULT "[]"'); } catch {}

// ==================== ADMIN USER SETUP ====================
// Always ensure demiadmin exists with correct password
const ADMIN_USERNAME = 'demiadmin';
const ADMIN_PASSWORD = 'molink123';

const existingAdmin = db.prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ?').get(ADMIN_USERNAME);
if (!existingAdmin) {
  // Remove any old admin users and create fresh
  db.prepare('DELETE FROM admin_users').run();
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare('INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)').run(randomUUID(), ADMIN_USERNAME, hash);
  console.log('Created admin user: demiadmin');
} else {
  // Ensure password is correct (reset if needed)
  const passwordCorrect = bcrypt.compareSync(ADMIN_PASSWORD, existingAdmin.password_hash);
  if (!passwordCorrect) {
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(hash, ADMIN_USERNAME);
    console.log('Reset admin password for demiadmin');
  }
}

// ==================== BANK DETAILS SETUP ====================
const bankExists = db.prepare('SELECT id FROM bank_details WHERE id = 1').get();
if (!bankExists) {
  db.prepare('INSERT INTO bank_details (id, bank_name, account_name, account_number, sort_code) VALUES (1, ?, ?, ?, ?)').run('', 'Demure Bakes', '', '');
}

// ==================== SEED DATA ====================
const SEED_VERSION = '7';
// Add new columns if they don't exist (safe migration)
try { db.exec('ALTER TABLE products ADD COLUMN flavours TEXT DEFAULT "[]"'); } catch {}
try { db.exec('ALTER TABLE products ADD COLUMN portion_sizes TEXT DEFAULT "[]"'); } catch {}
const currentSeedVersion = db.prepare("SELECT value FROM settings WHERE key = 'seed_version'").get();
if (!currentSeedVersion || currentSeedVersion.value !== SEED_VERSION) {
  db.prepare('DELETE FROM products').run();
  db.prepare('DELETE FROM testimonials').run();
  db.prepare('DELETE FROM gallery_images').run();
  db.prepare('DELETE FROM site_content').run();
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seed_version', ?)").run(SEED_VERSION);
  console.log('Resetting seed data to version', SEED_VERSION);
}

const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productCount.count === 0) {
  const B = BACKEND_URL;
  const seedProducts = [
    {
      name: "Valentine's Cupcakes",
      description: "Beautifully decorated cupcakes with fondant hearts, roses and love-themed toppers. Perfect for gifting your special someone.",
      price: 0,
      category: 'cupcakes',
      images: [`${B}/uploads/valentines-cupcakes-1.jpg`, `${B}/uploads/valentines-cupcakes-2.jpg`],
      flavours: ['Vanilla', 'Chocolate', 'Strawberry', 'Lemon'],
      portion_sizes: [{ label: 'Box of 3', price: 12 }, { label: 'Box of 6', price: 18 }, { label: 'Box of 12', price: 32 }],
      sort_order: 1
    },
    {
      name: "Oreo Brownie Slab",
      description: "Rich, fudgy brownie slab loaded with whole Oreo cookies and a generous drizzle of smooth caramel sauce. Perfect for sharing at events and parties.",
      price: 0,
      category: 'brownies',
      images: [`${B}/uploads/oreo-brownie-slab-1.jpg`, `${B}/uploads/oreo-caramel-brownie-1.jpg`],
      flavours: ['Oreo', 'Oreo Caramel', 'Biscoff', 'Nutella'],
      portion_sizes: [{ label: '4 Brownies', price: 15 }, { label: '6 Brownies', price: 20 }, { label: '12 Brownies', price: 30 }, { label: '24 Brownies', price: 55 }],
      sort_order: 2
    },
    {
      name: "Oreo Brownie Box",
      description: "Indulgent Oreo-topped brownies with milk chocolate drizzle, presented in a beautiful windowed gift box — perfect for gifting.",
      price: 0,
      category: 'brownies',
      images: [`${B}/uploads/oreo-brownie-box-1.jpg`, `${B}/uploads/oreo-brownie-box-2.jpg`, `${B}/uploads/oreo-brownie-box-3.jpg`],
      flavours: ['Oreo', 'Biscoff', 'Caramel', 'Mixed'],
      portion_sizes: [{ label: '4 Brownies', price: 15 }, { label: '6 Brownies', price: 20 }, { label: '12 Brownies', price: 30 }, { label: '24 Brownies', price: 55 }],
      sort_order: 3
    },
    {
      name: "Easter Cupcakes",
      description: "Spring-inspired cupcakes with pastel buttercream swirls and mini egg toppers. A delightful Easter treat for the whole family.",
      price: 0,
      category: 'cupcakes',
      images: [`${B}/uploads/easter-cupcakes-1.jpg`, `${B}/uploads/easter-cupcakes-2.jpg`],
      flavours: ['Vanilla', 'Chocolate', 'Lemon', 'Strawberry'],
      portion_sizes: [{ label: 'Box of 3', price: 11 }, { label: 'Box of 6', price: 15 }, { label: 'Box of 12', price: 28 }],
      sort_order: 4
    },
    {
      name: "Easter Treat Box",
      description: "A gorgeous windowed gift box with Easter cupcakes and chocolate brownies — the perfect spring gift for family and friends.",
      price: 22,
      category: 'tray bakes',
      images: [`${B}/uploads/easter-treat-box-1.jpg`],
      flavours: [],
      portion_sizes: [{ label: 'Standard Box', price: 22 }],
      sort_order: 5
    },
    {
      name: "Easter Basket Hamper",
      description: "A stunning wicker basket filled with Easter cupcakes, chocolate brownies, a Cadbury Creme Egg, Kinder Chocolate and adorable chick decorations.",
      price: 35,
      category: 'tray bakes',
      images: [`${B}/uploads/easter-basket-1.jpg`, `${B}/uploads/easter-basket-2.jpg`, `${B}/uploads/easter-basket-3.jpg`, `${B}/uploads/easter-basket-4.jpg`],
      flavours: [],
      portion_sizes: [{ label: 'Standard Hamper', price: 35 }],
      sort_order: 6
    },
    {
      name: "Mother's Day Cupcakes",
      description: "Box of beautifully decorated cupcakes with pastel buttercream swirls and personalised toppers. The perfect way to celebrate the special woman in your life.",
      price: 0,
      category: 'cupcakes',
      images: [`${B}/uploads/mothers-day-cupcakes-1.jpg`, `${B}/uploads/mothers-day-cupcakes-2.jpg`],
      flavours: ['Vanilla', 'Chocolate', 'Strawberry', 'Lemon'],
      portion_sizes: [{ label: 'Box of 6', price: 18 }, { label: 'Box of 12', price: 28 }, { label: 'Box of 24', price: 50 }],
      sort_order: 7
    }
  ];
  const insertProd = db.prepare('INSERT INTO products (id, name, description, price, category, images, available, sort_order, flavours, portion_sizes) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)');
  seedProducts.forEach(p => insertProd.run(randomUUID(), p.name, p.description, p.price, p.category, JSON.stringify(p.images), p.sort_order, JSON.stringify(p.flavours || []), JSON.stringify(p.portion_sizes || [])));
  console.log(`Seeded ${seedProducts.length} products`);
}

const testimonialCount = db.prepare('SELECT COUNT(*) as count FROM testimonials').get();
if (testimonialCount.count === 0) {
  const seedTestimonials = [
    { author: 'Sarah M.', text: "Ordered the Valentine's cupcakes for my partner — they were absolutely stunning and tasted incredible! Will definitely be ordering again.", rating: 5, sort_order: 1 },
    { author: 'Jessica L.', text: 'The Oreo brownies are out of this world! So fudgy and rich. My whole family was obsessed. Already planning my next order.', rating: 5, sort_order: 2 },
    { author: 'Emma T.', text: 'Ordered the Easter basket for my mum and she was over the moon. Beautiful presentation and everything tasted amazing.', rating: 5, sort_order: 3 },
    { author: 'Priya K.', text: "The Mother's Day cupcakes were perfect — so pretty and delicious. The personalised toppers were a lovely touch.", rating: 5, sort_order: 4 },
    { author: 'Chloe R.', text: "Best brownies I've ever had! The caramel Oreo ones are something else. Packaging is gorgeous too — perfect for gifting.", rating: 5, sort_order: 5 }
  ];
  const insertTest = db.prepare('INSERT INTO testimonials (id, author, text, rating, visible, sort_order) VALUES (?, ?, ?, ?, 1, ?)');
  seedTestimonials.forEach(t => insertTest.run(randomUUID(), t.author, t.text, t.rating, t.sort_order));
  console.log(`Seeded ${seedTestimonials.length} testimonials`);
}

const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery_images').get();
if (galleryCount.count === 0) {
  const B = BACKEND_URL;
  const seedGallery = [
    { url: `${B}/uploads/valentines-cupcakes-1.jpg`, alt: "Valentine's Cupcakes", sort_order: 1 },
    { url: `${B}/uploads/valentines-cupcakes-2.jpg`, alt: "Valentine's Cupcakes 2", sort_order: 2 },
    { url: `${B}/uploads/oreo-brownie-slab-1.jpg`, alt: 'Oreo Brownie Slab', sort_order: 3 },
    { url: `${B}/uploads/oreo-caramel-brownie-1.jpg`, alt: 'Oreo Caramel Brownie', sort_order: 4 },
    { url: `${B}/uploads/oreo-brownie-box-1.jpg`, alt: 'Oreo Brownie Box', sort_order: 5 },
    { url: `${B}/uploads/oreo-brownie-box-2.jpg`, alt: 'Oreo Brownie Box 2', sort_order: 6 },
    { url: `${B}/uploads/oreo-brownie-box-3.jpg`, alt: 'Oreo Brownie Box 3', sort_order: 7 },
    { url: `${B}/uploads/easter-cupcakes-1.jpg`, alt: 'Easter Cupcakes', sort_order: 8 },
    { url: `${B}/uploads/easter-treat-box-1.jpg`, alt: 'Easter Treat Box', sort_order: 9 },
    { url: `${B}/uploads/easter-basket-1.jpg`, alt: 'Easter Basket Hamper', sort_order: 10 },
    { url: `${B}/uploads/easter-basket-2.jpg`, alt: 'Easter Basket 2', sort_order: 11 },
    { url: `${B}/uploads/mothers-day-cupcakes-1.jpg`, alt: "Mother's Day Cupcakes", sort_order: 12 }
  ];
  const insertGal = db.prepare('INSERT INTO gallery_images (id, url, alt, sort_order) VALUES (?, ?, ?, ?)');
  seedGallery.forEach(g => insertGal.run(randomUUID(), g.url, g.alt, g.sort_order));
  console.log(`Seeded ${seedGallery.length} gallery images`);
}

// Seed FAQs
const faqCount = db.prepare('SELECT COUNT(*) as count FROM faqs').get();
if (faqCount.count === 0) {
  const seedFaqs = [
    { question: 'How far in advance do I need to order?', answer: 'We recommend ordering at least 3–5 days in advance to ensure we can accommodate your request. For large or custom orders, please give us 7+ days notice.', sort_order: 1 },
    { question: 'Do you deliver?', answer: 'Currently we offer collection only. We are based in [your area] and will provide the collection address once your order is confirmed.', sort_order: 2 },
    { question: 'What is your deposit policy?', answer: 'We require a 20% deposit at the time of ordering to secure your slot. The remaining balance is due on collection. Deposits are non-refundable if cancelled within 48 hours of the collection date.', sort_order: 3 },
    { question: 'Can I request a custom order?', answer: 'Absolutely! We love creating bespoke treats. Get in touch via Instagram or email to discuss your ideas and we will do our best to bring your vision to life.', sort_order: 4 },
    { question: 'Are your products suitable for people with allergies?', answer: 'All our products are made in a home kitchen that handles nuts, gluten, dairy, and eggs. We cannot guarantee an allergen-free environment. Please check the allergen information on each product and contact us if you have specific concerns.', sort_order: 5 },
    { question: 'How should I store my order?', answer: 'Most of our products are best enjoyed within 3 days of collection. Brownies can be stored in an airtight container at room temperature. Cupcakes are best kept in a cool, dry place away from direct sunlight.', sort_order: 6 }
  ];
  const insertFaq = db.prepare('INSERT INTO faqs (id, question, answer, sort_order, visible) VALUES (?, ?, ?, ?, 1)');
  seedFaqs.forEach(f => insertFaq.run(randomUUID(), f.question, f.answer, f.sort_order));
  console.log(`Seeded ${seedFaqs.length} FAQs`);
}

// Seed slot availability
const slotExists = db.prepare('SELECT id FROM slot_availability WHERE id = 1').get();
if (!slotExists) {
  db.prepare('INSERT INTO slot_availability (id, slots_remaining, slots_total, week_label, show_counter) VALUES (?, ?, ?, ?, ?)').run(1, 3, 5, 'This Weekend', 1);
  console.log('Seeded slot availability');
}

// Seed default site content
const contentCount = db.prepare('SELECT COUNT(*) as count FROM site_content').get();
if (contentCount.count === 0) {
  const defaultContent = [
    { key: 'hero_line1', value: 'Dive into' },
    { key: 'hero_line2', value: 'Happiness' },
    { key: 'hero_tagline', value: 'Handcrafted brownies, cupcakes & gift boxes — baked fresh to order with love.' },
    { key: 'hero_badge1', value: '🎂 Fresh Daily' },
    { key: 'hero_badge2', value: '✨ Made to Order' },
    { key: 'menu_heading', value: 'Our Sweet Creations' },
    { key: 'menu_subheading', value: 'Every treat is handcrafted fresh to order using premium ingredients. Choose your favourite and place your order today.' },
    { key: 'how_heading', value: 'Simple & Sweet Process' },
    { key: 'how_step1_title', value: 'Browse & Choose' },
    { key: 'how_step1_desc', value: 'Pick your favourite treats or request something bespoke.' },
    { key: 'how_step2_title', value: 'Place Your Order' },
    { key: 'how_step2_desc', value: 'Fill in your details and confirm with a 20% deposit via bank transfer.' },
    { key: 'how_step3_title', value: 'We Bake with Love' },
    { key: 'how_step3_desc', value: 'Your order is freshly baked to perfection for your collection date.' },
    { key: 'how_step4_title', value: 'Collect & Enjoy' },
    { key: 'how_step4_desc', value: 'Pick up your beautiful treats and dive into happiness!' },
    { key: 'how_video_enabled', value: 'false' },
    { key: 'how_video_url', value: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { key: 'gallery_heading', value: 'Fresh from the Kitchen' },
    { key: 'gallery_subheading', value: 'A look at our latest creations — follow us on Instagram for more' },
    { key: 'reviews_heading', value: 'What Our Customers Say' },
    { key: 'about_badge', value: 'About Us' },
    { key: 'about_heading1', value: 'Baked with love,' },
    { key: 'about_heading2', value: 'served with joy' },
    { key: 'about_para1', value: 'Demure Bakes is a home-based artisan bakery dedicated to crafting indulgent treats that bring people together. Every brownie, cupcake, and gift box is made fresh to order using premium ingredients.' },
    { key: 'about_para2', value: "We believe that great bakes deserve great ingredients — no shortcuts, no compromise. Whether it's a birthday, a special occasion, or simply a treat for yourself, we pour our heart into every single order." },
    { key: 'about_stat1_num', value: '500+' },
    { key: 'about_stat1_label', value: 'Happy Customers' },
    { key: 'about_stat2_num', value: '50+' },
    { key: 'about_stat2_label', value: 'Flavour Combos' },
    { key: 'about_stat3_num', value: '100%' },
    { key: 'about_stat3_label', value: 'Fresh to Order' },
    { key: 'contact_heading', value: "Let's Create Something Sweet" },
    { key: 'contact_subheading', value: 'Have a question or want to discuss a custom order? We\'d love to hear from you.' },
    { key: 'contact_instagram', value: '@demurebakes' },
    { key: 'contact_email', value: 'hello@demurebakes.co.uk' },
    { key: 'whatsapp_number', value: '447700000000' },
    { key: 'footer_tagline', value: 'Handcrafted with love, delivered with joy.' }
  ];
  const insertContent = db.prepare('INSERT INTO site_content (key, value) VALUES (?, ?)');
  defaultContent.forEach(c => insertContent.run(c.key, c.value));
  console.log(`Seeded ${defaultContent.length} site content items`);
}

// Ensure newer site-content controls exist for already-deployed databases.
const ensureContent = db.prepare('INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)');
ensureContent.run('how_video_enabled', 'false');
ensureContent.run('how_video_url', 'https://www.youtube.com/embed/dQw4w9WgXcQ');

// ==================== MIDDLEWARE ====================
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, username: user.username });
});

app.post('/api/auth/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), req.user.id);
  res.json({ success: true });
});

// ==================== PRODUCTS ROUTES ====================

app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY sort_order ASC, created_at DESC').all();
  res.json(products.map(p => {
    const images = JSON.parse(p.images || '[]');
    const fullImages = images.map(uploadUrl);
    return {
      ...p,
      images: fullImages,
      available: p.available === 1,
      flavours: JSON.parse(p.flavours || '[]'),
      portion_sizes: JSON.parse(p.portion_sizes || '[]')
    };
  }));
});

app.get('/api/products/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...p,
    images: JSON.parse(p.images || '[]').map(uploadUrl),
    available: p.available === 1,
    flavours: JSON.parse(p.flavours || '[]'),
    portion_sizes: JSON.parse(p.portion_sizes || '[]')
  });
});

app.post('/api/products', authMiddleware, upload.array('images', 10), (req, res) => {
  const body = req.body || {};
  const { name, description, price, category, available, sort_order, flavours, portion_sizes } = body;
  if (!name) return res.status(400).json({ error: 'Product name is required' });
  const id = randomUUID();
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    imageUrls = req.files.map(f => f.filename);
  } else if (body.images) {
    imageUrls = Array.isArray(body.images) ? body.images : JSON.parse(body.images || '[]');
  }
  const parsedFlavours = flavours ? (typeof flavours === 'string' ? JSON.parse(flavours) : flavours) : [];
  const parsedPortions = portion_sizes ? (typeof portion_sizes === 'string' ? JSON.parse(portion_sizes) : portion_sizes) : [];
  db.prepare('INSERT INTO products (id, name, description, price, category, images, available, sort_order, flavours, portion_sizes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, name, description || '', parseFloat(price) || 0, category || 'brownies',
    JSON.stringify(imageUrls), available === 'false' || available === false ? 0 : 1,
    parseInt(sort_order) || 0, JSON.stringify(parsedFlavours), JSON.stringify(parsedPortions)
  );
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.status(201).json({ ...p, images: JSON.parse(p.images).map(uploadUrl), available: p.available === 1, flavours: JSON.parse(p.flavours || '[]'), portion_sizes: JSON.parse(p.portions || p.portion_sizes || '[]') });
});

app.put('/api/products/:id', authMiddleware, upload.array('images', 10), (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const body = req.body || {};
  const { name, description, price, category, available, sort_order, flavours, portion_sizes } = body;
  let imageUrls;
  if (req.files && req.files.length > 0) {
    imageUrls = req.files.map(f => f.filename);
  } else if (body.images) {
    imageUrls = Array.isArray(body.images) ? body.images : JSON.parse(body.images || '[]');
  } else {
    imageUrls = null;
  }
  const parsedFlavours = flavours !== undefined ? (typeof flavours === 'string' ? JSON.parse(flavours) : flavours) : JSON.parse(existing.flavours || '[]');
  const parsedPortions = portion_sizes !== undefined ? (typeof portion_sizes === 'string' ? JSON.parse(portion_sizes) : portion_sizes) : JSON.parse(existing.portion_sizes || '[]');
  db.prepare(`UPDATE products SET name=?, description=?, price=?, category=?, images=?, available=?, sort_order=?, flavours=?, portion_sizes=?, updated_at=datetime('now') WHERE id=?`).run(
    name || existing.name,
    description !== undefined ? description : existing.description,
    price !== undefined ? parseFloat(price) : existing.price,
    category || existing.category,
    imageUrls !== null ? JSON.stringify(imageUrls) : existing.images,
    available !== undefined ? (available === 'false' || available === false ? 0 : 1) : existing.available,
    sort_order !== undefined ? parseInt(sort_order) : existing.sort_order,
    JSON.stringify(parsedFlavours),
    JSON.stringify(parsedPortions),
    req.params.id
  );
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json({ ...p, images: JSON.parse(p.images).map(uploadUrl), available: p.available === 1, flavours: JSON.parse(p.flavours || '[]'), portion_sizes: JSON.parse(p.portion_sizes || '[]') });
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
  if (!db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== IMAGE UPLOAD ====================

app.post('/api/upload', authMiddleware, upload.array('images', 10), (req, res) => {
  if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files uploaded' });
  res.json({ urls: req.files.map(f => uploadUrl(f.filename)) });
});

app.post('/api/upload/single', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: uploadUrl(req.file.filename) });
});

// ==================== TESTIMONIALS ROUTES ====================

app.get('/api/testimonials', (req, res) => {
  const rows = db.prepare('SELECT * FROM testimonials WHERE visible = 1 ORDER BY sort_order ASC, created_at DESC').all();
  res.json(rows.map(t => ({ ...t, visible: t.visible === 1 })));
});

app.get('/api/testimonials/all', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC').all();
  res.json(rows.map(t => ({ ...t, visible: t.visible === 1 })));
});

app.post('/api/testimonials', authMiddleware, (req, res) => {
  const { author, role, text, content, rating, visible, sort_order } = req.body;
  const reviewText = text || content || '';
  const id = randomUUID();
  db.prepare('INSERT INTO testimonials (id, author, text, rating, visible, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, author, reviewText, rating || 5, visible !== false ? 1 : 0, sort_order || 0
  );
  const t = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
  res.status(201).json({ ...t, visible: t.visible === 1 });
});

app.put('/api/testimonials/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { author, role, text, content, rating, visible, sort_order } = req.body;
  const reviewText = text || content;
  db.prepare('UPDATE testimonials SET author=?, text=?, rating=?, visible=?, sort_order=? WHERE id=?').run(
    author || existing.author, reviewText || existing.text,
    rating !== undefined ? rating : existing.rating,
    visible !== undefined ? (visible ? 1 : 0) : existing.visible,
    sort_order !== undefined ? sort_order : existing.sort_order,
    req.params.id
  );
  const t = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  res.json({ ...t, visible: t.visible === 1 });
});

app.delete('/api/testimonials/:id', authMiddleware, (req, res) => {
  if (!db.prepare('SELECT id FROM testimonials WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== BANK DETAILS ====================

app.get('/api/bank-details', (req, res) => {
  res.json(db.prepare('SELECT * FROM bank_details WHERE id = 1').get() || {});
});

app.put('/api/bank-details', authMiddleware, (req, res) => {
  const { bank_name, account_name, account_number, sort_code, paypal_email, notes } = req.body;
  // Ensure paypal_email and notes columns exist
  try { db.exec('ALTER TABLE bank_details ADD COLUMN paypal_email TEXT DEFAULT ""'); } catch {}
  try { db.exec('ALTER TABLE bank_details ADD COLUMN notes TEXT DEFAULT ""'); } catch {}
  db.prepare(`UPDATE bank_details SET bank_name=?, account_name=?, account_number=?, sort_code=?, paypal_email=?, notes=?, updated_at=datetime('now') WHERE id=1`).run(
    bank_name || '', account_name || '', account_number || '', sort_code || '', paypal_email || '', notes || ''
  );
  res.json(db.prepare('SELECT * FROM bank_details WHERE id = 1').get());
});

// ==================== GALLERY ====================

app.get('/api/gallery', (req, res) => {
  const rows = db.prepare('SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC').all();
  res.json(rows.map(g => ({ ...g, url: uploadUrl(g.url), thumbnail: uploadUrl(g.url) })));
});

app.post('/api/gallery', authMiddleware, upload.single('image'), (req, res) => {
  let url, alt, sort_order;
  if (req.file) {
    // File upload
    url = req.file.filename;
    alt = req.body.alt || req.file.originalname || '';
    sort_order = parseInt(req.body.sort_order) || 0;
  } else {
    // JSON body
    url = req.body.url;
    alt = req.body.alt || '';
    sort_order = parseInt(req.body.sort_order) || 0;
  }
  if (!url) return res.status(400).json({ error: 'No image provided' });
  const id = randomUUID();
  // Store just the filename if it's a full URL to our backend
  const filename = uploadFilename(url);
  const storedUrl = /^https?:\/\//i.test(filename) ? filename : uploadFilename(url);
  db.prepare('INSERT INTO gallery_images (id, url, alt, sort_order) VALUES (?, ?, ?, ?)').run(id, storedUrl, alt, sort_order);
  const created = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(id);
  res.status(201).json({ ...created, url: uploadUrl(created.url), thumbnail: uploadUrl(created.url), filename });
});

app.delete('/api/gallery/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM gallery_images WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== SITE CONTENT ====================

app.get('/api/site-content', (req, res) => {
  const rows = db.prepare('SELECT * FROM site_content').all();
  // Return as array for admin panel compatibility
  res.json(rows);
});

// Per-key PUT for admin panel
app.put('/api/site-content/:key', authMiddleware, (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  db.prepare("INSERT OR REPLACE INTO site_content (key, value, updated_at) VALUES (?, ?, datetime('now'))").run(key, value || '');
  res.json({ key, value });
});

app.put('/api/site-content', authMiddleware, (req, res) => {
  // Accept either { key, value } or { updates: { key: value, ... } }
  if (req.body.updates && typeof req.body.updates === 'object') {
    const updateStmt = db.prepare('INSERT OR REPLACE INTO site_content (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))');
    const updateMany = db.transaction((updates) => {
      Object.entries(updates).forEach(([k, v]) => updateStmt.run(k, v));
    });
    updateMany(req.body.updates);
    res.json({ success: true, updated: Object.keys(req.body.updates).length });
  } else {
    const { key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO site_content (key, value, updated_at) VALUES (?, ?, datetime('now'))").run(key, value);
    res.json({ key, value });
  }
});

// ==================== INSTAGRAM FEED PROXY ====================

app.get('/api/instagram-feed', (req, res) => {
  // Instagram's public API is heavily restricted; fall back to gallery images
  const gallery = db.prepare('SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC LIMIT 12').all();
  res.json({
    posts: gallery.map(g => {
      const fullUrl = uploadUrl(g.url);
      return { id: g.id, url: fullUrl, thumbnail: fullUrl, caption: g.alt, link: 'https://www.instagram.com/demurebakes' };
    }),
    source: 'gallery',
    instagram_url: 'https://www.instagram.com/demurebakes'
  });
});

// ==================== ORDERS ====================

// Generate unique human-readable reference: DB-YYYYMMDD-XXXX
function generateReference() {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DB-${dateStr}-${rand}`;
}

app.get('/api/orders', authMiddleware, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders.map(o => ({ ...o, deposit_paid: o.deposit_paid === 1 })));
});

app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR reference = ?').get(req.params.id, req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ ...order, deposit_paid: order.deposit_paid === 1 });
});

app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, customer_phone, product_id, product_name, quantity, special_requests, delivery_date, total } = req.body;
  if (!customer_name || !customer_email) return res.status(400).json({ error: 'Name and email are required' });

  const id = randomUUID();
  let reference = generateReference();
  // Ensure uniqueness
  while (db.prepare('SELECT id FROM orders WHERE reference = ?').get(reference)) {
    reference = generateReference();
  }

  const totalAmount = parseFloat(total) || 0;
  const depositAmount = Math.ceil(totalAmount * 0.20 * 100) / 100; // 20% deposit, rounded up to nearest penny

  db.prepare(`INSERT INTO orders (id, reference, customer_name, customer_email, customer_phone, product_id, product_name, quantity, special_requests, delivery_date, total, deposit, deposit_paid, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending')`).run(
    id, reference, customer_name, customer_email, customer_phone || '',
    product_id || '', product_name || '', parseInt(quantity) || 1,
    special_requests || '', delivery_date || '', totalAmount, depositAmount
  );

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  const bankDetails = db.prepare('SELECT * FROM bank_details WHERE id = 1').get();

  res.status(201).json({
    ...order,
    deposit_paid: false,
    bank_details: bankDetails
  });
});

app.patch('/api/orders/:id/deposit', authMiddleware, (req, res) => {
  const { deposit_paid } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR reference = ?').get(req.params.id, req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  db.prepare('UPDATE orders SET deposit_paid = ? WHERE id = ?').run(deposit_paid ? 1 : 0, order.id);
  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
  res.json({ ...updated, deposit_paid: updated.deposit_paid === 1 });
});

app.patch('/api/orders/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'baking', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR reference = ?').get(req.params.id, req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, order.id);
  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
  res.json({ ...updated, deposit_paid: updated.deposit_paid === 1 });
});

app.delete('/api/orders/:id', authMiddleware, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR reference = ?').get(req.params.id, req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  db.prepare('DELETE FROM orders WHERE id = ?').run(order.id);
  res.json({ success: true });
});

// ==================== SETTINGS ====================

app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const result = {};
  rows.forEach(s => { result[s.key] = s.value; });
  res.json(result);
});

app.put('/api/settings', authMiddleware, (req, res) => {
  const { key, value } = req.body;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  res.json({ key, value });
});

// ==================== FAQs ====================

app.get('/api/faqs', (req, res) => {
  const faqs = db.prepare('SELECT * FROM faqs WHERE visible = 1 ORDER BY sort_order ASC, created_at ASC').all();
  res.json(faqs);
});

app.get('/api/faqs/all', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC').all());
});

app.post('/api/faqs', authMiddleware, (req, res) => {
  const { question, answer, sort_order, visible } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' });
  const id = randomUUID();
  db.prepare('INSERT INTO faqs (id, question, answer, sort_order, visible) VALUES (?, ?, ?, ?, ?)').run(id, question, answer, sort_order || 0, visible !== false ? 1 : 0);
  res.status(201).json(db.prepare('SELECT * FROM faqs WHERE id = ?').get(id));
});

app.put('/api/faqs/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { question, answer, sort_order, visible } = req.body;
  db.prepare('UPDATE faqs SET question=?, answer=?, sort_order=?, visible=? WHERE id=?').run(
    question || existing.question, answer || existing.answer,
    sort_order !== undefined ? sort_order : existing.sort_order,
    visible !== undefined ? (visible ? 1 : 0) : existing.visible,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id));
});

app.delete('/api/faqs/:id', authMiddleware, (req, res) => {
  if (!db.prepare('SELECT id FROM faqs WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== SLOT AVAILABILITY ====================

app.get('/api/slots', (req, res) => {
  const slot = db.prepare('SELECT * FROM slot_availability WHERE id = 1').get();
  res.json(slot || { slots_remaining: 0, slots_total: 5, week_label: 'This Weekend', show_counter: 1 });
});

app.put('/api/slots', authMiddleware, (req, res) => {
  const { slots_remaining, slots_total, week_label, show_counter } = req.body;
  const existing = db.prepare('SELECT * FROM slot_availability WHERE id = 1').get();
  if (!existing) {
    db.prepare('INSERT INTO slot_availability (id, slots_remaining, slots_total, week_label, show_counter) VALUES (1, ?, ?, ?, ?)').run(
      slots_remaining ?? 3, slots_total ?? 5, week_label || 'This Weekend', show_counter !== false ? 1 : 0
    );
  } else {
    db.prepare("UPDATE slot_availability SET slots_remaining=?, slots_total=?, week_label=?, show_counter=?, updated_at=datetime('now') WHERE id=1").run(
      slots_remaining !== undefined ? slots_remaining : existing.slots_remaining,
      slots_total !== undefined ? slots_total : existing.slots_total,
      week_label || existing.week_label,
      show_counter !== undefined ? (show_counter ? 1 : 0) : existing.show_counter
    );
  }
  res.json(db.prepare('SELECT * FROM slot_availability WHERE id = 1').get());
});

// ==================== PENDING REVIEWS ====================

// Public: submit a review (goes to pending moderation)
app.post('/api/reviews/submit', (req, res) => {
  const { author, text, rating, order_reference } = req.body;
  if (!author || !text) return res.status(400).json({ error: 'Name and review text are required' });
  const id = randomUUID();
  db.prepare('INSERT INTO pending_reviews (id, author, text, rating, order_reference, status) VALUES (?, ?, ?, ?, ?, "pending")').run(
    id, author, text, Math.min(5, Math.max(1, parseInt(rating) || 5)), order_reference || ''
  );
  res.status(201).json({ success: true, message: 'Thank you! Your review has been submitted and will appear after approval.' });
});

// Admin: get all pending reviews
app.get('/api/reviews/pending', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM pending_reviews ORDER BY created_at DESC').all());
});

// Admin: approve a pending review (moves to testimonials)
app.post('/api/reviews/:id/approve', authMiddleware, (req, res) => {
  const review = db.prepare('SELECT * FROM pending_reviews WHERE id = ?').get(req.params.id);
  if (!review) return res.status(404).json({ error: 'Not found' });
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM testimonials').get().m || 0;
  db.prepare('INSERT INTO testimonials (id, author, text, rating, visible, sort_order) VALUES (?, ?, ?, ?, 1, ?)').run(
    randomUUID(), review.author, review.text, review.rating, maxOrder + 1
  );
  db.prepare('UPDATE pending_reviews SET status = "approved" WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Admin: reject a pending review
app.post('/api/reviews/:id/reject', authMiddleware, (req, res) => {
  if (!db.prepare('SELECT id FROM pending_reviews WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE pending_reviews SET status = "rejected" WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Admin: delete a pending review
app.delete('/api/reviews/:id', authMiddleware, (req, res) => {
  if (!db.prepare('SELECT id FROM pending_reviews WHERE id = ?').get(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM pending_reviews WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== ORDER TRACKING ====================

app.get('/api/orders/track/:reference', (req, res) => {
  const order = db.prepare('SELECT id, reference, customer_name, product_name, quantity, total, deposit, deposit_paid, status, delivery_date, created_at FROM orders WHERE reference = ?').get(req.params.reference.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Order not found. Please check your reference code.' });
  res.json({ ...order, deposit_paid: order.deposit_paid === 1 });
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    products: db.prepare('SELECT COUNT(*) as c FROM products').get().c,
    orders: db.prepare('SELECT COUNT(*) as c FROM orders').get().c,
    testimonials: db.prepare('SELECT COUNT(*) as c FROM testimonials').get().c
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ==================== SERVE FRONTEND ====================
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  // For React Router: serve index.html for all non-API routes
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Demure Bakes API', version: '3.0.0', admin: 'demiadmin' });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Demure Bakes API v3 running on port ${PORT}`);
});

module.exports = app;
