import React, { useRef, useEffect } from 'react';
import { BACKEND_URL } from '../api';

export default function Hero() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#f5f0e8',
      }}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.35,
        }}
      >
        <source src={`${BACKEND_URL}/uploads/hero-video.mp4`} type="video/mp4" />
      </video>

      {/* Gradient overlay for readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(245,240,232,0.88) 0%, rgba(245,240,232,0.70) 50%, rgba(245,240,232,0.45) 100%)',
        zIndex: 1,
      }} />

      {/* Decorative floating elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '5%',
        width: '8px',
        height: '8px',
        background: '#c8a84b',
        borderRadius: '50%',
        opacity: 0.5,
        zIndex: 2,
        animation: 'float 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '8%',
        width: '5px',
        height: '5px',
        background: '#c8a84b',
        borderRadius: '50%',
        opacity: 0.4,
        zIndex: 2,
        animation: 'float 5s ease-in-out infinite 1s',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: '12%',
        fontSize: '1.5rem',
        opacity: 0.15,
        zIndex: 2,
        animation: 'float 6s ease-in-out infinite 0.5s',
      }}>✦</div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        alignItems: 'center',
        paddingTop: '80px',
      }}
      className="hero-grid"
      >
        {/* Left: Text */}
        <div style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            fontWeight: '600',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#c8a84b',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            ✦ Handcrafted with Love ✦
          </p>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '700',
            lineHeight: '1.1',
            marginBottom: '1.25rem',
          }}>
            <span style={{ color: '#2c1810', display: 'block' }}>Dive into</span>
            <span style={{
              color: '#c8a84b',
              display: 'block',
              fontStyle: 'italic',
            }}>Happiness</span>
          </h1>

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            color: '#5c3d2e',
            lineHeight: '1.7',
            marginBottom: '2rem',
            maxWidth: '420px',
          }}>
            Handcrafted brownies, cupcakes &amp; bespoke celebration cakes made with love in the UK
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button
              onClick={() => scrollTo('contact')}
              style={{
                background: '#3d2b1f',
                color: '#f5f0e8',
                border: 'none',
                borderRadius: '50px',
                padding: '0.85rem 2rem',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(61,43,31,0.25)',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(61,43,31,0.35)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(61,43,31,0.25)'; }}
            >
              Order Now
            </button>
            <button
              onClick={() => scrollTo('menu')}
              style={{
                background: 'transparent',
                color: '#3d2b1f',
                border: '2px solid #3d2b1f',
                borderRadius: '50px',
                padding: '0.8rem 2rem',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.target.style.background = '#3d2b1f'; e.target.style.color = '#f5f0e8'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#3d2b1f'; e.target.style.transform = 'translateY(0)'; }}
            >
              View Menu
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['🧁', '🍫', '🎂', '🍰'].map((emoji, i) => (
                <span key={i} style={{ fontSize: '1.4rem' }}>{emoji}</span>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: '#c8a84b', fontSize: '0.75rem' }}>★</span>
                ))}
              </div>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8rem',
                color: '#5c3d2e',
                fontWeight: '500',
              }}>250+ happy customers</span>
            </div>
            <div style={{
              height: '30px',
              width: '1px',
              background: 'rgba(92,61,46,0.2)',
            }} />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              color: '#5c3d2e',
              fontWeight: '500',
            }}>Made with Love</span>
          </div>
        </div>

        {/* Right: Circular image / logo display */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          animation: 'fadeIn 1s ease 0.3s both',
        }}>
          {/* Outer decorative ring */}
          <div style={{
            width: 'clamp(280px, 40vw, 420px)',
            height: 'clamp(280px, 40vw, 420px)',
            borderRadius: '50%',
            border: '2px dashed rgba(200,168,75,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            animation: 'float 6s ease-in-out infinite',
          }}>
            {/* Inner circle with background */}
            <div style={{
              width: '90%',
              height: '90%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(200,168,75,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(61,43,31,0.15)',
            }}>
              {/* Demure Bakes branding text */}
              <div style={{
                textAlign: 'center',
                padding: '2rem',
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: '700',
                  fontStyle: 'italic',
                  color: '#c8a84b',
                  letterSpacing: '0.05em',
                  lineHeight: '1',
                }}>DEMURE</div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(0.8rem, 1.5vw, 1.1rem)',
                  fontWeight: '400',
                  color: '#3d2b1f',
                  letterSpacing: '0.3em',
                  marginTop: '4px',
                }}>BAKES</div>
                <div style={{
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '2rem' }}>🧁</span>
                  <span style={{ fontSize: '2rem' }}>🍫</span>
                </div>
              </div>
            </div>

            {/* Floating badge: Bespoke Orders */}
            <div style={{
              position: 'absolute',
              top: '15%',
              right: '-5%',
              background: 'rgba(200,168,75,0.9)',
              color: '#3d2b1f',
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(200,168,75,0.3)',
              animation: 'float 4s ease-in-out infinite 0.5s',
              whiteSpace: 'nowrap',
            }}>
              ✦ Bespoke Orders
            </div>

            {/* Floating badge: Made with Love */}
            <div style={{
              position: 'absolute',
              bottom: '18%',
              right: '-8%',
              background: 'rgba(255,255,255,0.95)',
              color: '#3d2b1f',
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(61,43,31,0.15)',
              animation: 'float 5s ease-in-out infinite 1s',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}>
              <span style={{ color: '#e91e63' }}>♥</span> Made with Love
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: 0.6,
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          color: '#5c3d2e',
          textTransform: 'uppercase',
        }}>Scroll</span>
        <div style={{
          width: '1px',
          height: '30px',
          background: 'linear-gradient(to bottom, #c8a84b, transparent)',
          animation: 'scrollBounce 2s ease-in-out infinite',
        }} />
        <span style={{ color: '#c8a84b', fontSize: '0.8rem', animation: 'scrollBounce 2s ease-in-out infinite' }}>↓</span>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-grid > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
