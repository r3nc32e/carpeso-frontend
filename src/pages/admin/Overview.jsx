import { useState, useEffect } from 'react';
import { Car, ClipboardList, Users, ScrollText } from 'lucide-react';
import api from '../../api/axios';

function Overview() {
    const [stats, setStats] = useState({
        vehicles: 0,
        transactions: 0,
        users: 0,
        logs: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesRes, transactionsRes, usersRes, logsRes] = await Promise.all([
                    api.get('/admin/vehicles'),
                    api.get('/admin/transactions'),
                    api.get('/admin/users'),
                    api.get('/admin/audit-logs'),
                ]);
                setStats({
                    vehicles: vehiclesRes.data.data.length,
                    transactions: transactionsRes.data.data.length,
                    users: usersRes.data.data.length,
                    logs: logsRes.data.data.length,
                });
                setRecentTransactions(transactionsRes.data.data.slice(0, 5));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        {
            label: 'Total Vehicles',
            value: stats.vehicles,
            icon: <Car size={24} />,
            color: 'bg-red-600',
        },
        {
            label: 'Total Transactions',
            value: stats.transactions,
            icon: <ClipboardList size={24} />,
            color: 'bg-gray-800',
        },
        {
            label: 'Total Buyers',
            value: stats.users,
            icon: <Users size={24} />,
            color: 'bg-red-500',
        },
        {
            label: 'Audit Logs',
            value: stats.logs,
            icon: <ScrollText size={24} />,
            color: 'bg-gray-600',
        },
    ];

    const statusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            CONFIRMED: 'bg-blue-100 text-blue-700',
            PREPARING: 'bg-purple-100 text-purple-700',
            READY: 'bg-indigo-100 text-indigo-700',
            OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
            DELIVERED: 'bg-green-100 text-green-700',
            COMPLETED: 'bg-green-200 text-green-800',
            CANCELLED: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-600';
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 uppercase tracking-wider text-sm animate-pulse">
                Loading Dashboard...
            </p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <div key={card.label} className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
                        <div className={`${card.color} text-white p-3 rounded-xl`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                    Recent Transactions
                </h2>
                {recentTransactions.length === 0 ? (
                    <p className="text-gray-400 text-sm uppercase text-center py-8">
                        No Transactions Yet
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['#', 'Buyer', 'Vehicle', 'Amount', 'Status', 'Date'].map(h => (
                                        <th key={h} className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map(t => (
                                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-3 text-gray-500 font-mono">#{t.id}</td>
                                        <td className="py-3 px-3 font-semibold text-gray-700 uppercase">
                                            {t.buyerFullName}
                                        </td>
                                        <td className="py-3 px-3 text-gray-600 uppercase">
                                            {t.vehicleBrand} {t.vehicleModel}
                                        </td>
                                        <td className="py-3 px-3 font-bold text-gray-800">
                                            ₱{t.amount?.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${statusColor(t.status)}`}>
                                                {t.status}
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