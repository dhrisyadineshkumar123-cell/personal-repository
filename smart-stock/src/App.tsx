import { Navigate, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/products";
import Analytics from "./pages/Analytics";  
import AlertsPage from "./pages/Alerts";
import Settings from "./pages/settings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import CreateAccount from "./pages/CreateAccount"; 
import StaffHome from "./pages/StaffHome";
import StaffSales from "./pages/StaffSales";
import AdminCategories from "./pages/AdminCategories";
import AdminSales from "./pages/AdminSales";
import AdminHome from "./pages/AdminHome";
import "./App.css";
import { AuthProvider, useAuth } from "./auth/AuthContext";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/create-account" element={<CreateAccount />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            {role === 'admin' ? <AdminHome /> : <Index />}
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminHome />
          </RequireAdmin>
        }
      />

        <Route
          path="/staff"
          element={
            <RequireAuth>
              <StaffHome />
            </RequireAuth>
          }
        />
        <Route
          path="/staff/sales"
          element={
            <RequireAuth>
              <StaffSales />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RequireAdmin>
              <AdminCategories />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/sales"
          element={
            <RequireAdmin>
              <AdminSales />
            </RequireAdmin>
          }
        />
        <Route
          path="/products"
          element={
            <RequireAuth>
              <Products />
            </RequireAuth>
          }
        />
        <Route
          path="/analytics"
          element={
            <RequireAuth>
              <Analytics />
            </RequireAuth>
          }
        />
        <Route
          path="/alerts"
          element={
            <RequireAuth>
              <AlertsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

export default App;