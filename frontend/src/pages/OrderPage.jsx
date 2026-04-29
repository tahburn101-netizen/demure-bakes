import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getBankDetails, createOrder } from '../api';

const API = 'https://demure-bakes-backend-production.up.railway.app';
const STEPS = ['Choose Product', 'Allergen Check', 'Your Details', 'Confirm & Pay'];

const ALLERGEN_LIST = [
  { icon: '🌾', name: 'Gluten', desc: 'Wheat flour is used in all baked goods' },
  { icon: '🥛', name: 'Dairy', desc: 'Butter, cream and milk in most products' },
  { icon: '🥚', name: 'Eggs', desc: 'Used in all baked goods' },
  { icon: '🥜', name: 'Nuts', desc: 'Products may contain or be made near nuts' },
  { icon: '🍫', name: 'Soya', desc: 'Present in some chocolate and coatings' },
];

const inputSt = (hasError) => ({
  width: '100%',
  padding: '0.75rem 1rem',
  border: `2px solid ${hasError ? '#e53e3e' : 'rgba(107,79,58,0.2)'}`,
  borderRadius: '12px',
  fontFamily: 'Nunito, sans-serif',
  fontSize: '0.95rem',
  color: 'rgb(61,35,20)',
  background: 'rgb(250,247,242)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
});

const labelSt = {
  display: 'block',
  fontFamily: 'Nunito, sans-serif',
  fontWeight: 700,
  fontSize: '0.82rem',
  color: 'rgb(107,79,58)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.4rem',
};

const pillSt = {
  padding: '0.4rem 0.85rem',
  borderRadius: '50px',
  border: '2px solid',
  fontFamily: 'Nunito, sans-serif',
  fontWeight: 700,
  fontSize: '0.82rem',
  cursor: 'pointer',
  transition: 'all 0.15s',
  background: 'white',
};

const card = {
  background: 'white',
  borderRadius: '24px',
  boxShadow: '0 4px 24px rgba(61,35,20,0.09)',
  padding: '2rem',
  marginBottom: '1.5rem',
};

