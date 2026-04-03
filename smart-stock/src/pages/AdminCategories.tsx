import { useState, useEffect } from 'react'
import { useAuth } from '@/auth/AuthContext'
import AppShell from '@/components/AppShell'
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react'

interface Category {
  name: string
  description: string
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ name: '', description: '' })
  const [editing, setEditing] = useState(false)
  const [originalName, setOriginalName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { getAuthHeader, role } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/categories', { headers: { Authorization: getAuthHeader() } })
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (role !== 'admin') {
      alert('Only administrators can manage categories.')
      return
    }

    setSaving(true)
    try {
      const url = editing 
        ? `http://localhost:5000/categories/${encodeURIComponent(originalName)}`
        : 'http://localhost:5000/categories'
      
      const method = editing ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader() },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP ${res.status}`)
      }

      setForm({ name: '', description: '' })
      setEditing(false)
      setOriginalName('')
      fetchCategories()
      alert(`Category ${editing ? 'updated' : 'created'} successfully.`)
    } catch (err: any) {
      console.error('Failed to save category', err)
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const editCategory = (cat: Category) => {
    setForm({ name: cat.name, description: cat.description })
    setOriginalName(cat.name)
    setEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteCategory = async (name: string) => {
    if (role !== 'admin') {
      alert('Only administrators can delete categories.')
      return
    }

    if (confirm('Delete category?')) {
      try {
        const res = await fetch(`http://localhost:5000/categories/${encodeURIComponent(name)}`, {
          method: 'DELETE',
          headers: { Authorization: getAuthHeader() }
        })
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || `HTTP ${res.status}`)
        }
        fetchCategories()
        alert('Category deleted.')
      } catch (err: any) {
        console.error('Failed to delete', err)
        alert('Error: ' + err.message)
      }
    }
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Manage Categories</h1>
          <button onClick={fetchCategories} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-card p-8 rounded-3xl border shadow-glass">
          <h2 className="text-2xl font-bold mb-6">{editing ? 'Edit' : 'New'} Category</h2>
          {role !== 'admin' ? (
            <p className="p-6 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 text-center font-medium">
              Only inventory managers can add or edit categories.
            </p>
          ) : (
            <form onSubmit={saveCategory} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Category name"
                className="p-4 rounded-xl border bg-black/30 text-white focus:border-primary disabled:opacity-50"
                required
                disabled={saving}
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description (optional)"
                className="p-4 rounded-xl border bg-black/30 text-white focus:border-primary resize-none h-24 md:col-span-2 disabled:opacity-50"
                disabled={saving}
              />
              <button 
                type="submit" 
                disabled={saving}
                className="md:col-span-2 bg-primary text-white py-4 px-8 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {editing ? 'Update' : 'Create'} Category
              </button>
            </form>
          )}
        </div>

        {/* Categories Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-card rounded-3xl border overflow-hidden shadow-glass">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-6 text-left font-bold text-white text-lg">Name</th>
                  <th className="p-6 text-left font-bold text-white text-lg">Description</th>
                  <th className="p-6 text-right font-bold text-white text-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.name} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-6 font-bold text-white">{cat.name}</td>
                    <td className="p-6 text-muted-foreground max-w-md">{cat.description}</td>
                    <td className="p-6">
                      <div className="flex gap-2 justify-end">
                        {role === 'admin' ? (
                          <>
                            <button onClick={() => editCategory(cat)} className="p-2 bg-blue/20 text-blue rounded-xl hover:bg-blue/40 font-bold px-4">
                              Edit
                            </button>
                            <button onClick={() => deleteCategory(cat.name)} className="p-2 bg-red/20 text-red rounded-xl hover:bg-red/40 font-bold px-4">
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Restricted</span>
                        )}
                      </div>
                    </td>
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

export default AdminCategories

