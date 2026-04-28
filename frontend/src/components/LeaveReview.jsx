import React, { useState } from 'react';
import api from '../api';

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
            fontSize: '1.75rem', lineHeight: 1,
            color: star <= (hovered || value) ? '#F59E0B' : '#D1D5DB',
            transition: 'color 0.15s, transform 0.15s',
            transform: star <= (hovered || value) ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function LeaveReview() {
  const [form, setForm] = useState({ author: '', text: '', rating: 5, order_reference: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.author.trim() || !form.text.trim()) {
      setError('Please fill in your name and review.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/reviews/submit', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="leave-review" style={{ background: 'rgb(237,232,223)', padding: '5rem 0' }}>
      <div style={{ maxWidth: '44rem', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.25)',
            borderRadius: '50px', padding: '0.35rem 1rem', marginBottom: '1rem',
          }}>
            <span style={{ fontSize: '0.9rem' }}>⭐</span>
            <span style={{
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem',
              color: 'rgb(107,79,58)', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Share Your Experience</span>
          </div>
          <h2 style={{
            fontFamily: '"Baloo 2", cursive', fontWeight: 800,
            fontSize: 'clamp(1.75rem,4vw,2.5rem)', color: 'rgb(61,35,20)', margin: '0 0 0.75rem 0',
          }}>
            Leave a Review
          </h2>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontSize: '1rem',
            color: 'rgb(107,79,58)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6,
          }}>
            Loved your order? We'd love to hear from you! Your review helps others discover Demure Bakes.
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'white', borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(61,35,20,0.1)', padding: '2.5rem',
        }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{
                fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem',
                color: 'rgb(61,35,20)', margin: '0 0 0.75rem 0',
              }}>
                Thank you for your review!
              </h3>
              <p style={{
                fontFamily: 'Nunito, sans-serif', fontSize: '1rem',
                color: 'rgb(107,79,58)', lineHeight: 1.6,
              }}>
                Your review has been submitted and will appear on the site after approval. We really appreciate your support! 💛
              </p>
              <button
                onClick={() => { setSuccess(false); setForm({ author: '', text: '', rating: 5, order_reference: '' }); }}
                style={{
                  marginTop: '1.5rem', background: 'rgb(61,35,20)', color: 'rgb(237,232,223)',
                  border: 'none', borderRadius: '50px', padding: '0.6rem 1.5rem',
                  fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Leave Another Review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Star Rating */}
              <div>
                <label style={{
                  display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                  fontSize: '0.9rem', color: 'rgb(61,35,20)', marginBottom: '0.5rem',
                }}>
                  Your Rating *
                </label>
                <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
              </div>

              {/* Name */}
              <div>
                <label style={{
                  display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                  fontSize: '0.9rem', color: 'rgb(61,35,20)', marginBottom: '0.5rem',
                }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  placeholder="e.g. Sarah M."
                  style={{
                    width: '100%', border: '2px solid rgba(201,150,58,0.3)', borderRadius: '12px',
                    padding: '0.75rem 1rem', fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem',
                    color: 'rgb(61,35,20)', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgb(201,150,58)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,150,58,0.3)'}
                />
              </div>

              {/* Review Text */}
              <div>
                <label style={{
                  display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                  fontSize: '0.9rem', color: 'rgb(61,35,20)', marginBottom: '0.5rem',
                }}>
                  Your Review *
                </label>
                <textarea
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="Tell us about your experience — what did you order and what did you love about it?"
                  rows={4}
                  style={{
                    width: '100%', border: '2px solid rgba(201,150,58,0.3)', borderRadius: '12px',
                    padding: '0.75rem 1rem', fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem',
                    color: 'rgb(61,35,20)', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgb(201,150,58)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,150,58,0.3)'}
                />
              </div>

              {/* Order Reference (optional) */}
              <div>
                <label style={{
                  display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                  fontSize: '0.9rem', color: 'rgb(61,35,20)', marginBottom: '0.5rem',
                }}>
                  Order Reference <span style={{ fontWeight: 400, color: 'rgb(107,79,58)' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.order_reference}
                  onChange={e => setForm(f => ({ ...f, order_reference: e.target.value.toUpperCase() }))}
                  placeholder="e.g. DB-20260428-84C2"
                  style={{
                    width: '100%', border: '2px solid rgba(201,150,58,0.3)', borderRadius: '12px',
                    padding: '0.75rem 1rem', fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem',
                    color: 'rgb(61,35,20)', outline: 'none', boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgb(201,150,58)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,150,58,0.3)'}
                />
              </div>

              {error && (
                <p style={{ color: 'rgb(185,28,28)', fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? 'rgba(61,35,20,0.5)' : 'rgb(61,35,20)',
                  color: 'rgb(237,232,223)', border: 'none', borderRadius: '50px',
                  padding: '0.875rem 2rem', fontFamily: '"Baloo 2", cursive', fontWeight: 700,
                  fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(61,35,20,0.2)',
                  alignSelf: 'flex-start',
                }}
              >
                {loading ? 'Submitting...' : '⭐ Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
