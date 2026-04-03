import { useState, useEffect } from 'react'
import { useAuth } from '@/auth/AuthContext';
import AppShell from '@/components/AppShell'
import { Plus, Package, Edit2, RefreshCw, Trash2, X, Save, Activity, Search } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  quantity: number
  price: number
  category: string
  stock: 'optimal' | 'low' | 'critical' | 'overstock'
}

const stockColors = {
  optimal:   { bg: 'bg-success/10',    text: 'text-success',  border: 'border-success/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]', label: 'Optimal'   },
  low:       { bg: 'bg-warning/10',    text: 'text-warning', border: 'border-warning/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]', label: 'Low Stock' },
  critical:  { bg: 'bg-critical/10',   text: 'text-critical', border: 'border-critical/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]', label: 'Critical'  },
  overstock: { bg: 'bg-info/10',       text: 'text-info', border: 'border-info/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]', label: 'Overstock' },
}

const empty: Product = { id: '', name: '', description: '', quantity: 0, price: 0, category: 'Uncategorized', stock: 'optimal' }

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

const [showForm, setShowForm]   = useState(false)
  const [editId,   setEditId]     = useState<string | null>(null)
  const [form,     setForm]       = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [restock,  setRestock]    = useState<string | null>(null)
  const [restockQty, setRestockQty] = useState(0)

  const [flowOpen, setFlowOpen] = useState<string | null>(null)
  const [flowData, setFlowData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<{name: string, description?: string}[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const { getAuthHeader, role } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/categories', { 
        headers: { Authorization: getAuthHeader() } 
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/products', { 
        headers: { Authorization: getAuthHeader() } 
      })
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const openAdd = () => { setForm(empty); setEditId(null); setShowForm(true) }

  const openEdit = (p: Product) => {
    setForm({ ...p })
    setEditId(p.id)
    setShowForm(true)
  }

