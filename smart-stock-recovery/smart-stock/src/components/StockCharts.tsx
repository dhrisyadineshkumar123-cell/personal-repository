import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  ComposedChart, Bar, Line, Legend
} from "recharts";

const flowData = [
  { time: "08:00", inflow: 120, outflow: 80 },
  { time: "10:00", inflow: 250, outflow: 150 },
  { time: "12:00", inflow: 180, outflow: 300 },
  { time: "14:00", inflow: 390, outflow: 280 },
  { time: "16:00", inflow: 420, outflow: 450 },
  { time: "18:00", inflow: 200, outflow: 190 },
];

const categoryDistribution = [
  { name: "Grains & Pulses", value: 450, color: "#8b5cf6" },
  { name: "Spices", value: 280, color: "#10b981" },
  { name: "Dairy", value: 320, color: "#3b82f6" },
  { name: "Snacks", value: 190, color: "#f59e0b" },
  { name: "Beverages", value: 150, color: "#ef4444" },
];

const projectionData = [
  { name: 'Mon', actual: 4000, projected: 4400, capacity: 5000 },
  { name: 'Tue', actual: 3000, projected: 3200, capacity: 5000 },
  { name: 'Wed', actual: 2000, projected: 2500, capacity: 5000 },
  { name: 'Thu', actual: 2780, projected: 3908, capacity: 5000 },
  { name: 'Fri', actual: 1890, projected: 4800, capacity: 5000 },
  { name: 'Sat', actual: 2390, projected: 3800, capacity: 5000 },
  { name: 'Sun', actual: 3490, projected: 4300, capacity: 5000 },
];

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
        
        <div className="w-full mb-8 relative z-10 text-center shrink-0">
          <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase drop-shadow-sm">Category Stock Distribution</h3>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">SKU Volume by Indian Retail Category</p>
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
          {categoryDistribution.map((cat) => (
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
