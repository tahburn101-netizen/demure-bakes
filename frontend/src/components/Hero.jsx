import React, { useEffect, useRef } from 'react';

const API_BASE = 'https://demure-bakes-backend-production.up.railway.app';

const Sparkle = ({ size, color, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <path
      d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
      fill={color}
    />
  </svg>
);

export default function Hero({ onOrderClick }) {
  const ringRef = useRef(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'rgb(237,232,223)',
        paddingTop: '64px',
      }}
    >
      {/* Soft background blobs */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-8%', right: '-4%',
          width: '42vw', height: '42vw', borderRadius: '50%',
          background: 'rgba(245,198,204,0.22)', filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-4%', left: '-4%',
          width: '32vw', height: '32vw', borderRadius: '50%',
          background: 'rgba(201,150,58,0.09)', filter: 'blur(50px)',
        }} />
      </div>

      {/* Animated sparkles */}
      <div aria-hidden="true" className="sparkle-wrap s1" style={{ position: 'absolute', top: '165px', left: '101px' }}>
        <Sparkle size={28} color="#F5C6CC" />
      </div>
      <div aria-hidden="true" className="sparkle-wrap s2" style={{ position: 'absolute', top: '275px', right: '126px' }}>
        <Sparkle size={20} color="#F5C6CC" />
      </div>
      <div aria-hidden="true" className="sparkle-wrap s3" style={{ position: 'absolute', top: '748px', left: '189px' }}>
        <Sparkle size={22} color="#C9963A" />
      </div>
      <div aria-hidden="true" className="sparkle-wrap s4" style={{ position: 'absolute', top: '120px', right: '300px' }}>
        <Sparkle size={16} color="#F5C6CC" />
      </div>
      <div aria-hidden="true" className="sparkle-wrap s5" style={{ position: 'absolute', bottom: '200px', left: '60px' }}>
        <Sparkle size={18} color="#C9963A" />
      </div>
      <div aria-hidden="true" className="sparkle-wrap s6" style={{ position: 'absolute', bottom: '120px', right: '200px' }}>
        <Sparkle size={24} color="#F5C6CC" />
      </div>

      {/* Main grid */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          paddingTop: '3rem',
          paddingBottom: '5rem',
        }}>

          {/* ── Left: Text ── */}
          <div className="hero-left">
            {/* Badge */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{
                fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                color: 'rgb(201,150,58)', textTransform: 'uppercase', letterSpacing: '0.15em',
              }}>✦ Handcrafted with Love ✦</span>
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily: '"Baloo 2", cursive', lineHeight: 1.05, marginBottom: '1.5rem', margin: 0 }}>
              <span className="anim-dive" style={{
                display: 'block',
                fontSize: 'clamp(3rem,7vw,5.5rem)',
                fontWeight: 800,
                color: 'rgb(61,35,20)',
                marginBottom: '0.1em',
              }}>Dive into</span>
              <span className="anim-happy" style={{
                display: 'block',
                fontSize: 'clamp(3rem,7vw,5.5rem)',
                fontWeight: 800,
                color: 'rgb(201,150,58)',
              }}>Happiness</span>
            </h1>

            {/* Subtext */}
            <p className="anim-sub" style={{
              fontFamily: 'Nunito, sans-serif', fontSize: '1.1rem',
              color: 'rgb(107,79,58)', maxWidth: '480px',
              margin: '1.5rem 0 2rem 0', lineHeight: 1.75,
            }}>
              Handcrafted brownies, cupcakes &amp; bespoke celebration cakes made with love in the UK
            </p>

            {/* Buttons */}
            <div className="anim-sub hero-btns" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <button
                className="btn-primary"
                onClick={onOrderClick}
              >
                Order Now
              </button>
              <button
                className="btn-outline-hero"
                onClick={() => scrollTo('menu')}
              >
                View Menu
              </button>
            </div>

            {/* Social proof */}
            <div className="anim-sub" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ display: 'flex' }}>
                {['🧁','🍫','🎂','🍰'].map((e, i) => (
                  <div key={i} style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgb(245,198,204)', border: '2px solid white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', marginLeft: i === 0 ? 0 : '-8px',
                  }}>{e}</div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#C9963A">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'rgb(160,136,120)', margin: 0 }}>
                  250+ happy customers
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: Video Circle ── */}
          <div className="hero-right" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="hero-float" style={{
              position: 'relative',
              width: 'min(420px, 90vw)',
              height: 'min(420px, 90vw)',
            }}>
              {/* Spinning dashed ring */}
              <div className="ring-spin" style={{
                position: 'absolute',
                inset: '-18px',
                borderRadius: '50%',
                border: '3px dashed rgba(201,150,58,0.35)',
              }} />

              {/* Soft glow */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,198,204,0.35) 0%, rgba(237,232,223,0) 70%)',
                pointerEvents: 'none',
              }} />

              {/* Video circle */}
              <div style={{
                position: 'relative', width: '100%', height: '100%',
                borderRadius: '50%', overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(61,35,20,0.2), 0 0 0 8px rgba(201,150,58,0.12)',
              }}>
                <video
                  autoPlay muted loop playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                >
                  <source src={`${API_BASE}/uploads/hero-video.mp4`} type="video/mp4" />
                </video>
              </div>

              {/* "Made with Love" badge — bottom right */}
              <div style={{
                position: 'absolute', bottom: '4%', right: '-6%',
                background: 'white', borderRadius: '16px',
                padding: '10px 16px', boxShadow: '0 8px 32px rgba(61,35,20,0.15)',
                display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#F5C6CC" stroke="#F5C6CC" strokeWidth="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.85rem', color: 'rgb(61,35,20)' }}>
                  Made with Love
                </span>
              </div>

              {/* "Bespoke Orders" badge — top left */}
              <div style={{
                position: 'absolute', top: '4%', left: '-6%',
                background: 'rgb(201,150,58)', borderRadius: '12px',
                padding: '8px 14px', boxShadow: '0 4px 16px rgba(201,150,58,0.4)',
                whiteSpace: 'nowrap',
              }}>
                <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.8rem', color: 'white' }}>
                  ✦ Bespoke Orders
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-bounce" style={{
        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'rgb(160,136,120)' }}>Scroll</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(160,136,120)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <style>{`
        /* ── Sparkle animations ── */
        @keyframes sparkle1 {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
        }
        @keyframes sparkle2 {
          0%, 100% { opacity: 0.2; transform: scale(0.9) rotate(0deg); }
          50% { opacity: 0.9; transform: scale(1.3) rotate(-15deg); }
        }
        @keyframes sparkle3 {
          0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(30deg); }
        }
        .sparkle-wrap { pointer-events: none; }
        .sparkle-wrap.s1 { animation: sparkle1 2.5s ease-in-out infinite; }
        .sparkle-wrap.s2 { animation: sparkle2 3s ease-in-out 0.5s infinite; }
        .sparkle-wrap.s3 { animation: sparkle3 2s ease-in-out 1s infinite; }
        .sparkle-wrap.s4 { animation: sparkle1 3.5s ease-in-out 0.3s infinite; }
        .sparkle-wrap.s5 { animation: sparkle2 2.8s ease-in-out 0.8s infinite; }
        .sparkle-wrap.s6 { animation: sparkle3 3.2s ease-in-out 0.2s infinite; }

        /* ── Spinning ring ── */
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ring-spin {
          animation: ringRotate 20s linear infinite;
        }

        /* ── Hero float ── */
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .hero-float {
          animation: heroFloat 4s ease-in-out infinite;
        }

        /* ── Text entrance ── */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .anim-dive { animation: slideUp 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }
        .anim-happy { animation: slideUp 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.5s both; }
        .anim-sub { animation: slideUp 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.7s both; }

        /* ── Scroll bounce ── */
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(7px); }
        }
        .scroll-bounce { animation: bounce 1.4s ease-in-out infinite; }

        /* ── Buttons ── */
        .btn-primary {
          font-family: "Baloo 2", cursive;
          font-weight: 700;
          font-size: 1rem;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          border: none;
          background: rgb(61,35,20);
          color: rgb(237,232,223);
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(61,35,20,0.25);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(61,35,20,0.35);
        }
        .btn-outline-hero {
          font-family: "Baloo 2", cursive;
          font-weight: 700;
          font-size: 1rem;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          border: 2px solid rgb(201,150,58);
          background: transparent;
          color: rgb(201,150,58);
          cursor: pointer;
          transition: transform 0.2s, background 0.2s, color 0.2s;
        }
        .btn-outline-hero:hover {
          background: rgb(201,150,58);
          color: white;
          transform: translateY(-2px);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center !important;
            padding-top: 2rem !important;
          }
          .hero-left {
            text-align: center !important;
            order: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-left p { margin-left: auto !important; margin-right: auto !important; }
          .hero-btns { justify-content: center !important; }
          .hero-right { order: 1; }
          .sparkle-wrap.s3 { display: none; }
        }
        @media (max-width: 640px) {
          .sparkle-wrap.s1, .sparkle-wrap.s4 { display: none; }
          .hero-float {
            width: min(300px, 80vw) !important;
            height: min(300px, 80vw) !important;
          }
        }
      `}</style>
    </section>
  );
}
