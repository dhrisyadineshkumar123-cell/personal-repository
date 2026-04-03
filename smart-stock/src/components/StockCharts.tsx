import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  ComposedChart, Bar, Line, Legend
} from "recharts";
import { useAuth } from '@/auth/AuthContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        {label && <p className="text-white font-bold mb-2 break-all">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm font-medium">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload?.fill, boxShadow: `0 0 8px ${entry.color || entry.payload?.fill}` }} />
            <span style={{ color: entry.color || entry.payload?.fill }}>{entry.name}:</span>
            <span className="text-white drop-shadow-sm">{entry.value} Units</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const StockCharts = () => {
  const [flowData, setFlowData] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [projectionData, setProjectionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAuthHeader } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const auth = getAuthHeader();
        const [flowRes, projRes] = await Promise.all([
          fetch('http://localhost:5000/api/charts/flow', { headers: { Authorization: auth } }),
          fetch('http://localhost:5000/api/charts/projections', { headers: { Authorization: auth } })
        ]);
        const catUrl = new URL('http://localhost:5000/api/charts/categories');
        catUrl.searchParams.append('category', selectedCategory);
        const catRes = await fetch(catUrl.toString(), { headers: { Authorization: auth } });
        
        setFlowData(await flowRes.json());
        setCategoryDistribution(await catRes.json());
        setProjectionData(await projRes.json());
      } catch (err) {
        console.error("Failed to fetch chart data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedCategory]);


  if (loading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Initializing telemetry...</div>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* Real-time Flow Area Chart */}
      <div className="xl:col-span-2 bg-gradient-to-br from-card to-black/40 backdrop-blur-glass border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-glass flex flex-col min-h-[400px]">
        <div className="absolute top-0 right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-1000" />
        
        <div className="flex items-center justify-between mb-8 relative z-10 shrink-0">
          <div>
            <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase drop-shadow-sm">Live Inventory Flow</h3>
            <p className="text-xs text-muted-foreground mt-1">Inflow vs Outflow velocity over time</p>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"/> Inflow</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-info rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"/> Outflow</div>
          </div>
        </div>

        <div className="flex-1 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={flowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="inflow" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" style={{ filter: "drop-shadow(0 0 10px rgba(34,197,94,0.3))" }} />
              <Area type="monotone" dataKey="outflow" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOutflow)" style={{ filter: "drop-shadow(0 0 10px rgba(59,130,246,0.3))" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution Pie Chart */}
      <div className="bg-gradient-to-tr from-card to-black/40 backdrop-blur-glass border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-glass flex flex-col items-center min-h-[400px]">
        <div className="absolute bottom-0 left-[-10%] w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#8b5cf6]/20 transition-colors duration-1000" />
        
        <div className="w-full mb-8 relative z-10 shrink-0">
          <div className="flex flex-col items-center gap-3">
            <div>
              <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase drop-shadow-sm">Category Stock Distribution</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Filter by Category</p>
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-xl border border-white/20 bg-black/50 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
            >
              <option value="all">All Categories</option>
              {categoryDistribution.map((cat: any) => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>


        <div className="flex-1 w-full relative z-10 -mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth={2}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}80)` }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <div className="w-full flex flex-wrap justify-center gap-3 mt-4 relative z-10 shrink-0">
          {categoryDistribution.map((cat: any) => (
            <div key={cat.name} className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}` }} />
              {cat.name}
            </div>
          ))}
        </div>
      </div>

      {/* Capacity & Projection Composed Chart */}
      <div className="xl:col-span-3 bg-card backdrop-blur-glass border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-glass flex flex-col min-h-[400px]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] bg-warning/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-warning/10 transition-colors duration-1000" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 gap-4 shrink-0">
          <div>
            <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase drop-shadow-sm">7-Day Capacity Projection</h3>
            <p className="text-xs text-muted-foreground mt-1">Actuals vs Predicted vs Max Capacity limits in Store Operations</p>
          </div>
        </div>

        <div className="flex-1 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px', fontWeight: 'bold' }} />
              
              <Bar dataKey="actual" name="Actual Volume" barSize={30} fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="projected" name="AI Projection" stroke="#2dd4bf" strokeWidth={4} dot={{ r: 6, fill: "#2dd4bf", stroke: "#090a0f", strokeWidth: 2 }} style={{ filter: "drop-shadow(0 0 10px rgba(45,212,191,0.5))" }} />
              <Line type="stepAfter" dataKey="capacity" name="Max Capacity" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} style={{ filter: "drop-shadow(0 0 5px rgba(239,68,68,0.5))" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default StockCharts;
