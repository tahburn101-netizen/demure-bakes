import React, { useState, useEffect, useRef } from 'react'
import {
  login, getProducts, createProduct, updateProduct, deleteProduct,
  getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getBankDetails, updateBankDetails,
  getGallery, addGalleryImage, deleteGalleryImage,
  uploadImages, uploadSingleImage, changePassword
} from '../api'

/* ─── tiny helpers ─── */
const gold = '#c8a84b'
const dark = '#3d2b1f'
const cream = '#f5f0e8'
const white = '#ffffff'

function Btn({ children, onClick, variant = 'primary', small, style = {}, disabled }) {
  const base = {
    border: 'none', borderRadius: '50px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Inter',sans-serif", fontWeight: 600,
    fontSize: small ? '0.78rem' : '0.88rem',
    padding: small ? '0.4rem 1rem' : '0.65rem 1.5rem',
    transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
  }
  const variants = {
    primary: { background: dark, color: cream },
    gold: { background: gold, color: dark },
    danger: { background: '#c0392b', color: white },
    ghost: { background: 'transparent', color: dark, border: `1.5px solid ${dark}` },
  }
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder, required, style = {} }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: '0.8rem', fontWeight: 600, color: dark, marginBottom: '0.35rem' }}>{label}{required && <span style={{ color: '#c0392b' }}> *</span>}</label>}
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3}
          style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1.5px solid #ddd', fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', resize: 'vertical', outline: 'none', ...style }}
        />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1.5px solid #ddd', fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', outline: 'none', ...style }}
        />
      )}
    </div>
  )
}

function Card({ children, style = {} }) {
  return <div style={{ background: white, borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(61,43,31,0.08)', marginBottom: '1.25rem', ...style }}>{children}</div>
}

/* ─── LOGIN ─── */
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await login(username, password)
      localStorage.setItem('admin_token', data.token)
      onLogin(data.token)
    } catch {
      setError('Invalid username or password')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: white, borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 8px 40px rgba(61,43,31,0.12)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 700, fontStyle: 'italic', color: gold }}>Demure</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 400, color: dark, marginLeft: 6 }}>Bakes</span>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.85rem', color: '#8b6347', marginTop: '0.5rem' }}>Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit}>
          <Input label="Username" value={username} onChange={setUsername} placeholder="admin" required />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
          {error && <p style={{ color: '#c0392b', fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>}
          <Btn style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Btn>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <a href="/" style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.8rem', color: gold, textDecoration: 'none' }}>← Back to website</a>
        </p>
      </div>
    </div>
  )
}

