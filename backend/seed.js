const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'demure.db');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create tables
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
`);

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Admin user
const adminExists = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('demurebakes2026', 10);
  db.prepare('INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)').run(uuidv4(), 'admin', hash);
  console.log('✓ Admin user created (username: admin, password: demurebakes2026)');
}

// Bank details
const bankExists = db.prepare('SELECT id FROM bank_details WHERE id = 1').get();
if (!bankExists) {
  db.prepare('INSERT INTO bank_details (id, bank_name, account_name, account_number, sort_code) VALUES (1, ?, ?, ?, ?)').run('', 'Demure Bakes', '', '');
}

// Clear existing products and re-seed
db.prepare('DELETE FROM products').run();

const products = [
  {
    name: "Valentine's Cupcakes",
    description: "Beautifully decorated cupcakes with fondant hearts, roses and love-themed toppers. Perfect for gifting.",
    price: 18.00,
    category: 'cupcakes',
    images: [
      `${BASE_URL}/uploads/valentines-cupcakes-1.jpg`,
      `${BASE_URL}/uploads/valentines-cupcakes-2.jpg`
    ],
    sort_order: 1
  },
  {
    name: "Oreo Caramel Brownies",
    description: "Fudgy chocolate brownies topped with Oreo cookies and a drizzle of smooth caramel sauce. Boxed in 4.",
    price: 12.00,
    category: 'brownies',
    images: [
      `${BASE_URL}/uploads/oreo-caramel-brownies-1.jpg`
    ],
    sort_order: 2
  },
  {
    name: "Oreo Brownie Box (6)",
    description: "Six indulgent Oreo-topped brownies with milk chocolate drizzle, presented in a windowed gift box.",
    price: 16.00,
    category: 'brownies',
    images: [
      `${BASE_URL}/uploads/oreo-brownie-box-1.jpg`
    ],
    sort_order: 3
  },
  {
    name: "Easter Cupcakes",
    description: "Spring-inspired cupcakes with pastel buttercream swirls and mini egg toppers. Available in boxes of 3.",
    price: 15.00,
    category: 'cupcakes',
    images: [
      `${BASE_URL}/uploads/easter-cupcakes-1.jpg`,
      `${BASE_URL}/uploads/easter-cupcakes-2.jpg`
    ],
    sort_order: 4
  },
  {
    name: "Easter Treat Box",
    description: "Mixed box with Easter cupcakes and chocolate bunny brownies — the perfect spring gift.",
    price: 22.00,
    category: 'boxes',
    images: [
      `${BASE_URL}/uploads/easter-treat-box-1.jpg`
    ],
    sort_order: 5
  },
  {
    name: "Mother's Day Cupcakes",
    description: "Box of 12 cupcakes with Best Mom Ever toppers and pastel buttercream. Ideal for Mother's Day.",
    price: 28.00,
    category: 'cupcakes',
    images: [
      `${BASE_URL}/uploads/mothers-day-cupcakes-1.jpg`,
      `${BASE_URL}/uploads/mothers-day-cupcakes-2.jpg`
    ],
    sort_order: 6
  },
  {
    name: "Oreo Brownie Slab",
    description: "Rich, fudgy brownie slab topped with whole Oreos and caramel — great for sharing.",
    price: 10.00,
    category: 'brownies',
    images: [
      `${BASE_URL}/uploads/oreo-brownie-slab-1.jpg`
    ],
    sort_order: 7
  },
  {
    name: "Caramel Oreo Brownie",
    description: "Single brownie with Oreo and caramel drizzle — the star of our brownie range.",
    price: 4.00,
    category: 'brownies',
    images: [
      `${BASE_URL}/uploads/caramel-oreo-brownie-1.jpg`,
      `${BASE_URL}/uploads/caramel-oreo-brownie-2.jpg`
    ],
    sort_order: 8
  },
  {
    name: "Easter Basket Hamper",
    description: "A wicker basket filled with Easter cupcakes, brownies, Creme Eggs and Kinder Chocolate.",
    price: 35.00,
    category: 'hampers',
    images: [
      `${BASE_URL}/uploads/easter-basket-1.jpg`,
      `${BASE_URL}/uploads/easter-basket-2.jpg`
    ],
    sort_order: 9
  },
  {
    name: "Caramel Brownie Slab",
    description: "Wide shot of our caramel Oreo brownie slab — great for sharing at events and parties.",
    price: 20.00,
    category: 'brownies',
    images: [
      `${BASE_URL}/uploads/caramel-brownie-slab-1.jpg`
    ],
    sort_order: 10
  }
];

const insertProduct = db.prepare(`INSERT INTO products (id, name, description, price, category, images, available, sort_order) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`);
products.forEach(p => {
  insertProduct.run(uuidv4(), p.name, p.description, p.price, p.category, JSON.stringify(p.images), p.sort_order);
});
console.log(`✓ ${products.length} products seeded`);

// Clear and re-seed testimonials
db.prepare('DELETE FROM testimonials').run();
const testimonials = [
  { author: 'Sarah M.', text: "Ordered the Valentine's cupcakes for my partner — they were absolutely stunning and tasted incredible! Will definitely be ordering again.", rating: 5, sort_order: 1 },
  { author: 'Jessica L.', text: "The Oreo brownies are out of this world! So fudgy and rich. My whole family was obsessed. Already planning my next order.", rating: 5, sort_order: 2 },
  { author: 'Emma T.', text: "Ordered the Easter basket for my mum and she was over the moon. Beautiful presentation and everything tasted amazing.", rating: 5, sort_order: 3 },
  { author: 'Priya K.', text: "The Mother's Day cupcakes were perfect — so pretty and delicious. The personalised toppers were a lovely touch.", rating: 5, sort_order: 4 },
  { author: 'Chloe R.', text: "Best brownies I've ever had! The caramel Oreo ones are something else. Packaging is gorgeous too — perfect for gifting.", rating: 5, sort_order: 5 }
];
const insertTestimonial = db.prepare('INSERT INTO testimonials (id, author, text, rating, visible, sort_order) VALUES (?, ?, ?, ?, 1, ?)');
testimonials.forEach(t => insertTestimonial.run(uuidv4(), t.author, t.text, t.rating, t.sort_order));
console.log(`✓ ${testimonials.length} testimonials seeded`);

// Gallery images (all product images)
db.prepare('DELETE FROM gallery_images').run();
const galleryImages = [
  { url: `${BASE_URL}/uploads/valentines-cupcakes-1.jpg`, alt: "Valentine's Cupcakes", sort_order: 1 },
  { url: `${BASE_URL}/uploads/oreo-caramel-brownies-1.jpg`, alt: "Oreo Caramel Brownies", sort_order: 2 },
  { url: `${BASE_URL}/uploads/oreo-brownie-box-1.jpg`, alt: "Oreo Brownie Box", sort_order: 3 },
  { url: `${BASE_URL}/uploads/easter-cupcakes-1.jpg`, alt: "Easter Cupcakes", sort_order: 4 },
  { url: `${BASE_URL}/uploads/easter-treat-box-1.jpg`, alt: "Easter Treat Box", sort_order: 5 },
  { url: `${BASE_URL}/uploads/mothers-day-cupcakes-1.jpg`, alt: "Mother's Day Cupcakes", sort_order: 6 },
  { url: `${BASE_URL}/uploads/oreo-brownie-slab-1.jpg`, alt: "Oreo Brownie Slab", sort_order: 7 },
  { url: `${BASE_URL}/uploads/caramel-oreo-brownie-1.jpg`, alt: "Caramel Oreo Brownie", sort_order: 8 },
  { url: `${BASE_URL}/uploads/easter-basket-1.jpg`, alt: "Easter Basket Hamper", sort_order: 9 },
  { url: `${BASE_URL}/uploads/easter-basket-2.jpg`, alt: "Easter Basket Top View", sort_order: 10 },
  { url: `${BASE_URL}/uploads/mothers-day-cupcakes-2.jpg`, alt: "Mother's Day Box Sunlit", sort_order: 11 },
  { url: `${BASE_URL}/uploads/easter-cupcakes-2.jpg`, alt: "Easter Cupcake Close-Up", sort_order: 12 }
];
const insertGallery = db.prepare('INSERT INTO gallery_images (id, url, alt, sort_order) VALUES (?, ?, ?, ?)');
galleryImages.forEach(g => insertGallery.run(uuidv4(), g.url, g.alt, g.sort_order));
console.log(`✓ ${galleryImages.length} gallery images seeded`);

console.log('\n✅ Database seeded successfully!');
db.close();
