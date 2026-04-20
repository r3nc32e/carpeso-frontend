import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import api from '../api/axios';

function NotificationDropdown({ variant = 'admin' }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/notifications/unread-count'),
            ]);
            setNotifications(notifRes.data.data || []);
            setUnreadCount(countRes.data.data || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            await api.put('/notifications/read-all');
            fetchNotifications();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const notifIcon = (type) => ({
        RESERVATION: '🚗',
        ORDER_UPDATE: '📦',
        WARRANTY_CLAIM: '🛡️',
        REVIEW: '⭐',
        SYSTEM: '🔔',
    }[type] || '🔔');

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (mins > 0) return `${mins}m ago`;
        return 'Just now';
    };

    // Admin = gray bg bell, Buyer = red bg bell
    const bellBtnClass = variant === 'admin'
        ? 'relative p-2 rounded-full hover:bg-gray-100 transition'
        : 'relative p-2 rounded-full hover:bg-red-700 transition';

    const bellIconClass = variant === 'admin'
        ? 'text-gray-600'
        : 'text-red-100';

    const badgeClass = variant === 'admin'
        ? 'absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center'
        : 'absolute -top-0.5 -right-0.5 w-5 h-5 bg-white text-red-600 rounded-full text-xs font-bold flex items-center justify-center';

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setOpen(!open)} className={bellBtnClass}>
                <Bell size={18} className={bellIconClass} />
                {unreadCount > 0 && (
                    <span className={badgeClass}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-red-600" />
                            <span className="font-bold text-gray-800 text-sm">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"
                                >
                                    <CheckCheck size={12} /> Mark all read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)}
                                className="p-1 hover:bg-gray-200 rounded-lg transition">
                                <X size={14} className="text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-10">
                                <Bell size={32} className="mx-auto mb-2 text-gray-200" />
                                <p className="text-gray-400 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.read && markAsRead(n.id)}
                                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 cursor-pointer ${!n.read ? 'bg-red-50' : ''}`}
                                >
                                    <span className="text-xl flex-shrink-0 mt-0.5">
                                        {notifIcon(n.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm font-semibold truncate ${!n.read ? 'text-red-700' : 'text-gray-800'}`}>
                                                {n.title}
                                            </p>
                                            {!n.read && (
                                                <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-1" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                            <p className="text-xs text-gray-400">{notifications.length} total notifications</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationDropdown;