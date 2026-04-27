const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID: uuidv4 } = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'demure-bakes-secret-2026';
const BACKEND_URL = process.env.BACKEND_URL || 'https://demure-bakes-backend-production.up.railway.app';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database setup
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'demure.db');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT DEFAULT 'other',
    images TEXT DEFAULT '[]',
    available INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
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

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    product_id TEXT,
    product_name TEXT,
    quantity INTEGER DEFAULT 1,
    special_requests TEXT,
    delivery_date TEXT,
    status TEXT DEFAULT 'pending',
    total REAL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed default admin user if not exists
const adminExists = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('demurebakes2026', 10);
  db.prepare('INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)').run(uuidv4(), 'admin', hash);
}

// Seed default bank details row
const bankExists = db.prepare('SELECT id FROM bank_details WHERE id = 1').get();
if (!bankExists) {
  db.prepare('INSERT INTO bank_details (id, bank_name, account_name, account_number, sort_code) VALUES (1, ?, ?, ?, ?)').run('', 'Demure Bakes', '', '');
}

// Auto-seed products on first startup
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productCount.count === 0) {
  const B = BACKEND_URL;
  const seedProducts = [
    {
      name: "Valentine's Cupcakes",
      description: "Beautifully decorated cupcakes with fondant hearts, roses and love-themed toppers. Perfect for gifting your special someone. Available in boxes of 3 or 6.",
      price: 18.00,
      category: 'cupcakes',
      images: [`${B}/uploads/valentines-cupcakes-1.jpg`],
      sort_order: 1
    },
    {
      name: "Oreo Caramel Brownie Slab",
      description: "Rich, fudgy brownie slab loaded with whole Oreo cookies and a generous drizzle of smooth caramel sauce. Perfect for sharing at events and parties. Serves 6-8.",
      price: 20.00,
      category: 'brownies',
      images: [
        `${B}/uploads/oreo-brownie-slab-1.jpg`,
        `${B}/uploads/oreo-caramel-brownie-1.jpg`
      ],
      sort_order: 2
    },
    {
      name: "Oreo Brownie Box",
      description: "Indulgent Oreo-topped brownies with milk chocolate drizzle, presented in a beautiful windowed gift box. Available in boxes of 4 or 6 — perfect for gifting.",
      price: 16.00,
      category: 'brownies',
      images: [
        `${B}/uploads/oreo-brownie-box-1.jpg`,
        `${B}/uploads/oreo-brownie-box-2.jpg`,
        `${B}/uploads/oreo-brownie-box-3.jpg`
      ],
      sort_order: 3
    },
    {
      name: "Easter Cupcakes",
      description: "Spring-inspired cupcakes with pastel buttercream swirls and mini egg toppers. A delightful Easter treat for the whole family. Available in boxes of 3 or 6.",
      price: 15.00,
      category: 'cupcakes',
      images: [`${B}/uploads/easter-cupcakes-1.jpg`],
      sort_order: 4
    },
    {
      name: "Easter Treat Box",
      description: "A gorgeous windowed gift box with Easter cupcakes and chocolate bunny brownies — the perfect spring gift for family and friends.",
      price: 22.00,
      category: 'boxes',
      images: [`${B}/uploads/easter-treat-box-1.jpg`],
      sort_order: 5
    },
    {
      name: "Easter Basket Hamper",
      description: "A stunning wicker basket filled with Easter cupcakes, chocolate brownies, a Cadbury Creme Egg, Kinder Chocolate and adorable chick decorations. The ultimate Easter gift.",
      price: 35.00,
      category: 'hampers',
      images: [
        `${B}/uploads/easter-basket-1.jpg`,
        `${B}/uploads/easter-basket-2.jpg`,
        `${B}/uploads/easter-basket-3.jpg`,
        `${B}/uploads/easter-basket-4.jpg`
      ],
      sort_order: 6
    },
    {
      name: "Mother's Day Cupcakes",
      description: "Box of 12 beautifully decorated cupcakes with 'Best Mom Ever' disc toppers and pastel buttercream swirls. The perfect way to celebrate the special woman in your life.",
      price: 28.00,
      category: 'cupcakes',
      images: [
        `${B}/uploads/mothers-day-cupcakes-1.jpg`,
        `${B}/uploads/mothers-day-cupcakes-2.jpg`
      ],
      sort_order: 7
    }
  ];

  const insertProd = db.prepare('INSERT INTO products (id, name, description, price, category, images, available, sort_order) VALUES (?, ?, ?, ?, ?, ?, 1, ?)');
  seedProducts.forEach(p => insertProd.run(uuidv4(), p.name, p.description, p.price, p.category, JSON.stringify(p.images), p.sort_order));
  console.log(`Seeded ${seedProducts.length} products`);
}

// Auto-seed testimonials on first startup
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
  seedTestimonials.forEach(t => insertTest.run(uuidv4(), t.author, t.text, t.rating, t.sort_order));
  console.log(`Seeded ${seedTestimonials.length} testimonials`);
}

