import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Received', icon: '📋', desc: 'Your order has been received and is awaiting confirmation.' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Your order is confirmed! Please send your 20% deposit to secure your slot.' },
  { key: 'baking', label: 'Baking', icon: '🧁', desc: 'Your treats are being freshly baked with love!' },
  { key: 'ready', label: 'Ready to Collect', icon: '🎁', desc: 'Your order is ready! Please arrange collection.' },
  { key: 'completed', label: 'Collected', icon: '🎉', desc: 'Order complete — enjoy your treats!' },
];

const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', color: '#92400E' },
  confirmed: { bg: '#DBEAFE', color: '#1E40AF' },
  baking:    { bg: '#FFEDD5', color: '#9A3412' },
  ready:     { bg: '#D1FAE5', color: '#065F46' },
  completed: { bg: '#EDE9FE', color: '#4C1D95' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B' },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{
      padding: '0.25rem 0.85rem',
      borderRadius: '50px',
      fontSize: '0.82rem',
      fontWeight: 700,
      textTransform: 'capitalize',
      fontFamily: 'Nunito, sans-serif',
      background: colors.bg,
      color: colors.color,
      display: 'inline-block',
    }}>
      {status}
    </span>
  );
}

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('ref') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const data = await api.get(`/api/orders/track/${reference.trim().toUpperCase()}`).then(r => r.data);
      setOrder(data);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Order not found. Please check your reference code.');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : -1;

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF', fontFamily: 'Nunito, sans-serif' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '2rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#C9A84C', textDecoration: 'none', marginBottom: '2rem' }}>
          ← Back to Home
        </a>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎂</div>
        <h1 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: 'clamp(1.8rem,5vw,2.8rem)', color: '#3D2B1F', margin: '0 0 0.5rem 0' }}>
          Track Your Order
        </h1>
        <p style={{ fontSize: '1rem', color: '#7A5C3E', margin: 0 }}>
          Enter your reference code to see your order status
        </p>
      </div>

      {/* Search Form */}
      <div style={{ maxWidth: '560px', margin: '0 auto 2.5rem', padding: '0 1rem' }}>
        <form onSubmit={handleSearch} style={{ background: 'white', borderRadius: '24px', boxShadow: '0 8px 32px rgba(61,35,20,0.12)', padding: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#3D2B1F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Order Reference Code
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value.toUpperCase())}
              placeholder="e.g. DB-20260428-84C2"
              style={{
                flex: 1,
                minWidth: '180px',
                border: '2px solid #C9A84C',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                fontFamily: 'monospace',
                color: '#3D2B1F',
                outline: 'none',
                background: '#FAFAF8',
              }}
            />
            <button
              type="submit"
              disabled={loading || !reference.trim()}
              style={{
                background: loading || !reference.trim() ? 'rgba(201,168,76,0.5)' : '#C9A84C',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                fontFamily: '"Baloo 2", cursive',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading || !reference.trim() ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? '...' : 'Track'}
            </button>
          </div>
          {error && (
            <p style={{ marginTop: '0.75rem', color: '#DC2626', fontSize: '0.9rem', fontWeight: 600 }}>
              ❌ {error}
            </p>
          )}
        </form>
      </div>

      {/* Order Details */}
      {order && (
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1rem 4rem' }}>

          {/* Summary Card */}
          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(61,35,20,0.08)', padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: '#7A5C3E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference</p>
                <p style={{ margin: 0, fontFamily: 'monospace', fontWeight: 800, fontSize: '1.15rem', color: '#3D2B1F' }}>{order.reference}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: '#7A5C3E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</p>
                <p style={{ margin: 0, fontWeight: 700, color: '#3D2B1F', fontSize: '0.95rem' }}>{order.customer_name}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: '#7A5C3E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</p>
                <p style={{ margin: 0, fontWeight: 700, color: '#3D2B1F', fontSize: '0.95rem' }}>{order.product_name}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: '#7A5C3E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Total</p>
                <p style={{ margin: 0, fontWeight: 700, color: '#3D2B1F', fontSize: '0.95rem' }}>£{Number(order.total).toFixed(2)}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: '#7A5C3E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deposit (20%)</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#3D2B1F', fontSize: '0.95rem' }}>£{Number(order.deposit).toFixed(2)}</p>
                  {order.deposit_paid
                    ? <span style={{ fontSize: '0.75rem', background: '#D1FAE5', color: '#065F46', padding: '0.1rem 0.5rem', borderRadius: '50px', fontWeight: 700 }}>Paid ✓</span>
                    : <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.5rem', borderRadius: '50px', fontWeight: 700 }}>Pending</span>
                  }
                </div>
              </div>
              {order.delivery_date && (
                <div>
                  <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: '#7A5C3E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collection Date</p>
                  <p style={{ margin: 0, fontWeight: 700, color: '#3D2B1F', fontSize: '0.95rem' }}>{order.delivery_date}</p>
                </div>
              )}
              <div>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: '#7A5C3E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ordered On</p>
                <p style={{ margin: 0, fontWeight: 700, color: '#3D2B1F', fontSize: '0.95rem' }}>
                  {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          {order.status !== 'cancelled' && (
            <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(61,35,20,0.08)', padding: '2rem' }}>
              <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.2rem', color: '#3D2B1F', margin: '0 0 1.5rem 0' }}>
                Order Progress
              </h2>
              <div>
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isPending = index > currentStepIndex;
                  return (
                    <div key={step.key} style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          background: isCompleted ? '#C9A84C' : isCurrent ? '#3D2B1F' : '#EDE8DF',
                          color: isCompleted || isCurrent ? 'white' : '#9CA3AF',
                          border: isCurrent ? '3px solid #C9A84C' : '3px solid transparent',
                          boxSizing: 'border-box',
                        }}>
                          {isCompleted ? '✓' : step.icon}
                        </div>
                        {index < STATUS_STEPS.length - 1 && (
                          <div style={{
                            width: '2px',
                            height: '32px',
                            marginTop: '4px',
                            background: isCompleted ? '#C9A84C' : '#E5E7EB',
                          }} />
                        )}
                      </div>
                      <div style={{ paddingTop: '0.5rem', paddingBottom: '1rem', flex: 1 }}>
                        <p style={{
                          margin: '0 0 0.2rem 0',
                          fontFamily: '"Baloo 2", cursive',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isCurrent ? '#3D2B1F' : isCompleted ? '#C9A84C' : '#9CA3AF',
                        }}>
                          {step.label}
                          {isCurrent && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', background: '#C9A84C', color: 'white', borderRadius: '50px', padding: '0.1rem 0.5rem', fontFamily: 'Nunito, sans-serif' }}>
                              Current
                            </span>
                          )}
                        </p>
                        {isCurrent && (
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#7A5C3E', lineHeight: 1.5 }}>
                            {step.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancelled State */}
          {order.status === 'cancelled' && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '24px', padding: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>❌</p>
              <p style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1.1rem', color: '#991B1B', margin: '0 0 0.4rem' }}>
                This order has been cancelled.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#DC2626', margin: 0 }}>
                Please contact us if you have any questions.
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
