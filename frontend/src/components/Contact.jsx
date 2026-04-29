import React, { useState, useEffect } from 'react';
import { getBankDetails, getSiteContent } from '../api';

export default function Contact({ onOrderClick }) {
  const [bankDetails, setBankDetails] = useState(null);
  const [showBank, setShowBank] = useState(false);
  const [content, setContent] = useState({});

  useEffect(() => {
    getBankDetails().then(data => setBankDetails(data)).catch(() => {});
    getSiteContent().then(setContent).catch(() => {});
  }, []);

  const c = (key, fallback) => content[key] !== undefined ? content[key] : fallback;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const hasBankDetails = bankDetails && (bankDetails.account_name || bankDetails.account_number);
  const instagramHandle = c('contact_instagram', '@demurebakes');
  const instagramUrl = `https://instagram.com/${instagramHandle.replace('@', '')}`;
  const email = c('contact_email', 'hello@demurebakes.co.uk');

  return (
    <>
      {/* Contact Section */}
      <section id="contact" style={{
        padding: '5rem 0',
        background: '#3d2b1f',
        color: '#f5f0e8',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          {/* Label */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem',
          }}>
            <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
            <span style={{ fontFamily: '"Baloo 2", cursive', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c8a84b' }}>Get in Touch</span>
            <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
          </div>

          <h2 style={{
            fontFamily: '"Baloo 2", cursive',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            color: '#f5f0e8',
            marginBottom: '1rem',
          }}>
            {c('contact_heading', "Let's Create Something Sweet")}
          </h2>

          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '1rem',
            color: 'rgba(245,240,232,0.75)',
            lineHeight: '1.7',
            marginBottom: '2.5rem',
            maxWidth: '500px',
            margin: '0 auto 2.5rem',
          }}>
            {c('contact_subheading', "Have a question or want to discuss a custom order? We'd love to hear from you.")}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a
              href="/order"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#c8a84b',
                color: '#3d2b1f',
                padding: '0.85rem 2rem',
                borderRadius: '50px',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '0.9rem',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#d4b96a'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#c8a84b'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              🎂 Place an Order
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                color: '#f5f0e8',
                padding: '0.8rem 2rem',
                borderRadius: '50px',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '0.9rem',
                fontWeight: '600',
                textDecoration: 'none',
                border: '2px solid rgba(245,240,232,0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f5f0e8'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              {instagramHandle}
            </a>

            {email && (
              <a
                href={`mailto:${email}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  color: '#f5f0e8',
                  padding: '0.8rem 2rem',
                  borderRadius: '50px',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  border: '2px solid rgba(245,240,232,0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f5f0e8'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                ✉️ {email}
              </a>
            )}
          </div>

          {/* Bank Details (if set) */}
          {hasBankDetails && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowBank(!showBank)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#f5f0e8',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50px',
                  padding: '0.5rem 1.25rem',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                {showBank ? 'Hide' : 'View'} Bank Details for Payment
              </button>

              {showBank && (
                <div style={{
                  marginTop: '1rem',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'inline-block',
                  textAlign: 'left',
                  minWidth: '260px',
                }}>
                  {bankDetails.bank_name && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: '600', display: 'block' }}>Bank</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem' }}>{bankDetails.bank_name}</span>
                    </div>
                  )}
                  {bankDetails.account_name && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: '600', display: 'block' }}>Account Name</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem' }}>{bankDetails.account_name}</span>
                    </div>
                  )}
                  {bankDetails.account_number && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: '600', display: 'block' }}>Account Number</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem' }}>{bankDetails.account_number}</span>
                    </div>
                  )}
                  {bankDetails.sort_code && (
                    <div>
                      <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: '600', display: 'block' }}>Sort Code</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem' }}>{bankDetails.sort_code}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#2c1810',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <button
          onClick={() => scrollTo('home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{
            fontFamily: '"Baloo 2", cursive',
            fontSize: '1.1rem',
            fontWeight: '800',
            fontStyle: 'italic',
            color: '#c8a84b',
          }}>Demure</span>
          <span style={{
            fontFamily: '"Baloo 2", cursive',
            fontSize: '1.1rem',
            fontWeight: '400',
            color: '#f5f0e8',
            marginLeft: '5px',
          }}>Bakes</span>
        </button>

        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '0.8rem',
          color: 'rgba(245,240,232,0.5)',
          textAlign: 'center',
        }}>
          {c('footer_tagline', 'Handcrafted with love, delivered with joy.')} · © {new Date().getFullYear()} Demure Bakes
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="/track"
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.8rem',
              color: 'rgba(245,240,232,0.65)',
              textDecoration: 'none',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#c8a84b'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,240,232,0.65)'}
          >
            🔍 Track Your Order
          </a>
          <a
            href="/admin"
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.8rem',
              color: 'rgba(245,240,232,0.4)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = '#c8a84b'}
            onMouseLeave={e => e.target.style.color = 'rgba(245,240,232,0.4)'}
          >
            Admin
          </a>
        </div>
      </footer>
    </>
  );
}
