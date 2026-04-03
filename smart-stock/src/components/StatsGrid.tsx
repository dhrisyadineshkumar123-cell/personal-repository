import { useState, useEffect } from "react";
import { Package, TrendingUp, AlertTriangle, IndianRupee } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const StatsGrid = () => {
  const [data, setData] = useState<any>(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch('http://localhost:5000/api/stats', {
          headers: { Authorization: getAuthHeader() }
        }).then(r => r.json());
        setData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [getAuthHeader]);

  if (!data) return <div className="text-white animate-pulse text-sm font-medium">Loading telemetry...</div>

  const dynamicStats = [
    {
      title: "Total SKUs",
      value: data?.totalProducts || 0,
      change: "+12%",
      trend: "up" as const,
      icon: Package,
      color: "text-[#8b5cf6]",      // Neon Purple
      bgColor: "bg-[#8b5cf6]/20",
      shadow: "shadow-[0_0_15px_rgba(139,92,246,0.5)]",
    },
    {
      title: "Total Sales",
      value: `₹${((data?.totalSales || 0) / 100000).toFixed(1)}L`,
      change: "+8.3%",
      trend: "up" as const,
      icon: IndianRupee,
      color: "text-[#10b981]",      // Neon Emerald
      bgColor: "bg-[#10b981]/20",
      shadow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    },
    {
      title: "Turnover Rate",
      value: `${data?.turnoverRate || 0}x`,
      change: "+0.6",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-[#3b82f6]",      // Neon Blue
      bgColor: "bg-[#3b82f6]/20",
      shadow: "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    },
    {
      title: "Low Stock Alerts",
      value: data?.lowStock || 0,
      change: (data?.lowStock || 0) > 10 ? "+5" : "-2",
      trend: (data?.lowStock || 0) > 10 ? "up" as const : "down" as const,
      icon: AlertTriangle,
      color: "text-[#f59e0b]",      // Neon Amber
      bgColor: "bg-[#f59e0b]/20",
      shadow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {dynamicStats.map((stat, i) => (
        <div
          key={stat.title}
          className="group bg-card backdrop-blur-glass border border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-glass relative overflow-hidden"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Subtle gradient glow behind the card */}
          <div className="absolute top-0 right-0 -m-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.shadow} border border-white/10`}>
              <stat.icon className={`h-6 w-6 ${stat.color} drop-shadow-md`} />
            </div>
            <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              stat.trend === "up" 
                ? "bg-success/10 text-success border-success/20" 
                : "bg-critical/10 text-critical border-critical/20"
            }`}>
              {stat.change}
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.title}</p>
            <p className="text-3xl font-display font-bold text-white mt-1 drop-shadow-sm">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;