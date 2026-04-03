import { useState, useEffect } from 'react'
import { useAuth } from '@/auth/AuthContext'
import AppShell from '@/components/AppShell'
import { Search, AlertTriangle, RefreshCw } from 'lucide-react'

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  stock: 'optimal' | 'low' | 'critical' | 'overstock';
}

const StaffHome = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sales, setSales] = useState<any[]>([])
  const [saleForm, setSaleForm] = useState({ productId: '', quantity: 1, unitPrice: 0 })
  const [productsList, setProductsList] = useState<Product[]>([])
  const [saleError, setSaleError] = useState('')
  const [saleSaving, setSaleSaving] = useState(false)
  const { getAuthHeader } = useAuth();

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/products', { headers: { Authorization: getAuthHeader() } })
      const data = await res.json()
      setProducts(data)
      setProductsList(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSales = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sales', { headers: { Authorization: getAuthHeader() } })
      if (res.ok) {
        const data = await res.json()
        setSales(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!saleForm.productId || saleForm.quantity <= 0 || saleForm.unitPrice <= 0) return
    setSaleError('')
    setSaleSaving(true)
    try {
      const prod = productsList.find(p => p.id === saleForm.productId)
      const res = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader() },
        body: JSON.stringify({
          productId: saleForm.productId,
          productName: prod?.name || saleForm.productId,
          quantity: Number(saleForm.quantity),
          unitPrice: Number(saleForm.unitPrice)
        })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || `HTTP ${res.status}`)
      }
      setSaleForm({ productId: '', quantity: 1, unitPrice: 0 })
      fetchSales()
      fetchProducts() // refresh stock counts immediately
    } catch (err: any) {
      console.error('Sale failed', err)
      setSaleError(err.message || 'Failed to record sale.')
    } finally {
      setSaleSaving(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchSales()
  }, [])

  const doRestock = async (id: string, qty: number) => {
    try {
      const res = await fetch('http://localhost:5000/api/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader() },
        body: JSON.stringify({ productId: id, quantity: qty })
      })
      if (res.ok) fetchProducts()
    } catch (err) {
      console.error('Restock failed', err)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const calculateROP = (qty: number) => {
    const baseline = qty < 50 ? 50 : 150
    return Math.floor(baseline * 0.2) // ~20% of baseline
  }

  const calculateEOQ = (qty: number, price: number) => {
    // EOQ = sqrt((2 * D * S) / H)
    const annualDemand = qty > 0 ? qty * 12 : 500
    const orderCost = 50 // Generic simulated $50 fulfillment cycle logic
    const holdingCost = Math.max(0.5, price * 0.1) // 10% of price holding cost
    return Math.floor(Math.sqrt((2 * annualDemand * orderCost) / holdingCost))
  }

  const getDaysLeft = (qty: number) => {
    // Simulated daily burn rate of 5 units
    return Math.floor(qty / 5)
  }

  return (
    <AppShell>
        <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Floor Terminal
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Manage live inventory, log sales, and monitor algorithmic reorder signals.
            </p>
          </div>
          
          <div className="relative w-full sm:w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search SKU or Product..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner transition-all"
            />
          </div>
        </div>

        {/* Sales Form */}
        <div className="bg-card backdrop-blur-glass border border-white/10 rounded-3xl p-8 shadow-glass">
          <h2 className="text-2xl font-display font-bold text-white mb-6">Log Sale</h2>
          <form onSubmit={handleSale} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select 
              value={saleForm.productId} 
              onChange={(e) => {
                const prod = productsList.find(p => p.id === e.target.value)
                setSaleForm({ ...saleForm, productId: e.target.value, unitPrice: prod ? prod.price : 0 })
              }}
              className="px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white text-sm focus:border-primary focus:ring-1"
              required
              disabled={saleSaving}
            >
              <option value="">Select Product</option>
              {productsList.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price} (Stock: {p.quantity})</option>)}
            </select>
            <input 
              type="number" 
              min="1" 
              value={saleForm.quantity}
              onChange={(e) => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })}
              placeholder="Qty"
              className="px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white text-sm focus:border-primary focus:ring-1"
              required
              disabled={saleSaving}
            />
            <input 
              type="number" 
              min="0" 
              step="0.01"
              value={saleForm.unitPrice}
              onChange={(e) => setSaleForm({ ...saleForm, unitPrice: Number(e.target.value) })}
              placeholder="Price"
              className="px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white text-sm focus:border-primary focus:ring-1"
              required
              disabled={saleSaving}
            />
            {saleError && (
              <div className="md:col-span-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                ⚠ {saleError}
              </div>
            )}
            <button type="submit" disabled={saleSaving} className="md:col-span-3 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-neon-purple transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saleSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Record Sale (Total: ₹{(saleForm.quantity * saleForm.unitPrice).toFixed(2)})
            </button>
          </form>
        </div>

        {/* Recent Sales Table */}
        <div className="bg-card backdrop-blur-glass border border-white/10 rounded-3xl p-6 shadow-glass overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold text-white">Recent Sales</h3>
            <button onClick={fetchSales} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          {sales.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No sales recorded yet. Log your first sale above.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {sales.map((sale: any) => (
                <div key={sale.salesId} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{sale.salesId}</span>
                    <span className="text-muted-foreground text-xs font-mono">{sale.productId} x {sale.quantity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-success font-bold text-lg">₹{sale.totalAmount.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground block">{new Date(sale.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Table */}
        {loading ? (
          <div className="flex justify-center py-20"><p className="text-white">Connecting to server...</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {filteredProducts.map((p, i) => {
              const rop = calculateROP(p.quantity)
              const eoq = calculateEOQ(p.quantity, p.price)
              const daysLeft = getDaysLeft(p.quantity)
              const isAlert = p.quantity <= rop

              return (
                <div key={p.id} className={`bg-card backdrop-blur-glass border ${isAlert ? 'border-critical/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-critical/5' : 'border-white/10 shadow-glass'} p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden transition-all`} style={{ animationDelay: `${i * 50}ms` }}>
                  
                  {isAlert && <div className="absolute top-0 right-0 -m-8 w-24 h-24 bg-critical/20 rounded-full blur-2xl pointer-events-none animate-pulse" />}

                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h3 className="font-bold text-lg text-white truncate">{p.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{p.id} • {p.category}</p>
                    </div>
                    {isAlert && (
                      <span className="bg-critical/20 text-critical text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-critical/30 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Reorder Alert
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm relative z-10">
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Current Stock</p>
                      <p className={`font-display font-bold text-2xl ${isAlert ? 'text-critical drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-white drop-shadow-sm'} mt-1`}>{p.quantity}</p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Est. Depletion</p>
                      <p className="font-display font-bold text-xl text-white mt-1 drop-shadow-sm">{daysLeft} Days</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm relative z-10 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[9px] text-info font-bold uppercase tracking-wider">Reorder Point (ROP)</p>
                      <p className="text-sm font-medium text-white mt-0.5">{rop} Units</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#8b5cf6] font-bold uppercase tracking-wider">Econ Order Qty (EOQ)</p>
                      <p className="text-sm font-medium text-white mt-0.5">{eoq} Units</p>
                    </div>
                  </div>

                  <div className="flex gap-2 relative z-10 mt-2">
                    <button onClick={() => doRestock(p.id, eoq)} className="flex-1 py-2.5 rounded-xl border border-success/30 bg-success/10 text-success text-xs font-bold flex items-center justify-center gap-2 hover:bg-success hover:text-white transition-all shadow-inner">
                      <RefreshCw className="h-4 w-4" /> Bulk Restock ({eoq} units)
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default StaffHome
