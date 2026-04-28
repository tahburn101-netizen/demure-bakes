import React, { useState, useEffect } from 'react';
import api from '../api';

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: open ? '0 8px 30px rgba(61,35,20,0.12)' : '0 2px 10px rgba(61,35,20,0.06)',
        transition: 'all 0.3s ease',
        border: open ? '1px solid rgba(201,150,58,0.3)' : '1px solid transparent',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: '1rem',
        }}
      >
        <span style={{
          fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem',
          color: open ? 'rgb(201,150,58)' : 'rgb(61,35,20)', lineHeight: 1.4,
          transition: 'color 0.2s',
        }}>
          {faq.question}
        </span>
        <span style={{
          flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
          background: open ? 'rgb(201,150,58)' : 'rgba(201,150,58,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s',
        }}>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke={open ? 'white' : 'rgb(201,150,58)'} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 1.5rem 1.25rem', borderTop: '1px solid rgba(201,150,58,0.1)' }}>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem',
            color: 'rgb(107,79,58)', lineHeight: 1.7, margin: '1rem 0 0 0',
          }}>
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/faqs')
      .then(r => { setFaqs(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || faqs.length === 0) return null;

  return (
    <section id="faq" style={{ background: 'rgb(250,247,242)', padding: '5rem 0' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.25)',
            borderRadius: '50px', padding: '0.35rem 1rem', marginBottom: '1rem',
          }}>
            <span style={{ fontSize: '0.9rem' }}>❓</span>
            <span style={{
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem',
              color: 'rgb(107,79,58)', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>FAQ</span>
          </div>
          <h2 style={{
            fontFamily: '"Baloo 2", cursive', fontWeight: 800,
            fontSize: 'clamp(2rem,4vw,2.75rem)', color: 'rgb(61,35,20)', margin: '0 0 0.75rem 0',
          }}>
            Frequently Asked Questions
          </h2>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontSize: '1.05rem',
            color: 'rgb(107,79,58)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6,
          }}>
            Everything you need to know before placing your order
          </p>
        </div>

        {/* FAQ List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, i) => (
            <FAQItem key={faq.id} faq={faq} index={i} />
          ))}
        </div>

        {/* Still have questions CTA */}
        <div style={{
          marginTop: '3rem', textAlign: 'center', padding: '2rem',
          background: 'linear-gradient(135deg, rgba(201,150,58,0.08) 0%, rgba(61,35,20,0.05) 100%)',
          borderRadius: '20px', border: '1px solid rgba(201,150,58,0.2)',
        }}>
          <p style={{
            fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1.1rem',
            color: 'rgb(61,35,20)', margin: '0 0 0.5rem 0',
          }}>
            Still have questions?
          </p>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem',
            color: 'rgb(107,79,58)', margin: '0 0 1.25rem 0',
          }}>
            Feel free to reach out on Instagram or send us an email — we're happy to help!
          </p>
          <a
            href="https://instagram.com/demurebakes"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgb(61,35,20)', color: 'rgb(237,232,223)',
              borderRadius: '50px', padding: '0.6rem 1.5rem',
              fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none', transition: 'all 0.2s',
            }}
          >
            📸 @demurebakes
          </a>
        </div>
      </div>
    </section>
  );
}
