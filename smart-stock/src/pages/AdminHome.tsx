import AppShell from '@/components/AppShell';
import StatsGrid from '@/components/StatsGrid';
import StockCharts from '@/components/StockCharts';
import InventoryTable from '@/components/InventoryTable';
import StockAlerts from '@/components/StockAlerts';
import { ShieldCheck, BarChart3, Package, Database, Users, FileText, Activity, Zap, IndianRupee, Box, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { useState, useEffect } from 'react';

const AdminHome = () => {
  const { role, getAuthHeader } = useAuth();
  const [stats, setStats] = useState({ totalSales: 0, totalItems: 0, avgOrder: 0 });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stats', {
          headers: { Authorization: getAuthHeader() }
        });
        if (res.ok) {
          const data = await res.json();
          // Also fetch sales to get total item count
          const salesRes = await fetch('http://localhost:5000/api/sales', {
            headers: { Authorization: getAuthHeader() }
          });
          const salesData = await salesRes.json();
          const totalQtySold = salesData.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);
          
          setStats({
            totalSales: data.totalSales || 0,
            totalItems: totalQtySold || 0,
            avgOrder: salesData.length ? (data.totalSales / salesData.length) : 0
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardStats();
  }, [getAuthHeader]);

  if (role === null) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-primary font-display font-bold">Initializing Admin Session...</div>
    </div>
  );

  if (role !== 'admin') return (
    <div className="min-h-screen bg-background flex items-center justify-center text-white font-medium">
      Not authorized to access Admin Portal.
    </div>
  );

  const adminQuickLinks = [
    { icon: Package, label: 'Categories', to: '/admin/categories', desc: 'Manage categories' },
    { icon: BarChart3, label: 'Sales Ledger', to: '/admin/sales', desc: 'Record sales' },
    { icon: Database, label: 'Products', to: '/products', desc: 'Full inventory' },
    { icon: Users, label: 'Staff', to: '/staff', desc: 'Team management' },
    { icon: FileText, label: 'Reports', to: '/analytics', desc: 'Business insights' },
  ];

  return (
    <AppShell>
      <div className="max-w-[1800px] mx-auto pb-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
        
        {/* Core Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4 border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
              <Activity className="h-4 w-4 text-primary mr-2 animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest pr-2">System Online</span>
            </div>
            <h1 className='text-4xl md:text-5xl font-display font-black tracking-tight text-white drop-shadow-md'>
              Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#8b5cf6] to-info drop-shadow-none">Command</span>
            </h1>
            <p className='text-muted-foreground mt-3 font-medium text-lg max-w-xl'>
              Centralized monitoring matrix. Real-time telemetry for stock flow and predictive demand analytics.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Dynamic Stats in Header */}
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 shadow-glass">
                <div className="p-1 bg-primary/20 rounded-md text-primary">
                  <IndianRupee className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-bold text-white">₹{stats.totalSales.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 shadow-glass">
                <div className="p-1 bg-info/20 rounded-md text-info">
                  <Box className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-bold text-white">{stats.totalItems} items</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 shadow-glass">
                <div className="p-1 bg-warning/20 rounded-md text-warning">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-bold text-white">{stats.avgOrder.toFixed(0)} avg</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

            <div className="flex gap-4">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-glass">
                <div className="p-2 bg-success/20 rounded-xl text-success shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Integrity</p>
                  <p className="text-sm font-bold text-white">99.9% Secure</p>
                </div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-glass">
                <div className="p-2 bg-info/20 rounded-xl text-info shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Latency</p>
                  <p className="text-sm font-bold text-white">12ms Sync</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
          {adminQuickLinks.map((link, i) => (
            <Link key={link.to} to={link.to} className="group bg-card/80 backdrop-blur border border-white/10 p-6 rounded-3xl hover:bg-white/5 hover:border-primary transition-all hover:-translate-y-1 shadow-glass relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5" />
              <link.icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform relative z-10" />
              <h3 className="font-bold text-lg text-white mb-1 relative z-10">{link.label}</h3>
              <p className="text-muted-foreground text-xs relative z-10">{link.desc}</p>
            </Link>
          ))}
        </div>

        <div className="relative z-10">
          <StatsGrid />
        </div>

        <div className="relative z-10 mt-8 mb-8">
          <StockCharts />
        </div>

        {/* Inventory & Alerts */}
        <div className='grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10'>
          <div className='xl:col-span-8 group'>
            <div className="relative h-full flex flex-col">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-info/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />
              <div className="relative flex-grow h-full min-h-[500px]">
                <InventoryTable />
              </div>
            </div>
          </div>
          <div className='xl:col-span-4 group'>
            <div className="relative h-full flex flex-col">
              <div className="absolute -inset-1 bg-gradient-to-l from-warning/20 to-critical/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />
              <div className="relative flex-grow h-full min-h-[500px]">
                <StockAlerts />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AdminHome;

