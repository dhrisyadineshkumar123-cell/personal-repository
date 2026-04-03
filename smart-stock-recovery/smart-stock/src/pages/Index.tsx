import AppShell from '@/components/AppShell';
import StatsGrid from '@/components/StatsGrid';
import StockCharts from '@/components/StockCharts';
import InventoryTable from '@/components/InventoryTable';
import StockAlerts from '@/components/StockAlerts';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
 
const Index = () => {
  return (
    <AppShell>
      <div className='max-w-[1800px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 relative pb-12 space-y-12'>
        
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
          <div className="flex flex-wrap gap-4">
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
        
        {/* Top-Level KPI Grid */}
        <div className="relative z-10">
          <StatsGrid />
        </div>

        {/* Dynamic Charting Matrix */}
        <div className="relative z-10 mt-8 mb-8">
          <StockCharts />
        </div>
        
        {/* Asymmetrical Lower Section */}
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
 
export default Index;