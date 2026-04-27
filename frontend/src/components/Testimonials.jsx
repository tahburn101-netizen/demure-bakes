import React, { useState, useEffect } from 'react';
import { getTestimonials } from '../api';

function StarRating({ rating = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= rating ? '#c8a84b' : '#ddd', fontSize: '1rem' }}>★</span>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }) {
  const initials = testimonial.author.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = ['#c8a84b', '#8b6347', '#5c3d2e', '#a8882b', '#d4b96a'];
  const color = colors[testimonial.author.charCodeAt(0) % colors.length];

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '1.75rem',
      boxShadow: '0 2px 12px rgba(61,43,31,0.07)',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(200,168,75,0.1)',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(61,43,31,0.12)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(61,43,31,0.07)'; }}
    >
      <StarRating rating={testimonial.rating} />
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.9rem',
        color: '#5c3d2e',
        lineHeight: '1.7',
        fontStyle: 'italic',
        marginBottom: '1.25rem',
      }}>
        "{testimonial.text}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: color,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Playfair Display', serif",
          fontWeight: '700',
          fontSize: '0.9rem',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#2c1810',
        }}>
          {testimonial.author}
        </span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    getTestimonials()
      .then(data => setTestimonials(data))
      .catch(() => setTestimonials([]));
  }, []);

  return (
    <section style={{ padding: '5rem 0', background: '#ede7d9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Label */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem',
        }}>
          <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c8a84b' }}>Reviews</span>
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
          What Our Customers Say
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {testimonials.map(t => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
