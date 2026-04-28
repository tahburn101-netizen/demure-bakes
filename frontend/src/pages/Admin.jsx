import React, { useState, useEffect, useRef } from 'react'

const API = 'https://demure-bakes-backend-production.up.railway.app'

/* ─── helpers ─── */
async function apiFetch(path, opts = {}, token = '') {
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) }
  const res = await fetch(`${API}${path}`, { ...opts, headers })
  const text = await res.text()
  if (!res.ok) throw new Error(text)
  try { return JSON.parse(text) } catch { return text }
}

async function apiUpload(path, formData, token) {
  const res = await fetch(`${API}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData })
  const text = await res.text()
  if (!res.ok) throw new Error(text)
  try { return JSON.parse(text) } catch { return text }
}

/* ─── colours ─── */
const C = {
  bg: '#FAF7F2', card: '#FFFFFF', brown: '#3D2314', mid: '#6B4226',
  gold: '#C9963A', goldLight: '#E8B86D', cream: '#EDE8DF',
  border: 'rgba(107,66,38,0.15)', text: '#3D2314', muted: '#7A5C3E',
}

const inputStyle = {
  width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px',
  border: `1.5px solid ${C.border}`, fontFamily: 'Nunito, sans-serif',
  fontSize: '0.9rem', color: C.text, background: 'white',
  boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
}

function Btn({ children, onClick, variant = 'primary', disabled, style = {} }) {
  const base = {
    border: 'none', borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.9rem',
    padding: '0.6rem 1.2rem', transition: 'all 0.2s', opacity: disabled ? 0.55 : 1,
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
  }
  const variants = {
    primary: { background: C.brown, color: C.cream },
    gold: { background: C.gold, color: 'white', boxShadow: '0 2px 10px rgba(201,150,58,0.3)' },
    danger: { background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5' },
    ghost: { background: 'transparent', color: C.mid, border: `1px solid ${C.border}` },
    success: { background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' },
  }
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>
}

const TABS = [
  { id: 'orders',    label: '📦 Orders' },
  { id: 'products',  label: '🧁 Products' },
  { id: 'reviews',   label: '⭐ Reviews' },
  { id: 'pending_reviews', label: '🔔 Pending Reviews' },
  { id: 'faqs',      label: '❓ FAQs' },
  { id: 'slots',     label: '🗓️ Slots' },
  { id: 'content',   label: '✏️ Site Text' },
  { id: 'bank',      label: '🏦 Bank Details' },
  { id: 'gallery',   label: '🖼️ Gallery' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '')
  const [tab, setTab] = useState('orders')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogin = (t) => { setToken(t); localStorage.setItem('admin_token', t) }
  const handleLogout = () => { setToken(''); localStorage.removeItem('admin_token') }

  if (!token) return <LoginPage onLogin={handleLogin} />

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{ background: C.brown, height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', flexShrink: 0, position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: C.cream, borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '1.1rem' }}>☰</button>
          <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.15rem', color: C.cream }}>🧁 Demure Bakes</span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'rgba(237,232,223,0.55)', marginLeft: '0.25rem' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'rgba(237,232,223,0.6)', textDecoration: 'none' }}>View Site ↗</a>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: C.cream, borderRadius: '8px', padding: '0.35rem 0.8rem', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', fontWeight: 600 }}>Sign Out</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 299 }} />
            <aside style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '220px', background: C.brown, zIndex: 300, display: 'flex', flexDirection: 'column', padding: '1rem 0' }}>
              <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.1rem', color: C.cream }}>🧁 Admin Panel</div>
              </div>
              <nav style={{ flex: 1, padding: '0.75rem 0' }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false) }} style={{
                    display: 'block', width: '100%', textAlign: 'left', background: tab === t.id ? 'rgba(201,150,58,0.2)' : 'transparent',
                    border: 'none', borderLeft: tab === t.id ? `3px solid ${C.gold}` : '3px solid transparent',
                    color: tab === t.id ? C.gold : 'rgba(237,232,223,0.75)', padding: '0.7rem 1.25rem',
                    fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer',
                  }}>{t.label}</button>
                ))}
              </nav>
            </aside>
          </>
        )}

        {/* Desktop sidebar */}
        <aside className="desktop-sidebar" style={{ width: '200px', background: C.brown, flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '1rem 0' }}>
          <nav style={{ flex: 1 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'block', width: '100%', textAlign: 'left', background: tab === t.id ? 'rgba(201,150,58,0.2)' : 'transparent',
                border: 'none', borderLeft: tab === t.id ? `3px solid ${C.gold}` : '3px solid transparent',
                color: tab === t.id ? C.gold : 'rgba(237,232,223,0.75)', padding: '0.7rem 1.25rem',
                fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', minWidth: 0 }}>
          {tab === 'orders'          && <OrdersTab token={token} />}
          {tab === 'products'        && <ProductsTab token={token} />}
          {tab === 'reviews'         && <ReviewsTab token={token} />}
          {tab === 'pending_reviews' && <PendingReviewsTab token={token} />}
          {tab === 'faqs'            && <FAQsTab token={token} />}
          {tab === 'slots'           && <SlotsTab token={token} />}
          {tab === 'content'         && <ContentTab token={token} />}
          {tab === 'bank'            && <BankTab token={token} />}
          {tab === 'gallery'         && <GalleryTab token={token} />}
        </main>
      </div>

      <style>{`
        .desktop-sidebar { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        input:focus, textarea:focus, select:focus { border-color: ${C.gold} !important; }
      `}</style>
    </div>
  )
}

/* ─── LOGIN ─── */
function LoginPage({ onLogin }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault(); setLoading(true); setErr('')
    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) })
      onLogin(data.token)
    } catch { setErr('Invalid username or password') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 16px 60px rgba(61,35,20,0.12)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧁</div>
          <h1 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.75rem', color: C.brown, margin: 0 }}>Demure Bakes</h1>
          <p style={{ fontFamily: 'Nunito, sans-serif', color: C.muted, margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Admin Dashboard</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: C.muted, display: 'block', marginBottom: '0.4rem' }}>Username</label>
            <input style={inputStyle} value={u} onChange={e => setU(e.target.value)} placeholder="demiadmin" autoComplete="username" required />
          </div>
          <div>
            <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: C.muted, display: 'block', marginBottom: '0.4rem' }}>Password</label>
            <input style={inputStyle} type="password" value={p} onChange={e => setP(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
          </div>
          {err && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: '#B91C1C', background: '#FEE2E2', padding: '0.6rem 0.9rem', borderRadius: '8px' }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ background: C.brown, color: C.cream, border: 'none', borderRadius: '12px', padding: '0.875rem', fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <a href="/" style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem', color: C.gold, textDecoration: 'none' }}>← Back to website</a>
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   ORDERS TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function OrdersTab({ token }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  const load = () => {
    setLoading(true)
    apiFetch('/api/orders', {}, token).then(d => { setOrders(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const toggleDeposit = async (o) => {
    await apiFetch(`/api/orders/${o.id}/deposit`, { method: 'PATCH', body: JSON.stringify({ deposit_paid: !o.deposit_paid }) }, token)
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, deposit_paid: !x.deposit_paid } : x))
  }

  const setStatus = async (o, status) => {
    await apiFetch(`/api/orders/${o.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token)
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status } : x))
  }

  const del = async (id) => {
    if (!confirm('Delete this order permanently?')) return
    await apiFetch(`/api/orders/${id}`, { method: 'DELETE' }, token)
    setOrders(prev => prev.filter(x => x.id !== id))
    if (expanded === id) setExpanded(null)
  }

  const filtered = orders.filter(o => {
    if (filter === 'unpaid' && o.deposit_paid) return false
    if (filter === 'paid' && !o.deposit_paid) return false
    if (filter === 'pending' && o.status !== 'pending') return false
    if (filter === 'confirmed' && o.status !== 'confirmed') return false
    if (search) {
      const q = search.toLowerCase()
      return (o.reference || '').toLowerCase().includes(q) || (o.customer_name || '').toLowerCase().includes(q) || (o.customer_email || '').toLowerCase().includes(q)
    }
    return true
  })

  const statusBg = s => ({ confirmed: '#DCFCE7', cancelled: '#FEE2E2', pending: '#FEF3C7' }[s] || '#F3F4F6')
  const statusColor = s => ({ confirmed: '#166534', cancelled: '#B91C1C', pending: '#92400E' }[s] || '#374151')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: C.brown, margin: 0 }}>Orders</h2>
        <Btn variant="ghost" onClick={load}>↻ Refresh</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: orders.length, color: C.brown },
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#92400E' },
          { label: 'Deposit Paid', value: orders.filter(o => o.deposit_paid).length, color: '#166534' },
          { label: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: C.gold },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '14px', padding: '1rem', border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: C.muted, marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'unpaid', 'paid', 'pending', 'confirmed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.35rem 0.85rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.8rem',
            background: filter === f ? C.brown : C.cream, color: filter === f ? C.cream : C.muted,
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
        <input style={{ ...inputStyle, width: '200px', padding: '0.4rem 0.85rem', marginLeft: 'auto' }}
          placeholder="Search ref / name..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>
          {orders.length === 0 ? 'No orders yet. Orders will appear here when customers place them.' : 'No orders match your filter.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(o => (
            <div key={o.id} style={{
              background: 'white', borderRadius: '16px', padding: '1.25rem',
              border: `1px solid ${C.border}`, borderLeft: `4px solid ${o.deposit_paid ? '#16A34A' : C.gold}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1rem', color: C.brown, background: C.cream, padding: '0.15rem 0.6rem', borderRadius: '6px' }}>{o.reference}</span>
                    <span style={{ padding: '0.15rem 0.55rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif', background: statusBg(o.status), color: statusColor(o.status) }}>{o.status}</span>
                    <span style={{ padding: '0.15rem 0.55rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif', background: o.deposit_paid ? '#DCFCE7' : '#FEF3C7', color: o.deposit_paid ? '#166534' : '#92400E' }}>
                      {o.deposit_paid ? '✓ Deposit Paid' : '⏳ Deposit Pending'}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', color: C.muted }}>
                    <strong style={{ color: C.brown }}>{o.customer_name}</strong>
                    {o.customer_email && ` · ${o.customer_email}`}
                    {o.customer_phone && ` · ${o.customer_phone}`}
                  </div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem', color: C.muted, marginTop: '0.2rem' }}>
                    {o.product_name} ×{o.quantity}
                    {o.delivery_date && ` · Delivery: ${o.delivery_date}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.1rem', color: C.brown }}>£{Number(o.total || 0).toFixed(2)}</div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: C.gold }}>Deposit: £{Number(o.deposit || 0).toFixed(2)}</div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.72rem', color: C.muted, marginTop: '0.2rem' }}>
                    {o.created_at ? new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.72rem', color: C.muted }}>{expanded === o.id ? '▲ Hide' : '▼ Details'}</div>
                </div>
              </div>

              {expanded === o.id && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
                  {o.special_requests && (
                    <div style={{ background: C.bg, borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: C.muted }}>
                      <strong>Customer Notes:</strong> {o.special_requests}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Btn variant={o.deposit_paid ? 'ghost' : 'gold'} onClick={() => toggleDeposit(o)} style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
                      {o.deposit_paid ? '↩ Mark Deposit Unpaid' : '💳 Mark Deposit Paid'}
                    </Btn>
                    {o.status !== 'confirmed' && (
                      <Btn variant="success" onClick={() => setStatus(o, 'confirmed')} style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>✓ Confirm Order</Btn>
                    )}
                    {o.status === 'confirmed' && (
                      <Btn variant="ghost" onClick={() => setStatus(o, 'pending')} style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>↩ Set Pending</Btn>
                    )}
                    {o.status !== 'cancelled' && (
                      <Btn variant="ghost" onClick={() => setStatus(o, 'cancelled')} style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', color: '#B91C1C', borderColor: '#FCA5A5' }}>✕ Cancel</Btn>
                    )}
                    <Btn variant="danger" onClick={() => del(o.id)} style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', marginLeft: 'auto' }}>🗑 Delete</Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCTS TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function ProductsTab({ token }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'brownies', available: true })
  const [flavours, setFlavours] = useState([]) // array of strings
  const [portionSizes, setPortionSizes] = useState([]) // array of { label, price }
  const [allergens, setAllergens] = useState([]) // array of strings
  const [newFlavour, setNewFlavour] = useState('')
  const [newAllergen, setNewAllergen] = useState('')
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef()

  const load = () => {
    setLoading(true)
    fetch(`${API}/api/products`).then(r => r.json()).then(d => { setProducts(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const CATEGORIES = ['brownies', 'cupcakes', 'loaf cakes', 'tray bakes']

  const openNew = () => {
    setEditing('new')
    setForm({ name: '', description: '', price: '', category: 'brownies', available: true })
    setFlavours([])
    setPortionSizes([])
    setAllergens([])
    setNewFlavour('')
    setNewAllergen('')
    setFiles([])
    setMsg('')
  }
  const openEdit = p => {
    setEditing(p.id)
    setForm({ name: p.name, description: p.description || '', price: String(p.price || ''), category: p.category || 'brownies', available: p.available !== false })
    setFlavours(Array.isArray(p.flavours) ? p.flavours : [])
    setPortionSizes(Array.isArray(p.portion_sizes) ? p.portion_sizes : [])
    setAllergens(Array.isArray(p.allergens) ? p.allergens : [])
    setNewFlavour('')
    setNewAllergen('')
    setFiles([])
    setMsg('')
  }

  const handleSave = async () => {
    if (!form.name) { setMsg('Product name is required'); return }
    if (portionSizes.length === 0) { setMsg('Add at least one portion size with a price'); return }
    setSaving(true); setMsg('')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      // Use lowest portion size price as the base price
      const basePrice = portionSizes.length > 0 ? Math.min(...portionSizes.map(s => parseFloat(s.price) || 0)) : parseFloat(form.price) || 0
      fd.append('price', basePrice)
      fd.append('category', form.category)
      fd.append('available', form.available)
      fd.append('flavours', JSON.stringify(flavours))
      fd.append('portion_sizes', JSON.stringify(portionSizes))
      fd.append('allergens', JSON.stringify(allergens))
      files.forEach(f => fd.append('images', f))
      const url = editing === 'new' ? `${API}/api/products` : `${API}/api/products/${editing}`
      const method = editing === 'new' ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (!res.ok) throw new Error(await res.text())
      setMsg('✓ Saved!'); setEditing(null); load()
    } catch (e) { setMsg('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  const del = async id => {
    if (!confirm('Delete this product?')) return
    await fetch(`${API}/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: C.brown, margin: 0 }}>Products</h2>
        <Btn variant="gold" onClick={openNew}>+ Add Product</Btn>
      </div>

      {editing && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: `2px solid ${C.gold}` }}>
          <h3 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, color: C.brown, margin: '0 0 1.25rem' }}>{editing === 'new' ? 'New Product' : 'Edit Product'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.3rem' }}>Product Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Oreo Brownie Slab" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.3rem' }}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the product..." />
            </div>
            <div>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.3rem' }}>Category</label>
              <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            {/* ── PORTION SIZES ── */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.5rem' }}>Portion Sizes &amp; Prices *</label>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: C.muted, margin: '0 0 0.75rem' }}>Each size can have its own price. Customers choose from these options when ordering.</p>
              {portionSizes.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <input
                    style={{ ...inputStyle, flex: 2 }}
                    value={s.label}
                    onChange={e => setPortionSizes(ps => ps.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                    placeholder="e.g. Box of 6, Serves 4-6"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: C.gold }}>£</span>
                    <input
                      style={{ ...inputStyle }}
                      type="number" step="0.01" min="0"
                      value={s.price}
                      onChange={e => setPortionSizes(ps => ps.map((x, j) => j === i ? { ...x, price: e.target.value } : x))}
                      placeholder="0.00"
                    />
                  </div>
                  <button onClick={() => setPortionSizes(ps => ps.filter((_, j) => j !== i))} style={{ background: '#FEE2E2', color: '#B91C1C', border: 'none', borderRadius: '8px', padding: '0.5rem 0.65rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>✕</button>
                </div>
              ))}
              <button
                onClick={() => setPortionSizes(ps => [...ps, { label: '', price: '' }])}
                style={{ background: C.cream, border: `1.5px dashed ${C.border}`, borderRadius: '10px', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, width: '100%', marginTop: '0.25rem' }}
              >+ Add Portion Size</button>
            </div>

            {/* ── FLAVOURS ── */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.5rem' }}>Flavours (optional)</label>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: C.muted, margin: '0 0 0.75rem' }}>Add available flavours. Customers choose from these when ordering. Leave empty if not applicable.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {flavours.map((f, i) => (
                  <span key={i} style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '0.25rem 0.7rem', fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem', color: C.brown, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {f}
                    <button onClick={() => setFlavours(fl => fl.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontWeight: 700, padding: 0, lineHeight: 1 }}>✕</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={newFlavour}
                  onChange={e => setNewFlavour(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newFlavour.trim()) { setFlavours(fl => [...fl, newFlavour.trim()]); setNewFlavour('') } }}
                  placeholder="e.g. Vanilla, Chocolate, Biscoff"
                />
                <button
                  onClick={() => { if (newFlavour.trim()) { setFlavours(fl => [...fl, newFlavour.trim()]); setNewFlavour('') } }}
                  style={{ background: C.gold, color: 'white', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem' }}
                >Add</button>
              </div>
            </div>
            {/* ── ALLERGEN / DIETARY TAGS ── */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.5rem' }}>Allergens &amp; Dietary Info (optional)</label>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: C.muted, margin: '0 0 0.5rem' }}>e.g. Gluten, Nuts, Dairy, Eggs, Vegan, Gluten-Free, Nut-Free</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {allergens.map((a, i) => {
                  const isPositive = ['Vegan', 'Gluten-Free', 'Nut-Free'].includes(a)
                  return (
                    <span key={i} style={{ background: isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isPositive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`, color: isPositive ? 'rgb(22,163,74)' : 'rgb(185,28,28)', borderRadius: '20px', padding: '0.25rem 0.7rem', fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {a}
                      <button onClick={() => setAllergens(al => al.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, padding: 0, lineHeight: 1 }}>✕</button>
                    </span>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={newAllergen}
                  onChange={e => setNewAllergen(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newAllergen.trim()) { setAllergens(al => [...al, newAllergen.trim()]); setNewAllergen('') } }}
                  placeholder="e.g. Gluten, Vegan, Nut-Free"
                />
                <button
                  onClick={() => { if (newAllergen.trim()) { setAllergens(al => [...al, newAllergen.trim()]); setNewAllergen('') } }}
                  style={{ background: C.gold, color: 'white', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem' }}
                >Add</button>
              </div>
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.3rem' }}>
                Product Images {editing !== 'new' && '(upload new to add/replace)'}
              </label>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => setFiles(Array.from(e.target.files))} />
              <button onClick={() => fileRef.current.click()} style={{ ...inputStyle, cursor: 'pointer', border: `2px dashed ${C.border}`, textAlign: 'center', color: C.muted }}>
                📷 {files.length > 0 ? `${files.length} file(s) selected` : 'Click to choose images'}
              </button>
              {files.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {files.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />)}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.88rem', color: C.muted }}>
                <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
                Available for order
              </label>
            </div>
          </div>
          {msg && <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: msg.startsWith('Error') ? '#B91C1C' : '#166534', marginTop: '0.75rem' }}>{msg}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Btn variant="gold" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saving...' : '✓ Save Product'}</Btn>
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${C.border}`, opacity: p.available === false ? 0.6 : 1 }}>
              {p.images?.[0] && <img src={p.images[0].startsWith('http') ? p.images[0] : `${API}/uploads/${p.images[0]}`} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <h4 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1rem', color: C.brown, margin: 0 }}>{p.name}</h4>
                  <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, color: C.gold }}>£{p.price}</span>
                </div>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: C.muted, margin: '0 0 0.75rem', lineHeight: 1.5 }}>{p.description}</p>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '20px', background: C.cream, color: C.muted }}>{p.category}</span>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '20px', background: p.available !== false ? '#DCFCE7' : '#FEE2E2', color: p.available !== false ? '#166534' : '#B91C1C' }}>
                    {p.available !== false ? 'Available' : 'Unavailable'}
                  </span>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.72rem', color: C.muted }}>{p.images?.length || 0} photo{(p.images?.length || 0) !== 1 ? 's' : ''}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                    <Btn variant="ghost" onClick={() => openEdit(p)} style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}>Edit</Btn>
                    <Btn variant="danger" onClick={() => del(p.id)} style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}>Del</Btn>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   REVIEWS TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function ReviewsTab({ token }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ author: '', role: '', content: '', rating: 5 })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => {
    setLoading(true)
    fetch(`${API}/api/testimonials`).then(r => r.json()).then(d => { setReviews(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing('new'); setForm({ author: '', role: '', content: '', rating: 5 }); setMsg('') }
  const openEdit = r => { setEditing(r.id); setForm({ author: r.author, role: r.role || '', content: r.content, rating: r.rating || 5 }); setMsg('') }

  const handleSave = async () => {
    if (!form.author || !form.content) { setMsg('Author and review text are required'); return }
    setSaving(true); setMsg('')
    try {
      const url = editing === 'new' ? `${API}/api/testimonials` : `${API}/api/testimonials/${editing}`
      const method = editing === 'new' ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error(await res.text())
      setMsg('✓ Saved!'); setEditing(null); load()
    } catch (e) { setMsg('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  const del = async id => {
    if (!confirm('Delete this review?')) return
    await fetch(`${API}/api/testimonials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: C.brown, margin: 0 }}>Reviews</h2>
        <Btn variant="gold" onClick={openNew}>+ Add Review</Btn>
      </div>

      {editing && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: `2px solid ${C.gold}` }}>
          <h3 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, color: C.brown, margin: '0 0 1.25rem' }}>{editing === 'new' ? 'New Review' : 'Edit Review'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.3rem' }}>Customer Name *</label>
              <input style={inputStyle} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Sarah M." />
            </div>
            <div>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.3rem' }}>Title / Role</label>
              <input style={inputStyle} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Verified Customer" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.3rem' }}>Review Text *</label>
              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write the review..." />
            </div>
            <div>
              <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: C.muted, display: 'block', marginBottom: '0.3rem' }}>Rating</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, rating: n }))} style={{ fontSize: '1.4rem', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= form.rating ? 1 : 0.25, transition: 'opacity 0.15s' }}>⭐</button>
                ))}
              </div>
            </div>
          </div>
          {msg && <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: msg.startsWith('Error') ? '#B91C1C' : '#166534', marginTop: '0.75rem' }}>{msg}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Btn variant="gold" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saving...' : '✓ Save Review'}</Btn>
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>Loading...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>No reviews yet. Add your first one!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Baloo 2", cursive', fontWeight: 800, color: 'white', fontSize: '1rem', flexShrink: 0 }}>
                      {(r.author || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '0.95rem', color: C.brown }}>{r.author}</div>
                      {r.role && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: C.muted }}>{r.role}</div>}
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>{'⭐'.repeat(r.rating || 5)}</div>
                  </div>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', color: C.muted, margin: 0, lineHeight: 1.6 }}>"{r.content}"</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <Btn variant="ghost" onClick={() => openEdit(r)} style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}>Edit</Btn>
                  <Btn variant="danger" onClick={() => del(r.id)} style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}>Del</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SITE CONTENT TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function ContentTab({ token }) {
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [msgs, setMsgs] = useState({})

  const load = () => {
    setLoading(true)
    fetch(`${API}/api/site-content`).then(r => r.json()).then(data => {
      const map = {}
      data.forEach(item => { map[item.key] = item.value })
      setContent(map); setLoading(false)
    }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const save = async (key) => {
    setSaving(s => ({ ...s, [key]: true }))
    try {
      const res = await fetch(`${API}/api/site-content/${key}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: content[key] })
      })
      if (!res.ok) throw new Error()
      setMsgs(m => ({ ...m, [key]: '✓ Saved' }))
      setTimeout(() => setMsgs(m => ({ ...m, [key]: '' })), 2500)
    } catch { setMsgs(m => ({ ...m, [key]: '✗ Error' })) }
    finally { setSaving(s => ({ ...s, [key]: false })) }
  }

  const GROUPS = [
    { label: '🦸 Hero Section', keys: ['hero_line1', 'hero_line2', 'hero_tagline', 'hero_badge1', 'hero_badge2'] },
    { label: '🧁 Menu Section', keys: ['menu_heading', 'menu_subheading'] },
    { label: '📋 How It Works', keys: ['how_heading', 'how_step1_title', 'how_step1_desc', 'how_step2_title', 'how_step2_desc', 'how_step3_title', 'how_step3_desc', 'how_step4_title', 'how_step4_desc'] },
    { label: '🖼️ Gallery Section', keys: ['gallery_heading', 'gallery_subheading'] },
    { label: '⭐ Reviews Section', keys: ['reviews_heading'] },
    { label: '👩‍🍳 About Section', keys: ['about_badge', 'about_heading1', 'about_heading2', 'about_para1', 'about_para2', 'about_stat1_num', 'about_stat1_label', 'about_stat2_num', 'about_stat2_label', 'about_stat3_num', 'about_stat3_label'] },
    { label: '📞 Contact & Footer', keys: ['contact_heading', 'contact_subheading', 'contact_instagram', 'contact_email', 'footer_tagline'] },
  ]

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>Loading content...</div>

  return (
    <div>
      <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: C.brown, margin: '0 0 0.5rem' }}>Site Text Editor</h2>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: C.muted, margin: '0 0 1.5rem' }}>Edit any text on the website. Changes save instantly and appear live across all devices.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {GROUPS.map(group => (
          <div key={group.label} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.05rem', color: C.brown, margin: '0 0 1.25rem' }}>{group.label}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {group.keys.map(key => (
                <div key={key}>
                  <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: C.muted, display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {key.replace(/_/g, ' ')}
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    {(content[key] || '').length > 80 ? (
                      <textarea style={{ ...inputStyle, flex: 1, minHeight: '80px', resize: 'vertical' }} value={content[key] || ''} onChange={e => setContent(c => ({ ...c, [key]: e.target.value }))} />
                    ) : (
                      <input style={{ ...inputStyle, flex: 1 }} value={content[key] || ''} onChange={e => setContent(c => ({ ...c, [key]: e.target.value }))} />
                    )}
                    <button onClick={() => save(key)} disabled={saving[key]} style={{
                      background: msgs[key] === '✓ Saved' ? '#DCFCE7' : C.gold, color: msgs[key] === '✓ Saved' ? '#166534' : 'white',
                      border: 'none', borderRadius: '10px', padding: '0.65rem 1rem', cursor: 'pointer',
                      fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, transition: 'all 0.2s',
                    }}>
                      {saving[key] ? '...' : msgs[key] || 'Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   BANK TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function BankTab({ token }) {
  const [form, setForm] = useState({ bank_name: '', account_name: '', account_number: '', sort_code: '', paypal_email: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`${API}/api/bank-details`).then(r => r.json()).then(d => {
      if (d) setForm({ bank_name: d.bank_name || '', account_name: d.account_name || '', account_number: d.account_number || '', sort_code: d.sort_code || '', paypal_email: d.paypal_email || '', notes: d.notes || '' })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`${API}/api/bank-details`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      setMsg('✓ Bank details saved successfully!')
    } catch { setMsg('✗ Error saving bank details') }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>Loading...</div>

  const fields = [
    { key: 'bank_name', label: 'Bank Name', placeholder: 'e.g. Monzo, Barclays' },
    { key: 'account_name', label: 'Account Name', placeholder: 'e.g. Demure Bakes' },
    { key: 'account_number', label: 'Account Number', placeholder: '12345678' },
    { key: 'sort_code', label: 'Sort Code', placeholder: '12-34-56' },
    { key: 'paypal_email', label: 'PayPal Email (optional)', placeholder: 'paypal@example.com' },
    { key: 'notes', label: 'Additional Notes (optional)', placeholder: 'Any extra payment instructions...' },
  ]

  return (
    <div>
      <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: C.brown, margin: '0 0 0.5rem' }}>Bank Details</h2>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: C.muted, margin: '0 0 1.5rem' }}>These details are shown to customers after they place an order and pay their 20% deposit.</p>

      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: `1px solid ${C.border}`, maxWidth: '560px' }}>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: '1.1rem' }}>
            <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: C.muted, display: 'block', marginBottom: '0.4rem' }}>{f.label}</label>
            <input style={inputStyle} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
          </div>
        ))}
        {msg && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: msg.startsWith('✓') ? '#166534' : '#B91C1C', background: msg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem' }}>{msg}</div>}
        <Btn variant="gold" onClick={save} disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', borderRadius: '12px' }}>
          {saving ? 'Saving...' : '✓ Save Bank Details'}
        </Btn>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   GALLERY TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function GalleryTab({ token }) {
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef()

  const load = () => {
    setLoading(true)
    fetch(`${API}/api/gallery`).then(r => r.json()).then(d => { setGallery(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const upload = async (files) => {
    if (!files.length) return
    setUploading(true); setMsg('')
    try {
      for (const file of files) {
        const fd = new FormData(); fd.append('image', file)
        const res = await fetch(`${API}/api/gallery`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
        if (!res.ok) throw new Error(await res.text())
      }
      setMsg(`✓ ${files.length} image(s) uploaded!`); load()
    } catch (e) { setMsg('✗ Error: ' + e.message) }
    finally { setUploading(false) }
  }

  const del = async id => {
    if (!confirm('Delete this image?')) return
    await fetch(`${API}/api/gallery/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: C.brown, margin: 0 }}>Gallery</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => upload(Array.from(e.target.files))} />
          <Btn variant="gold" onClick={() => fileRef.current.click()} disabled={uploading}>{uploading ? 'Uploading...' : '+ Upload Images'}</Btn>
        </div>
      </div>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: C.muted, margin: '0 0 1.5rem' }}>
        The gallery section on the website shows the latest posts from <strong>@demurebakes</strong> on Instagram. You can also manually upload images here as a fallback.
      </p>
      {msg && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: msg.startsWith('✓') ? '#166534' : '#B91C1C', background: msg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem' }}>{msg}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>Loading...</div>
      ) : gallery.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>No gallery images yet. Upload some!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {gallery.map(img => (
            <div key={img.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
              <img src={img.url ? (img.url.startsWith('http') ? img.url : `${API}/uploads/${img.url}`) : (img.filename ? `${API}/uploads/${img.filename}` : '')} alt={img.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => del(img.id)} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: 'white', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── PENDING REVIEWS TAB ─── */
function PendingReviewsTab({ token }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = () => {
    setLoading(true)
    apiFetch('/api/reviews/pending', {}, token)
      .then(d => { setReviews(d || []); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(load, [])

  const approve = async (id) => {
    try {
      await apiFetch(`/api/reviews/${id}/approve`, { method: 'PUT' }, token)
      setMsg('✓ Review approved and published!')
      load()
    } catch (e) { setMsg('Error: ' + e.message) }
  }

  const reject = async (id) => {
    if (!confirm('Delete this review permanently?')) return
    try {
      await apiFetch(`/api/reviews/${id}`, { method: 'DELETE' }, token)
      setMsg('✓ Review deleted.')
      load()
    } catch (e) { setMsg('Error: ' + e.message) }
  }

  return (
    <div>
      <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: C.brown, marginBottom: '1.5rem' }}>
        🔔 Pending Reviews
      </h2>
      {msg && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: msg.startsWith('✓') ? '#166534' : '#B91C1C', background: msg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem' }}>{msg}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>Loading...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>
          🎉 No pending reviews — you're all caught up!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(61,35,20,0.08)', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, color: C.brown }}>{r.author}</span>
                    <span style={{ color: '#F59E0B', fontSize: '0.9rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    {r.order_reference && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: C.muted, background: 'rgba(201,150,58,0.1)', padding: '0.1rem 0.5rem', borderRadius: '50px' }}>{r.order_reference}</span>}
                  </div>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: C.mid, margin: 0, lineHeight: 1.6 }}>{r.text}</p>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: C.muted, margin: '0.5rem 0 0' }}>{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <Btn variant="success" onClick={() => approve(r.id)}>✓ Approve</Btn>
                  <Btn variant="danger" onClick={() => reject(r.id)}>✕ Delete</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── FAQs TAB ─── */
function FAQsTab({ token }) {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [editing, setEditing] = useState(null) // null = list, 'new' = new, id = edit
  const [form, setForm] = useState({ question: '', answer: '', sort_order: 0 })

  const load = () => {
    setLoading(true)
    apiFetch('/api/faqs', {}, token)
      .then(d => { setFaqs(d || []); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(load, [])

  const startNew = () => { setForm({ question: '', answer: '', sort_order: faqs.length }); setEditing('new') }
  const startEdit = (faq) => { setForm({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order }); setEditing(faq.id) }

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) { setMsg('Please fill in both question and answer.'); return }
    try {
      if (editing === 'new') {
        await apiFetch('/api/faqs', { method: 'POST', body: JSON.stringify(form) }, token)
        setMsg('✓ FAQ added!')
      } else {
        await apiFetch(`/api/faqs/${editing}`, { method: 'PUT', body: JSON.stringify(form) }, token)
        setMsg('✓ FAQ updated!')
      }
      setEditing(null)
      load()
    } catch (e) { setMsg('Error: ' + e.message) }
  }

  const del = async (id) => {
    if (!confirm('Delete this FAQ?')) return
    try {
      await apiFetch(`/api/faqs/${id}`, { method: 'DELETE' }, token)
      setMsg('✓ FAQ deleted.')
      load()
    } catch (e) { setMsg('Error: ' + e.message) }
  }

  if (editing !== null) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Btn variant="ghost" onClick={() => setEditing(null)}>← Back</Btn>
          <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: C.brown, margin: 0 }}>
            {editing === 'new' ? 'New FAQ' : 'Edit FAQ'}
          </h2>
        </div>
        {msg && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: msg.startsWith('✓') ? '#166534' : '#B91C1C', background: msg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem' }}>{msg}</div>}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(61,35,20,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '640px' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: C.brown, marginBottom: '0.4rem' }}>Question *</label>
            <input style={inputStyle} value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="e.g. How far in advance do I need to order?" />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: C.brown, marginBottom: '0.4rem' }}>Answer *</label>
            <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Type the answer here..." />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: C.brown, marginBottom: '0.4rem' }}>Sort Order</label>
            <input type="number" style={{ ...inputStyle, width: '100px' }} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Btn variant="gold" onClick={save}>💾 Save FAQ</Btn>
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: C.brown, margin: 0 }}>❓ FAQs</h2>
        <Btn variant="gold" onClick={startNew}>+ Add FAQ</Btn>
      </div>
      {msg && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: msg.startsWith('✓') ? '#166534' : '#B91C1C', background: msg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem' }}>{msg}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>Loading...</div>
      ) : faqs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>No FAQs yet. Add your first one!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map(faq => (
            <div key={faq.id} style={{ background: 'white', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 10px rgba(61,35,20,0.07)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, color: C.brown, margin: '0 0 0.35rem', fontSize: '0.95rem' }}>{faq.question}</p>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: C.muted, margin: 0, lineHeight: 1.5 }}>{faq.answer.length > 120 ? faq.answer.slice(0, 120) + '...' : faq.answer}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <Btn variant="ghost" onClick={() => startEdit(faq)}>✏️ Edit</Btn>
                <Btn variant="danger" onClick={() => del(faq.id)}>✕</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── SLOTS TAB ─── */
function SlotsTab({ token }) {
  const [slots, setSlots] = useState({ week_label: '', slots_remaining: 5, show_counter: false })
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    apiFetch('/api/slots', {}, token)
      .then(d => { setSlots(d || { week_label: '', slots_remaining: 5, show_counter: false }); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    try {
      await apiFetch('/api/slots', { method: 'PUT', body: JSON.stringify(slots) }, token)
      setMsg('✓ Slot availability updated!')
    } catch (e) { setMsg('Error: ' + e.message) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: C.muted, fontFamily: 'Nunito, sans-serif' }}>Loading...</div>

  return (
    <div>
      <h2 style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: '1.5rem', color: C.brown, marginBottom: '0.5rem' }}>🗓️ Order Slots</h2>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: C.muted, marginBottom: '1.5rem' }}>
        Control the urgency banner shown at the top of the website. When enabled, customers will see how many slots are left for the week.
      </p>
      {msg && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: msg.startsWith('✓') ? '#166534' : '#B91C1C', background: msg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem' }}>{msg}</div>}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(61,35,20,0.08)', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, color: C.brown, margin: 0 }}>Show Slot Counter Banner</p>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem', color: C.muted, margin: '0.2rem 0 0' }}>Displays urgency banner at the top of the homepage</p>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
            <input type="checkbox" checked={slots.show_counter} onChange={e => setSlots(s => ({ ...s, show_counter: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '13px', transition: '0.3s',
              background: slots.show_counter ? C.gold : '#D1D5DB',
            }}>
              <span style={{
                position: 'absolute', top: '3px', left: slots.show_counter ? '25px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                transition: '0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </span>
          </label>
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: C.brown, marginBottom: '0.4rem' }}>Week Label</label>
          <input style={inputStyle} value={slots.week_label} onChange={e => setSlots(s => ({ ...s, week_label: e.target.value }))} placeholder="e.g. this weekend, w/c 5 May" />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: C.brown, marginBottom: '0.4rem' }}>Slots Remaining</label>
          <input type="number" min="0" max="99" style={{ ...inputStyle, width: '100px' }} value={slots.slots_remaining} onChange={e => setSlots(s => ({ ...s, slots_remaining: parseInt(e.target.value) || 0 }))} />
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.78rem', color: C.muted, margin: '0.4rem 0 0' }}>
            🔥 Banner turns orange/red when ≤ 2 slots remain. Set to 0 to show "No slots available".
          </p>
        </div>
        <Btn variant="gold" onClick={save} style={{ alignSelf: 'flex-start' }}>💾 Save</Btn>
      </div>
    </div>
  )
}
