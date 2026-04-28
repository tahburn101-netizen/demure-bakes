import React, { useState, useEffect } from 'react';
import { getProducts, getBankDetails, createOrder } from '../api';

const API = 'https://demure-bakes-backend-production.up.railway.app';
const STEPS = ['Choose Product', 'Your Details', 'Confirm Order'];

export default function OrderModal({ product: initialProduct, onClose }) {
  const [step, setStep] = useState(initialProduct ? 1 : 0);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct || null);
  const [selectedFlavour, setSelectedFlavour] = useState('');
  const [selectedPortion, setSelectedPortion] = useState(null); // { label, price }
  const [bankDetails, setBankDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    quantity: 1,
    special_requests: '',
    delivery_date: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getProducts().then(data => setProducts(data.filter(p => p.available !== false)));
    getBankDetails().then(setBankDetails).catch(() => {});
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // When product changes, reset flavour/portion
  useEffect(() => {
    if (selectedProduct && selectedProduct.id !== 'custom') {
      const portions = selectedProduct.portion_sizes || [];
      const flavours = selectedProduct.flavours || [];
      setSelectedPortion(portions.length > 0 ? portions[0] : null);
      setSelectedFlavour(flavours.length > 0 ? flavours[0] : '');
    }
  }, [selectedProduct]);

  const unitPrice = selectedPortion ? parseFloat(selectedPortion.price) || 0 : (selectedProduct?.price || 0);
  const total = selectedProduct && selectedProduct.id !== 'custom' ? unitPrice * form.quantity : 0;
  const deposit = Math.ceil(total * 0.20 * 100) / 100;

  const validate = () => {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = 'Name is required';
    if (!form.customer_email.trim() || !/\S+@\S+\.\S+/.test(form.customer_email)) e.customer_email = 'Valid email required';
    if (!form.delivery_date) e.delivery_date = 'Please select a preferred date';
    // Require flavour if product has flavours
    if (selectedProduct && selectedProduct.id !== 'custom' && (selectedProduct.flavours || []).length > 0 && !selectedFlavour) {
      e.flavour = 'Please select a flavour';
    }
    return e;
  };

  const handleNext = () => {
    if (step === 0) {
      if (!selectedProduct) return;
      setStep(1);
    } else if (step === 1) {
      const e = validate();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
      setErrors({});
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const portionNote = selectedPortion ? `Portion: ${selectedPortion.label}` : '';
      const flavourNote = selectedFlavour ? `Flavour: ${selectedFlavour}` : '';
      const optionsNote = [portionNote, flavourNote].filter(Boolean).join(' | ');
      const fullSpecial = [optionsNote, form.special_requests].filter(Boolean).join('\n');

      const result = await createOrder({
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        product_id: selectedProduct?.id || '',
        product_name: selectedProduct?.name || 'Custom Order',
        quantity: form.quantity,
        special_requests: fullSpecial,
        delivery_date: form.delivery_date,
        total: total,
      });
      setOrderResult(result);
    } catch (err) {
      alert('Failed to submit order. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: `2px solid ${errors[field] ? '#e53e3e' : 'rgba(107, 79, 58, 0.2)'}`,
    fontFamily: 'Nunito, sans-serif',
    fontSize: '0.95rem',
    color: 'rgb(61, 35, 20)',
    background: 'white',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  const labelStyle = {
    display: 'block',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 700,
    fontSize: '0.85rem',
    color: 'rgb(107, 79, 58)',
    marginBottom: '0.4rem',
  };

  const pillBase = {
    fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem',
    padding: '0.4rem 0.9rem', borderRadius: '50px', cursor: 'pointer',
    border: '2px solid transparent', transition: 'all 0.15s',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'rgb(250, 247, 242)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          background: 'rgb(61, 35, 20)',
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.25rem', color: 'rgb(237, 232, 223)', margin: 0 }}>
              {orderResult ? '🎉 Order Placed!' : 'Place Your Order'}
            </h2>
            {!orderResult && (
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'rgba(237, 232, 223, 0.7)', margin: '0.2rem 0 0 0' }}>
                Step {step + 1} of {STEPS.length}: {STEPS[step]}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(237, 232, 223, 0.15)', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgb(237, 232, 223)', fontSize: '1.1rem', flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Progress bar */}
        {!orderResult && (
          <div style={{ height: '4px', background: 'rgba(107, 79, 58, 0.1)', flexShrink: 0 }}>
            <div style={{
              height: '100%', background: 'rgb(201, 150, 58)',
              width: `${((step + 1) / STEPS.length) * 100}%`,
              transition: 'width 0.4s ease', borderRadius: '0 2px 2px 0',
            }} />
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>

          {/* SUCCESS SCREEN */}
          {orderResult ? (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9963A, #E8B86D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 8px 30px rgba(201,150,58,0.4)',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <h3 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: 'rgb(61, 35, 20)', margin: '0 0 0.5rem 0' }}>
                Thank you, {form.customer_name.split(' ')[0]}!
              </h3>
              <p style={{ fontFamily: 'Nunito, sans-serif', color: 'rgb(107, 79, 58)', lineHeight: 1.6, margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
                Your order has been received! Please pay the <strong>20% deposit (£{orderResult.deposit?.toFixed(2) || deposit.toFixed(2)})</strong> via bank transfer to confirm your order.
              </p>

              <div style={{
                background: 'linear-gradient(135deg, rgb(61, 35, 20), rgb(107, 79, 58))',
                borderRadius: '16px', padding: '1.25rem',
                marginBottom: '1.25rem',
              }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(232,184,109,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem 0' }}>
                  Your Order Reference
                </p>
                <p style={{ fontFamily: '"Baloo 2", cursive', fontSize: '2rem', fontWeight: 800, color: 'rgb(232, 184, 109)', margin: '0 0 0.5rem 0', letterSpacing: '0.05em' }}>
                  {orderResult.reference}
                </p>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'rgba(237,232,223,0.7)', margin: 0 }}>
                  Use this as your bank transfer reference
                </p>
              </div>

              {bankDetails && (bankDetails.account_number || bankDetails.bank_name || bankDetails.sort_code) ? (
                <div style={{
                  background: 'white', borderRadius: '16px', padding: '1.25rem',
                  textAlign: 'left', border: '2px solid rgba(201, 150, 58, 0.3)',
                  marginBottom: '1.25rem',
                }}>
                  <h4 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem', color: 'rgb(61, 35, 20)', margin: '0 0 0.75rem 0' }}>
                    💳 Bank Transfer Details
                  </h4>
                  {[
                    { label: 'Bank', value: bankDetails.bank_name },
                    { label: 'Account Name', value: bankDetails.account_name },
                    { label: 'Account Number', value: bankDetails.account_number },
                    { label: 'Sort Code', value: bankDetails.sort_code },
                  ].filter(r => r.value).map(row => (
                    <div key={row.label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '0.4rem 0', borderBottom: '1px solid rgba(107, 79, 58, 0.1)',
                    }}>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: 'rgb(107, 79, 58)' }}>{row.label}</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: 'rgb(61, 35, 20)' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{
                    marginTop: '0.75rem', padding: '0.75rem',
                    background: 'rgba(201, 150, 58, 0.1)', borderRadius: '10px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: 'rgb(107, 79, 58)' }}>Amount to Pay (20% deposit)</span>
                    <span style={{ fontFamily: '"Baloo 2", cursive', fontSize: '1.2rem', fontWeight: 800, color: 'rgb(201, 150, 58)' }}>
                      £{orderResult.deposit?.toFixed(2) || deposit.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(201, 150, 58, 0.1)', borderRadius: '12px', padding: '1rem',
                  marginBottom: '1.25rem', fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: 'rgb(107, 79, 58)',
                }}>
                  We'll be in touch shortly with payment details. Check your email at <strong>{form.customer_email}</strong>.
                </div>
              )}

              <div style={{
                background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '12px',
                padding: '0.875rem 1rem', marginBottom: '1.5rem',
              }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem', color: '#166534', margin: 0, lineHeight: 1.6 }}>
                  📧 A confirmation has been sent to <strong>{form.customer_email}</strong>. Once your deposit is received, we'll confirm your order and begin baking! 🎂
                </p>
              </div>

              <button onClick={onClose} style={{
                background: 'rgb(61, 35, 20)', color: 'rgb(237, 232, 223)',
                border: 'none', borderRadius: '50px', padding: '0.875rem 2rem',
                fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', width: '100%',
              }}>
                Done ✓
              </button>
            </div>

          ) : step === 0 ? (
            /* STEP 0: Product selection */
            <div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: 'rgb(107, 79, 58)', margin: '0 0 1.25rem 0' }}>
                Choose what you'd like to order:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {products.map(p => {
                  const portions = p.portion_sizes || [];
                  const minPrice = portions.length > 0 ? Math.min(...portions.map(s => parseFloat(s.price) || 0)) : p.price;
                  const maxPrice = portions.length > 0 ? Math.max(...portions.map(s => parseFloat(s.price) || 0)) : p.price;
                  const priceLabel = portions.length > 1 && minPrice !== maxPrice
                    ? `from £${minPrice.toFixed(2)}`
                    : `£${minPrice.toFixed(2)}`;
                  return (
                    <div key={p.id} onClick={() => setSelectedProduct(p)} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem',
                      borderRadius: '16px',
                      border: `2px solid ${selectedProduct?.id === p.id ? 'rgb(201, 150, 58)' : 'rgba(107, 79, 58, 0.15)'}`,
                      background: selectedProduct?.id === p.id ? 'rgba(201, 150, 58, 0.08)' : 'white',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      {p.images && p.images[0] ? (
                        <img
                          src={p.images[0].startsWith('http') ? p.images[0] : `${API}/uploads/${p.images[0]}`}
                          alt={p.name}
                          style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'rgb(237, 232, 223)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🧁</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.95rem', color: 'rgb(61, 35, 20)' }}>{p.name}</div>
                        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: 'rgb(107, 79, 58)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>
                        {(p.flavours || []).length > 0 && (
                          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.73rem', color: 'rgb(201, 150, 58)', marginTop: '0.15rem' }}>
                            {p.flavours.length} flavour{p.flavours.length !== 1 ? 's' : ''} available
                          </div>
                        )}
                      </div>
                      <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1rem', color: 'rgb(201, 150, 58)', flexShrink: 0, textAlign: 'right' }}>
                        {priceLabel}
                      </div>
                      {selectedProduct?.id === p.id && (
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgb(201, 150, 58)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Custom order */}
                <div onClick={() => setSelectedProduct({ id: 'custom', name: 'Custom Order', price: 0 })} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem',
                  borderRadius: '16px',
                  border: `2px dashed ${selectedProduct?.id === 'custom' ? 'rgb(201, 150, 58)' : 'rgba(107, 79, 58, 0.25)'}`,
                  background: selectedProduct?.id === 'custom' ? 'rgba(201, 150, 58, 0.08)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'rgba(201, 150, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>✨</div>
                  <div>
                    <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.95rem', color: 'rgb(61, 35, 20)' }}>Custom / Bespoke Order</div>
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'rgb(107, 79, 58)' }}>Tell us what you'd like — we'll make it happen</div>
                  </div>
                </div>
              </div>
            </div>

          ) : step === 1 ? (
            /* STEP 1: Customer details + portion/flavour selectors */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Product summary card */}
              {selectedProduct && selectedProduct.id !== 'custom' && (
                <div style={{
                  background: 'rgba(201, 150, 58, 0.08)', borderRadius: '14px',
                  border: '1px solid rgba(201, 150, 58, 0.25)', padding: '1rem',
                  marginBottom: '0.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    {selectedProduct.images?.[0] && (
                      <img
                        src={selectedProduct.images[0].startsWith('http') ? selectedProduct.images[0] : `${API}/uploads/${selectedProduct.images[0]}`}
                        alt={selectedProduct.name}
                        style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.9rem', color: 'rgb(61, 35, 20)' }}>{selectedProduct.name}</div>
                    </div>
                    {/* Quantity stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(107,79,58,0.2)', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem', color: 'rgb(61, 35, 20)', minWidth: '20px', textAlign: 'center' }}>{form.quantity}</span>
                      <button onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(107,79,58,0.2)', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>

                  {/* Portion size selector */}
                  {(selectedProduct.portion_sizes || []).length > 0 && (
                    <div style={{ marginBottom: (selectedProduct.flavours || []).length > 0 ? '0.75rem' : 0 }}>
                      <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: 'rgb(107, 79, 58)', marginBottom: '0.4rem' }}>Portion Size</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {selectedProduct.portion_sizes.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedPortion(s)}
                            style={{
                              ...pillBase,
                              background: selectedPortion?.label === s.label ? 'rgb(61, 35, 20)' : 'white',
                              color: selectedPortion?.label === s.label ? 'rgb(237, 232, 223)' : 'rgb(61, 35, 20)',
                              borderColor: selectedPortion?.label === s.label ? 'rgb(61, 35, 20)' : 'rgba(107, 79, 58, 0.25)',
                            }}
                          >
                            {s.label} — <span style={{ color: selectedPortion?.label === s.label ? 'rgb(232, 184, 109)' : 'rgb(201, 150, 58)', fontWeight: 800 }}>£{parseFloat(s.price).toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flavour selector */}
                  {(selectedProduct.flavours || []).length > 0 && (
                    <div>
                      <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: 'rgb(107, 79, 58)', marginBottom: '0.4rem' }}>
                        Flavour {errors.flavour && <span style={{ color: '#e53e3e', fontWeight: 400 }}>— {errors.flavour}</span>}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {selectedProduct.flavours.map((f, i) => (
                          <button
                            key={i}
                            onClick={() => { setSelectedFlavour(f); setErrors(e => ({ ...e, flavour: undefined })); }}
                            style={{
                              ...pillBase,
                              background: selectedFlavour === f ? 'rgb(201, 150, 58)' : 'white',
                              color: selectedFlavour === f ? 'white' : 'rgb(61, 35, 20)',
                              borderColor: selectedFlavour === f ? 'rgb(201, 150, 58)' : 'rgba(107, 79, 58, 0.25)',
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Running total */}
                  {total > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(201, 150, 58, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem', color: 'rgb(107, 79, 58)' }}>
                        {form.quantity} × £{unitPrice.toFixed(2)}
                      </span>
                      <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.05rem', color: 'rgb(61, 35, 20)' }}>
                        Total: £{total.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={labelStyle}>Full Name *</label>
                <input type="text" placeholder="Your full name" value={form.customer_name}
                  onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                  style={inputStyle('customer_name')}
                  onFocus={e => e.target.style.borderColor = 'rgb(201, 150, 58)'}
                  onBlur={e => e.target.style.borderColor = errors.customer_name ? '#e53e3e' : 'rgba(107, 79, 58, 0.2)'} />
                {errors.customer_name && <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: '#e53e3e', margin: '0.25rem 0 0 0' }}>{errors.customer_name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" placeholder="your@email.com" value={form.customer_email}
                  onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                  style={inputStyle('customer_email')}
                  onFocus={e => e.target.style.borderColor = 'rgb(201, 150, 58)'}
                  onBlur={e => e.target.style.borderColor = errors.customer_email ? '#e53e3e' : 'rgba(107, 79, 58, 0.2)'} />
                {errors.customer_email && <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: '#e53e3e', margin: '0.25rem 0 0 0' }}>{errors.customer_email}</p>}
              </div>
              <div>
                <label style={labelStyle}>Phone Number (optional)</label>
                <input type="tel" placeholder="+44 7700 000000" value={form.customer_phone}
                  onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                  style={inputStyle('customer_phone')}
                  onFocus={e => e.target.style.borderColor = 'rgb(201, 150, 58)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(107, 79, 58, 0.2)'} />
              </div>
              <div>
                <label style={labelStyle}>Preferred Delivery / Collection Date *</label>
                <input type="date" value={form.delivery_date}
                  min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))}
                  style={inputStyle('delivery_date')}
                  onFocus={e => e.target.style.borderColor = 'rgb(201, 150, 58)'}
                  onBlur={e => e.target.style.borderColor = errors.delivery_date ? '#e53e3e' : 'rgba(107, 79, 58, 0.2)'} />
                {errors.delivery_date && <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: '#e53e3e', margin: '0.25rem 0 0 0' }}>{errors.delivery_date}</p>}
              </div>
              <div>
                <label style={labelStyle}>Special Requests / Allergies</label>
                <textarea placeholder="Any special requests, dietary requirements, or personalisation..."
                  value={form.special_requests}
                  onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle('special_requests'), resize: 'vertical', minHeight: '80px' }}
                  onFocus={e => e.target.style.borderColor = 'rgb(201, 150, 58)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(107, 79, 58, 0.2)'} />
              </div>
            </div>

          ) : (
            /* STEP 2: Confirmation */
            <div>
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(107, 79, 58, 0.1)' }}>
                <h4 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem', color: 'rgb(61, 35, 20)', margin: '0 0 0.75rem 0' }}>Order Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'Item', value: selectedProduct?.name || 'Custom Order' },
                    selectedPortion ? { label: 'Portion', value: selectedPortion.label } : null,
                    selectedFlavour ? { label: 'Flavour', value: selectedFlavour } : null,
                    { label: 'Quantity', value: form.quantity },
                    { label: 'Name', value: form.customer_name },
                    { label: 'Email', value: form.customer_email },
                    { label: 'Phone', value: form.customer_phone || '—' },
                    { label: 'Date', value: form.delivery_date || '—' },
                    { label: 'Requests', value: form.special_requests || 'None' },
                  ].filter(Boolean).map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(107,79,58,0.08)' }}>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: 'rgb(107, 79, 58)' }}>{row.label}</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: 'rgb(61, 35, 20)', textAlign: 'right', wordBreak: 'break-word' }}>{row.value}</span>
                    </div>
                  ))}
                  {selectedProduct && selectedProduct.id !== 'custom' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0.25rem 0' }}>
                        <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem', color: 'rgb(61, 35, 20)' }}>Total</span>
                        <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.1rem', color: 'rgb(61, 35, 20)' }}>£{total.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem', color: 'rgb(201, 150, 58)' }}>20% Deposit Due Now</span>
                        <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.1rem', color: 'rgb(201, 150, 58)' }}>£{deposit.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div style={{ background: 'rgba(201, 150, 58, 0.08)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(201, 150, 58, 0.25)', marginBottom: '1rem' }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: 'rgb(107, 79, 58)', margin: 0, lineHeight: 1.6 }}>
                  💳 A <strong>20% deposit</strong> is required to confirm your order. Bank transfer details and your unique reference number will be shown after submission.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {!orderResult && (
          <div style={{
            padding: '1rem 1.5rem', borderTop: '1px solid rgba(107, 79, 58, 0.1)',
            display: 'flex', gap: '0.75rem', flexShrink: 0, background: 'rgb(250, 247, 242)',
          }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                flex: 1, padding: '0.75rem', borderRadius: '50px',
                border: '2px solid rgba(107, 79, 58, 0.25)', background: 'transparent',
                fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.95rem',
                color: 'rgb(107, 79, 58)', cursor: 'pointer',
              }}>← Back</button>
            )}
            {step < 2 ? (
              <button onClick={handleNext} disabled={step === 0 && !selectedProduct} style={{
                flex: 2, padding: '0.75rem', borderRadius: '50px', border: 'none',
                background: step === 0 && !selectedProduct ? 'rgba(61, 35, 20, 0.3)' : 'rgb(61, 35, 20)',
                color: 'rgb(237, 232, 223)', fontFamily: '"Baloo 2", cursive', fontWeight: 700,
                fontSize: '0.95rem', cursor: step === 0 && !selectedProduct ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}>Continue →</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} style={{
                flex: 2, padding: '0.75rem', borderRadius: '50px', border: 'none',
                background: submitting ? 'rgba(201, 150, 58, 0.5)' : 'rgb(201, 150, 58)',
                color: 'white', fontFamily: '"Baloo 2", cursive', fontWeight: 700,
                fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(201, 150, 58, 0.4)',
              }}>
                {submitting ? 'Placing Order...' : '✓ Place Order'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
