import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';

import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Vehicles from './pages/admin/Vehicles';
import Transactions from './pages/admin/Transactions';
import Users from './pages/admin/Users';
import AuditLogs from './pages/admin/AuditLogs';
import ManageAdmins from './pages/admin/ManageAdmins';

import BuyerDashboard from './pages/buyer/BuyerDashboard';

const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated()) return <Navigate to="/login" />;
    if (roles && !roles.includes(user?.role)) return <Navigate to="/login" />;
    return children;
};

const AdminRoute = ({ children }) => (
    <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}>
        <AdminLayout>{children}</AdminLayout>
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

    const getDefaultRoute = () => {
        if (!isAuthenticated()) return '/login';
        if (user?.role === 'BUYER') return '/buyer/dashboard';
        return '/admin/dashboard';
    };

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><Overview /></AdminRoute>} />
            <Route path="/admin/vehicles" element={<AdminRoute><Vehicles /></AdminRoute>} />
            <Route path="/admin/transactions" element={<AdminRoute><Transactions /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
            <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
            <Route path="/admin/manage-admins" element={<AdminRoute><ManageAdmins /></AdminRoute>} />

            {/* Buyer Routes */}
            <Route path="/buyer/dashboard" element={
                <ProtectedRoute roles={['BUYER']}>
                    <BuyerDashboard />
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
        </Routes>
    );
}

export default App;