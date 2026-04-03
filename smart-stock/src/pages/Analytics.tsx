import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import AppShell from "../components/AppShell";

const Analytics = () => {
  const [stats, setStats] = useState<any>(null);

  const { getAuthHeader } = useAuth();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stats', {
          headers: { Authorization: getAuthHeader() }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, [getAuthHeader]);

  const kpis = [
    { label: "Total SKUs", value: stats?.totalProducts || "...", change: "Active Inventory", color: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]/20", shadow: "shadow-[0_0_15px_rgba(139,92,246,0.3)]" },
    { label: "Total Sales", value: `₹${(stats?.totalSales || 0).toLocaleString()}`, change: "Estimated via Outflow", color: "text-[#10b981]", bg: "bg-[#10b981]/20", shadow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" },
    { label: "Low / critical items", value: stats?.lowStock || "0", change: "Requires attention", color: "text-[#ef4444]", bg: "bg-[#ef4444]/20", shadow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]" },
    { label: "Turnover Rate", value: `${stats?.turnoverRate || 0}x`, change: "Velocity Metric", color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/20", shadow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]" }
  ];

  const demandData = [
    { month: "Jan", demand: 120, received: 100 },
    { month: "Feb", demand: 135, received: 130 },
    { month: "Mar", demand: 150, received: 140 },
    { month: "Apr", demand: 160, received: 155 },
    { month: "May", demand: 172, received: 165 },
    { month: "Jun", demand: 168, received: 170 }
  ];

  const stockMix = stats?.stockStatusBreakdown ? stats.stockStatusBreakdown.map((s: any) => ({
    label: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: Math.round((s.count / (stats.totalProducts || 1)) * 100),
    color: s._id === 'optimal' ? "bg-success shadow-[0_0_10px_rgba(16,185,129,0.8)]" : 
           s._id === 'low' || s._id === 'critical' ? "bg-warning shadow-[0_0_10px_rgba(245,158,11,0.8)]" : 
           "bg-info shadow-[0_0_10px_rgba(59,130,246,0.8)]"
  })) : [
    { label: "Optimal stock", value: 0, color: "bg-success shadow-[0_0_10px_rgba(16,185,129,0.8)]" },
    { label: "Low / critical", value: 0, color: "bg-warning shadow-[0_0_10px_rgba(245,158,11,0.8)]" },
    { label: "Overstock", value: 0, color: "bg-info shadow-[0_0_10px_rgba(59,130,246,0.8)]" }
  ];

  return (
    <AppShell>
      <div className="space-y-8 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">System Analytics</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Inventory insights based on your SmartStock products and alerts.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <div
              key={kpi.label}
              className="group bg-card backdrop-blur-glass border border-white/10 p-6 rounded-2xl flex flex-col gap-2 shadow-glass hover:border-white/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-0 right-0 -m-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors pointer-events-none" />
              
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground drop-shadow-sm">{kpi.label}</span>
              <span className="text-3xl font-display font-bold text-white drop-shadow-md">{kpi.value}</span>
              <span className={`text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-full w-max border border-white/10 backdrop-blur-sm ${kpi.color} ${kpi.bg} ${kpi.shadow}`}>
                {kpi.change}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demand vs received (mock line bars) */}
          <div className="bg-card backdrop-blur-glass border border-white/10 rounded-2xl p-6 lg:col-span-2 shadow-glass hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-display font-bold text-white tracking-wide uppercase drop-shadow-sm mb-1">Monthly demand vs received</h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Helps you understand if purchase orders are matching real demand.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {demandData.map((row) => (
                <div key={row.month} className="text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground font-bold">{row.month}</span>
                    <span className="text-muted-foreground font-mono">
                      <span className="text-success">D: {row.demand}</span> <span className="mx-2 opacity-50">|</span> <span className="text-info">R: {row.received}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 h-2.5">
                    <div
                      className="h-full rounded-l-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000"
                      style={{ width: `${row.demand / 2}%` }}
                    />
                    <div
                      className="h-full rounded-r-full bg-info shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000"
                      style={{ width: `${row.received / 2}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock health mix */}
          <div className="bg-card backdrop-blur-glass border border-white/10 rounded-2xl p-6 shadow-glass hover:border-white/20 transition-all">
            <h2 className="text-sm font-display font-bold text-white tracking-wide uppercase drop-shadow-sm mb-1">Stock health</h2>
            <p className="text-xs text-muted-foreground font-medium mb-6">
              Breakdown of SKUs by stock status from your products and alerts.
            </p>
            <div className="space-y-5">
              {stockMix.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-muted-foreground">{item.label}</span>
                    <span className="font-bold text-white">{item.value}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-black/40 overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all duration-1000 ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Analytics;