import { useEffect, useState } from 'react';
import { getSiteContent } from '../api';

const STEP_ICONS = ['🛒', '📝', '🎨', '🎁'];

export default function HowItWorks() {
  const [content, setContent] = useState({});

  useEffect(() => {
    getSiteContent().then(setContent).catch(() => {});
  }, []);

  const c = (key, fallback) => content[key] !== undefined ? content[key] : fallback;

  const steps = [
    { icon: STEP_ICONS[0], number: '1', title: c('how_step1_title', 'Browse & Choose'), desc: c('how_step1_desc', 'Pick your favourite treats or request something bespoke.') },
    { icon: STEP_ICONS[1], number: '2', title: c('how_step2_title', 'Place Your Order'), desc: c('how_step2_desc', 'Fill in your details and confirm with a 20% deposit via bank transfer.') },
    { icon: STEP_ICONS[2], number: '3', title: c('how_step3_title', 'We Bake with Love'), desc: c('how_step3_desc', 'Your order is freshly baked to perfection for your collection date.') },
    { icon: STEP_ICONS[3], number: '4', title: c('how_step4_title', 'Collect & Enjoy'), desc: c('how_step4_desc', 'Pick up your beautiful treats and dive into happiness!') },
  ];

  return (
    <section id="how-it-works" style={{ padding: '5rem 0', background: '#ede7d9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Label */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem',
        }}>
          <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
          <span style={{ fontFamily: "'Baloo 2', cursive", fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c8a84b' }}>How It Works</span>
          <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>✦</span>
        </div>

        <h2 style={{
          fontFamily: '"Baloo 2", cursive',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          fontWeight: '800',
          color: '#2c1810',
          textAlign: 'center',
          marginBottom: '3rem',
        }}>
          {c('how_heading', 'Simple & Sweet Process')}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              textAlign: 'center',
              padding: '2rem 1.5rem',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '16px',
              border: '1px solid rgba(200,168,75,0.15)',
              transition: 'all 0.3s ease',
              position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(61,43,31,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Step number */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#c8a84b', color: '#3d2b1f',
                fontFamily: '"Baloo 2", cursive', fontWeight: '700', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                {step.number}
              </div>

              {/* Icon */}
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'rgba(200,168,75,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem', fontSize: '2rem',
              }}>
                {step.icon}
              </div>

              <h3 style={{
                fontFamily: '"Baloo 2", cursive', fontSize: '1.1rem', fontWeight: '700',
                color: '#2c1810', marginBottom: '0.6rem',
              }}>
                {step.title}
              </h3>
              <p style={{
                fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem',
                color: '#8b6347', lineHeight: '1.6',
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
        {/* Video embed — How to Order */}
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem',
            color: 'rgb(107,79,58)', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '0.75rem',
          }}>Watch how it works</p>
          <div style={{
            position: 'relative', paddingBottom: '56.25%', height: 0,
            borderRadius: '20px', overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(61,35,20,0.15)',
            maxWidth: '640px', margin: '0 auto',
          }}>
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="How to order from Demure Bakes"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
              }}
            />
          </div>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem',
            color: 'rgb(107,79,58)', marginTop: '0.75rem',
          }}>
            You can update this video URL from the Admin Panel → Site Text
          </p>
        </div>
      </div>
    </section>
  );
}
