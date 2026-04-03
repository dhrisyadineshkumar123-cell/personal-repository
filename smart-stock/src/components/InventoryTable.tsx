
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";

const statusConfig = {
  optimal: { label: "Optimal", className: "bg-success/10 text-success border-success/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]" },
  low: { label: "Low Stock", className: "bg-warning/10 text-warning border-warning/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]" },
  critical: { label: "Critical", className: "bg-critical/10 text-critical border-critical/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]" },
  overstock: { label: "Overstock", className: "bg-info/10 text-info border-info/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]" },
} as const;

type ProductStatus = keyof typeof statusConfig;

const InventoryTable = () => {
  const [filter, setFilter] = useState<string>("all");
  const [products, setProducts] = useState<any[]>([]);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch('http://localhost:5000/products', {
          headers: { Authorization: getAuthHeader() }
        }).then(r => r.json());
        const mapped = data.map((p: any) => ({
          ...p,
          sku: p.id,
          category: p.category || "Uncategorized",
          currentStock: p.quantity || 0,
          optimalStock: p.quantity < 50 ? 100 : Math.floor(p.quantity * 1.5),
          reorderPoint: Math.floor(p.quantity * 0.2),
          unitCost: p.price || 0,
          status: p.quantity <= 10 || p.stock === 'critical' ? 'critical' : p.quantity <= 30 || p.stock === 'low' ? 'low' : p.quantity > 500 ? 'overstock' : 'optimal'
        }));
        setProducts(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [getAuthHeader]);

  const filtered = filter === "all" ? products : products.filter((p) => p.status === filter);

  return (
    <div className="bg-card backdrop-blur-glass rounded-2xl border border-white/10 shadow-glass overflow-hidden flex flex-col h-full group hover:border-white/20 transition-all">
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02]">
        <h2 className="text-sm font-display font-bold text-white tracking-wide uppercase drop-shadow-sm">Inventory Overview</h2>
        <div className="flex gap-2 flex-wrap bg-background/50 p-1.5 rounded-xl border border-white/5">
          {["all", "critical", "low", "optimal", "overstock"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all duration-300 \${
                filter === f
                  ? "bg-primary text-white shadow-neon-purple scale-105"
                  : "bg-transparent text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-black/20">
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground tracking-wider text-xs uppercase">
                <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">Product <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground tracking-wider text-xs uppercase">SKU</th>
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground tracking-wider text-xs uppercase hidden md:table-cell">Category</th>
              <th className="text-right py-4 px-6 font-semibold text-muted-foreground tracking-wider text-xs uppercase">Stock</th>
              <th className="text-right py-4 px-6 font-semibold text-muted-foreground tracking-wider text-xs uppercase hidden lg:table-cell">Reorder Pt</th>
              <th className="text-right py-4 px-6 font-semibold text-muted-foreground tracking-wider text-xs uppercase hidden lg:table-cell">Optimal</th>
              <th className="text-left py-4 px-6 font-semibold text-muted-foreground tracking-wider text-xs uppercase">Status</th>
              <th className="py-4 px-6 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((product) => {
              const stockPercent = Math.round((product.currentStock / product.optimalStock) * 100);
              return (
                <tr key={product.id} className="hover:bg-white/5 transition-colors group/row">
                  <td className="py-4 px-6 font-medium text-white group-hover/row:text-primary transition-colors">{product.name}</td>
                  <td className="py-4 px-6 text-muted-foreground font-mono text-xs group-hover/row:text-white transition-colors">{product.sku}</td>
                  <td className="py-4 px-6 text-muted-foreground hidden md:table-cell">{product.category}</td>
                  <td className="py-4 px-6 text-right">
                    <span className="font-bold text-white drop-shadow-sm">{product.currentStock}</span>
                    <div className="w-full bg-black/40 rounded-full h-1.5 mt-2 overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          stockPercent > 100 ? "bg-info shadow-[0_0_8px_rgba(59,130,246,0.8)]" : 
                          stockPercent > 50 ? "bg-success shadow-[0_0_8px_rgba(16,185,129,0.8)]" : 
                          stockPercent > 25 ? "bg-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]" : 
                          "bg-critical shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                        }`}
                        style={{ width: `${Math.min(stockPercent, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right text-muted-foreground hidden lg:table-cell font-mono">{product.reorderPoint}</td>
                  <td className="py-4 px-6 text-right text-muted-foreground hidden lg:table-cell font-mono">{product.optimalStock}</td>
                  <td className="py-4 px-6">
                    <Badge variant="outline" className={`font-semibold ${statusConfig[product.status as ProductStatus]?.className || ''}`}>
                      {statusConfig[product.status as ProductStatus]?.label || product.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <button className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/row:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
