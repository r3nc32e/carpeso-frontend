import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Car, ClipboardList,
    ShieldCheck, Star, LogOut, Menu, X
} from 'lucide-react';
import NotificationDropdown from '../../components/NotificationDropdown';

function BuyerLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/buyer/dashboard' },
        { label: 'Browse Vehicles', icon: <Car size={16} />, path: '/buyer/catalog' },
        { label: 'My Orders', icon: <ClipboardList size={16} />, path: '/buyer/orders' },
        { label: 'Warranty Claims', icon: <ShieldCheck size={16} />, path: '/buyer/warranty-claims' },
        { label: 'My Reviews', icon: <Star size={16} />, path: '/buyer/reviews' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Top Nav */}
            <header className="bg-red-600 text-white fixed top-0 left-0 right-0 z-30 shadow-lg">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo + Desktop Nav */}
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Carpeso"
                            className="w-9 h-9 rounded-full object-cover border-2 border-white flex-shrink-0" />
                        <nav className="hidden md:flex items-center gap-1 ml-2">
                            {navItems.map(item => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
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
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        <NotificationDropdown />

                        <div className="hidden sm:flex items-center gap-2 bg-red-700 px-3 py-1.5 rounded-full">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-red-600 text-xs font-bold">
                                {user?.fullName?.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-red-100 max-w-[100px] truncate">
                                {user?.fullName?.split(' ')[0]}
                            </span>
                        </div>

                        <button
                            onClick={logout}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white text-red-600 rounded-full text-xs font-bold hover:bg-red-50 transition"
                        >
                            <LogOut size={14} />
                            Logout
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-red-700 transition"
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-red-500 px-4 py-3 space-y-1">
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setMobileOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                                    isActive(item.path)
                                        ? 'bg-white text-red-600'
                                        : 'text-red-100 hover:bg-red-700'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-100 hover:bg-red-700 transition"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Page Content */}
            <main className="flex-1 mt-16 p-4 sm:p-6 overflow-x-hidden">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-red-600 text-red-100 text-center py-3 text-xs uppercase tracking-wider">
                © 2026 Carpeso — All Rights Reserved
            </footer>
        </div>
    );
}

export default BuyerLayout;