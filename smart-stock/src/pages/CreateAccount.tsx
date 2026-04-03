import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeType, setStoreType] = useState<"grocery" | "fashion" | "electronics" | "other">(
    "grocery"
  );
  const [role, setRole] = useState<"admin" | "staff">("admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!storeName.trim()) {
      setError("Please enter your store name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          storeName,
          storeType,
          role,
          password
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create account');
      }

      setError(null);
      setMessage("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-sm p-8 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-display font-bold text-white">Create Account</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Join the SmartStock network and connect with your store ecosystem.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">
              Full Name
            </label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="storeName" className="text-xs font-medium text-muted-foreground">
              Store Name
            </label>
            <input
              id="storeName"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Downtown Fresh Market"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="storeType" className="text-xs font-medium text-muted-foreground">
              Store Type
            </label>
            <select
              id="storeType"
              value={storeType}
              onChange={(e) => setStoreType(e.target.value as typeof storeType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="grocery">Grocery / FMCG</option>
              <option value="fashion">Fashion / Apparel</option>
              <option value="electronics">Electronics</option>
              <option value="other">Other retail</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="role" className="text-xs font-medium text-muted-foreground">
              Account Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none font-bold text-primary"
            >
              <option value="admin">Administrator (Full Access)</option>
              <option value="staff">Staff (Inventory & Sales)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Email
            </label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-medium text-muted-foreground"
            >
              Confirm Password
            </label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Account
          </button>
        </form>
        {message && <p className="text-xs text-success mt-1">{message}</p>}
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}

        <div className="text-xs text-center mt-2">
          <Link to="/login" className="text-muted-foreground hover:text-foreground hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;