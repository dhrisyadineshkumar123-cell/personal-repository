import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

const Settings = () => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getAuthHeader } = useAuth();
  
  const [formData, setFormData] = useState({
    storeName: "",
    currency: "INR",
    lowThreshold: 7,
    criticalThreshold: 3
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        headers: { Authorization: getAuthHeader() }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: getAuthHeader()
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </AppShell>
    );
  }

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
                value={formData.storeName}
                onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Default currency
              </label>
              <select 
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner appearance-none"
              >
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
                value={formData.lowThreshold}
                onChange={(e) => setFormData({...formData, lowThreshold: Number(e.target.value)})}
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
                value={formData.criticalThreshold}
                onChange={(e) => setFormData({...formData, criticalThreshold: Number(e.target.value)})}
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

        <div className="flex justify-end pt-2 items-center gap-4">
          {saved && (
            <span className="text-success text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in slide-in-from-right-2">
              <CheckCircle2 className="h-4 w-4" /> Configuration Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 hover:shadow-neon-purple active:scale-95 transition-all flex items-center gap-2"
            type="button"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Configuration
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default Settings;