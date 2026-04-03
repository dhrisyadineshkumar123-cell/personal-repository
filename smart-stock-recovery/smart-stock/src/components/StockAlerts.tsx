import { AlertCircle, ArrowUpRight, Clock, Package } from "lucide-react";

const alerts = [
  {
    id: 1,
    title: "Critical Stock",
    item: "Aashirvaad Atta 10kg",
    message: "Only 12 units remaining. Reorder point is 50.",
    time: "2h ago",
    type: "critical"
  },
  {
    id: 2,
    title: "Restock Recommended",
    item: "Tata Salt 1kg",
    message: "Current stock is 45. Below reorder point of 80.",
    time: "5h ago",
    type: "warning"
  },
  {
    id: 3,
    title: "Overstock Notice",
    item: "Amul Taaza Milk 1L",
    message: "580 units in stock. Exceeds optimal level of 300.",
    time: "1d ago",
    type: "info"
  }
];

const StockAlerts = () => {
  return (
    <div className="bg-card backdrop-blur-glass border border-white/10 rounded-2xl flex flex-col h-full shadow-glass overflow-hidden group hover:border-white/20 transition-all">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h2 className="text-sm font-display font-bold text-white tracking-wide uppercase drop-shadow-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          Active Alerts
        </h2>
        <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
          3 NEW
        </span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 transition-all group/alert relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              alert.type === 'critical' ? 'bg-critical shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 
              alert.type === 'warning' ? 'bg-warning shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 
              'bg-info shadow-[0_0_10px_rgba(59,130,246,0.8)]'
            }`} />
            <div className="flex gap-3 ml-2">
              <div className={`p-2 rounded-lg shrink-0 h-fit ${
                alert.type === 'critical' ? 'bg-critical/20 text-critical shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]' : 
                alert.type === 'warning' ? 'bg-warning/20 text-warning shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]' : 
                'bg-info/20 text-info shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]'
              }`}>
                {alert.type === 'info' ? <ArrowUpRight className="h-4 w-4" /> : <Package className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                  <div className="flex items-center text-[10px] text-muted-foreground font-medium">
                    <Clock className="h-3 w-3 mr-1" />
                    {alert.time}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-2 font-medium">
                  <span className="text-foreground font-semibold">{alert.item}</span> — {alert.message}
                </p>
                <div className="flex gap-2">
                  <button className="text-[10px] font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition-colors">
                    Review
                  </button>
                  <button className="text-[10px] font-bold text-muted-foreground hover:text-white px-2 py-1.5 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/5 text-center bg-black/40">
        <button className="text-xs font-bold text-primary hover:text-white transition-colors duration-300">
          View All Alerts →
        </button>
      </div>
    </div>
  );
};

export default StockAlerts;