// Auto-seed gallery on first startup
const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery_images').get();
if (galleryCount.count === 0) {
  const B = BACKEND_URL;
  const seedGallery = [
    { url: `${B}/uploads/valentines-cupcakes-1.jpg`, alt: "Valentine's Cupcakes", sort_order: 1 },
    { url: `${B}/uploads/oreo-brownie-slab-1.jpg`, alt: 'Oreo Brownie Slab', sort_order: 2 },
    { url: `${B}/uploads/oreo-brownie-box-1.jpg`, alt: 'Oreo Brownie Box', sort_order: 3 },
    { url: `${B}/uploads/easter-cupcakes-1.jpg`, alt: 'Easter Cupcakes', sort_order: 4 },
    { url: `${B}/uploads/easter-treat-box-1.jpg`, alt: 'Easter Treat Box', sort_order: 5 },
    { url: `${B}/uploads/mothers-day-cupcakes-1.jpg`, alt: "Mother's Day Cupcakes", sort_order: 6 },
    { url: `${B}/uploads/easter-basket-1.jpg`, alt: 'Easter Basket Hamper', sort_order: 7 },
    { url: `${B}/uploads/easter-basket-3.jpg`, alt: 'Easter Basket Outdoor', sort_order: 8 },
    { url: `${B}/uploads/mothers-day-cupcakes-2.jpg`, alt: "Mother's Day Box Sunlit", sort_order: 9 },
    { url: `${B}/uploads/oreo-brownie-box-3.jpg`, alt: 'Oreo Brownie Box White', sort_order: 10 },
    { url: `${B}/uploads/easter-basket-4.jpg`, alt: 'Easter Basket Close-Up', sort_order: 11 },
    { url: `${B}/uploads/oreo-caramel-brownie-1.jpg`, alt: 'Oreo Caramel Brownie', sort_order: 12 }
  ];
  const insertGal = db.prepare('INSERT INTO gallery_images (id, url, alt, sort_order) VALUES (?, ?, ?, ?)');
  seedGallery.forEach(g => insertGal.run(uuidv4(), g.url, g.alt, g.sort_order));
  console.log(`Seeded ${seedGallery.length} gallery images`);
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
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
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username });
});

app.post('/api/auth/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ success: true });
});

// ==================== PRODUCTS ROUTES ====================

app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY sort_order ASC, created_at DESC').all();
  const result = products.map(p => ({
    ...p,
    images: JSON.parse(p.images || '[]'),
    available: p.available === 1
  }));
  res.json(result);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ ...product, images: JSON.parse(product.images || '[]'), available: product.available === 1 });
});