const saveProduct = async () => {
    if (!form.name.trim()) {
      setError('Product name is required')
      return
    }
    if (form.quantity < 0 || form.price <= 0) {
      setError('Quantity must be >= 0 and price > 0')
      return
    }

    setSaving(true)
    setError('')
    
    try {
      if (editId) {
        const res = await fetch(`http://localhost:5000/products/${editId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: getAuthHeader()
          },
          body: JSON.stringify(form)
        })
        if (!res.ok) {
          throw new Error(`Update failed: ${res.status} ${res.statusText}`)
        }
      } else {
        const newId = 'PRD-' + String(Date.now()).slice(-4)
        const newForm = { ...form, id: newId, quantity: Number(form.quantity), price: Number(form.price) }
        const res = await fetch('http://localhost:5000/products', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: getAuthHeader()
          },
          body: JSON.stringify(newForm)
        })
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || `Create failed: ${res.status} ${res.statusText}`)
        }
      }
      
      setShowForm(false)
      setForm(empty)
      setEditId(null)
      fetchProducts()
    } catch (err: any) {
      console.error('Save product error:', err)
      setError(err.message || 'Failed to save product. Check console.')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: string) => {
    await fetch(`http://localhost:5000/products/${id}`, { 
      method: 'DELETE',
      headers: { Authorization: getAuthHeader() }
    })
    fetchProducts()
  }

  const doRestock = async (id: string) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    const updated = { ...product, quantity: product.quantity + restockQty }
    await fetch(`http://localhost:5000/products/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: getAuthHeader()
      },
      body: JSON.stringify(updated)
    })
    setRestock(null)
    setRestockQty(0)
    fetchProducts()
  }

  const toggleFlow = async (id: string) => {
    if (flowOpen === id) {
      setFlowOpen(null)
      return
    }
    const res = await fetch(`http://localhost:5000/products/${id}/flow`, {
      headers: { Authorization: getAuthHeader() }
    })
    const data = await res.json()
    setFlowData(data)
    setFlowOpen(id)
  }

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Category name required');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: getAuthHeader()
        },
        body: JSON.stringify(newCategory)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      setNewCategory({ name: '', description: '' });
      setShowCategoryModal(false);
      fetchCategories();
      console.log('Category created successfully');
    } catch (err: any) {
      console.error('Failed to create category:', err);
      alert('Failed to create category: ' + err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Product Repository
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Manage your products — add, edit, restock or remove items.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input 
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center outline-none shrink-0 gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold bg-primary hover:bg-primary/90 hover:shadow-neon-purple active:scale-95 transition-all"
            >
              <Plus className="h-5 w-5" /> Add Product
            </button>
          </div>
        </div>

        {/* Product Cards */}
        {loading ? (
          <div className="flex justify-center py-20"><p className="text-white">Loading products...</p></div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground border border-dashed border-white/20 rounded-3xl bg-white/5">
            <Package className="h-20 w-20 mb-6 opacity-40 text-primary" />
            <p className="text-xl font-bold text-white drop-shadow-sm">No products found</p>
            <p className="text-sm mt-2 font-medium">Click "Add Product" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())).map((product, i) => {
              const sc = stockColors[product.stock] || stockColors.optimal
              return (
                <div
                  key={product.id}
                  className="group bg-card backdrop-blur-glass rounded-2xl border border-white/10 p-6 flex flex-col gap-4 shadow-glass hover:border-white/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 shadow-neon-purple">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                      {sc.label}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <p className="font-bold text-lg text-white drop-shadow-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{product.id}</p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mt-2 relative z-10">
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Quantity</p>
                      <p className="font-display font-bold text-xl text-white mt-1 drop-shadow-sm">{product.quantity}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Price</p>
                      <p className="font-display font-bold text-xl text-success mt-1 drop-shadow-sm">₹{product.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2 relative z-10 flex-wrap">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-white/5 text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => { setRestock(product.id); setRestockQty(0); setFlowOpen(null) }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-info/20 text-info border border-info/50 hover:bg-info hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Restock
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 rounded-xl bg-critical/10 text-critical border border-critical/30 hover:bg-critical hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => { toggleFlow(product.id); setRestock(null) }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all mt-1"
                  >
                    <Activity className="h-3.5 w-3.5" /> {flowOpen === product.id ? 'Close Details' : 'View Product Details & Flow'}
                  </button>

                  {restock === product.id && (
                    <div className="mt-3 p-4 rounded-xl border border-info/30 bg-info/10 relative z-10 animate-in fade-in slide-in-from-top-2">
                      <p className="text-xs font-bold text-info mb-3 uppercase tracking-wider">Adjust Stock (use negative for Sales):</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={restockQty}
                          onChange={e => setRestockQty(Number(e.target.value))}
                          placeholder="+ or -"
                          className="w-24 px-3 py-1.5 rounded-lg border border-info/50 bg-black/40 text-white text-sm outline-none focus:border-info focus:ring-1 focus:ring-info shadow-inner"
                        />
                        <button
                          onClick={() => doRestock(product.id)}
                          className="flex-1 px-4 py-1.5 flex items-center justify-center gap-1 rounded-lg text-white text-xs font-bold bg-info hover:bg-info/80 hover:shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add
                        </button>
                        <button
                          onClick={() => setRestock(null)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/10 text-muted-foreground hover:text-white hover:bg-white/20 transition-all font-bold text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {flowOpen === product.id && (
                    <div className="mt-4 p-5 rounded-2xl border border-primary/30 bg-primary/5 relative z-10 animate-in fade-in slide-in-from-top-2 flex flex-col gap-5 shadow-[0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-md">
                      
                      {/* Characteristics Block */}
                      <div>
                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-primary mb-3 uppercase tracking-widest border-b border-white/5 pb-2">
                          <Package className="h-3 w-3" /> Supply Characteristics
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                          <div>
                            <span className="text-muted-foreground/60 block mb-0.5 font-semibold text-[9px] uppercase">Registry Name</span>
                            <span className="text-white font-medium">{product.name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground/60 block mb-0.5 font-semibold text-[9px] uppercase">SKU Identifier</span>
                            <span className="text-white font-mono">{product.id}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground/60 block mb-0.5 font-semibold text-[9px] uppercase">System Description</span>
                            <span className="text-muted-foreground leading-relaxed">{product.description || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground/60 block mb-0.5 font-semibold text-[9px] uppercase">Unit Worth</span>
                            <span className="text-success font-display font-bold">₹{product.price.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground/60 block mb-0.5 font-semibold text-[9px] uppercase">Live Quantity</span>
                            <span className="text-info font-display font-bold">{product.quantity} Units</span>
                          </div>
                        </div>
                      </div>

                      {/* Flow Log Block */}
                      <div>
                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-info mb-3 uppercase tracking-widest border-b border-white/5 pb-2 mt-2">
                          <Activity className="h-3 w-3" /> Ledger Log
                        </h4>
                        <div className="max-h-32 overflow-y-auto custom-scrollbar pr-2">
                          {flowData.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic pl-1">No ledger entries detected.</p>
                          ) : (
                            <div className="space-y-2">
                              {flowData.map((f, i) => (
                                <div key={i} className="flex justify-between items-center text-xs pb-1.5 border-b border-white/5 last:border-0 last:pb-0 group">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${f.type === 'inflow' ? 'bg-success shadow-[0_0_5px_rgba(16,185,129,0.8)]' : 'bg-info shadow-[0_0_5px_rgba(59,130,246,0.8)]'}`} />
                                    <span className={f.type === 'inflow' ? 'text-success font-medium' : 'text-info font-medium'}>
                                      {f.type === 'inflow' ? '+' : '-'}{f.quantity} units
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-muted-foreground font-mono group-hover:text-white transition-colors">
                                    {new Date(f.date).toLocaleDateString()} {new Date(f.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-white/20 rounded-3xl shadow-glass w-full max-w-md p-8 animate-in zoom-in-95 duration-200">

            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <h2 className="text-xl font-display font-bold text-white tracking-wide">
                {editId ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 bg-white/5 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Logic Board Rev B"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                />
              </div>

               <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Initial Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Unit Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-success font-bold text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="relative">
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Category</label>
                  <select
                    value={form.category || "Uncategorized"}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner appearance-none font-medium"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  {role === 'admin' && (
                    <button
                      onClick={() => setShowCategoryModal(true)}
                      className="absolute top-0 right-0 -mt-2 -mr-2 p-1.5 bg-primary/90 hover:bg-primary text-white rounded-lg text-xs font-bold shadow-neon-purple transition-all hover:scale-105"
                      title="Create New Category"
                    >
                      +
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Status Override</label>
                  <select
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value as Product['stock'] })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner appearance-none font-medium"
                  >
                    <option value="optimal">Optimal</option>
                    <option value="low">Low Stock</option>
                    <option value="critical">Critical</option>
                    <option value="overstock">Overstock</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-sm mb-4 animate-in slide-in-from-top-2">
                {error}
              </div>
            )}
            <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => { setShowForm(false); setError(''); }}
                disabled={saving}
                className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                disabled={saving}
                className="flex-[2] py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 shadow-neon-purple active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    {editId ? 'Commit Changes' : 'Initialize Product'}
                  </>
                )}
              </button>
            </div>
          </div>

          {showCategoryModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-card border border-white/20 rounded-3xl shadow-glass w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <h3 className="text-lg font-display font-bold text-white">New Category</h3>
                  <button 
                    onClick={() => setShowCategoryModal(false)} 
                    className="p-1.5 bg-white/5 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Category Name"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                    required
                  />
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary shadow-inner resize-none h-20"
                  />
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createCategory}
                    className="flex-1 py-3 rounded-xl text-white text-sm font-bold bg-primary hover:bg-primary/90 shadow-neon-purple active:scale-95 transition-all"
                  >
                    Create Category
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}

export default Products
