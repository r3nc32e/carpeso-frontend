import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Car, ClipboardList, Users,
    ScrollText, ShieldCheck, Menu, X, LogOut, Tag
} from 'lucide-react';
import NotificationDropdown from '../../components/NotificationDropdown';

function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isSuperAdmin = user?.role === 'SUPERADMIN';
    const hasPrivilege = (priv) =>
        isSuperAdmin || user?.privileges?.includes(priv);

    const navItems = [
        { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/admin/dashboard', show: true },
        { label: 'Vehicles', icon: <Car size={18} />, path: '/admin/vehicles', show: hasPrivilege('INVENTORY_MANAGER') },
        { label: 'Categories', icon: <Tag size={18} />, path: '/admin/categories', show: hasPrivilege('INVENTORY_MANAGER') },
        { label: 'Transactions', icon: <ClipboardList size={18} />, path: '/admin/transactions', show: hasPrivilege('TRANSACTION_MANAGER') },
        { label: 'Users', icon: <Users size={18} />, path: '/admin/users', show: hasPrivilege('ACCOUNT_MANAGER') },
        { label: 'Audit Logs', icon: <ScrollText size={18} />, path: '/admin/audit-logs', show: hasPrivilege('SALES_ANALYST') || isSuperAdmin },
        { label: 'Manage Admins', icon: <ShieldCheck size={18} />, path: '/admin/manage-admins', show: isSuperAdmin },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar — Desktop */}
            <div className={`
                hidden lg:flex flex-col
                ${sidebarOpen ? 'w-64' : 'w-16'}
                bg-red-600 text-white
                transition-all duration-300
                min-h-screen fixed z-10
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-red-500 min-h-[64px]">
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

                {/* Nav */}
                <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
                    {navItems.filter(i => i.show).map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            title={!sidebarOpen ? item.label : ''}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                                isActive(item.path)
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
                        title={!sidebarOpen ? 'Logout' : ''}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-100 hover:bg-red-700 transition"
                    >
                        <LogOut size={18} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`
                fixed top-0 left-0 h-full w-64 bg-red-600 text-white
                flex flex-col z-30 lg:hidden
                transition-transform duration-300
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between p-4 border-b border-red-500">
                    <img src="/logo.png" alt="Carpeso"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white" />
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="text-white hover:bg-red-700 p-1.5 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-4 py-3 border-b border-red-500">
                    <p className="text-xs text-red-200 uppercase tracking-wider">Logged In As</p>
                    <p className="font-bold text-sm uppercase truncate">{user?.fullName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${isSuperAdmin ? 'bg-yellow-400 text-yellow-900' : 'bg-red-800 text-red-100'}`}>
                        {user?.role}
                    </span>
                </div>

                <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
                    {navItems.filter(i => i.show).map(item => (
                        <button
                            key={item.path}
                            onClick={() => { navigate(item.path); setMobileOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                                isActive(item.path)
                                    ? 'bg-white text-red-600'
                                    : 'text-red-100 hover:bg-red-700'
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-red-500">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-100 hover:bg-red-700 transition"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`
                flex-1 flex flex-col min-w-0
                transition-all duration-300
                ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}
            `}>
                {/* Top Nav */}
                <header className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Menu size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-gray-800 uppercase tracking-wide">
                                {navItems.find(n => isActive(n.path))?.label || 'Dashboard'}
                            </h1>
                            <p className="text-xs text-gray-400 uppercase hidden sm:block">
                                Carpeso Admin Panel
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <NotificationDropdown />
                        <div className="flex items-center gap-2 bg-gray-100 px-2 sm:px-3 py-1.5 rounded-full">
                            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {user?.fullName?.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 uppercase hidden sm:block truncate max-w-[100px]">
                                {user?.fullName?.split(' ')[0]}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
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