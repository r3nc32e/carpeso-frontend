import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Car, ClipboardList,
    ShieldCheck, LogOut, Menu, UserCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import NotificationDropdown from '../../components/NotificationDropdown';

function BuyerLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard',      icon: <LayoutDashboard size={17} />, path: '/buyer/dashboard' },
        { label: 'Browse Vehicles',icon: <Car size={17} />,             path: '/buyer/catalog' },
        { label: 'My Orders',      icon: <ClipboardList size={17} />,   path: '/buyer/orders' },
        { label: 'Warranty Claims',icon: <ShieldCheck size={17} />,     path: '/buyer/warranty-claims' },
        { label: 'My Profile',     icon: <UserCircle size={17} />,      path: '/buyer/profile' },
    ];

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowLogoutConfirm(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            {/* ── Logout Confirm ──────────────────────────────────────────────── */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogOut size={28} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Logout</h3>
                        <p className="text-gray-500 text-sm mb-6">Are you sure you want to logout from Carpeso?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleLogout}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Mobile Nav Overlay ───────────────────────────────────────────── */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setMobileOpen(false)} />
            )}

            {/* ── Top Header ──────────────────────────────────────────────────── */}
            <header className="bg-red-600 text-white fixed top-0 left-0 right-0 z-30 shadow-lg">
                <div className="w-full px-4 py-0 flex items-center justify-between h-14">

                    {/* Left: Logo */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button type="button" onClick={() => setMobileOpen(v => !v)}
                            className="md:hidden p-2 hover:bg-red-700 rounded-lg transition">
                            <Menu size={20} />
                        </button>
                        <img src="/logo.png" alt="Carpeso"
                            className="w-8 h-8 rounded-full object-cover border-2 border-white flex-shrink-0" />
                        <span className="font-bold text-base hidden sm:block">Carpeso</span>
                    </div>

                    {/* Center: Desktop nav — scrollable if too many items */}
                    <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto flex-1 justify-center px-4 scrollbar-none">
                        {navItems.map(item => (
                            <button key={item.path} type="button"
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap flex-shrink-0 ${
                                    isActive(item.path)
                                        ? 'bg-white text-red-600'
                                        : 'text-red-100 hover:bg-red-700'
                                }`}>
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Right: Notifications + Logout */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <NotificationDropdown variant="buyer" />
                        <button type="button" onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-700 hover:bg-red-800 rounded-lg transition text-xs font-semibold">
                            <LogOut size={15} />
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>

                {/* ── Mobile Slide-down Menu ──────────────────────────────────── */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-red-500 bg-red-600">
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map(item => (
                                <button key={item.path} type="button"
                                    onClick={() => { navigate(item.path); setMobileOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition text-left ${
                                        isActive(item.path)
                                            ? 'bg-white text-red-600'
                                            : 'text-red-100 hover:bg-red-700'
                                    }`}>
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                            <button type="button" onClick={() => { setShowLogoutConfirm(true); setMobileOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-100 hover:bg-red-700 transition">
                                <LogOut size={17} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* ── Main Content ─────────────────────────────────────────────────── */}
            {/* pt-14 = height of the fixed header */}
            <main className="pt-14 flex-1 w-full">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                    {children}
                </div>
            </main>

            <footer className="bg-red-600 text-red-100 text-center py-3 text-xs uppercase tracking-wider flex-shrink-0">
                © 2026 Carpeso — All Rights Reserved
            </footer>
        </div>
    );
}

export default BuyerLayout;