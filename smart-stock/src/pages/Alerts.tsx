import AppShell from "@/components/AppShell";
import { AlertTriangle, Bell, Clock, RefreshCw, Package, CheckCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/auth/AuthContext";

interface Alert {
  id: string;
  productId: string;
  productName: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  action: string;
  rop: number;
  eoq: number;
  currentStock: number;
  time: string;
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState<Record<string, boolean>>({});
  const [restockQty, setRestockQty] = useState<Record<string, number>>({});
  const { getAuthHeader } = useAuth();

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/alerts', {
        headers: { Authorization: getAuthHeader() }
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleRestock = async (alert: Alert) => {
    const qty = restockQty[alert.productId] || alert.eoq;
    if (qty <= 0) return;
    setRestocking(prev => ({ ...prev, [alert.productId]: true }));
    try {
      const res = await fetch('http://localhost:5000/api/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader() },
        body: JSON.stringify({ productId: alert.productId, quantity: qty })
      });
      if (res.ok) {
        // Re-fetch alerts — the alert will be gone if stock is now OK
        await fetchAlerts();
      }
    } catch (err) {
      console.error('Restock failed', err);
    } finally {
      setRestocking(prev => ({ ...prev, [alert.productId]: false }));
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">System Alerts</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Live inventory risks computed from ROP & EOQ. Alerts auto-clear when stock is fixed.
            </p>
          </div>
          <button
            onClick={fetchAlerts}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-card backdrop-blur-glass border border-warning/20 rounded-2xl p-5 flex items-center gap-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <div className="p-3 rounded-xl bg-warning/20 border border-warning/30">
            <Bell className="h-5 w-5 text-warning animate-pulse" />
          </div>
          <div className="text-sm font-medium text-white/90 leading-relaxed">
            Alerts are generated from <span className="font-bold text-warning">real product data</span> using ROP & EOQ calculations.
            Restocking a product will <span className="font-bold text-success">automatically remove</span> its alert.
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Loading alerts from inventory...</div>
        ) : alerts.length === 0 ? (
          <div className="p-10 text-center bg-card backdrop-blur-glass border border-success/20 rounded-2xl flex flex-col items-center gap-3">
            <div className="p-4 bg-success/20 rounded-full">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <p className="text-white font-bold text-lg tracking-wide">All Systems Nominal</p>
            <p className="text-muted-foreground text-sm">No stock alerts — all products are above their reorder points.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, i) => {
              const isHigh = alert.severity === "high";
              const isMed = alert.severity === "medium";
              const borderColor = isHigh ? "border-critical/30" : isMed ? "border-warning/30" : "border-info/30";
              const shadowColor = isHigh ? "shadow-[0_0_15px_rgba(239,68,68,0.2)]" : isMed ? "shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "";
              const iconBg = isHigh ? "bg-critical/20 text-critical" : isMed ? "bg-warning/20 text-warning" : "bg-info/20 text-info";
              const badge = isHigh ? "bg-critical/10 text-critical border-critical/20" : isMed ? "bg-warning/10 text-warning border-warning/20" : "bg-info/10 text-info border-info/20";
              const isRestocking = restocking[alert.productId];
              const qty = restockQty[alert.productId] ?? alert.eoq;

              return (
                <div
                  key={alert.id}
                  className={`group bg-card backdrop-blur-glass border ${borderColor} rounded-2xl p-6 flex items-start gap-5 ${shadowColor} hover:-translate-y-1 hover:border-white/20 transition-all duration-300 relative overflow-hidden`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`flex-shrink-0 p-3.5 rounded-xl border border-white/10 ${iconBg}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-base font-bold text-white">{alert.type}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-widest font-bold border ${badge}`}>
                          {alert.severity} Risk
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{alert.time}</span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-white mb-1">{alert.productName}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{alert.message}</p>

                    <div className="flex flex-wrap gap-3 text-xs font-bold mb-4">
                      <span className="px-3 py-1 rounded-lg bg-info/10 text-info border border-info/20">
                        ROP: {alert.rop} units
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        EOQ: {alert.eoq} units
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-white/5 text-white border border-white/10">
                        Current: {alert.currentStock} units
                      </span>
                    </div>

                    {/* Restock form */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={e => setRestockQty(prev => ({ ...prev, [alert.productId]: Number(e.target.value) }))}
                          className="w-20 bg-transparent text-white text-sm font-mono outline-none"
                          placeholder="Qty"
                        />
                        <span className="text-xs text-muted-foreground">units</span>
                      </div>
                      <button
                        onClick={() => handleRestock(alert)}
                        disabled={isRestocking}
                        className="flex items-center gap-2 px-5 py-2 bg-success/20 hover:bg-success/30 border border-success/30 text-success font-bold text-sm rounded-xl transition-all disabled:opacity-50"
                      >
                        {isRestocking
                          ? <><div className="w-4 h-4 border-2 border-success/30 border-t-success rounded-full animate-spin" /> Restocking...</>
                          : <><RefreshCw className="h-4 w-4" /> Restock &amp; Clear Alert</>
                        }
                      </button>
                    </div>

                    <p className="mt-3 text-xs font-medium text-success/70">
                      💡 {alert.action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Alerts;