export default function OrderPage() {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('product');

  const [step, setStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFlavour, setSelectedFlavour] = useState('');
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [allergenConfirmed, setAllergenConfirmed] = useState(false);
  const [allergenError, setAllergenError] = useState(false);
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
    getProducts().then(data => {
      const available = data.filter(p => p.available !== false);
      setProducts(available);
      if (preselectedId) {
        const found = available.find(p => String(p.id) === String(preselectedId));
        if (found) {
          setSelectedProduct(found);
          setStep(1);
        }
      }
    });
    getBankDetails().then(setBankDetails).catch(() => {});
  }, []);

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
      if (!allergenConfirmed) { setAllergenError(true); return; }
      setAllergenError(false);
      setStep(2);
    } else if (step === 2) {
      const e = validate();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
      setErrors({});
      setStep(3);
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

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(237,232,223)', fontFamily: 'Nunito, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgb(61,35,20) 0%, rgb(107,79,58) 100%)',
        padding: '2rem 1.5rem 3rem',
        textAlign: 'center',
      }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'rgba(237,232,223,0.7)', textDecoration: 'none', marginBottom: '1.25rem' }}>
          ← Back to Home
        </a>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧁</div>
        <h1 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: 'clamp(1.8rem,5vw,2.6rem)', color: 'rgb(237,232,223)', margin: '0 0 0.4rem 0' }}>
          Place Your Order
        </h1>
        <p style={{ color: 'rgba(237,232,223,0.7)', fontSize: '0.95rem', margin: 0 }}>
          Freshly baked to order — made with love
        </p>
      </div>

      {/* Step indicator */}
      {!orderResult && (
        <div style={{ maxWidth: '640px', margin: '-1.5rem auto 0', padding: '0 1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(61,35,20,0.08)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center' }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: i < step ? 'rgb(201,150,58)' : i === step ? 'rgb(61,35,20)' : 'rgb(237,232,223)',
                    color: i <= step ? 'white' : 'rgb(180,160,140)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800,
                    border: i === step ? '2px solid rgb(201,150,58)' : '2px solid transparent',
                    boxSizing: 'border-box', marginBottom: '0.25rem',
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: i === step ? 'rgb(61,35,20)' : 'rgb(180,160,140)', textAlign: 'center', lineHeight: 1.2 }}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: i < step ? 'rgb(201,150,58)' : 'rgb(237,232,223)', marginBottom: '1rem' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: '640px', margin: '1.5rem auto', padding: '0 1rem 4rem' }}>

        {/* SUCCESS SCREEN */}
        {orderResult ? (
          <div style={{ ...card, textAlign: 'center', padding: '2.5rem 2rem' }}>
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
            <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.6rem', color: 'rgb(61,35,20)', margin: '0 0 0.5rem 0' }}>
              Thank you, {form.customer_name.split(' ')[0]}! 🎉
            </h2>
            <p style={{ color: 'rgb(107,79,58)', lineHeight: 1.6, margin: '0 0 1.5rem 0', fontSize: '0.92rem' }}>
              Your order has been received! Please pay the <strong>20% deposit (£{(orderResult.deposit || deposit).toFixed(2)})</strong> via bank transfer to confirm your slot.
            </p>

            {/* Reference box */}
            <div style={{
              background: 'linear-gradient(135deg, rgb(61,35,20), rgb(107,79,58))',
              borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem',
            }}>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(232,184,109,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.4rem 0' }}>
                Your Order Reference
              </p>
              <p style={{ fontFamily: '"Baloo 2", cursive', fontSize: '2rem', fontWeight: 800, color: 'rgb(232,184,109)', margin: '0 0 0.4rem 0', letterSpacing: '0.05em' }}>
                {orderResult.reference}
              </p>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'rgba(237,232,223,0.7)', margin: 0 }}>
                Use this as your bank transfer reference
              </p>
            </div>

            {/* Bank details */}
            {bankDetails && (bankDetails.account_number || bankDetails.bank_name) && (
              <div style={{ background: 'rgb(250,247,242)', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', border: '2px solid rgba(201,150,58,0.3)', marginBottom: '1.25rem' }}>
                <h4 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem', color: 'rgb(61,35,20)', margin: '0 0 0.75rem 0' }}>
                  💳 Bank Transfer Details
                </h4>
                {[
                  { label: 'Bank', value: bankDetails.bank_name },
                  { label: 'Account Name', value: bankDetails.account_name },
                  { label: 'Account Number', value: bankDetails.account_number },
                  { label: 'Sort Code', value: bankDetails.sort_code },
                  { label: 'Amount to Pay', value: `£${(orderResult.deposit || deposit).toFixed(2)}` },
                  { label: 'Reference', value: orderResult.reference },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(107,79,58,0.08)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'rgb(107,79,58)' }}>{row.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgb(61,35,20)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Track order link */}
            <a
              href={`/track?ref=${orderResult.reference}`}
              style={{
                display: 'block',
                background: 'rgba(201,150,58,0.1)',
                border: '2px solid rgba(201,150,58,0.4)',
                borderRadius: '14px',
                padding: '0.875rem 1rem',
                textDecoration: 'none',
                color: 'rgb(61,35,20)',
                fontFamily: '"Baloo 2", cursive',
                fontWeight: 700,
                fontSize: '0.95rem',
                marginBottom: '0.75rem',
              }}
            >
              🔍 Track your order status →
            </a>

            <a href="/" style={{
              display: 'block',
              background: 'rgb(61,35,20)',
              color: 'rgb(237,232,223)',
              borderRadius: '50px',
              padding: '0.875rem 2rem',
              fontFamily: '"Baloo 2", cursive',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
            }}>
              Back to Home
            </a>
          </div>
        ) : (
          <>
            {/* STEP 0: Product Selection */}
            {step === 0 && (
              <div style={card}>
                <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.2rem', color: 'rgb(61,35,20)', margin: '0 0 0.5rem 0' }}>
                  What would you like to order?
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'rgb(107,79,58)', margin: '0 0 1.25rem 0' }}>
                  Select a product to get started
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {products.map(p => {
                    const portions = p.portion_sizes || [];
                    const minPrice = portions.length > 0 ? Math.min(...portions.map(s => parseFloat(s.price) || 0)) : p.price;
                    const priceLabel = portions.length > 1 ? `from £${minPrice.toFixed(2)}` : `£${minPrice.toFixed(2)}`;
                    const isSelected = selectedProduct?.id === p.id;
                    return (
                      <div key={p.id} onClick={() => setSelectedProduct(p)} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem',
                        borderRadius: '16px',
                        border: `2px solid ${isSelected ? 'rgb(201,150,58)' : 'rgba(107,79,58,0.15)'}`,
                        background: isSelected ? 'rgba(201,150,58,0.07)' : 'white',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        {p.images && p.images[0] ? (
                          <img src={p.images[0].startsWith('http') ? p.images[0] : `${API}/uploads/${p.images[0]}`} alt={p.name}
                            style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'rgb(237,232,223)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🧁</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.95rem', color: 'rgb(61,35,20)' }}>{p.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'rgb(107,79,58)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                          {(p.flavours || []).length > 0 && (
                            <div style={{ fontSize: '0.72rem', color: 'rgb(201,150,58)', marginTop: '0.15rem', fontWeight: 600 }}>
                              {p.flavours.length} flavour{p.flavours.length !== 1 ? 's' : ''} available
                            </div>
                          )}
                        </div>
                        <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1rem', color: 'rgb(201,150,58)', flexShrink: 0 }}>{priceLabel}</div>
                        {isSelected && (
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgb(201,150,58)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Custom order option */}
                  <div onClick={() => setSelectedProduct({ id: 'custom', name: 'Custom Order', price: 0 })} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem',
                    borderRadius: '16px',
                    border: `2px dashed ${selectedProduct?.id === 'custom' ? 'rgb(201,150,58)' : 'rgba(107,79,58,0.25)'}`,
                    background: selectedProduct?.id === 'custom' ? 'rgba(201,150,58,0.07)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'rgba(201,150,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>✨</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.95rem', color: 'rgb(61,35,20)' }}>Custom / Bespoke Order</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgb(107,79,58)' }}>Something special in mind? Tell us all about it</div>
                    </div>
                    <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.85rem', color: 'rgb(107,79,58)', flexShrink: 0 }}>POA</div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Allergen Acknowledgement */}
            {step === 1 && (
              <div style={card}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                  <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.3rem', color: 'rgb(61,35,20)', margin: '0 0 0.4rem 0' }}>
                    Allergen Information
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: 'rgb(107,79,58)', margin: 0, lineHeight: 1.5 }}>
                    All our products are made in a home kitchen. Please read carefully before ordering.
                  </p>
                </div>

                <div style={{ background: 'rgb(250,247,242)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <p style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.9rem', color: 'rgb(61,35,20)', margin: '0 0 0.75rem 0' }}>
                    Our kitchen handles the following allergens:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {ALLERGEN_LIST.map(a => (
                      <div key={a.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.3rem', flexShrink: 0, lineHeight: 1 }}>{a.icon}</span>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'rgb(61,35,20)' }}>{a.name}: </span>
                          <span style={{ fontSize: '0.85rem', color: 'rgb(107,79,58)' }}>{a.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#92400E', margin: 0, lineHeight: 1.6 }}>
                    <strong>Important:</strong> We cannot guarantee an allergen-free environment. Cross-contamination is possible. If you have a severe allergy, please contact us before ordering.
                  </p>
                </div>

                {selectedProduct && selectedProduct.allergens && (() => {
                  try {
                    const allergens = JSON.parse(selectedProduct.allergens || '[]');
                    if (allergens.length > 0) return (
                      <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#991B1B', margin: '0 0 0.4rem 0' }}>
                          This product specifically contains:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {allergens.map(a => (
                            <span key={a} style={{ background: '#FCA5A5', color: '#7F1D1D', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700 }}>{a}</span>
                          ))}
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}

                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer',
                  padding: '1rem',
                  background: allergenError ? '#FEF2F2' : allergenConfirmed ? 'rgba(201,150,58,0.07)' : 'white',
                  borderRadius: '14px',
                  border: `2px solid ${allergenError ? '#FCA5A5' : allergenConfirmed ? 'rgb(201,150,58)' : 'rgba(107,79,58,0.2)'}`,
                  transition: 'all 0.2s',
                }}>
                  <input
                    type="checkbox"
                    checked={allergenConfirmed}
                    onChange={e => { setAllergenConfirmed(e.target.checked); if (e.target.checked) setAllergenError(false); }}
                    style={{ width: '20px', height: '20px', marginTop: '2px', flexShrink: 0, accentColor: 'rgb(201,150,58)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.88rem', color: 'rgb(61,35,20)', lineHeight: 1.5, fontWeight: 600 }}>
                    I have read and understood the allergen information above. I confirm that I (and anyone consuming this order) am aware of the allergens present and accept responsibility for any dietary requirements.
                  </span>
                </label>
                {allergenError && (
                  <p style={{ color: '#DC2626', fontSize: '0.82rem', fontWeight: 600, margin: '0.5rem 0 0 0' }}>
                    Please tick the box to confirm you have read the allergen information
                  </p>
                )}
              </div>
            )}

            {/* STEP 2: Your Details */}
            {step === 2 && (
              <div style={card}>
                <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.2rem', color: 'rgb(61,35,20)', margin: '0 0 1.25rem 0' }}>
                  Your Details
                </h2>

                {selectedProduct && selectedProduct.id !== 'custom' && (
                  <div style={{ background: 'rgb(250,247,242)', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.9rem', color: 'rgb(61,35,20)' }}>{selectedProduct.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(107,79,58,0.2)', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem', color: 'rgb(61,35,20)', minWidth: '20px', textAlign: 'center' }}>{form.quantity}</span>
                        <button onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(107,79,58,0.2)', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                    </div>
                    {(selectedProduct.portion_sizes || []).length > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ ...labelSt, marginBottom: '0.4rem' }}>Portion Size</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {selectedProduct.portion_sizes.map((s, i) => (
                            <button key={i} onClick={() => setSelectedPortion(s)} style={{
                              ...pillSt,
                              background: selectedPortion?.label === s.label ? 'rgb(61,35,20)' : 'white',
                              color: selectedPortion?.label === s.label ? 'rgb(237,232,223)' : 'rgb(61,35,20)',
                              borderColor: selectedPortion?.label === s.label ? 'rgb(61,35,20)' : 'rgba(107,79,58,0.25)',
                            }}>
                              {s.label} — <span style={{ color: selectedPortion?.label === s.label ? 'rgb(232,184,109)' : 'rgb(201,150,58)', fontWeight: 800 }}>£{parseFloat(s.price).toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {(selectedProduct.flavours || []).length > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ ...labelSt, marginBottom: '0.4rem' }}>
                          Flavour {errors.flavour && <span style={{ color: '#e53e3e', fontWeight: 400, textTransform: 'none' }}>— {errors.flavour}</span>}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {selectedProduct.flavours.map((f, i) => (
                            <button key={i} onClick={() => { setSelectedFlavour(f); setErrors(e => ({ ...e, flavour: undefined })); }} style={{
                              ...pillSt,
                              background: selectedFlavour === f ? 'rgb(201,150,58)' : 'white',
                              color: selectedFlavour === f ? 'white' : 'rgb(61,35,20)',
                              borderColor: selectedFlavour === f ? 'rgb(201,150,58)' : 'rgba(107,79,58,0.25)',
                            }}>
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {total > 0 && (
                      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(201,150,58,0.2)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.82rem', color: 'rgb(107,79,58)' }}>{form.quantity} × £{unitPrice.toFixed(2)}</span>
                        <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1rem', color: 'rgb(61,35,20)' }}>Total: £{total.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={labelSt}>Full Name *</label>
                    <input type="text" placeholder="Your full name" value={form.customer_name}
                      onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                      style={inputSt(errors.customer_name)}
                      onFocus={e => e.target.style.borderColor = 'rgb(201,150,58)'}
                      onBlur={e => e.target.style.borderColor = errors.customer_name ? '#e53e3e' : 'rgba(107,79,58,0.2)'} />
                    {errors.customer_name && <p style={{ fontSize: '0.75rem', color: '#e53e3e', margin: '0.25rem 0 0' }}>{errors.customer_name}</p>}
                  </div>
                  <div>
                    <label style={labelSt}>Email Address *</label>
                    <input type="email" placeholder="your@email.com" value={form.customer_email}
                      onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                      style={inputSt(errors.customer_email)}
                      onFocus={e => e.target.style.borderColor = 'rgb(201,150,58)'}
                      onBlur={e => e.target.style.borderColor = errors.customer_email ? '#e53e3e' : 'rgba(107,79,58,0.2)'} />
                    {errors.customer_email && <p style={{ fontSize: '0.75rem', color: '#e53e3e', margin: '0.25rem 0 0' }}>{errors.customer_email}</p>}
                  </div>
                  <div>
                    <label style={labelSt}>Phone Number (optional)</label>
                    <input type="tel" placeholder="+44 7700 000000" value={form.customer_phone}
                      onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                      style={inputSt(false)}
                      onFocus={e => e.target.style.borderColor = 'rgb(201,150,58)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(107,79,58,0.2)'} />
                  </div>
                  <div>
                    <label style={labelSt}>Preferred Collection / Event Date *</label>
                    <input type="date" value={form.delivery_date}
                      min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))}
                      style={inputSt(errors.delivery_date)}
                      onFocus={e => e.target.style.borderColor = 'rgb(201,150,58)'}
                      onBlur={e => e.target.style.borderColor = errors.delivery_date ? '#e53e3e' : 'rgba(107,79,58,0.2)'} />
                    {errors.delivery_date && <p style={{ fontSize: '0.75rem', color: '#e53e3e', margin: '0.25rem 0 0' }}>{errors.delivery_date}</p>}
                  </div>
                  <div>
                    <label style={labelSt}>Special Requests / Dietary Requirements</label>
                    <textarea placeholder="Any special requests, personalisation, or dietary notes..."
                      value={form.special_requests}
                      onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))}
                      rows={3}
                      style={{ ...inputSt(false), resize: 'vertical', minHeight: '80px' }}
                      onFocus={e => e.target.style.borderColor = 'rgb(201,150,58)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(107,79,58,0.2)'} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Confirm & Pay */}
            {step === 3 && (
              <div style={card}>
                <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.2rem', color: 'rgb(61,35,20)', margin: '0 0 1.25rem 0' }}>
                  Confirm Your Order
                </h2>
                <div style={{ background: 'rgb(250,247,242)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  {[
                    { label: 'Item', value: selectedProduct?.name || 'Custom Order' },
                    selectedPortion ? { label: 'Portion', value: selectedPortion.label } : null,
                    selectedFlavour ? { label: 'Flavour', value: selectedFlavour } : null,
                    { label: 'Quantity', value: form.quantity },
                    { label: 'Name', value: form.customer_name },
                    { label: 'Email', value: form.customer_email },
                    form.customer_phone ? { label: 'Phone', value: form.customer_phone } : null,
                    form.delivery_date ? { label: 'Date', value: new Date(form.delivery_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) } : null,
                    form.special_requests ? { label: 'Requests', value: form.special_requests } : null,
                  ].filter(Boolean).map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.35rem 0', borderBottom: '1px solid rgba(107,79,58,0.08)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'rgb(107,79,58)', flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgb(61,35,20)', textAlign: 'right', wordBreak: 'break-word' }}>{row.value}</span>
                    </div>
                  ))}
                  {selectedProduct && selectedProduct.id !== 'custom' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0.2rem' }}>
                        <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem', color: 'rgb(61,35,20)' }}>Total</span>
                        <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.1rem', color: 'rgb(61,35,20)' }}>£{total.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem', color: 'rgb(201,150,58)' }}>20% Deposit Due Now</span>
                        <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.1rem', color: 'rgb(201,150,58)' }}>£{deposit.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ background: 'rgba(201,150,58,0.08)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(201,150,58,0.25)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'rgb(107,79,58)', margin: 0, lineHeight: 1.6 }}>
                    💳 A <strong>20% deposit</strong> is required to confirm your order. Bank transfer details and your unique reference number will be shown after submission.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{
                  flex: 1, padding: '0.875rem', borderRadius: '50px',
                  border: '2px solid rgba(107,79,58,0.25)', background: 'transparent',
                  fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.95rem',
                  color: 'rgb(107,79,58)', cursor: 'pointer',
                }}>← Back</button>
              )}
              {step < 3 ? (
                <button onClick={handleNext} disabled={step === 0 && !selectedProduct} style={{
                  flex: 2, padding: '0.875rem', borderRadius: '50px', border: 'none',
                  background: step === 0 && !selectedProduct ? 'rgba(61,35,20,0.3)' : 'rgb(61,35,20)',
                  color: 'rgb(237,232,223)', fontFamily: '"Baloo 2", cursive', fontWeight: 700,
                  fontSize: '0.95rem', cursor: step === 0 && !selectedProduct ? 'not-allowed' : 'pointer',
                }}>Continue →</button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} style={{
                  flex: 2, padding: '0.875rem', borderRadius: '50px', border: 'none',
                  background: submitting ? 'rgba(201,150,58,0.5)' : 'rgb(201,150,58)',
                  color: 'white', fontFamily: '"Baloo 2", cursive', fontWeight: 700,
                  fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(201,150,58,0.4)',
                }}>
                  {submitting ? 'Placing Order...' : '✓ Place Order'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
