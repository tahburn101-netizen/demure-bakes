import React, { useState, useEffect } from 'react';
import { getInstagramFeed } from '../api';

export default function Gallery() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('gallery');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    getInstagramFeed()
      .then(data => {
        setPosts(data.posts || []);
        setSource(data.source || 'gallery');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="gallery" style={{ background: 'rgb(237,232,223)', padding: '5rem 0' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.25)',
            borderRadius: '50px', padding: '0.35rem 1rem', marginBottom: '1rem',
          }}>
            <span style={{ fontSize: '0.9rem' }}>📸</span>
            <span style={{
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem',
              color: 'rgb(107,79,58)', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Gallery</span>
          </div>
          <h2 style={{
            fontFamily: '"Baloo 2", cursive', fontWeight: 800,
            fontSize: 'clamp(2rem,4vw,3rem)', color: 'rgb(61,35,20)', margin: '0 0 0.75rem 0',
          }}>
            Fresh from the Kitchen
          </h2>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontSize: '1.05rem',
            color: 'rgb(107,79,58)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6,
          }}>
            {source === 'instagram'
              ? 'Latest from our Instagram @demurebakes — updated automatically with every new post'
              : 'A look at our latest creations — follow us on Instagram for more'}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '3px solid rgba(201,150,58,0.2)', borderTopColor: 'rgb(201,150,58)',
              animation: 'gallerySpin 0.8s linear infinite', margin: '0 auto 1rem',
            }} />
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem',
            }}>
              {posts.map((post, i) => (
                <div
                  key={post.id || i}
                  onClick={() => setLightbox(post)}
                  style={{
                    borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                    position: 'relative', aspectRatio: '1', background: 'rgb(237,232,223)',
                    boxShadow: '0 4px 16px rgba(61,35,20,0.08)', transition: 'transform 0.3s, box-shadow 0.3s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(61,35,20,0.18)';
                    const overlay = e.currentTarget.querySelector('.gal-overlay');
                    if (overlay) overlay.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(61,35,20,0.08)';
                    const overlay = e.currentTarget.querySelector('.gal-overlay');
                    if (overlay) overlay.style.opacity = '0';
                  }}
                >
                  <img
                    src={post.thumbnail || post.url}
                    alt={post.caption || post.alt || `Gallery ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                  <div
                    className="gal-overlay"
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(61,35,20,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.3s',
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid rgba(255,255,255,0.5)',
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instagram CTA */}
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <a
                href="https://www.instagram.com/demurebakes"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  color: 'white', textDecoration: 'none',
                  borderRadius: '50px', padding: '0.75rem 1.75rem',
                  fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.95rem',
                  boxShadow: '0 4px 16px rgba(220,39,67,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,39,67,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(220,39,67,0.3)'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                Follow @demurebakes on Instagram
              </a>
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', cursor: 'pointer',
          }}
          onClick={() => setLightbox(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.caption || lightbox.alt || 'Gallery'}
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '16px', objectFit: 'contain', display: 'block' }}
            />
            {lightbox.caption && (
              <p style={{
                fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)',
                textAlign: 'center', margin: '0.75rem 0 0 0',
              }}>
                {lightbox.caption}
              </p>
            )}
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: '-12px', right: '-12px',
                background: 'white', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', color: 'rgb(61,35,20)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >✕</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes gallerySpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
