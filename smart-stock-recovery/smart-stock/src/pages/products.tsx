import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { Plus, Package, Edit2, RefreshCw, Trash2, X, Save } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  quantity: number
  price: number
  stock: 'optimal' | 'low' | 'critical' | 'overstock'
}

const stockColors = {
  optimal:   { bg: 'bg-success/10',    text: 'text-success',  border: 'border-success/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]', label: 'Optimal'   },
  low:       { bg: 'bg-warning/10',    text: 'text-warning', border: 'border-warning/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]', label: 'Low Stock' },
  critical:  { bg: 'bg-critical/10',   text: 'text-critical', border: 'border-critical/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]', label: 'Critical'  },
  overstock: { bg: 'bg-info/10',       text: 'text-info', border: 'border-info/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]', label: 'Overstock' },
}

const empty: Product = { id: '', name: '', description: '', quantity: 0, price: 0, stock: 'optimal' }

const Products = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: 'PRD-001', name: 'India Gate Basmati Rice', description: 'Premium 5kg basmati rice', quantity: 342, price: 450.00, stock: 'optimal' },
    { id: 'PRD-002', name: 'Tata Salt',               description: '1kg iodized salt',           quantity: 45,  price: 28.00,  stock: 'low'     },
    { id: 'PRD-003', name: 'Aashirvaad Atta',         description: '10kg premium wheat atta',    quantity: 12,  price: 380.00, stock: 'critical' },
  ])

  const [showForm, setShowForm]   = useState(false)
  const [editId,   setEditId]     = useState<string | null>(null)
  const [form,     setForm]       = useState(empty)
  const [restock,  setRestock]    = useState<string | null>(null)
  const [restockQty, setRestockQty] = useState(0)

  const openAdd = () => { setForm(empty); setEditId(null); setShowForm(true) }

  const openEdit = (p: Product) => {
    setForm({ ...p })
    setEditId(p.id)
    setShowForm(true)
  }

  const saveProduct = () => {
    if (!form.name.trim()) return
    if (editId) {
      setProducts(products.map(p => p.id === editId ? { ...form, id: editId } : p))
    } else {
      const newId = 'PRD-' + String(products.length + 1).padStart(3, '0')
      setProducts([...products, { ...form, id: newId }])
    }
    setShowForm(false)
    setForm(empty)
    setEditId(null)
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const doRestock = (id: string) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, quantity: p.quantity + restockQty } : p
    ))
    setRestock(null)
    setRestockQty(0)
  }

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
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold bg-primary hover:bg-primary/90 hover:shadow-neon-purple active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5" /> Add Product
          </button>
        </div>

        {/* Product Cards */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground border border-dashed border-white/20 rounded-3xl bg-white/5">
            <Package className="h-20 w-20 mb-6 opacity-40 text-primary" />
            <p className="text-xl font-bold text-white drop-shadow-sm">No products found</p>
            <p className="text-sm mt-2 font-medium">Click "Add Product" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => {
              const sc = stockColors[product.stock]
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

                  <div className="flex gap-2 mt-2 relative z-10">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-white/5 text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => { setRestock(product.id); setRestockQty(0) }}
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

                  {restock === product.id && (
                    <div className="mt-3 p-4 rounded-xl border border-info/30 bg-info/10 relative z-10 animate-in fade-in slide-in-from-top-2">
                      <p className="text-xs font-bold text-info mb-3 uppercase tracking-wider">Add incoming stock:</p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={restockQty}
                          onChange={e => setRestockQty(Number(e.target.value))}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-info/50 bg-black/40 text-white text-sm outline-none focus:border-info focus:ring-1 focus:ring-info shadow-inner"
                        />
                        <button
                          onClick={() => doRestock(product.id)}
                          className="px-4 py-1.5 rounded-lg text-white text-xs font-bold bg-info hover:bg-info/80 hover:shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all"
                        >
                          Add
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

            <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                className="flex-[2] py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 shadow-neon-purple active:scale-95 transition-all"
              >
                <Save className="h-5 w-5" />
                {editId ? 'Commit Changes' : 'Initialize Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

export default Products

