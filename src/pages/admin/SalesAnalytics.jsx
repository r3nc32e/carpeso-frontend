import { useState, useEffect } from 'react';
import { TrendingUp, Download, Car, Users, ClipboardList } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';


function SalesAnalytics() {
    usePageTitle('Sales Analytics');
    
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/transactions');
            setTransactions(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const completed = transactions.filter(t =>
        ['DELIVERED', 'COMPLETED'].includes(t.status)
    );

    const now = new Date();

    const filterByPeriod = (data) => {
        return data.filter(t => {
            const date = new Date(t.createdAt);
            if (period === 'day') {
                return date.toDateString() === now.toDateString();
            } else if (period === 'month') {
                return date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
            } else {
                return date.getFullYear() === now.getFullYear();
            }
        });
    };

    const periodData = filterByPeriod(completed);
    const totalRevenue = periodData.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalAll = completed.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // Top vehicles
    const vehicleSales = {};
    completed.forEach(t => {
        const key = `${t.vehicleBrand} ${t.vehicleModel}`;
        vehicleSales[key] = (vehicleSales[key] || 0) + Number(t.amount || 0);
    });
    const topVehicles = Object.entries(vehicleSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Monthly breakdown
    const monthlyData = {};
    completed.forEach(t => {
        const date = new Date(t.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-PH', { month: 'short', year: 'numeric' });
        if (!monthlyData[key]) monthlyData[key] = { label, total: 0, count: 0 };
        monthlyData[key].total += Number(t.amount || 0);
        monthlyData[key].count += 1;
    });
    const monthlyArr = Object.values(monthlyData).slice(-6);
    const maxMonthly = Math.max(...monthlyArr.map(m => m.total), 1);

    // Payment mode breakdown
    const paymentBreakdown = {};
    completed.forEach(t => {
        const mode = t.paymentMode?.replace(/_/g, ' ') || 'Unknown';
        paymentBreakdown[mode] = (paymentBreakdown[mode] || 0) + 1;
    });

    const handleExportPDF = async () => {
        try {
            const res = await api.get('/admin/sales/report', {
                responseType: 'blob',
                params: { period }
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `sales-report-${period}-${new Date().toLocaleDateString('en-PH').replace(/\//g, '-')}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('PDF export coming soon!');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 text-sm animate-pulse">Loading analytics...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Sales Analytics</h2>
                    <p className="text-sm text-gray-400">Track revenue and performance</p>
                </div>
                <div className="flex gap-2">
                    {/* Period Filter */}
                    {['day', 'month', 'year'].map(p => (
                        <button key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${period === p ? 'bg-red-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                            {p === 'day' ? 'Today' : p === 'month' ? 'This Month' : 'This Year'}
                        </button>
                    ))}
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-full text-xs font-bold transition"
                    >
                        <Download size={12} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: period === 'day' ? "Today's Revenue" : period === 'month' ? "This Month's Revenue" : "This Year's Revenue",
                        value: `₱${totalRevenue.toLocaleString()}`,
                        sub: `${periodData.length} orders`,
                        icon: <TrendingUp size={24} />,
                        color: 'bg-red-600',
                    },
                    {
                        label: 'Total All-Time Revenue',
                        value: `₱${totalAll.toLocaleString()}`,
                        sub: `${completed.length} completed orders`,
                        icon: <ClipboardList size={24} />,
                        color: 'bg-gray-800',
                    },
                    {
                        label: 'Average Order Value',
                        value: completed.length > 0
                            ? `₱${Math.round(totalAll / completed.length).toLocaleString()}`
                            : '₱0',
                        sub: 'Per completed order',
                        icon: <Car size={24} />,
                        color: 'bg-red-500',
                    },
                ].map(card => (
                    <div key={card.label} className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
                        <div className={`${card.color} text-white p-3 rounded-xl flex-shrink-0`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{card.label}</p>
                            <p className="text-xs text-gray-300 mt-0.5">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Bar Chart */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                        Monthly Revenue (Last 6 Months)
                    </h3>
                    {monthlyArr.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {monthlyArr.map((m, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span className="font-semibold">{m.label}</span>
                                        <span className="font-bold text-gray-800">₱{m.total.toLocaleString()} ({m.count} orders)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div
                                            className="bg-red-500 h-3 rounded-full transition-all duration-700"
                                            style={{ width: `${(m.total / maxMonthly) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Vehicles */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                        Top Selling Vehicles
                    </h3>
                    {topVehicles.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No sales yet</p>
                    ) : (
                        <div className="space-y-3">
                            {topVehicles.map(([name, revenue], i) => (
                                <div key={name} className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                                        <p className="text-xs text-gray-400">₱{revenue.toLocaleString()}</p>
                                    </div>
                                    <div className="flex-1 max-w-[120px]">
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full"
                                                style={{ width: `${(revenue / topVehicles[0][1]) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Mode Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                    Payment Mode Breakdown
                </h3>
                {Object.keys(paymentBreakdown).length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No data yet</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Object.entries(paymentBreakdown).map(([mode, count]) => (
                            <div key={mode} className="bg-gray-50 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-red-600">{count}</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">{mode}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Completed Orders */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                    Recent Completed Orders
                </h3>
                {completed.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No completed orders yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['#', 'Buyer', 'Vehicle', 'Amount', 'Payment', 'Date'].map(h => (
                                        <th key={h} className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {completed.slice(0, 10).map(t => (
                                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-3 text-gray-400 font-mono text-xs">#{t.id}</td>
                                        <td className="py-3 px-3 font-semibold text-gray-700">{t.buyerFullName}</td>
                                        <td className="py-3 px-3 text-gray-600">{t.vehicleBrand} {t.vehicleModel}</td>
                                        <td className="py-3 px-3 font-bold text-green-600">₱{Number(t.amount).toLocaleString()}</td>
                                        <td className="py-3 px-3 text-gray-500 text-xs">{t.paymentMode?.replace(/_/g, ' ')}</td>
                                        <td className="py-3 px-3 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString('en-PH')}</td>
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

export default SalesAnalytics;