app.post('/api/products', authMiddleware, (req, res) => {
  const { name, description, price, category, images, available, sort_order } = req.body;
  const id = uuidv4();
  db.prepare(`INSERT INTO products (id, name, description, price, category, images, available, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, name, description || '', parseFloat(price), category || 'other',
    JSON.stringify(images || []), available !== false ? 1 : 0, sort_order || 0
  );
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.status(201).json({ ...product, images: JSON.parse(product.images), available: product.available === 1 });
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
  const { name, description, price, category, images, available, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  db.prepare(`UPDATE products SET name=?, description=?, price=?, category=?, images=?, available=?, sort_order=?, updated_at=datetime('now') WHERE id=?`).run(
    name || existing.name,
    description !== undefined ? description : existing.description,
    price !== undefined ? parseFloat(price) : existing.price,
    category || existing.category,
    images !== undefined ? JSON.stringify(images) : existing.images,
    available !== undefined ? (available ? 1 : 0) : existing.available,
    sort_order !== undefined ? sort_order : existing.sort_order,
    req.params.id
  );
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json({ ...product, images: JSON.parse(product.images), available: product.available === 1 });
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== IMAGE UPLOAD ROUTES ====================

app.post('/api/upload', authMiddleware, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const baseUrl = BACKEND_URL;
  const urls = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);
  res.json({ urls });
});

app.post('/api/upload/single', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const baseUrl = BACKEND_URL;
  const url = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ url });
});

// ==================== TESTIMONIALS ROUTES ====================

app.get('/api/testimonials', (req, res) => {
  const testimonials = db.prepare('SELECT * FROM testimonials WHERE visible = 1 ORDER BY sort_order ASC, created_at DESC').all();
  res.json(testimonials.map(t => ({ ...t, visible: t.visible === 1 })));
});

app.get('/api/testimonials/all', authMiddleware, (req, res) => {
  const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC').all();
  res.json(testimonials.map(t => ({ ...t, visible: t.visible === 1 })));
});

app.post('/api/testimonials', authMiddleware, (req, res) => {
  const { author, text, rating, visible, sort_order } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO testimonials (id, author, text, rating, visible, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, author, text, rating || 5, visible !== false ? 1 : 0, sort_order || 0
  );
  const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
  res.status(201).json({ ...testimonial, visible: testimonial.visible === 1 });
});

app.put('/api/testimonials/:id', authMiddleware, (req, res) => {
  const { author, text, rating, visible, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Testimonial not found' });
  db.prepare('UPDATE testimonials SET author=?, text=?, rating=?, visible=?, sort_order=? WHERE id=?').run(
    author || existing.author, text || existing.text,
    rating !== undefined ? rating : existing.rating,
    visible !== undefined ? (visible ? 1 : 0) : existing.visible,
    sort_order !== undefined ? sort_order : existing.sort_order,
    req.params.id
  );
  const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  res.json({ ...testimonial, visible: testimonial.visible === 1 });
});

app.delete('/api/testimonials/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Testimonial not found' });
  db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== BANK DETAILS ROUTES ====================

app.get('/api/bank-details', (req, res) => {
  const details = db.prepare('SELECT * FROM bank_details WHERE id = 1').get();
  res.json(details || {});
});

app.put('/api/bank-details', authMiddleware, (req, res) => {
  const { bank_name, account_name, account_number, sort_code } = req.body;
  db.prepare(`UPDATE bank_details SET bank_name=?, account_name=?, account_number=?, sort_code=?, updated_at=datetime('now') WHERE id=1`).run(
    bank_name || '', account_name || '', account_number || '', sort_code || ''
  );
  const details = db.prepare('SELECT * FROM bank_details WHERE id = 1').get();
  res.json(details);
});

// ==================== GALLERY ROUTES ====================

app.get('/api/gallery', (req, res) => {
  const images = db.prepare('SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC').all();
  res.json(images);
});

app.post('/api/gallery', authMiddleware, (req, res) => {
  const { url, alt, sort_order } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO gallery_images (id, url, alt, sort_order) VALUES (?, ?, ?, ?)').run(id, url, alt || '', sort_order || 0);
  const image = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(id);
  res.status(201).json(image);
});

app.delete('/api/gallery/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM gallery_images WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== INSTAGRAM FEED PROXY ====================
// Fetches the latest posts from @demurebakes using Instagram's public embed API
app.get('/api/instagram-feed', async (req, res) => {
  try {
    const username = 'demurebakes';
    // Use Instagram's public JSON endpoint
    const https = require('https');
    const url = `https://www.instagram.com/${username}/?__a=1&__d=dis`;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Cookie': 'ig_did=1; csrftoken=1;'
      }
    };

    const request = https.get(url, options, (response) => {
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          const edges = json?.graphql?.user?.edge_owner_to_timeline_media?.edges || [];
          const posts = edges.slice(0, 12).map(edge => ({
            id: edge.node.id,
            url: edge.node.display_url,
            thumbnail: edge.node.thumbnail_src || edge.node.display_url,
            caption: edge.node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
            link: `https://www.instagram.com/p/${edge.node.shortcode}/`,
            timestamp: edge.node.taken_at_timestamp
          }));
          res.json({ posts, source: 'instagram' });
        } catch (e) {
          // Instagram blocked the request — return gallery images as fallback
          const gallery = db.prepare('SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC LIMIT 12').all();
          res.json({ posts: gallery.map(g => ({ id: g.id, url: g.url, thumbnail: g.url, caption: g.alt, link: 'https://www.instagram.com/demurebakes' })), source: 'gallery' });
        }
      });
    });
    request.on('error', () => {
      const gallery = db.prepare('SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC LIMIT 12').all();
      res.json({ posts: gallery.map(g => ({ id: g.id, url: g.url, thumbnail: g.url, caption: g.alt, link: 'https://www.instagram.com/demurebakes' })), source: 'gallery' });
    });
  } catch (err) {
    const gallery = db.prepare('SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC LIMIT 12').all();
    res.json({ posts: gallery.map(g => ({ id: g.id, url: g.url, thumbnail: g.url, caption: g.alt, link: 'https://www.instagram.com/demurebakes' })), source: 'gallery' });
  }
});

// ==================== ORDERS ROUTES ====================

app.get('/api/orders', authMiddleware, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, customer_phone, product_id, product_name, quantity, special_requests, delivery_date, total } = req.body;
  const id = uuidv4();
  db.prepare(`INSERT INTO orders (id, customer_name, customer_email, customer_phone, product_id, product_name, quantity, special_requests, delivery_date, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, customer_name, customer_email, customer_phone || '', product_id || '', product_name || '', quantity || 1, special_requests || '', delivery_date || '', total || 0
  );
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  res.status(201).json(order);
});

app.put('/api/orders/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json(order);
});

// ==================== SETTINGS ROUTES ====================

app.get('/api/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  const result = {};
  settings.forEach(s => { result[s.key] = s.value; });
  res.json(result);
});

app.put('/api/settings', authMiddleware, (req, res) => {
  const { key, value } = req.body;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  res.json({ key, value });
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), products: db.prepare('SELECT COUNT(*) as c FROM products').get().c });
});

app.get('/', (req, res) => {
  res.json({ message: 'Demure Bakes API', version: '2.0.0' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Demure Bakes API running on port ${PORT}`);
});

module.exports = app;
