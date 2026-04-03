import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("smartstock_auth");
    setIsAuthenticated(stored === "true");
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    window.localStorage.setItem("smartstock_auth", "true");
  };

  const logout = () => {
    setIsAuthenticated(false);
    window.localStorage.removeItem("smartstock_auth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

