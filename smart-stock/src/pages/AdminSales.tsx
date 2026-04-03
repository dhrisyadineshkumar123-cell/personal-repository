import { useState, useEffect } from 'react'
import { useAuth } from '@/auth/AuthContext'
import AppShell from '@/components/AppShell'
import { ShoppingCart, RefreshCw, Download, Filter, DollarSign, Package } from 'lucide-react'
import { format, subDays } from 'date-fns' // Assume date-fns installed or use native Date

interface Sale {
  salesId: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  totalAmount: number
  timestamp: string // Use timestamp for consistency
}

interface Product {
  id: string
  name: string
  price: number
  category?: string
}

const AdminSales = () => {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saleForm, setSaleForm] = useState({
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0
  })
  
  // Use local date instead of ISO string to avoid UTC offset issues
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');
  
  const [filter, setFilter] = useState({ from: thirtyDaysAgo, to: today })
  const [stats, setStats] = useState({ totalSales: 0, totalItems: 0, avgOrder: 0 })
  const [saleError, setSaleError] = useState('')
  const [saleSaving, setSaleSaving] = useState(false)
  const { getAuthHeader } = useAuth()

  const fetchSales = async () => {
    try {
      const url = new URL('http://localhost:5000/api/sales')
      url.searchParams.append('from', filter.from)
      url.searchParams.append('to', filter.to)
      const res = await fetch(url, { headers: { Authorization: getAuthHeader() } })
      const data = await res.json()
      // Sort descending by timestamp locally if not already sorted by backend
      const sortedData = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setSales(sortedData)

      // Fetch dynamic stats from backend
      const statsRes = await fetch('http://localhost:5000/api/stats', {
        headers: { Authorization: getAuthHeader() }
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        // Use total quantity sold from the sales data itself
        const totalQtySold = data.reduce((sum: number, s: Sale) => sum + (s.quantity || 0), 0)
        setStats({
          totalSales: statsData.totalSales || 0,
          totalItems: totalQtySold,
          avgOrder: data.length ? (statsData.totalSales / data.length) : 0
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/products', { headers: { Authorization: getAuthHeader() } })
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
    }
  }

  const addSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!saleForm.productId || saleForm.quantity <= 0 || saleForm.unitPrice <= 0) return
    setSaleError('')
    setSaleSaving(true)
    try {
      const totalAmount = saleForm.quantity * saleForm.unitPrice
      const res = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader() },
        body: JSON.stringify({ ...saleForm, quantity: Number(saleForm.quantity), unitPrice: Number(saleForm.unitPrice), totalAmount })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || `HTTP ${res.status}`)
      }
      setSaleForm({ productId: '', productName: '', quantity: 1, unitPrice: 0 })
      setShowAddForm(false)
      fetchSales()
    } catch (err: any) {
      console.error('Failed to add sale', err)
      setSaleError(err.message || 'Failed to record sale.')
    } finally {
      setSaleSaving(false)
    }
  }

  const exportCSV = () => {
    const csv = [
      ['Sales ID', 'Product', 'Qty', 'Unit Price', 'Total', 'Date'],
      ...sales.map(s => [s.salesId, s.productName || s.productId, s.quantity, s.unitPrice, s.totalAmount, s.timestamp])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  useEffect(() => {
    fetchSales()
    fetchProducts()
  }, [filter])

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold bg-gradient-to-r from-white to-muted-foreground bg-clip-text text-transparent tracking-tight drop-shadow-lg">
              Sales Ledger
            </h1>
            <p className="text-lg text-muted-foreground mt-2 font-medium max-w-md">
              Complete transaction history with real-time stock synchronization
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold">
              <DollarSign className="h-4 w-4" />
              ₹{stats.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold">
              <Package className="h-4 w-4" />
              {stats.totalItems} items
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-xl text-sm font-bold">
              {stats.avgOrder.toFixed(0)} avg
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <div className="bg-card p-6 rounded-3xl border shadow-glass lg:w-80 flex flex-col gap-4 shrink-0">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">From Date</label>
                <input type="date" value={filter.from} onChange={e => setFilter({...filter, from: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">To Date</label>
                <input type="date" value={filter.to} onChange={e => setFilter({...filter, to: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white focus:border-primary" />
              </div>
            </div>
            <button onClick={fetchSales} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary/90 shadow-neon-purple transition-all flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Apply
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 text-white font-bold rounded-xl shadow-neon-purple transition-all whitespace-nowrap">
              <ShoppingCart className="h-4 w-4" />
              Record Sale
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button onClick={fetchSales} className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 p-8 rounded-3xl backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <ShoppingCart className="h-8 w-8" />
              Process New Transaction
            </h3>
            <form onSubmit={addSale} className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-4xl">
              <select
                value={saleForm.productId}
                onChange={(e) => {
                  const prod = products.find(p => p.id === e.target.value)
                  if (prod) {
                    setSaleForm({
                      productId: prod.id,
                      productName: prod.name,
                      quantity: 1,
                      unitPrice: prod.price || 0
                    })
                  }
                }}
                className="lg:col-span-2 px-4 py-4 rounded-2xl border border-white/20 bg-black/50 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium text-lg"
                required
                disabled={saleSaving}
              >
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ₹{p.price?.toFixed(2)} {p.category ? `(${p.category})` : ''}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={saleForm.quantity}
                onChange={(e) => setSaleForm({...saleForm, quantity: Number(e.target.value)})}
                placeholder="Quantity"
                className="px-4 py-4 rounded-2xl border border-white/20 bg-black/50 text-white font-mono text-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
                disabled={saleSaving}
              />
              <input
                type="number"
                step="0.01"
                value={saleForm.unitPrice}
                onChange={(e) => setSaleForm({...saleForm, unitPrice: Number(e.target.value)})}
                placeholder="Price ₹"
                className="px-4 py-4 rounded-2xl border border-white/20 bg-black/50 text-success font-bold text-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
                disabled={saleSaving}
              />
              {saleError && (
                <div className="lg:col-span-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                  ⚠ {saleError}
                </div>
              )}
              <button type="submit" disabled={saleSaving} className="lg:col-span-4 col-span-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 text-white font-bold py-4 px-8 rounded-2xl shadow-neon-green text-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                {saleSaving && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Complete Sale (₹{(saleForm.quantity * saleForm.unitPrice).toFixed(2)})
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-xl text-muted-foreground animate-pulse">Loading sales ledger...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-white/20 rounded-3xl bg-white/5">
            <ShoppingCart className="h-24 w-24 mx-auto mb-8 text-white/40" />
            <h3 className="text-2xl font-bold text-white mb-2">No sales recorded</h3>
            <p className="text-muted-foreground text-lg mb-8">Use the form above to log your first transaction</p>
            <button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl shadow-neon-purple transition-all">
              + New Sale
            </button>
          </div>
        ) : (
          <div className="bg-card border rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-white/5 to-black/20 backdrop-blur-sm sticky top-0 z-10">
                  <tr>
                    <th className="p-6 text-left font-bold text-lg text-white tracking-wide">Sales ID</th>
                    <th className="p-6 text-left font-bold text-lg text-white tracking-wide">Product</th>
                    <th className="p-6 text-center font-bold text-lg text-white tracking-wide">Qty</th>
                    <th className="p-6 text-right font-bold text-lg text-white tracking-wide">Unit Price</th>
                    <th className="p-6 text-right font-bold text-lg text-white tracking-wide">Total</th>
                    <th className="p-6 text-left font-bold text-lg text-white tracking-wide">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.salesId} className="group border-t border-white/5 hover:bg-white/5 transition-all backdrop-blur-sm">
                      <td className="p-6 font-mono text-lg font-bold group-hover:text-primary">{sale.salesId}</td>
                      <td className="p-6 font-semibold text-white max-w-md">{sale.productName || sale.productId}</td>
                      <td className="p-6 text-center text-2xl font-mono text-primary drop-shadow-sm">{sale.quantity}</td>
                      <td className="p-6 text-right font-mono text-lg">₹{sale.unitPrice.toFixed(2)}</td>
                      <td className="p-6 text-right text-2xl font-bold text-success drop-shadow-lg">₹{sale.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="p-6 text-sm text-muted-foreground">
                        {new Date(sale.timestamp).toLocaleDateString()} {new Date(sale.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default AdminSales

