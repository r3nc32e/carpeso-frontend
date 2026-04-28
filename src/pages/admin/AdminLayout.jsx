import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Car, ClipboardList, Users,
    ScrollText, ShieldCheck, Menu, X, LogOut,
    Tag, Star, TrendingUp, UserCircle
} from 'lucide-react';
import NotificationDropdown from '../../components/NotificationDropdown';

function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isSuperAdmin = user?.role === 'SUPERADMIN';
    const privilege = user?.privileges?.[0] || '';

    const canAccess = (requiredPrivilege) => {
        if (isSuperAdmin) return true;
        return privilege === requiredPrivilege;
    };

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
            show: isSuperAdmin || privilege === 'INVENTORY_MANAGER',
        },
        {
            label: 'Categories',
            icon: <Tag size={18} />,
            path: '/admin/categories',
            show: isSuperAdmin || privilege === 'INVENTORY_MANAGER',
        },
        {
            label: 'Transactions',
            icon: <ClipboardList size={18} />,
            path: '/admin/transactions',
            show: isSuperAdmin || privilege === 'TRANSACTION_MANAGER',
        },
        {
            label: 'Users',
            icon: <Users size={18} />,
            path: '/admin/users',
            show: isSuperAdmin || privilege === 'ACCOUNT_MANAGER',
        },
        {
            label: 'Reviews',
            icon: <Star size={18} />,
            path: '/admin/reviews',
            show: isSuperAdmin || privilege === 'CONTENT_MODERATOR',
        },
        {
            label: 'Audit Logs',
            icon: <ScrollText size={18} />,
            path: '/admin/audit-logs',
            show: isSuperAdmin || privilege === 'SALES_ANALYST',
        },
        {
            label: 'Sales Analytics',
            icon: <TrendingUp size={18} />,
            path: '/admin/sales',
            show: isSuperAdmin || privilege === 'SALES_ANALYST',
        },
        {
            label: 'Manage Admins',
            icon: <ShieldCheck size={18} />,
            path: '/admin/manage-admins',
            show: isSuperAdmin,
        },
        {
            label: 'My Profile',
            icon: <UserCircle size={18} />,
            path: '/admin/profile',
            show: true,
        },
    ];

    const visibleNavItems = navItems.filter(item => item.show);
    const isActive = (path) => location.pathname === path;

    const handleNavClick = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SidebarContent = ({ isMobile = false }) => (
        <div className="flex flex-col h-full">
            {/* Logo Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-red-500 flex-shrink-0 min-h-[64px]">
                {(sidebarOpen || isMobile) && (
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Carpeso"
                            className="w-9 h-9 rounded-full object-cover border-2 border-white flex-shrink-0" />
                        <span className="font-bold text-white text-sm">Carpeso</span>
                    </div>
                )}
                {!isMobile && (
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(prev => !prev)}
                        className="text-white hover:bg-red-700 p-1.5 rounded-lg transition flex-shrink-0 ml-auto">
                        <Menu size={18} />
                    </button>
                )}
                {isMobile && (
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="text-white hover:bg-red-700 p-1.5 rounded-lg transition flex-shrink-0 ml-auto">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Role Badge */}
            {(sidebarOpen || isMobile) && (
                <div className="px-4 py-3 border-b border-red-500 flex-shrink-0">
                    <p className="text-xs text-red-200 uppercase tracking-wider mb-0.5">Logged in as</p>
                    <p className="font-bold text-white text-sm truncate">{user?.fullName}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold uppercase mt-1 ${isSuperAdmin ? 'bg-yellow-400 text-yellow-900' : 'bg-red-800 text-red-100'}`}>
                        {isSuperAdmin ? 'Super Admin' : privilege?.replace(/_/g, ' ') || 'Admin'}
                    </span>
                </div>
            )}

            {/* Nav Items — scrollable */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 min-h-0">
                {visibleNavItems.map(item => (
                    <button
                        key={item.path}
                        type="button"
                        onClick={() => handleNavClick(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition text-left
                            ${isActive(item.path)
                                ? 'bg-white text-red-600 shadow-sm'
                                : 'text-red-100 hover:bg-red-700 hover:text-white'
                            }`}>
                        <span className="flex-shrink-0">{item.icon}</span>
                        {(sidebarOpen || isMobile) && <span className="truncate">{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* Logout — always visible at bottom */}
            <div className="flex-shrink-0 p-3 border-t border-red-500">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-100 hover:bg-red-700 hover:text-white transition">
                    <LogOut size={18} className="flex-shrink-0" />
                    {(sidebarOpen || isMobile) && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-red-600 text-white fixed top-0 left-0 h-full z-10 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
                <SidebarContent isMobile={false} />
            </aside>

            {/* Mobile Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-red-600 text-white flex flex-col z-30 lg:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent isMobile={true} />
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
                {/* Top Nav */}
                <header className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition">
                            <Menu size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-gray-800 uppercase tracking-wide">
                                {visibleNavItems.find(n => isActive(n.path))?.label || 'Dashboard'}
                            </h1>
                            <p className="text-xs text-gray-400 uppercase hidden sm:block">Carpeso Admin Panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <NotificationDropdown variant="admin" />
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
                <footer className="bg-red-600 text-red-100 text-center py-3 text-xs uppercase tracking-wider flex-shrink-0">
                    © 2026 Carpeso — All Rights Reserved
                </footer>
            </div>
        </div>
    );
}

export default AdminLayout;