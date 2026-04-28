import React, { useState, useEffect, useRef } from 'react';
import { getProducts, getSiteContent } from '../api';

const CATEGORIES = ['all', 'brownies', 'cupcakes', 'boxes', 'hampers'];

function ImageCarousel({ images, name }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % images.length);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [images?.length]);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setCurrent(idx);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % images.length);
    }, 3500);
  };

  if (!images || images.length === 0) {
    return (
      <div style={{
        width: '100%', height: '240px', background: 'rgb(237, 232, 223)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '16px 16px 0 0',
      }}>
        <span style={{ fontSize: '3rem' }}>🧁</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden', borderRadius: '16px 16px 0 0', background: 'rgb(237, 232, 223)' }}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${name} ${i + 1}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.6s ease',
            opacity: i === current ? 1 : 0,
          }}
          loading="lazy"
        />
      ))}
      {/* Dots */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '5px',
          zIndex: 2,
        }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                background: i === current ? 'rgb(201, 150, 58)' : 'rgba(255,255,255,0.75)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      )}
      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo((current - 1 + images.length) % images.length)}
            style={{
              position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
              width: '30px', height: '30px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(61,35,20)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            onClick={() => goTo((current + 1) % images.length)}
            style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
              width: '30px', height: '30px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(61,35,20)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      )}
    </div>
  );
}

function ProductCard({ product, onOrder }) {
  const [hovered, setHovered] = useState(false);

  const catColors = {
    brownies: { bg: 'rgba(61,35,20,0.08)', text: 'rgb(61,35,20)' },
    cupcakes: { bg: 'rgba(245,198,204,0.5)', text: 'rgb(180,80,100)' },
    boxes: { bg: 'rgba(201,150,58,0.12)', text: 'rgb(140,90,10)' },
    hampers: { bg: 'rgba(107,79,58,0.1)', text: 'rgb(107,79,58)' },
    other: { bg: 'rgba(201,150,58,0.1)', text: 'rgb(140,90,10)' },
  };
  const cc = catColors[product.category] || catColors.other;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: hovered ? '0 20px 50px rgba(61,35,20,0.18)' : '0 4px 20px rgba(61,35,20,0.08)',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative' }}>
        <ImageCarousel images={product.images} name={product.name} />
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: cc.bg, backdropFilter: 'blur(8px)',
          color: cc.text, borderRadius: '50px', padding: '4px 12px',
          fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.72rem',
          textTransform: 'capitalize', border: `1px solid ${cc.text}30`, zIndex: 2,
        }}>
          {product.category}
        </div>
        {product.images && product.images.length > 1 && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(0,0,0,0.45)', color: 'white',
            borderRadius: '50px', padding: '3px 8px',
            fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.68rem',
            display: 'flex', alignItems: 'center', gap: '3px', zIndex: 2,
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            {product.images.length} photos
          </div>
        )}
      </div>

      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1.1rem',
          color: 'rgb(61,35,20)', margin: '0 0 0.5rem 0', lineHeight: 1.3,
        }}>
          {product.name}
        </h3>
        <p style={{
          fontFamily: 'Nunito, sans-serif', fontSize: '0.875rem',
          color: 'rgb(107,79,58)', lineHeight: 1.6, margin: '0 0 1rem 0', flex: 1,
        }}>
          {product.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{
            fontFamily: '"Baloo 2", cursive', fontWeight: 800,
            fontSize: '1.4rem', color: 'rgb(201,150,58)',
          }}>
            £{Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={() => onOrder(product)}
            style={{
              background: 'rgb(61,35,20)', color: 'rgb(237,232,223)',
              border: 'none', borderRadius: '50px', padding: '0.5rem 1.25rem',
              fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.875rem',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(61,35,20,0.2)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgb(201,150,58)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgb(61,35,20)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Menu({ onOrder }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    getProducts()
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'all'
    ? products.filter(p => p.available !== false)
    : products.filter(p => p.available !== false && p.category === activeCategory);

  const [content, setContent] = useState({});
  useEffect(() => { getSiteContent().then(setContent).catch(() => {}) }, []);
  const c = (key, fallback) => content[key] || fallback;

  const availableCategories = CATEGORIES.filter(cat =>
    cat === 'all' || products.some(p => p.category === cat && p.available !== false)
  );

  return (
    <section id="menu" style={{ background: 'rgb(250,247,242)', padding: '5rem 0' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.25)',
            borderRadius: '50px', padding: '0.35rem 1rem', marginBottom: '1rem',
          }}>
            <span style={{ fontSize: '0.9rem' }}>🍫</span>
            <span style={{
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem',
              color: 'rgb(107,79,58)', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Our Menu</span>
          </div>
          <h2 style={{
            fontFamily: '"Baloo 2", cursive', fontWeight: 800,
            fontSize: 'clamp(2rem,4vw,3rem)', color: 'rgb(61,35,20)', margin: '0 0 0.75rem 0',
          }}>
            {c('menu_heading', 'Sweet Creations')}
          </h2>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontSize: '1.05rem',
            color: 'rgb(107,79,58)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6,
          }}>
            {c('menu_subheading', 'Every treat is baked fresh to order with the finest ingredients')}
          </p>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontFamily: '"Baloo 2", cursive', fontWeight: 600, fontSize: '0.875rem',
                padding: '0.45rem 1.2rem', borderRadius: '50px',
                border: activeCategory === cat ? 'none' : '2px solid rgba(107,79,58,0.2)',
                background: activeCategory === cat ? 'rgb(61,35,20)' : 'white',
                color: activeCategory === cat ? 'rgb(237,232,223)' : 'rgb(107,79,58)',
                cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                boxShadow: activeCategory === cat ? '0 4px 12px rgba(61,35,20,0.2)' : 'none',
              }}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '3px solid rgba(201,150,58,0.2)', borderTopColor: 'rgb(201,150,58)',
              animation: 'menuSpin 0.8s linear infinite', margin: '0 auto 1rem',
            }} />
            <p style={{ fontFamily: 'Nunito, sans-serif', color: 'rgb(107,79,58)' }}>Loading our sweet creations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgb(107,79,58)', fontFamily: 'Nunito, sans-serif' }}>
            No items in this category yet.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '1.75rem',
          }}>
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} onOrder={onOrder} />
            ))}
          </div>
        )}

        {/* Custom order CTA */}
        <div style={{
          marginTop: '3.5rem', textAlign: 'center',
          background: 'linear-gradient(135deg, rgb(61,35,20) 0%, rgb(107,79,58) 100%)',
          borderRadius: '24px', padding: '2.5rem 2rem',
        }}>
          <h3 style={{
            fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.75rem',
            margin: '0 0 0.75rem 0', color: 'rgb(237,232,223)',
          }}>
            Want something bespoke? ✨
          </h3>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontSize: '1rem',
            color: 'rgba(237,232,223,0.85)', margin: '0 0 1.5rem 0',
            maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto',
          }}>
            Custom celebration cakes, personalised gift boxes and hampers — all made to order.
          </p>
          <button
            onClick={() => onOrder && onOrder({ id: 'custom', name: 'Custom / Bespoke Order', price: 0 })}
            style={{
              background: 'rgb(201,150,58)', color: 'white', border: 'none',
              borderRadius: '50px', padding: '0.75rem 2rem',
              fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(201,150,58,0.4)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Request Custom Order
          </button>
        </div>
      </div>

      <style>{`
        @keyframes menuSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
