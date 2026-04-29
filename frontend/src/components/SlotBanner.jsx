import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

export default function SlotBanner({ onOrderClick }) {
  const [slots, setSlots] = useState(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    api.get('/api/slots')
      .then(r => setSlots(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const shouldShow = Boolean(slots && slots.show_counter);

    if (!shouldShow) {
      root.style.setProperty('--slot-banner-height', '0px');
      return undefined;
    }

    const updateHeight = () => {
      const height = bannerRef.current?.offsetHeight || 0;
      root.style.setProperty('--slot-banner-height', `${height}px`);
    };

    updateHeight();

    let observer;
    if (typeof ResizeObserver !== 'undefined' && bannerRef.current) {
      observer = new ResizeObserver(updateHeight);
      observer.observe(bannerRef.current);
    }

    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      if (observer) observer.disconnect();
      root.style.setProperty('--slot-banner-height', '0px');
    };
  }, [slots]);

  if (!slots || !slots.show_counter) return null;
  if (slots.slots_remaining <= 0) {
    return (
      <div ref={bannerRef} style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
        background: 'linear-gradient(135deg, rgb(185,28,28) 0%, rgb(220,38,38) 100%)',
        color: 'white', textAlign: 'center', padding: '0.75rem 1.5rem',
        fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.9rem',
        boxSizing: 'border-box',
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
    <div ref={bannerRef} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
      background: urgency
        ? 'linear-gradient(135deg, rgb(201,150,58) 0%, rgb(220,100,30) 100%)'
        : 'linear-gradient(135deg, rgb(61,35,20) 0%, rgb(107,79,58) 100%)',
      color: 'rgb(237,232,223)', textAlign: 'center', padding: '0.75rem 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
      flexWrap: 'wrap', boxSizing: 'border-box',
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
