import React, { useState, useEffect } from 'react';
import api from '../api';

export default function SlotBanner({ onOrderClick }) {
  const [slots, setSlots] = useState(null);

  useEffect(() => {
    api.get('/api/slots')
      .then(r => setSlots(r.data))
      .catch(() => {});
  }, []);

  if (!slots || !slots.show_counter) return null;
  if (slots.slots_remaining <= 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgb(185,28,28) 0%, rgb(220,38,38) 100%)',
        color: 'white', textAlign: 'center', padding: '0.75rem 1.5rem',
        fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem',
      }}>
        ❌ No slots available {slots.week_label} — check back soon or{' '}
        <a href="https://instagram.com/demurebakes" target="_blank" rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'underline' }}>
          follow us on Instagram
        </a>{' '}for updates.
      </div>
    );
  }

  const urgency = slots.slots_remaining <= 2;

  return (
    <div style={{
      background: urgency
        ? 'linear-gradient(135deg, rgb(201,150,58) 0%, rgb(220,100,30) 100%)'
        : 'linear-gradient(135deg, rgb(61,35,20) 0%, rgb(107,79,58) 100%)',
      color: 'rgb(237,232,223)', textAlign: 'center', padding: '0.75rem 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
      flexWrap: 'wrap',
    }}>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>
        {urgency ? '🔥' : '🎂'}{' '}
        <strong>Only {slots.slots_remaining} slot{slots.slots_remaining !== 1 ? 's' : ''} left</strong>{' '}
        for {slots.week_label}!
      </span>
      <a
        href="/order"
        style={{
          background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
          color: 'white', borderRadius: '50px', padding: '0.3rem 1rem',
          fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.8rem',
          cursor: 'pointer', transition: 'all 0.2s',
          textDecoration: 'none', display: 'inline-block',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
      >
        Order Now →
      </a>
    </div>
  );
}
