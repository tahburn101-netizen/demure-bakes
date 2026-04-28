import { useEffect, useState } from 'react';
import { getSiteContent } from '../api';

const API_BASE = 'https://demure-bakes-backend-production.up.railway.app';

export default function About() {
  const [content, setContent] = useState({});

  useEffect(() => {
    getSiteContent().then(setContent).catch(() => {});
  }, []);

  const c = (key, fallback) => content[key] !== undefined ? content[key] : fallback;

  return (
    <section id="about" style={{ background: 'rgb(250,247,242)', padding: '5rem 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="about-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
        }}>
          {/* Image side */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '24px', overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(61,35,20,0.2)',
              aspectRatio: '4/3',
            }}>
              <img
                src={`${API_BASE}/uploads/about-oreo-brownie.jpg`}
                alt="Demure Bakes - Oreo Brownie"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = `${API_BASE}/uploads/oreo-brownie-slab-1.jpg`;
                }}
              />
            </div>
            {/* Floating badge */}
            <div style={{
              position: 'absolute', bottom: '-16px', right: '-16px',
              background: 'rgb(201,150,58)', borderRadius: '20px',
              padding: '1rem 1.25rem', textAlign: 'center',
              boxShadow: '0 8px 24px rgba(201,150,58,0.4)',
            }}>
              <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.75rem', color: 'white', lineHeight: 1 }}>100%</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', marginTop: '2px' }}>Homemade</div>
            </div>
            {/* Decorative circle */}
            <div style={{
              position: 'absolute', top: '-20px', left: '-20px',
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(237,232,223,0.8)', zIndex: -1,
            }} />
          </div>

          {/* Text side */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.25)',
              borderRadius: '50px', padding: '0.35rem 1rem', marginBottom: '1.25rem',
            }}>
              <span style={{ fontSize: '0.9rem' }}>🧁</span>
              <span style={{
                fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem',
                color: 'rgb(107,79,58)', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{c('about_badge', 'About Us')}</span>
            </div>

            <h2 style={{
              fontFamily: '"Baloo 2", cursive', fontWeight: 800,
              fontSize: 'clamp(2rem,4vw,2.75rem)', color: 'rgb(61,35,20)',
              margin: '0 0 1.25rem 0', lineHeight: 1.2,
            }}>
              {c('about_heading1', 'Baked with love,')}<br />
              <span style={{ color: 'rgb(201,150,58)' }}>{c('about_heading2', 'served with joy')}</span>
            </h2>

            <p style={{
              fontFamily: 'Nunito, sans-serif', fontSize: '1.05rem',
              color: 'rgb(107,79,58)', lineHeight: 1.75, margin: '0 0 1rem 0',
            }}>
              {c('about_para1', 'Demure Bakes is a home-based artisan bakery dedicated to crafting indulgent treats that bring people together. Every brownie, cupcake, and gift box is made fresh to order using premium ingredients.')}
            </p>

            <p style={{
              fontFamily: 'Nunito, sans-serif', fontSize: '1.05rem',
              color: 'rgb(107,79,58)', lineHeight: 1.75, margin: '0 0 2rem 0',
            }}>
              {c('about_para2', "We believe that great bakes deserve great ingredients — no shortcuts, no compromise. Whether it's a birthday, a special occasion, or simply a treat for yourself, we pour our heart into every single order.")}
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { numKey: 'about_stat1_num', labelKey: 'about_stat1_label', numFallback: '500+', labelFallback: 'Happy Customers' },
                { numKey: 'about_stat2_num', labelKey: 'about_stat2_label', numFallback: '50+', labelFallback: 'Flavour Combos' },
                { numKey: 'about_stat3_num', labelKey: 'about_stat3_label', numFallback: '100%', labelFallback: 'Fresh to Order' },
              ].map(stat => (
                <div key={stat.labelKey} style={{
                  background: 'white', borderRadius: '16px', padding: '1rem',
                  textAlign: 'center', boxShadow: '0 4px 16px rgba(61,35,20,0.06)',
                  border: '1px solid rgba(201,150,58,0.15)',
                }}>
                  <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: 'rgb(201,150,58)' }}>
                    {c(stat.numKey, stat.numFallback)}
                  </div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: 'rgb(107,79,58)', fontWeight: 600 }}>
                    {c(stat.labelKey, stat.labelFallback)}
                  </div>
                </div>
              ))}
            </div>

            {/* Values */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: '🌿', text: 'Fresh, quality ingredients in every batch' },
                { icon: '🎨', text: 'Fully customisable for any occasion' },
                { icon: '📦', text: 'Beautiful packaging — perfect for gifting' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(201,150,58,0.1)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
                  }}>{item.icon}</div>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem', color: 'rgb(107,79,58)', fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
