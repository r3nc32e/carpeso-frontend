import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Vehicles from './pages/admin/Vehicles';
import Transactions from './pages/admin/Transactions';
import Users from './pages/admin/Users';
import AuditLogs from './pages/admin/AuditLogs';
import ManageAdmins from './pages/admin/ManageAdmins';
import Categories from './pages/admin/Categories';
import AdminReviews from './pages/admin/Reviews';
import SalesAnalytics from './pages/admin/SalesAnalytics';
import AdminProfile from './pages/admin/Profile';

import BuyerLayout from './pages/buyer/BuyerLayout';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import Catalog from './pages/buyer/Catalog';
import MyOrders from './pages/buyer/MyOrders';
import WarrantyClaims from './pages/buyer/WarrantyClaims';
import Reviews from './pages/buyer/Reviews';
import VehicleDetail from './pages/buyer/VehicleDetail';
import BuyerProfile from './pages/buyer/Profile';

// Public VehicleDetail for guests
import PublicVehicleDetail from './pages/buyer/VehicleDetail';

const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />;
    return children;
};

const PrivilegeRoute = ({ children, privilege }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    if (!['ADMIN', 'SUPERADMIN'].includes(user?.role)) return <Navigate to="/login" replace />;
    // SuperAdmin can access everything
    if (user?.role === 'SUPERADMIN') {
        return <AdminLayout>{children}</AdminLayout>;
    }
    // Check if admin has the required privilege
    const hasPrivilege = user?.privileges?.includes(privilege);
    if (!hasPrivilege) return <Navigate to="/admin/dashboard" replace />;
    return <AdminLayout>{children}</AdminLayout>;
};

const SuperAdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    if (user?.role !== 'SUPERADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <AdminLayout>{children}</AdminLayout>;
};

const AdminRoute = ({ children }) => (
    <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}>
        <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
);

const BuyerRoute = ({ children }) => (
    <ProtectedRoute roles={['BUYER']}>
        <BuyerLayout>{children}</BuyerLayout>
    </ProtectedRoute>
);

function App() {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <img src="/logo.png" alt="Carpeso"
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-red-600" />
                <p className="text-gray-500 uppercase tracking-wider text-sm">Loading...</p>
            </div>
        </div>
    );

    const getDashboard = () => {
        if (!isAuthenticated()) return '/';
        return user?.role === 'BUYER' ? '/buyer/dashboard' : '/admin/dashboard';
    };

    return (
        <Routes>
            {/* Landing — default for guests, redirect if authenticated */}
            <Route path="/"
                element={
                    isAuthenticated()
                        ? <Navigate to={getDashboard()} replace />
                        : <Landing />
                }
            />

            {/* Auth Routes */}
            <Route path="/login"
                element={isAuthenticated() ? <Navigate to={getDashboard()} replace /> : <Login />} />
            <Route path="/register"
                element={isAuthenticated() ? <Navigate to="/buyer/dashboard" replace /> : <Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Public Vehicle Detail — guests can view */}
            <Route path="/vehicles/:id" element={<PublicVehicleDetail />} />

            {/* Admin Routes — Overview accessible to all admins */}
            <Route path="/admin/dashboard" element={<AdminRoute><Overview /></AdminRoute>} />
            <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />

            {/* Privilege-protected admin routes */}
            <Route path="/admin/vehicles"
                element={<PrivilegeRoute privilege="INVENTORY_MANAGER"><Vehicles /></PrivilegeRoute>} />
            <Route path="/admin/categories"
                element={<PrivilegeRoute privilege="INVENTORY_MANAGER"><Categories /></PrivilegeRoute>} />
            <Route path="/admin/transactions"
                element={<PrivilegeRoute privilege="TRANSACTION_MANAGER"><Transactions /></PrivilegeRoute>} />
            <Route path="/admin/users"
                element={<PrivilegeRoute privilege="ACCOUNT_MANAGER"><Users /></PrivilegeRoute>} />
            <Route path="/admin/reviews"
                element={<PrivilegeRoute privilege="CONTENT_MODERATOR"><AdminReviews /></PrivilegeRoute>} />
            <Route path="/admin/audit-logs"
                element={<PrivilegeRoute privilege="SALES_ANALYST"><AuditLogs /></PrivilegeRoute>} />
            <Route path="/admin/sales"
                element={<PrivilegeRoute privilege="SALES_ANALYST"><SalesAnalytics /></PrivilegeRoute>} />

            {/* SuperAdmin only */}
            <Route path="/admin/manage-admins"
                element={<SuperAdminRoute><ManageAdmins /></SuperAdminRoute>} />

            {/* Buyer Routes */}
            <Route path="/buyer/dashboard" element={<BuyerRoute><BuyerDashboard /></BuyerRoute>} />
            <Route path="/buyer/catalog" element={<BuyerRoute><Catalog /></BuyerRoute>} />
            <Route path="/buyer/vehicles/:id" element={<BuyerRoute><VehicleDetail /></BuyerRoute>} />
            <Route path="/buyer/orders" element={<BuyerRoute><MyOrders /></BuyerRoute>} />
            <Route path="/buyer/warranty-claims" element={<BuyerRoute><WarrantyClaims /></BuyerRoute>} />
            <Route path="/buyer/reviews" element={<BuyerRoute><Reviews /></BuyerRoute>} />
            <Route path="/buyer/profile" element={<BuyerRoute><BuyerProfile /></BuyerRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to={getDashboard()} replace />} />
        </Routes>
    );
}

export default App;