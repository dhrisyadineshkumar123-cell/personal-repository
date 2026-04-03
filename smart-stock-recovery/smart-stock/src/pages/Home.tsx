import { useState } from "react"
import AppShell from "@/components/AppShell"
import { Package, Plus, Trash2, Edit2 } from "lucide-react"

type StockLevel = "optimal" | "low" | "critical"

interface Product {
  id: string
  name: string
  description: string
  quantity: number
  price: number
  stock: StockLevel
}

const initialProducts: Product[] = [
  {
    id: "P100",
    name: "Coffee Beans",
    description: "Premium beans 1kg",
    quantity: 120,
    price: 10.5,
    stock: "optimal"
  },
  {
    id: "P101",
    name: "Olive Oil",
    description: "500ml bottle",
    quantity: 40,
    price: 7.8,
    stock: "low"
  }
]

export default function Home() {

  const [products, setProducts] = useState<Product[]>(initialProducts)

  const [formData, setFormData] = useState<Product>({
    id: "",
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    stock: "optimal"
  })

  const [editing, setEditing] = useState<boolean>(false)

  const [showForm, setShowForm] = useState(false)

  // generate product id
  const generateId = () => {
    return "P" + Math.floor(Math.random() * 10000)
  }

  // handle input change
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // add product
  const addProduct = () => {

    const newProduct = {
      ...formData,
      id: generateId()
    }

    setProducts(prev => [...prev, newProduct])

    resetForm()
  }

  // edit product
  const updateProduct = () => {

    const updated = products.map(p =>
      p.id === formData.id ? formData : p
    )

    setProducts(updated)

    resetForm()
  }

  // delete product
  const removeProduct = (id: string) => {
    const filtered = products.filter(p => p.id !== id)
    setProducts(filtered)
  }

  // start editing
  const startEdit = (product: Product) => {
    setEditing(true)
    setFormData(product)
    setShowForm(true)
  }

  // reset form
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      quantity: 0,
      price: 0,
      stock: "optimal"
    })
    setEditing(false)
    setShowForm(false)
  }

  const totalProducts = products.length

  const totalValue = products.reduce(
    (sum, p) => sum + p.quantity * p.price,
    0
  )

  const lowStock = products.filter(p => p.stock !== "optimal").length

  return (

    <AppShell>

      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}

        <div className="flex justify-between items-center">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Inventory Manager
            </h1>
            <p className="text-gray-500 text-sm">
              Track and manage your store products
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
            style={{ backgroundColor: "#2a9d5c" }}
          >
            <Plus size={16} />
            Add Product
          </button>

        </div>


        {/* Dashboard Stats */}

        <div className="grid grid-cols-3 gap-4">

          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">Products</p>
            <p className="text-2xl font-bold">{totalProducts}</p>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">Low Stock</p>
            <p className="text-2xl font-bold text-red-500">{lowStock}</p>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-500">Inventory Value</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalValue.toFixed(2)}
            </p>
          </div>

        </div>


        {/* Product Table */}

        <div className="bg-white border rounded-lg overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>

              {products.map(product => (

                <tr key={product.id} className="border-t">

                  <td className="p-3">

                    <div className="flex items-center gap-3">

                      <div className="p-2 bg-green-100 rounded">
                        <Package size={16} />
                      </div>

                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-gray-400">
                          {product.description}
                        </p>
                      </div>

                    </div>

                  </td>

                  <td className="p-3">{product.quantity}</td>

                  <td className="p-3">${product.price}</td>

                  <td className="p-3 capitalize">{product.stock}</td>

                  <td className="p-3 text-right">

                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => startEdit(product)}
                        className="p-2 bg-gray-100 rounded"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => removeProduct(product.id)}
                        className="p-2 bg-red-100 text-red-500 rounded"
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {/* Product Form */}

        {showForm && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

            <div className="bg-white p-6 rounded-lg w-96 space-y-4">

              <h2 className="text-lg font-bold">
                {editing ? "Edit Product" : "Add Product"}
              </h2>

              <input
                placeholder="Product name"
                value={formData.name}
                onChange={e => handleChange("name", e.target.value)}
                className="w-full border p-2 rounded"
              />

              <input
                placeholder="Description"
                value={formData.description}
                onChange={e => handleChange("description", e.target.value)}
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={e => handleChange("quantity", Number(e.target.value))}
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={e => handleChange("price", Number(e.target.value))}
                className="w-full border p-2 rounded"
              />

              <select
                value={formData.stock}
                onChange={e => handleChange("stock", e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="optimal">Optimal</option>
                <option value="low">Low</option>
                <option value="critical">Critical</option>
              </select>

              <div className="flex gap-2">

                <button
                  onClick={resetForm}
                  className="flex-1 border py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={editing ? updateProduct : addProduct}
                  className="flex-1 text-white rounded"
                  style={{ backgroundColor: "#2a9d5c" }}
                >
                  Save
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </AppShell>

  )
}