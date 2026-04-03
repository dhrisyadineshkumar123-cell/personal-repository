import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  role: 'admin' | 'staff' | null;
  email: string | null;
  login: (r: 'admin' | 'staff', e: string) => void;
  logout: () => void;
  getAuthHeader: () => string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => window.localStorage.getItem("smartstock_auth") === "true");
  const [role, setRole] = useState<'admin' | 'staff' | null>(() => window.localStorage.getItem("smartstock_role") as 'admin' | 'staff' | null);
  const [email, setEmail] = useState<string | null>(() => window.localStorage.getItem("smartstock_email"));

  useEffect(() => {
    // Sync with localStorage if it changes in other tabs
    const handleStorageChange = () => {
      setIsAuthenticated(window.localStorage.getItem("smartstock_auth") === "true");
      setRole(window.localStorage.getItem("smartstock_role") as 'admin' | 'staff' | null);
      setEmail(window.localStorage.getItem("smartstock_email"));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (r: 'admin' | 'staff', e: string) => {
    setIsAuthenticated(true);
    setRole(r);
    setEmail(e);
    window.localStorage.setItem("smartstock_auth", "true");
    window.localStorage.setItem("smartstock_role", r);
    window.localStorage.setItem("smartstock_email", e);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setEmail(null);
    window.localStorage.removeItem("smartstock_auth");
    window.localStorage.removeItem("smartstock_role");
    window.localStorage.removeItem("smartstock_email");
  };

  const getAuthHeader = () => email ? `Bearer ${email}` : role ? `Bearer ${role}` : '';
  return (
    <AuthContext.Provider value={{ isAuthenticated, role, email, login, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

