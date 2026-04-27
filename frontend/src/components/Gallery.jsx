import React, { useState, useEffect } from 'react';
import { getGallery } from '../api';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    getGallery()
      .then(data => setImages(data))
      .catch(() => setImages([]));
  }, []);

  return (
    <section id="gallery" style={{ padding: '5rem 0', background: '#f5f0e8' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Label */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem',
        }}>
          <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c8a84b' }}>Gallery</span>
          <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          fontWeight: '700',
          color: '#2c1810',
          textAlign: 'center',
          marginBottom: '0.5rem',
        }}>
          A peek at our latest creations
        </h2>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <a
            href="https://instagram.com/demure.bakes"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              color: '#c8a84b',
              textDecoration: 'none',
              fontWeight: '500',
              border: '1.5px dashed #c8a84b',
              padding: '0.4rem 1rem',
              borderRadius: '50px',
              display: 'inline-block',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.target.style.background = '#c8a84b'; e.target.style.color = '#3d2b1f'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#c8a84b'; }}
          >
            @demure.bakes
          </a>
        </div>

        {/* Gallery grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}
        className="gallery-grid-responsive"
        >
          {images.map((img, i) => (
            <div
              key={img.id}
              onClick={() => setLightbox(i)}
              style={{
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                background: '#ede7d9',
              }}
            >
              <img
                src={img.url}
                alt={img.alt || 'Demure Bakes creation'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease',
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(61,43,31,0)',
                transition: 'background 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(61,43,31,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(61,43,31,0)'}
              >
                <span style={{ color: 'white', fontSize: '1.5rem', opacity: 0, transition: 'opacity 0.3s' }}>🔍</span>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram follow button */}
        <div style={{ textAlign: 'center' }}>
          <a
            href="https://instagram.com/demure.bakes"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#3d2b1f',
              color: '#f5f0e8',
              padding: '0.75rem 2rem',
              borderRadius: '50px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5c3d2e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#3d2b1f'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Follow on Instagram
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >×</button>
          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              style={{
                position: 'absolute',
                left: '1rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
              }}
            >‹</button>
          )}
          <img
            src={images[lightbox]?.url}
            alt={images[lightbox]?.alt}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }}
            onClick={e => e.stopPropagation()}
          />
          {lightbox < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              style={{
                position: 'absolute',
                right: '1rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
              }}
            >›</button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .gallery-grid-responsive { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .gallery-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
