import React from 'react';

const steps = [
  { icon: '🛒', number: '1', title: 'Browse & Choose', desc: 'Pick your favourite treats or request something bespoke.' },
  { icon: '📝', number: '2', title: 'Place Your Order', desc: 'Fill in your details and confirm with a 20% deposit via bank transfer.' },
  { icon: '🎨', number: '3', title: 'We Bake with Love', desc: 'Your order is freshly baked to perfection for your collection date.' },
  { icon: '🎁', number: '4', title: 'Collect & Enjoy', desc: 'Pick up your beautiful treats and dive into happiness!' },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: '5rem 0', background: '#ede7d9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Label */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem',
        }}>
          <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c8a84b' }}>How It Works</span>
          <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          fontWeight: '700',
          color: '#2c1810',
          textAlign: 'center',
          marginBottom: '3rem',
        }}>
          Simple &amp; Sweet Process
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              textAlign: 'center',
              padding: '2rem 1.5rem',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '16px',
              border: '1px solid rgba(200,168,75,0.15)',
              transition: 'all 0.3s ease',
              position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(61,43,31,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Step number */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#c8a84b',
                color: '#3d2b1f',
                fontFamily: "'Playfair Display', serif",
                fontWeight: '700',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                {step.number}
              </div>

              {/* Icon */}
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(200,168,75,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '2rem',
              }}>
                {step.icon}
              </div>

              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#2c1810',
                marginBottom: '0.6rem',
              }}>
                {step.title}
              </h3>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                color: '#8b6347',
                lineHeight: '1.6',
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
