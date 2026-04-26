import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import BuyerProfile from "./pages/buyer/Profile";

import AdminLayout from "./pages/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import Vehicles from "./pages/admin/Vehicles";
import Transactions from "./pages/admin/Transactions";
import Users from "./pages/admin/Users";
import AuditLogs from "./pages/admin/AuditLogs";
import ManageAdmins from "./pages/admin/ManageAdmins";
import Categories from "./pages/admin/Categories";
import AdminReviews from "./pages/admin/Reviews";
import SalesAnalytics from "./pages/admin/SalesAnalytics";
import AdminProfile from "./pages/admin/Profile";

import BuyerLayout from "./pages/buyer/BuyerLayout";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import Catalog from "./pages/buyer/Catalog";
import MyOrders from "./pages/buyer/MyOrders";
import WarrantyClaims from "./pages/buyer/WarrantyClaims";
import Reviews from "./pages/buyer/Reviews";
import VehicleDetail from "./pages/buyer/VehicleDetail";

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => (
  <ProtectedRoute roles={["ADMIN", "SUPERADMIN"]}>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

const BuyerRoute = ({ children }) => (
  <ProtectedRoute roles={["BUYER"]}>
    <BuyerLayout>{children}</BuyerLayout>
  </ProtectedRoute>
);

function App() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="Carpeso"
            className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-red-600"
          />
          <p className="text-gray-500 uppercase tracking-wider text-sm">
            Loading...
          </p>
        </div>
      </div>
    );

  return (
    <Routes>
      {/* Landing — default for guests */}
      <Route
        path="/"
        element={
          isAuthenticated() ? (
            <Navigate
              to={
                user?.role === "BUYER" ? "/buyer/dashboard" : "/admin/dashboard"
              }
            />
          ) : (
            <Landing />
          )
        }
      />

      <Route
        path="/admin/profile"
        element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        }
      />
      {/* Auth */}
      <Route
        path="/login"
        element={
          isAuthenticated() ? (
            <Navigate
              to={
                user?.role === "BUYER" ? "/buyer/dashboard" : "/admin/dashboard"
              }
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated() ? <Navigate to="/buyer/dashboard" /> : <Register />
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route
        path="/buyer/profile"
        element={
          <BuyerRoute>
            <BuyerProfile />
          </BuyerRoute>
        }
      />
      {/* Public Vehicle Detail — for guests */}
      <Route path="/vehicles/:id" element={<VehicleDetail />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <Overview />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/vehicles"
        element={
          <AdminRoute>
            <Vehicles />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <Categories />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <AdminRoute>
            <Transactions />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <AdminRoute>
            <AuditLogs />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-admins"
        element={
          <AdminRoute>
            <ManageAdmins />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <AdminRoute>
            <AdminReviews />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/sales"
        element={
          <AdminRoute>
            <SalesAnalytics />
          </AdminRoute>
        }
      />

      {/* Buyer Routes */}
      <Route
        path="/buyer/dashboard"
        element={
          <BuyerRoute>
            <BuyerDashboard />
          </BuyerRoute>
        }
      />
      <Route
        path="/buyer/catalog"
        element={
          <BuyerRoute>
            <Catalog />
          </BuyerRoute>
        }
      />
      <Route
        path="/buyer/vehicles/:id"
        element={
          <BuyerRoute>
            <VehicleDetail />
          </BuyerRoute>
        }
      />
      <Route
        path="/buyer/orders"
        element={
          <BuyerRoute>
            <MyOrders />
          </BuyerRoute>
        }
      />
      <Route
        path="/buyer/warranty-claims"
        element={
          <BuyerRoute>
            <WarrantyClaims />
          </BuyerRoute>
        }
      />
      <Route
        path="/buyer/reviews"
        element={
          <BuyerRoute>
            <Reviews />
          </BuyerRoute>
        }
      />

      {/* Catch all */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated()
                ? user?.role === "BUYER"
                  ? "/buyer/dashboard"
                  : "/admin/dashboard"
                : "/"
            }
          />
        }
      />
    </Routes>
  );
}

export default App;
