import React from 'react';
import { BACKEND_URL } from '../api';

export default function About() {
  const stats = [
    { value: '250+', label: 'Happy Customers' },
    { value: '100%', label: 'Fresh Baked' },
    { value: 'Bespoke', label: 'Orders Welcome' },
  ];

  return (
    <section id="about" style={{ padding: '5rem 0', background: '#f5f0e8' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
      }}
      className="about-grid"
      >
        {/* Left: Image */}
        <div style={{ position: 'relative' }}>
          <div style={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(61,43,31,0.15)',
            aspectRatio: '4/3',
          }}>
            <img
              src={`${BACKEND_URL}/uploads/oreo-brownie-slab-1.jpg`}
              alt="Demure Bakes brownies"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {/* Decorative element */}
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '3px dashed rgba(200,168,75,0.3)',
            zIndex: -1,
          }} />
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '-15px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(200,168,75,0.1)',
            zIndex: -1,
          }} />
        </div>

        {/* Right: Content */}
        <div>
          {/* Label */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem',
          }}>
            <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c8a84b' }}>About Us</span>
            <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: '700',
            color: '#2c1810',
            marginBottom: '1.25rem',
            lineHeight: '1.2',
          }}>
            Made with Love, Baked to Perfection
          </h2>

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            color: '#5c3d2e',
            lineHeight: '1.8',
            marginBottom: '2rem',
          }}>
            At Demure Bakes, every treat is made from scratch using the finest ingredients. From indulgent Oreo brownies to elegant celebration cupcakes, we pour our heart into every bake. Whether it's a birthday, wedding, or just a Tuesday — we believe every moment deserves something sweet.
          </p>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
          }}>
            {stats.map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                padding: '1.25rem 1rem',
                textAlign: 'center',
                border: '1px solid rgba(200,168,75,0.15)',
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#c8a84b',
                  marginBottom: '0.25rem',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  color: '#8b6347',
                  fontWeight: '500',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}
