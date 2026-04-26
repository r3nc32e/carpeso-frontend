import { useState, useEffect } from 'react';
import { Car, ClipboardList, Users, ScrollText, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';


const IMG_BASE = 'http://localhost:8080/api/files';

function Overview() {
    usePageTitle('Dashboard');
    
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        vehicles: 0, transactions: 0,
        users: 0, logs: 0,
        totalSales: 0, pendingOrders: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [vRes, tRes, uRes, lRes] = await Promise.all([
                api.get('/admin/vehicles'),
                api.get('/admin/transactions'),
                api.get('/admin/users'),
                api.get('/admin/audit-logs'),
            ]);

            const transactions = tRes.data.data || [];
            const totalSales = transactions
                .filter(t => ['DELIVERED', 'COMPLETED'].includes(t.status))
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const pendingOrders = transactions
                .filter(t => t.status === 'PENDING').length;

            setStats({
                vehicles: vRes.data.data?.length || 0,
                transactions: transactions.length,
                users: uRes.data.data?.length || 0,
                logs: lRes.data.data?.length || 0,
                totalSales,
                pendingOrders,
            });
            setRecentTransactions(transactions.slice(0, 5));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Vehicles', value: stats.vehicles, icon: <Car size={24} />, color: 'bg-red-600', path: '/admin/vehicles' },
        { label: 'Total Transactions', value: stats.transactions, icon: <ClipboardList size={24} />, color: 'bg-gray-800', path: '/admin/transactions' },
        { label: 'Total Buyers', value: stats.users, icon: <Users size={24} />, color: 'bg-red-500', path: '/admin/users' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: <ScrollText size={24} />, color: 'bg-yellow-500', path: '/admin/transactions' },
    ];

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

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 text-sm animate-pulse">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Total Sales Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-red-200 text-sm uppercase tracking-wider">Total Sales Revenue</p>
                        <p className="text-4xl font-bold mt-1">₱{stats.totalSales.toLocaleString()}</p>
                        <p className="text-red-200 text-xs mt-1">From delivered & completed orders</p>
                    </div>
                    <TrendingUp size={48} className="text-red-300" />
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <button key={card.label}
                        onClick={() => navigate(card.path)}
                        className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition text-left w-full"
                    >
                        <div className={`${card.color} text-white p-3 rounded-xl`}>{card.icon}</div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{card.label}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Recent Transactions
                    </h2>
                    <button onClick={() => navigate('/admin/transactions')}
                        className="text-red-600 text-xs font-semibold flex items-center gap-1 hover:underline">
                        View All <ArrowRight size={12} />
                    </button>
                </div>
                {recentTransactions.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No transactions yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['#', 'Buyer', 'Vehicle', 'Amount', 'Status', 'Date'].map(h => (
                                        <th key={h} className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map(t => (
                                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-3 text-gray-400 font-mono text-xs">#{t.id}</td>
                                        <td className="py-3 px-3 font-semibold text-gray-700">{t.buyerFullName}</td>
                                        <td className="py-3 px-3 text-gray-600">{t.vehicleBrand} {t.vehicleModel}</td>
                                        <td className="py-3 px-3 font-bold text-gray-800">₱{Number(t.amount).toLocaleString()}</td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(t.status)}`}>
                                                {t.status?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-gray-400 text-xs">
                                            {new Date(t.createdAt).toLocaleDateString('en-PH')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Overview;