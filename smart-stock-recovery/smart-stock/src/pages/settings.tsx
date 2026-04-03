import AppShell from "@/components/AppShell";

const Settings = () => {
  return (
    <AppShell>
      <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Configure your store preferences, notifications, and inventory rules.
          </p>
        </div>

        {/* Store details */}
        <section className="bg-card backdrop-blur-glass border border-white/10 shadow-glass rounded-2xl p-6 space-y-5 hover:border-white/20 transition-all">
          <div>
            <h2 className="text-sm font-display font-bold text-white tracking-wide uppercase drop-shadow-sm mb-1">Store details</h2>
            <p className="text-xs text-muted-foreground">
              Basic information about your business.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Store name
              </label>
              <input
                type="text"
                defaultValue="SmartStock Demo Store"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Default currency
              </label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner appearance-none">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Inventory rules */}
        <section className="bg-card backdrop-blur-glass border border-white/10 shadow-glass rounded-2xl p-6 space-y-5 hover:border-white/20 transition-all">
          <div>
            <h2 className="text-sm font-display font-bold text-white tracking-wide uppercase drop-shadow-sm mb-1">Inventory rules</h2>
            <p className="text-xs text-muted-foreground">
              Control when SmartStock generates low stock and overstock alerts.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Low stock threshold (days of cover)
              </label>
              <input
                type="number"
                min={1}
                defaultValue={7}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-white text-sm outline-none focus:border-warning focus:ring-1 focus:ring-warning shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Critical stock threshold (days of cover)
              </label>
              <input
                type="number"
                min={1}
                defaultValue={3}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-white text-sm outline-none focus:border-critical focus:ring-1 focus:ring-critical shadow-inner"
              />
            </div>
          </div>
        </section>

        {/* Notification preferences */}
        <section className="bg-card backdrop-blur-glass border border-white/10 shadow-glass rounded-2xl p-6 space-y-5 hover:border-white/20 transition-all">
          <div>
            <h2 className="text-sm font-display font-bold text-white tracking-wide uppercase drop-shadow-sm mb-1">Notifications</h2>
            <p className="text-xs text-muted-foreground">
              Choose how you want to be notified about stock changes.
            </p>
          </div>
          <div className="space-y-4 text-sm font-medium">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-background" />
              <span className="text-muted-foreground group-hover:text-white transition-colors">Email alerts for low stock</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-background" />
              <span className="text-muted-foreground group-hover:text-white transition-colors">Daily inventory summary</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-background" />
              <span className="text-muted-foreground group-hover:text-white transition-colors">Weekly forecasting report</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <button
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 hover:shadow-neon-purple active:scale-95 transition-all"
            type="button"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default Settings;