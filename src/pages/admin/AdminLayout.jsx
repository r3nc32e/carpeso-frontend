import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Car, ClipboardList, Users,
    ScrollText, ShieldCheck, Bell, Menu, X, LogOut
} from 'lucide-react';

function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifOpen, setNotifOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isSuperAdmin = user?.role === 'SUPERADMIN';
    const hasPrivilege = (priv) =>
        isSuperAdmin || user?.privileges?.includes(priv);

    const navItems = [
        {
            label: 'Overview',
            icon: <LayoutDashboard size={18} />,
            path: '/admin/dashboard',
            show: true,
        },
        {
            label: 'Vehicles',
            icon: <Car size={18} />,
            path: '/admin/vehicles',
            show: hasPrivilege('INVENTORY_MANAGER'),
        },
        {
            label: 'Transactions',
            icon: <ClipboardList size={18} />,
            path: '/admin/transactions',
            show: hasPrivilege('TRANSACTION_MANAGER'),
        },
        {
            label: 'Users',
            icon: <Users size={18} />,
            path: '/admin/users',
            show: hasPrivilege('ACCOUNT_MANAGER'),
        },
        {
            label: 'Audit Logs',
            icon: <ScrollText size={18} />,
            path: '/admin/audit-logs',
            show: hasPrivilege('SALES_ANALYST') || isSuperAdmin,
        },
        {
            label: 'Manage Admins',
            icon: <ShieldCheck size={18} />,
            path: '/admin/manage-admins',
            show: isSuperAdmin,
        },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-red-600 text-white flex flex-col transition-all duration-300 min-h-screen fixed z-20`}>
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-red-500">
                    {sidebarOpen && (
                        <img src="/logo.png" alt="Carpeso"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white" />
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-white hover:bg-red-700 p-1.5 rounded-lg transition ml-auto"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Role Badge */}
                {sidebarOpen && (
                    <div className="px-4 py-3 border-b border-red-500">
                        <p className="text-xs text-red-200 uppercase tracking-wider">Logged In As</p>
                        <p className="font-bold text-sm uppercase truncate">{user?.fullName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${isSuperAdmin ? 'bg-yellow-400 text-yellow-900' : 'bg-red-800 text-red-100'}`}>
                            {user?.role}
                        </span>
                    </div>
                )}

                {/* Nav Items */}
                <nav className="flex-1 py-4 space-y-1 px-2">
                    {navItems.filter(item => item.show).map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition ${isActive(item.path)
                                ? 'bg-white text-red-600'
                                : 'text-red-100 hover:bg-red-700'
                            }`}
                        >
                            {item.icon}
                            {sidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-red-500">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider text-red-100 hover:bg-red-700 transition"
                    >
                        <LogOut size={18} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
                {/* Top Nav */}
                <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                            {navItems.find(n => isActive(n.path))?.label || 'Dashboard'}
                        </h1>
                        <p className="text-xs text-gray-400 uppercase">Carpeso Admin Panel</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button
                            onClick={() => setNotifOpen(!notifOpen)}
                            className="relative p-2 rounded-full hover:bg-gray-100 transition"
                        >
                            <Bell size={20} className="text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
                        </button>
                        {/* User Avatar */}
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {user?.fullName?.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 uppercase hidden sm:block">
                                {user?.fullName?.split(' ')[0]}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-red-600 text-red-100 text-center py-3 text-xs uppercase tracking-wider">
                    © 2026 Carpeso — All Rights Reserved
                </footer>
            </div>
        </div>
    );
}

export default AdminLayout;