/* ─── PRODUCTS TAB ─── */
function ProductsTab() {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'brownies', images: [], available: true })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef()

  const categories = ['brownies', 'cupcakes', 'boxes', 'hampers', 'other']

  const load = () => getProducts().then(setProducts).catch(() => {})
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing('new'); setForm({ name: '', description: '', price: '', category: 'brownies', images: [], available: true }) }
  const openEdit = p => { setEditing(p.id); setForm({ name: p.name, description: p.description || '', price: String(p.price), category: p.category || 'brownies', images: p.images || [], available: p.available }) }
  const closeForm = () => { setEditing(null); setMsg('') }

  const handleUpload = async files => {
    if (!files.length) return
    setUploading(true)
    try {
      const { urls } = await uploadImages(Array.from(files))
      setForm(f => ({ ...f, images: [...f.images, ...urls] }))
    } catch { setMsg('Upload failed') }
    finally { setUploading(false) }
  }

  const removeImage = idx => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))

  const save = async () => {
    if (!form.name || !form.price) { setMsg('Name and price are required'); return }
    setSaving(true); setMsg('')
    try {
      const payload = { ...form, price: parseFloat(form.price) }
      if (editing === 'new') await createProduct(payload)
      else await updateProduct(editing, payload)
      setMsg('Saved successfully!')
      await load(); closeForm()
    } catch { setMsg('Save failed') }
    finally { setSaving(false) }
  }

  const remove = async id => {
    if (!confirm('Delete this product?')) return
    await deleteProduct(id); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color: dark }}>Products</h2>
        <Btn variant="gold" onClick={openNew}>+ Add Product</Btn>
      </div>

      {/* Form */}
      {editing && (
        <Card style={{ border: `2px solid ${gold}` }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', color: dark, marginBottom: '1.25rem' }}>
            {editing === 'new' ? 'New Product' : 'Edit Product'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }} className="form-grid">
            <Input label="Product Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            <Input label="Price (£)" type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} placeholder="0.00" required />
          </div>
          <Input label="Description" type="textarea" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: '0.8rem', fontWeight: 600, color: dark, marginBottom: '0.35rem' }}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1.5px solid #ddd', fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', width: '100%' }}>
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', color: dark }}>
              <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
              Available for order
            </label>
          </div>

          {/* Images */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: '0.8rem', fontWeight: 600, color: dark, marginBottom: '0.5rem' }}>Product Images</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {form.images.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #eee' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(192,57,43,0.85)', color: white, border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
              <button onClick={() => fileRef.current.click()} style={{ width: '90px', height: '90px', borderRadius: '10px', border: `2px dashed ${gold}`, background: 'rgba(200,168,75,0.06)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: gold, fontSize: '1.5rem' }}>
                {uploading ? '…' : '+'}
                <span style={{ fontSize: '0.65rem', fontFamily: "'Inter',sans-serif" }}>Upload</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} />
          </div>

          {msg && <p style={{ color: msg.includes('success') ? '#27ae60' : '#c0392b', fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', marginBottom: '0.75rem' }}>{msg}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</Btn>
            <Btn variant="ghost" onClick={closeForm}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Products list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {products.map(p => (
          <Card key={p.id} style={{ padding: '1rem' }}>
            {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '0.75rem' }} />}
            <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1rem', color: dark, marginBottom: '0.25rem' }}>{p.name}</h4>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.78rem', color: '#8b6347', marginBottom: '0.5rem' }}>{p.category} · £{Number(p.price).toFixed(2)}</p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.75rem', color: p.available ? '#27ae60' : '#c0392b', marginBottom: '0.75rem' }}>{p.available ? '● Available' : '○ Hidden'}</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Btn small variant="gold" onClick={() => openEdit(p)}>Edit</Btn>
              <Btn small variant="danger" onClick={() => remove(p.id)}>Delete</Btn>
            </div>
          </Card>
        ))}
      </div>
      <style>{`.form-grid { @media (max-width:600px) { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

/* ─── TESTIMONIALS TAB ─── */
function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ author: '', text: '', rating: 5, visible: true })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => getAllTestimonials().then(setTestimonials).catch(() => {})
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing('new'); setForm({ author: '', text: '', rating: 5, visible: true }) }
  const openEdit = t => { setEditing(t.id); setForm({ author: t.author, text: t.text, rating: t.rating, visible: t.visible }) }
  const closeForm = () => { setEditing(null); setMsg('') }

  const save = async () => {
    if (!form.author || !form.text) { setMsg('Author and text are required'); return }
    setSaving(true); setMsg('')
    try {
      if (editing === 'new') await createTestimonial(form)
      else await updateTestimonial(editing, form)
      setMsg('Saved!')
      await load(); closeForm()
    } catch { setMsg('Save failed') }
    finally { setSaving(false) }
  }

  const remove = async id => {
    if (!confirm('Delete this testimonial?')) return
    await deleteTestimonial(id); load()
  }

  const toggle = async t => {
    await updateTestimonial(t.id, { ...t, visible: !t.visible }); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color: dark }}>Testimonials</h2>
        <Btn variant="gold" onClick={openNew}>+ Add Review</Btn>
      </div>

      {editing && (
        <Card style={{ border: `2px solid ${gold}` }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', color: dark, marginBottom: '1.25rem' }}>
            {editing === 'new' ? 'New Testimonial' : 'Edit Testimonial'}
          </h3>
          <Input label="Customer Name" value={form.author} onChange={v => setForm(f => ({ ...f, author: v }))} required />
          <Input label="Review Text" type="textarea" value={form.text} onChange={v => setForm(f => ({ ...f, text: v }))} required />
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: '0.8rem', fontWeight: 600, color: dark, marginBottom: '0.35rem' }}>Rating</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setForm(f => ({ ...f, rating: n }))}
                  style={{ fontSize: '1.4rem', background: 'none', border: 'none', cursor: 'pointer', color: n <= form.rating ? gold : '#ddd' }}>★</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', color: dark }}>
              <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} />
              Visible on website
            </label>
          </div>
          {msg && <p style={{ color: msg === 'Saved!' ? '#27ae60' : '#c0392b', fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', marginBottom: '0.75rem' }}>{msg}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
            <Btn variant="ghost" onClick={closeForm}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {testimonials.map(t => (
          <Card key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '0.4rem' }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= t.rating ? gold : '#ddd', fontSize: '0.9rem' }}>★</span>)}
              </div>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', color: '#5c3d2e', fontStyle: 'italic', marginBottom: '0.4rem' }}>"{t.text}"</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.8rem', fontWeight: 600, color: dark }}>— {t.author}</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.72rem', color: t.visible ? '#27ae60' : '#c0392b', marginTop: '0.25rem' }}>{t.visible ? '● Visible' : '○ Hidden'}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <Btn small variant="ghost" onClick={() => toggle(t)}>{t.visible ? 'Hide' : 'Show'}</Btn>
              <Btn small variant="gold" onClick={() => openEdit(t)}>Edit</Btn>
              <Btn small variant="danger" onClick={() => remove(t.id)}>Delete</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ─── BANK DETAILS TAB ─── */
function BankTab() {
  const [form, setForm] = useState({ bank_name: '', account_name: '', account_number: '', sort_code: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getBankDetails().then(d => setForm({ bank_name: d.bank_name || '', account_name: d.account_name || '', account_number: d.account_number || '', sort_code: d.sort_code || '' })).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true); setMsg('')
    try {
      await updateBankDetails(form)
      setMsg('Bank details saved successfully!')
    } catch { setMsg('Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color: dark, marginBottom: '1.5rem' }}>Bank Details</h2>
      <Card>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.85rem', color: '#8b6347', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          These details will be shown to customers when they click "View Bank Details for Payment" on the website.
        </p>
        <Input label="Bank Name" value={form.bank_name} onChange={v => setForm(f => ({ ...f, bank_name: v }))} placeholder="e.g. Monzo, Barclays" />
        <Input label="Account Name" value={form.account_name} onChange={v => setForm(f => ({ ...f, account_name: v }))} placeholder="e.g. Demure Bakes" />
        <Input label="Account Number" value={form.account_number} onChange={v => setForm(f => ({ ...f, account_number: v }))} placeholder="e.g. 12345678" />
        <Input label="Sort Code" value={form.sort_code} onChange={v => setForm(f => ({ ...f, sort_code: v }))} placeholder="e.g. 04-00-04" />
        {msg && <p style={{ color: msg.includes('success') ? '#27ae60' : '#c0392b', fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', marginBottom: '0.75rem' }}>{msg}</p>}
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Bank Details'}</Btn>
      </Card>
    </div>
  )
}

/* ─── GALLERY TAB ─── */
function GalleryTab() {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef()

  const load = () => getGallery().then(setImages).catch(() => {})
  useEffect(() => { load() }, [])

  const handleUpload = async files => {
    if (!files.length) return
    setUploading(true); setMsg('')
    try {
      const { urls } = await uploadImages(Array.from(files))
      for (const url of urls) await addGalleryImage({ url, alt: '' })
      setMsg(`${urls.length} image(s) added!`)
      load()
    } catch { setMsg('Upload failed') }
    finally { setUploading(false) }
  }

  const remove = async id => {
    if (!confirm('Remove from gallery?')) return
    await deleteGalleryImage(id); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color: dark }}>Gallery</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {msg && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', color: msg.includes('failed') ? '#c0392b' : '#27ae60' }}>{msg}</span>}
          <Btn variant="gold" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : '+ Add Images'}
          </Btn>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
        {images.map(img => (
          <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '2px solid #eee' }}>
            <img src={img.url} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => remove(img.id)}
              style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(192,57,43,0.85)', color: white, border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── SETTINGS TAB ─── */
function SettingsTab({ onLogout }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (form.next !== form.confirm) { setMsg('New passwords do not match'); return }
    if (form.next.length < 6) { setMsg('Password must be at least 6 characters'); return }
    setSaving(true); setMsg('')
    try {
      await changePassword(form.current, form.next)
      setMsg('Password changed successfully!')
      setForm({ current: '', next: '', confirm: '' })
    } catch { setMsg('Failed — check your current password') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color: dark, marginBottom: '1.5rem' }}>Settings</h2>
      <Card>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.05rem', color: dark, marginBottom: '1.25rem' }}>Change Password</h3>
        <Input label="Current Password" type="password" value={form.current} onChange={v => setForm(f => ({ ...f, current: v }))} />
        <Input label="New Password" type="password" value={form.next} onChange={v => setForm(f => ({ ...f, next: v }))} />
        <Input label="Confirm New Password" type="password" value={form.confirm} onChange={v => setForm(f => ({ ...f, confirm: v }))} />
        {msg && <p style={{ color: msg.includes('success') ? '#27ae60' : '#c0392b', fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', marginBottom: '0.75rem' }}>{msg}</p>}
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Update Password'}</Btn>
      </Card>
      <Card>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.05rem', color: dark, marginBottom: '0.75rem' }}>Session</h3>
        <Btn variant="danger" onClick={onLogout}>Sign Out</Btn>
      </Card>
    </div>
  )
}

/* ─── MAIN ADMIN ─── */
const TABS = [
  { id: 'products', label: '🧁 Products' },
  { id: 'testimonials', label: '⭐ Testimonials' },
  { id: 'bank', label: '🏦 Bank Details' },
  { id: 'gallery', label: '🖼 Gallery' },
  { id: 'settings', label: '⚙️ Settings' },
]

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))
  const [tab, setTab] = useState('products')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
  }

  if (!token) return <LoginPage onLogin={setToken} />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0ebe2', fontFamily: "'Inter',sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', background: dark, color: cream, display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-240px', bottom: 0, zIndex: 200,
        transition: 'left 0.3s ease',
      }} className="admin-sidebar">
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 700, fontStyle: 'italic', color: gold }}>Demure</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 400, color: cream, marginLeft: 5 }}>Bakes</span>
          <p style={{ fontSize: '0.72rem', color: 'rgba(245,240,232,0.5)', marginTop: '0.25rem' }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', background: tab === t.id ? 'rgba(200,168,75,0.15)' : 'transparent',
                border: 'none', borderLeft: tab === t.id ? `3px solid ${gold}` : '3px solid transparent',
                color: tab === t.id ? gold : 'rgba(245,240,232,0.7)', padding: '0.75rem 1.25rem',
                fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', fontWeight: tab === t.id ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <a href="/" style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: '0.8rem', color: 'rgba(245,240,232,0.5)', textDecoration: 'none', marginBottom: '0.5rem' }}>← View Website</a>
        </div>
      </aside>

      {/* Desktop sidebar always visible */}
      <aside style={{
        width: '240px', background: dark, color: cream, display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }} className="admin-sidebar-desktop">
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 700, fontStyle: 'italic', color: gold }}>Demure</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 400, color: cream, marginLeft: 5 }}>Bakes</span>
          <p style={{ fontSize: '0.72rem', color: 'rgba(245,240,232,0.5)', marginTop: '0.25rem' }}>Admin Panel</p>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', background: tab === t.id ? 'rgba(200,168,75,0.15)' : 'transparent',
                border: 'none', borderLeft: tab === t.id ? `3px solid ${gold}` : '3px solid transparent',
                color: tab === t.id ? gold : 'rgba(245,240,232,0.7)', padding: '0.75rem 1.25rem',
                fontFamily: "'Inter',sans-serif", fontSize: '0.88rem', fontWeight: tab === t.id ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <a href="/" style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: '0.8rem', color: 'rgba(245,240,232,0.5)', textDecoration: 'none' }}>← View Website</a>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minWidth: 0 }}>
        {/* Mobile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }} className="mobile-header">
          <button onClick={() => setSidebarOpen(true)} style={{ background: dark, color: cream, border: 'none', borderRadius: '8px', padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '1.1rem' }}>☰</button>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 600, color: dark }}>
            {TABS.find(t => t.id === tab)?.label}
          </span>
        </div>

        {tab === 'products' && <ProductsTab />}
        {tab === 'testimonials' && <TestimonialsTab />}
        {tab === 'bank' && <BankTab />}
        {tab === 'gallery' && <GalleryTab />}
        {tab === 'settings' && <SettingsTab onLogout={handleLogout} />}
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} />}

      <style>{`
        @media (min-width: 769px) {
          .admin-sidebar { display: none !important; }
          .mobile-header { display: none !important; }
        }
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
