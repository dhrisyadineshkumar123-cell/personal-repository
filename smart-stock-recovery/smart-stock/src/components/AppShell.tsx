import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronLeft,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  Store,
  LogOut
} from "lucide-react";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Package, label: "Products", to: "/products" },
  { icon: BarChart3, label: "Analytics", to: "/analytics" },
  { icon: AlertTriangle, label: "Alerts", to: "/alerts" },
  { icon: Settings, label: "Settings", to: "/settings" }
];

const AppShell = ({ children }: AppShellProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    window.localStorage.removeItem("smartstock_auth");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Blurred decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-success/20 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside
        className={`relative z-10 flex flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } hidden md:flex m-4 mr-0 rounded-2xl bg-card backdrop-blur-glass border border-white/10 shadow-glass`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 border border-primary/50 p-2 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.5)] shrink-0 group hover:shadow-[0_0_25px_rgba(139,92,246,0.8)] transition-all">
              <Store className="h-6 w-6 text-primary" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-display font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-info truncate">
                  SmartStock
                </h1>
                <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">System OS</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `group w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.15)] border border-primary/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform group-hover:text-primary group-[.active]:text-primary" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.label === "Alerts" && (
                <span className="ml-auto w-2 h-2 rounded-full bg-critical shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:text-white hover:bg-white/5 hover:border hover:border-white/10 ${
                isActive ? "bg-white/5 text-white border-white/10" : "text-muted-foreground border-transparent"
              }`
            }
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-info flex items-center justify-center text-white text-[10px] font-bold shadow-neon-purple shrink-0">
              SM
            </div>
            {!collapsed && <span>My Profile</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-critical hover:text-white hover:bg-critical/20 transition-all border border-transparent"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 mt-4 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 hover:border border-transparent hover:border-white/10 transition-all border-t border-white/5 pt-4"
          >
            <ChevronLeft
              className={`h-5 w-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && <span>Collapse Menu</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top bar */}
        <header className="px-8 py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <div className="bg-gradient-to-br from-primary to-info p-2 rounded-xl shadow-neon-purple">
              <Store className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="hidden md:flex flex-1">
             <div className="flex items-center gap-3 bg-card backdrop-blur-glass border border-white/10 rounded-full px-5 py-2.5 w-[400px] shadow-glass focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products, SKUs, patterns..."
                  className="bg-transparent text-sm font-medium outline-none flex-1 text-white placeholder:text-muted-foreground/50"
                />
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/alerts")}
              className="relative p-3 rounded-xl bg-card border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all shadow-glass group"
            >
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-critical rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse border-2 border-[#090a0f]" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-8 pb-8 pt-2 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;