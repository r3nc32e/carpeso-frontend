import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Users, ClipboardList, TrendingUp, Star, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

function Overview() {
    usePageTitle('Dashboard');
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const isSuperAdmin = user?.role === 'SUPERADMIN';
    const privilege = user?.privileges?.[0] || '';

    const canAccess = (requiredPrivilege) => {
        if (isSuperAdmin) return true;
        return privilege === requiredPrivilege;
    };

    useEffect(() => {
        fetchOverview();
        if (canAccess('TRANSACTION_MANAGER')) {
            fetchRecentTransactions();
        }
    }, []);

    const fetchOverview = async () => {
        try {
            const res = await api.get('/admin/overview');
            setStats(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentTransactions = async () => {
        try {
            const res = await api.get('/admin/transactions');
            setRecentTransactions((res.data.data || []).slice(0, 5));
        } catch (err) {
            console.error(err);
        }
    };

    const statusColor = (status) => ({
        PENDING: 'bg-yellow-100 text-yellow-700',
        CONFIRMED: 'bg-blue-100 text-blue-700',
        PREPARING: 'bg-purple-100 text-purple-700',
        READY: 'bg-indigo-100 text-indigo-700',
        OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
        DELIVERED: 'bg-green-100 text-green-700',
        COMPLETED: 'bg-green-200 text-green-800',
        CANCELLED: 'bg-red-100 text-red-700',
    }[status] || 'bg-gray-100 text-gray-600');

    // All possible stat cards
    const allCards = [
        {
            label: 'Total Vehicles',
            value: stats?.totalVehicles ?? '—',
            sub: `${stats?.availableVehicles ?? 0} available`,
            icon: <Car size={24} />,
            color: 'bg-blue-500',
            path: '/admin/vehicles',
            privilege: 'INVENTORY_MANAGER',
        },
        {
            label: 'Total Transactions',
            value: stats?.totalTransactions ?? '—',
            sub: `${stats?.pendingTransactions ?? 0} pending`,
            icon: <ClipboardList size={24} />,
            color: 'bg-purple-500',
            path: '/admin/transactions',
            privilege: 'TRANSACTION_MANAGER',
        },
        {
            label: 'Total Buyers',
            value: stats?.totalBuyers ?? '—',
            sub: `${stats?.activeBuyers ?? 0} active`,
            icon: <Users size={24} />,
            color: 'bg-green-500',
            path: '/admin/users',
            privilege: 'ACCOUNT_MANAGER',
        },
        {
            label: 'Total Revenue',
            value: stats?.totalRevenue
                ? `₱${Number(stats.totalRevenue).toLocaleString()}`
                : '₱0',
            sub: 'Completed orders',
            icon: <TrendingUp size={24} />,
            color: 'bg-red-500',
            path: '/admin/sales',
            privilege: 'SALES_ANALYST',
        },
        {
            label: 'Total Reviews',
            value: stats?.totalReviews ?? '—',
            sub: `Avg: ${stats?.averageRating?.toFixed(1) ?? '—'} ⭐`,
            icon: <Star size={24} />,
            color: 'bg-yellow-500',
            path: '/admin/reviews',
            privilege: 'CONTENT_MODERATOR',
        },
        {
            label: 'Warnings Issued',
            value: stats?.totalWarnings ?? '—',
            sub: `${stats?.suspendedUsers ?? 0} suspended`,
            icon: <AlertCircle size={24} />,
            color: 'bg-orange-500',
            path: '/admin/users',
            privilege: 'ACCOUNT_MANAGER',
        },
    ];

    // Filter cards based on privilege
    const visibleCards = allCards.filter(card => canAccess(card.privilege));

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-1">
                    Welcome back, {user?.fullName?.split(' ')[0]}! 👋
                </h2>
                <p className="text-red-100 text-sm">
                    {isSuperAdmin
                        ? 'You have full access to all Carpeso systems.'
                        : `Your role: ${privilege?.replace(/_/g, ' ')}`}
                </p>
            </div>

            {/* Stats Cards */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                            <div className="h-8 bg-gray-200 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleCards.map(card => (
                        <div key={card.label}
                            onClick={() => navigate(card.path)}
                            className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition`}>
                                    {card.icon}
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                            <p className="text-sm font-semibold text-gray-500 mt-0.5">{card.label}</p>
                            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Total Sales Banner — SuperAdmin or SALES_ANALYST only */}
            {canAccess('SALES_ANALYST') && stats?.totalRevenue && (
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
                    <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Total Sales Revenue</p>
                    <p className="text-4xl font-bold">
                        ₱{Number(stats.totalRevenue).toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                        From {stats?.completedTransactions ?? 0} completed transactions
                    </p>
                </div>
            )}

            {/* Recent Transactions — TRANSACTION_MANAGER or SuperAdmin */}
            {canAccess('TRANSACTION_MANAGER') && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                        <button onClick={() => navigate('/admin/transactions')}
                            className="text-red-600 text-sm font-semibold hover:underline">
                            View All →
                        </button>
                    </div>
                    {recentTransactions.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">No transactions yet</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['#', 'Buyer', 'Vehicle', 'Amount', 'Status', 'Date'].map(h => (
                                            <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map(t => (
                                        <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                            <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{t.id}</td>
                                            <td className="py-3 px-4 font-semibold text-gray-800 text-xs">{t.buyerFullName}</td>
                                            <td className="py-3 px-4 text-gray-600 text-xs">{t.vehicleBrand} {t.vehicleModel}</td>
                                            <td className="py-3 px-4 font-bold text-gray-800 text-xs">₱{Number(t.amount).toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(t.status)}`}>
                                                    {t.status?.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-400 text-xs">
                                                {new Date(t.createdAt).toLocaleDateString('en-PH')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Privilege info for non-superadmin */}
            {!isSuperAdmin && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <p className="text-sm text-blue-700 font-semibold mb-1">
                        🔒 Your Access Level: {privilege?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-blue-500">
                        You can only access pages and data assigned to your role.
                        Contact the SuperAdmin to request additional access.
                    </p>
                </div>
            )}
        </div>
    );
}

export default Overview;