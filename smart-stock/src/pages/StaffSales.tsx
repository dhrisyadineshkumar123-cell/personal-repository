import { useState, useEffect } from 'react'
import { useAuth } from '@/auth/AuthContext'
import AppShell from '@/components/AppShell'
import { ShoppingCart, RefreshCw } from 'lucide-react'

interface Sale {
  salesId: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  totalAmount: number
  timestamp: string
}

const StaffSales = () => {
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
  const [saleError, setSaleError] = useState('')
  const [saleSaving, setSaleSaving] = useState(false)
  const { getAuthHeader } = useAuth()

  interface Product {
    id: string
    name: string
    price: number
  }

  const fetchSales = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sales', { 
        headers: { Authorization: getAuthHeader() } 
      })
      if (res.ok) {
        const data = await res.json()
        // Sort descending by timestamp locally if not already sorted by backend
        const sortedData = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setSales(sortedData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/products', { 
        headers: { Authorization: getAuthHeader() } 
      })
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
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: getAuthHeader() 
        },
        body: JSON.stringify({
          ...saleForm,
          quantity: Number(saleForm.quantity),
          unitPrice: Number(saleForm.unitPrice),
          totalAmount
        })
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

  useEffect(() => {
    fetchSales()
    fetchProducts()
  }, [])

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Sales Records</h1>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAddForm(true)} 
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl shadow-neon-purple transition-all"
            >
              <ShoppingCart className="h-4 w-4" />
              New Sale
            </button>
            <button onClick={fetchSales} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-primary/10 border border-primary/30 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Log New Sale
            </h3>
            <form onSubmit={addSale} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                className="px-4 py-3 rounded-xl border border-white/20 bg-black/50 text-white focus:border-primary focus:ring-1 md:col-span-2"
                required
              >
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price?.toFixed(2)})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={saleForm.quantity}
                onChange={(e) => setSaleForm({...saleForm, quantity: Number(e.target.value)})}
                placeholder="Qty"
                className="px-4 py-3 rounded-xl border border-white/20 bg-black/50 text-white focus:border-primary focus:ring-1"
                required
              />
              <input
                type="number"
                step="0.01"
                value={saleForm.unitPrice}
                onChange={(e) => setSaleForm({...saleForm, unitPrice: Number(e.target.value)})}
                placeholder="Price"
                className="px-4 py-3 rounded-xl border border-white/20 bg-black/50 text-success font-bold focus:border-primary focus:ring-1"
                required
              />
              {saleError && (
                <div className="md:col-span-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                  ⚠ {saleError}
                </div>
              )}
              <button 
                type="submit"
                disabled={saleSaving}
                className="md:col-span-4 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-neon-purple transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saleSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Add Sale (₹{(saleForm.quantity * saleForm.unitPrice).toFixed(2)})
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading sales...</p>
        ) : (
          <div className="bg-card border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-4 text-left text-sm font-bold text-white">Sales ID</th>
                  <th className="p-4 text-left text-sm font-bold text-white">Product</th>
                  <th className="p-4 text-left text-sm font-bold text-white">Qty</th>
                  <th className="p-4 text-right text-sm font-bold text-white">Unit Price</th>
                  <th className="p-4 text-right text-sm font-bold text-white">Total</th>
                  <th className="p-4 text-left text-sm font-bold text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.salesId} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-4 font-mono text-sm">{sale.salesId}</td>
                  <td className="p-4 text-white font-medium">{sale.productName || sale.productId}</td>
                    <td className="p-4">{sale.quantity}</td>
                    <td className="p-4 text-right font-mono">₹{sale.unitPrice.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-success">₹{sale.totalAmount.toFixed(2)}</td>
                    <td className="p-4 text-xs text-muted-foreground">{new Date(sale.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default StaffSales

