import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Camera, Mail, User, Phone, Shield, Bell, Key, Save } from "lucide-react";

const Profile = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "Sarah",
    lastName: "Miller",
    email: "sarah.miller@smartstock.com",
    phone: "+1 (555) 123-4567",
    role: "System Administrator",
    department: "Operations",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would make an API call to save the data
  };

  return (
    <AppShell>
      <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight text-white drop-shadow-md">
              User <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#8b5cf6] to-info drop-shadow-none">Profile</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-medium text-lg">
              Manage your identity, contact information, and security preferences.
            </p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-glass border ${
              isEditing 
                ? "bg-primary text-white hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] border-primary/50" 
                : "bg-white/5 text-white hover:bg-white/10 border-white/10 hover:border-white/20"
            }`}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          
          {/* Left Column - Avatar & Identity */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-card backdrop-blur-glass border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group shadow-glass">
              <div className="absolute inset-0 bg-gradient-to-b from-[#8b5cf6]/10 to-transparent pointer-events-none" />
              
              <div className="relative mb-6 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full border-4 border-card bg-black/50 shadow-[0_0_30px_rgba(139,92,246,0.3)] relative overflow-hidden mb-4">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-info text-white text-4xl font-bold">
                      {formData.firstName[0]}{formData.lastName[0]}
                    </div>
                  )}
                </div>
                
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all shadow-glass hover:border-info/30 hover:text-info z-10">
                  <Camera className="h-4 w-4" />
                  Upload Photo
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>

              <h2 className="text-2xl font-display font-bold text-white text-center drop-shadow-sm mb-1">
                {formData.firstName} {formData.lastName}
              </h2>
              <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold text-primary border border-primary/20 bg-primary/10 select-none shadow-inner">
                <Shield className="h-3.5 w-3.5" />
                <span className="uppercase tracking-widest">{formData.role}</span>
              </div>
            </div>

            {/* Quick Stats/Badges */}
            <div className="bg-card backdrop-blur-glass border border-white/10 rounded-3xl p-6 shadow-glass">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest mb-4">Security Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/20 border border-success/20">
                  <div className="p-2 bg-success/20 text-success rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">2FA Enabled</p>
                    <p className="text-xs text-muted-foreground">Authenticator App</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="p-2 bg-info/20 text-info rounded-xl shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Change Password</p>
                    <p className="text-xs text-muted-foreground">Last changed 3mo ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card backdrop-blur-glass border border-white/10 rounded-3xl p-8 shadow-glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-info/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-info/10 transition-colors" />
              
              <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-info" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={`w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 ${
                      isEditing 
                        ? 'bg-black/40 border border-white/20 text-white focus:border-info focus:ring-info shadow-inner' 
                        : 'bg-transparent border border-transparent text-white/90 cursor-default'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={`w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 ${
                      isEditing 
                        ? 'bg-black/40 border border-white/20 text-white focus:border-info focus:ring-info shadow-inner' 
                        : 'bg-transparent border border-transparent text-white/90 cursor-default'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 ${
                        isEditing 
                          ? 'bg-black/40 border border-white/20 text-white focus:border-info focus:ring-info shadow-inner' 
                          : 'bg-transparent border border-transparent text-white/90 cursor-default'
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 ${
                        isEditing 
                          ? 'bg-black/40 border border-white/20 text-white focus:border-info focus:ring-info shadow-inner' 
                          : 'bg-transparent border border-transparent text-white/90 cursor-default'
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    readOnly={true}
                    className="w-full bg-transparent border border-transparent rounded-xl px-4 py-3 text-white/70 text-sm cursor-default"
                  />
                  {isEditing && (
                    <p className="text-[10px] text-muted-foreground mt-1 px-4">Contact IT to change department.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-card backdrop-blur-glass border border-white/10 rounded-3xl p-8 shadow-glass relative overflow-hidden group">
              <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#8b5cf6]" />
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">Critical Stock Alerts</p>
                    <p className="text-xs text-muted-foreground">Immediate email and push notifications.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked disabled={!isEditing} />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success shadow-inner peer-disabled:opacity-50"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">Weekly Summary Report</p>
                    <p className="text-xs text-muted-foreground">Receive inventory digest every Monday.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked disabled={!isEditing} />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success shadow-inner peer-disabled:opacity-50"></div>
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Profile;