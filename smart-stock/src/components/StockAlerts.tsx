import { AlertCircle, ArrowUpRight, Package, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router-dom";

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

const StockAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [restocking, setRestocking] = useState<Record<string, boolean>>({});
  const { getAuthHeader } = useAuth();
  const navigate = useNavigate();

  const fetchAlerts = useCallback(async () => {
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
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleQuickRestock = async (alert: Alert) => {
    setRestocking(prev => ({ ...prev, [alert.productId]: true }));
    try {
      const res = await fetch('http://localhost:5000/api/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader() },
        body: JSON.stringify({ productId: alert.productId, quantity: alert.eoq })
      });
      if (res.ok) await fetchAlerts();
    } catch (err) {
      console.error('Restock failed', err);
    } finally {
      setRestocking(prev => ({ ...prev, [alert.productId]: false }));
    }
  };

  return (
    <div className="bg-card backdrop-blur-glass border border-white/10 rounded-2xl flex flex-col h-full shadow-glass overflow-hidden group hover:border-white/20 transition-all">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h2 className="text-sm font-display font-bold text-white tracking-wide uppercase flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          Active Alerts
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${alerts.length > 0 ? 'bg-critical/20 text-critical border-critical/30' : 'bg-success/20 text-success border-success/30'}`}>
            {alerts.length} {alerts.length === 1 ? 'Issue' : alerts.length === 0 ? 'OK' : 'Issues'}
          </span>
          <button onClick={fetchAlerts} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            <div className="p-3 bg-success/20 rounded-full">
              <AlertCircle className="h-5 w-5 text-success" />
            </div>
            <p className="text-xs font-bold text-success">All stock levels are healthy</p>
          </div>
        )}
        {alerts.slice(0, 8).map((alert) => {
          const isHigh = alert.severity === 'high';
          const typeColor = isHigh ? 'critical' : 'warning';
          const isRestocking = restocking[alert.productId];

          return (
            <div key={alert.id} className="p-3 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 transition-all relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${isHigh ? 'bg-critical shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`} />
              <div className="flex gap-3 ml-2">
                <div className={`p-2 rounded-lg shrink-0 h-fit ${isHigh ? 'bg-critical/20 text-critical' : 'bg-warning/20 text-warning'}`}>
                  <Package className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h3 className="text-xs font-bold text-white truncate">{alert.productName}</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-wide ${isHigh ? 'text-critical' : 'text-warning'}`}>{alert.type}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug line-clamp-2">{alert.message}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleQuickRestock(alert)}
                      disabled={isRestocking}
                      className="text-[10px] font-bold text-success bg-success/10 hover:bg-success/20 border border-success/20 px-2 py-1 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {isRestocking
                        ? <><div className="w-2.5 h-2.5 border border-success/30 border-t-success rounded-full animate-spin" />Restocking...</>
                        : <><RefreshCw className="h-2.5 w-2.5" />Restock ({alert.eoq} units)</>
                      }
                    </button>
                    <button
                      onClick={() => navigate('/alerts')}
                      className="text-[10px] font-bold text-muted-foreground hover:text-white px-2 py-1 transition-colors flex items-center gap-1"
                    >
                      <ArrowUpRight className="h-2.5 w-2.5" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 text-center bg-black/40">
        <button onClick={() => navigate('/alerts')} className="text-xs font-bold text-primary hover:text-white transition-colors">
          View All Alerts ({alerts.length}) →
        </button>
      </div>
    </div>
  );
};

export default StockAlerts;