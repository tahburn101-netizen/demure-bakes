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

function StatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    baking: 'bg-orange-100 text-orange-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
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
    <div className="min-h-screen" style={{ background: '#EDE8DF', fontFamily: "'Playfair Display', Georgia, serif" }}>
      {/* Header */}
      <div className="text-center pt-16 pb-8 px-4">
        <a href="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: '#C9A84C' }}>
          ← Back to Home
        </a>
        <div className="text-4xl mb-3">🎂</div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#3D2B1F' }}>Track Your Order</h1>
        <p className="text-lg" style={{ color: '#7A5C3E' }}>
          Enter your reference code to see your order status
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-xl mx-auto px-4 mb-10">
        <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-lg p-8">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#3D2B1F' }}>
            Order Reference Code
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value.toUpperCase())}
              placeholder="e.g. DB-20260428-84C2"
              className="flex-1 border-2 rounded-xl px-4 py-3 text-base font-mono focus:outline-none"
              style={{ borderColor: '#C9A84C', color: '#3D2B1F' }}
            />
            <button
              type="submit"
              disabled={loading || !reference.trim()}
              className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#C9A84C' }}
            >
              {loading ? '...' : 'Track'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-red-600 text-sm font-medium">{error}</p>
          )}
        </form>
      </div>

      {/* Order Details */}
      {order && (
        <div className="max-w-2xl mx-auto px-4 pb-16">
          {/* Order Summary Card */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#7A5C3E' }}>Reference</p>
                <p className="text-xl font-bold font-mono" style={{ color: '#3D2B1F' }}>{order.reference}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#7A5C3E' }}>Customer</p>
                <p className="font-semibold" style={{ color: '#3D2B1F' }}>{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#7A5C3E' }}>Product</p>
                <p className="font-semibold" style={{ color: '#3D2B1F' }}>{order.product_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#7A5C3E' }}>Order Total</p>
                <p className="font-semibold" style={{ color: '#3D2B1F' }}>£{Number(order.total).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#7A5C3E' }}>Deposit (20%)</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold" style={{ color: '#3D2B1F' }}>£{Number(order.deposit).toFixed(2)}</p>
                  {order.deposit_paid
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Paid ✓</span>
                    : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Pending</span>
                  }
                </div>
              </div>
              {order.delivery_date && (
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#7A5C3E' }}>Collection Date</p>
                  <p className="font-semibold" style={{ color: '#3D2B1F' }}>{order.delivery_date}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#7A5C3E' }}>Ordered On</p>
                <p className="font-semibold" style={{ color: '#3D2B1F' }}>
                  {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-xl font-bold mb-6" style={{ color: '#3D2B1F' }}>Order Progress</h2>
              <div className="space-y-0">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isPending = index > currentStepIndex;
                  return (
                    <div key={step.key} className="flex gap-4">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 transition-all"
                          style={{
                            background: isCompleted ? '#C9A84C' : isCurrent ? '#3D2B1F' : '#EDE8DF',
                            color: isCompleted || isCurrent ? 'white' : '#9CA3AF',
                            border: isCurrent ? '3px solid #C9A84C' : 'none',
                          }}
                        >
                          {isCompleted ? '✓' : step.icon}
                        </div>
                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className="w-0.5 h-8 mt-1"
                            style={{ background: isCompleted ? '#C9A84C' : '#E5E7EB' }}
                          />
                        )}
                      </div>
                      {/* Step content */}
                      <div className="pb-8 flex-1">
                        <p
                          className="font-bold text-base"
                          style={{ color: isCurrent ? '#3D2B1F' : isCompleted ? '#C9A84C' : '#9CA3AF' }}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm mt-1" style={{ color: '#7A5C3E' }}>{step.desc}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {order.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
              <p className="text-2xl mb-2">❌</p>
              <p className="font-bold text-red-700">This order has been cancelled.</p>
              <p className="text-sm text-red-600 mt-1">Please contact us if you have any questions.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
