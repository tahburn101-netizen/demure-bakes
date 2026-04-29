import React, { useState, useEffect } from 'react';

export default function Navbar({ onOrderClick }) {
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
    { label: 'Home', id: 'hero' },
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
      transition: 'all 0.3s',
      background: scrolled ? 'rgba(237, 232, 223, 0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      boxShadow: scrolled ? '0 2px 16px rgba(61, 35, 20, 0.08)' : 'none',
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <button
          onClick={() => scrollTo('hero')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
        >
          <span style={{
            fontFamily: '"Baloo 2", cursive',
            fontWeight: 800,
            fontSize: '1.5rem',
            color: 'rgb(201, 150, 58)',
            letterSpacing: '-0.01em',
          }}>Demure</span>
          <span style={{
            fontFamily: '"Baloo 2", cursive',
            fontWeight: 400,
            fontSize: '1.5rem',
            color: 'rgb(107, 79, 58)',
          }}>Bakes</span>
        </button>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'rgb(107, 79, 58)',
                transition: 'color 0.2s',
                padding: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgb(201, 150, 58)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgb(107, 79, 58)'}
            >
              {link.label}
            </button>
          ))}
          <a
            href="/order"
            style={{
              background: 'rgb(61, 35, 20)',
              color: 'rgb(237, 232, 223)',
              border: 'none',
              borderRadius: '50px',
              padding: '0.5rem 1.25rem',
              fontFamily: '"Baloo 2", cursive',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(61,35,20,0.2)',
              textDecoration: 'none',
              display: 'inline-block',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(61,35,20,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(61,35,20,0.2)'; }}
          >
            Order Now
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'rgb(107, 79, 58)' }}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(237, 232, 223, 0.98)',
          backdropFilter: 'blur(12px)',
          padding: '1rem 1.5rem 1.5rem',
          borderTop: '1px solid rgba(201, 150, 58, 0.2)',
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
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                fontSize: '1rem',
                color: 'rgb(107, 79, 58)',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(201, 150, 58, 0.15)',
              }}
            >
              {link.label}
            </button>
          ))}
          <a
            href="/order"
            style={{
              marginTop: '1rem',
              display: 'block',
              width: '100%',
              background: 'rgb(61, 35, 20)',
              color: 'rgb(237, 232, 223)',
              border: 'none',
              borderRadius: '50px',
              padding: '0.75rem',
              fontFamily: '"Baloo 2", cursive',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            Order Now
          </a>
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
