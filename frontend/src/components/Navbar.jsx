import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Menu', id: 'menu' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(245, 240, 232, 0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      boxShadow: scrolled ? '0 2px 20px rgba(61,43,31,0.1)' : 'none',
      padding: '0 1.5rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
      }}>
        {/* Logo */}
        <button
          onClick={() => scrollTo('home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0',
          }}
        >
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.5rem',
            fontWeight: '700',
            fontStyle: 'italic',
            color: '#c8a84b',
            letterSpacing: '-0.5px',
          }}>Demure</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.5rem',
            fontWeight: '400',
            color: '#3d2b1f',
            marginLeft: '6px',
          }}>Bakes</span>
        </button>

        {/* Desktop Nav */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }} className="desktop-nav">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#3d2b1f',
                transition: 'color 0.2s',
                padding: '0.25rem 0',
                position: 'relative',
              }}
              onMouseEnter={e => e.target.style.color = '#c8a84b'}
              onMouseLeave={e => e.target.style.color = '#3d2b1f'}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('contact')}
            style={{
              background: '#3d2b1f',
              color: '#f5f0e8',
              border: 'none',
              borderRadius: '50px',
              padding: '0.6rem 1.5rem',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.target.style.background = '#5c3d2e'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.background = '#3d2b1f'; e.target.style.transform = 'translateY(0)'; }}
          >
            Order Now
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            flexDirection: 'column',
            gap: '5px',
            padding: '4px',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <span style={{ width: '24px', height: '2px', background: '#3d2b1f', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
          <span style={{ width: '24px', height: '2px', background: '#3d2b1f', display: 'block', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }}></span>
          <span style={{ width: '24px', height: '2px', background: '#3d2b1f', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(245, 240, 232, 0.98)',
          backdropFilter: 'blur(10px)',
          padding: '1rem 1.5rem 1.5rem',
          borderTop: '1px solid rgba(200,168,75,0.2)',
        }}>
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                fontWeight: '500',
                color: '#3d2b1f',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(200,168,75,0.15)',
              }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('contact')}
            style={{
              marginTop: '1rem',
              width: '100%',
              background: '#3d2b1f',
              color: '#f5f0e8',
              border: 'none',
              borderRadius: '50px',
              padding: '0.75rem',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Order Now
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
