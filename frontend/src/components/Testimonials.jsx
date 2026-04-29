import React, { useState, useEffect, useRef } from 'react';
import { getTestimonials, getSiteContent } from '../api';

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '16px' }}>
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} width="18" height="18" viewBox="0 0 24 24"
        fill={s <= rating ? '#C9963A' : '#E8D5B7'}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [content, setContent] = useState({});
  const intervalRef = useRef(null);

  useEffect(() => {
    getTestimonials().then(setTestimonials).catch(() => {});
    getSiteContent().then(d => { if (d) setContent(d); }).catch(() => {});
  }, []);

  const startInterval = () => {
    clearInterval(intervalRef.current);
    if (testimonials.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent(c => (c + 1) % testimonials.length);
      }, 5000);
    }
  };

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, [testimonials.length]);

  const goTo = (idx) => {
    if (isAnimating || idx === current) return;
    clearInterval(intervalRef.current);
    setIsAnimating(true);
    setCurrent(idx);
    setTimeout(() => {
      setIsAnimating(false);
      startInterval();
    }, 400);
  };

  const goNext = () => testimonials.length && goTo((current + 1) % testimonials.length);
  const goPrev = () => testimonials.length && goTo((current - 1 + testimonials.length) % testimonials.length);

  if (testimonials.length === 0) return null;
  const t = testimonials[current];
  if (!t || !t.author) return null;

  return (
    <>
      <style>{`
        .testimonials-section {
          background: #EDE8DF;
          padding: 80px 0;
        }
        .testimonials-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px;
          text-align: center;
        }
        .testimonials-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(201, 150, 58, 0.15);
          border: 1px solid rgba(201, 150, 58, 0.3);
          border-radius: 50px;
          padding: 6px 18px;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #8B5E3C;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .testimonials-heading {
          font-family: 'Baloo 2', cursive;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          color: #3D2314;
          margin-bottom: 48px;
          line-height: 1.2;
        }
        .testimonials-heading span { color: #C9963A; }
        .testimonial-card {
          background: white;
          border-radius: 24px;
          padding: 48px 48px 40px;
          box-shadow: 0 8px 40px rgba(61, 35, 20, 0.1);
          position: relative;
          transition: opacity 0.4s ease, transform 0.4s ease;
          margin: 0 auto;
          max-width: 700px;
        }
        .testimonial-card.animating {
          opacity: 0;
          transform: scale(0.97);
        }
        .testimonial-quote-icon {
          position: absolute;
          top: -22px;
          left: 50%;
          transform: translateX(-50%);
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #C9963A, #E8B86D);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(201, 150, 58, 0.4);
        }
        .testimonial-text {
          font-family: 'Nunito', sans-serif;
          font-size: clamp(16px, 2vw, 18px);
          color: #5A3E2B;
          line-height: 1.8;
          font-style: italic;
          margin-bottom: 24px;
        }
        .testimonial-author-name {
          font-family: 'Baloo 2', cursive;
          font-size: 16px;
          font-weight: 700;
          color: #3D2314;
        }
        .testimonial-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 32px;
        }
        .testimonial-nav-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid rgba(201, 150, 58, 0.4);
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #C9963A;
        }
        .testimonial-nav-btn:hover {
          background: #C9963A;
          border-color: #C9963A;
          color: white;
          transform: scale(1.05);
        }
        .testimonial-dots { display: flex; gap: 8px; align-items: center; }
        .testimonial-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(201, 150, 58, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          padding: 0;
        }
        .testimonial-dot.active {
          background: #C9963A;
          width: 24px;
          border-radius: 4px;
        }
        .testimonial-counter {
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          color: #A08880;
          margin-top: 12px;
        }
        @media (max-width: 640px) {
          .testimonial-card { padding: 40px 24px 32px; }
        }
      `}</style>

      <section className="testimonials-section" id="reviews">
        <div className="testimonials-container">
          <div className="testimonials-badge">
            <span>⭐</span>
            <span>Customer Reviews</span>
          </div>
          <h2 className="testimonials-heading">
            {content.reviews_heading || <>What Our <span>Customers Say</span></>}
          </h2>

          <div className={`testimonial-card ${isAnimating ? 'animating' : ''}`}>
            <div className="testimonial-quote-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
              </svg>
            </div>

            <StarRating rating={t.rating || 5} />

            <p className="testimonial-text">"{t.text}"</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9963A, #E8B86D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: 18, color: 'white'
              }}>
                {(t.author || '?').charAt(0).toUpperCase()}
              </div>
              <span className="testimonial-author-name">{t.author}</span>
            </div>
          </div>

          {testimonials.length > 1 && (
            <div className="testimonial-nav">
              <button className="testimonial-nav-btn" onClick={goPrev} aria-label="Previous review">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <div className="testimonial-dots">
                {testimonials.map((_, idx) => (
                  <button key={idx} className={`testimonial-dot ${idx === current ? 'active' : ''}`}
                    onClick={() => goTo(idx)} aria-label={`Review ${idx + 1}`} />
                ))}
              </div>
              <button className="testimonial-nav-btn" onClick={goNext} aria-label="Next review">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}

          <p className="testimonial-counter">{current + 1} of {testimonials.length} reviews</p>
        </div>
      </section>
    </>
  );
}
