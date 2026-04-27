import React, { useState, useEffect } from 'react';
import { getProducts } from '../api';

function ProductCard({ product }) {
  const [currentImage, setCurrentImage] = useState(0);
  const images = product.images || [];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(61,43,31,0.08)',
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(61,43,31,0.15)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 12px rgba(61,43,31,0.08)';
    }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f5f0e8' }}>
        {images.length > 0 ? (
          <img
            src={images[currentImage]}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
            🧁
          </div>
        )}

        {/* Image dots if multiple */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                style={{
                  width: i === currentImage ? '18px' : '7px',
                  height: '7px',
                  borderRadius: i === currentImage ? '4px' : '50%',
                  background: i === currentImage ? '#c8a84b' : 'rgba(255,255,255,0.7)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Category badge */}
        {product.category && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(200,168,75,0.9)',
            color: '#3d2b1f',
            padding: '3px 10px',
            borderRadius: '50px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.65rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {product.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.05rem',
          fontWeight: '600',
          color: '#2c1810',
          marginBottom: '0.5rem',
        }}>
          {product.name}
        </h3>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.82rem',
          color: '#8b6347',
          lineHeight: '1.5',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.15rem',
            fontWeight: '700',
            color: '#c8a84b',
          }}>
            £{Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={() => scrollTo('contact')}
            style={{
              background: '#c8a84b',
              color: '#3d2b1f',
              border: 'none',
              borderRadius: '50px',
              padding: '0.5rem 1.25rem',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.target.style.background = '#a8882b'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.background = '#c8a84b'; e.target.style.transform = 'translateY(0)'; }}
          >
            Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getProducts()
      .then(data => setProducts(data.filter(p => p.available)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="menu" style={{ padding: '5rem 0', background: '#f5f0e8' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Section label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            fontWeight: '600',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#c8a84b',
          }}>Our Menu</span>
          <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 2.75rem)',
          fontWeight: '700',
          color: '#2c1810',
          textAlign: 'center',
          marginBottom: '0.75rem',
        }}>
          Our Sweet Creations
        </h2>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          color: '#8b6347',
          textAlign: 'center',
          marginBottom: '2.5rem',
        }}>
          Every treat is baked fresh to order with the finest ingredients.
        </p>

        {/* Category filter */}
        {categories.length > 2 && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2.5rem',
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  background: filter === cat ? '#3d2b1f' : 'transparent',
                  color: filter === cat ? '#f5f0e8' : '#3d2b1f',
                  border: '2px solid #3d2b1f',
                  borderRadius: '50px',
                  padding: '0.4rem 1.1rem',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8b6347' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧁</div>
            <p>Loading our sweet creations...</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem',
            }}>
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Custom order CTA */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={() => scrollTo('contact')}
                style={{
                  background: 'transparent',
                  color: '#3d2b1f',
                  border: '2px dashed #c8a84b',
                  borderRadius: '50px',
                  padding: '0.85rem 2.5rem',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.target.style.background = '#c8a84b'; e.target.style.color = '#3d2b1f'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#3d2b1f'; }}
              >
                ✦ Place a Custom Order
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
