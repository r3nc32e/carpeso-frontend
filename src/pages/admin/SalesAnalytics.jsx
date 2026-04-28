import { useState, useEffect } from 'react';
import { TrendingUp, Download } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

function SalesAnalytics() {
    usePageTitle('Sales Analytics');
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, txRes] = await Promise.all([
                api.get('/admin/sales/stats'),
                api.get('/admin/transactions'),
            ]);
            setStats(statsRes.data.data);
            setTransactions(txRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `http://localhost:8080/api/admin/sales/report?period=${period}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error('Export failed!');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `carpeso-sales-report-${period}-${new Date().getFullYear()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Failed to export PDF: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    // Monthly chart data
    const getMonthlyData = () => {
        const months = ['Jan','Feb','Mar','Apr','May','Jun',
                        'Jul','Aug','Sep','Oct','Nov','Dec'];
        const data = months.map((month, i) => {
            const monthTx = transactions.filter(t => {
                const d = new Date(t.createdAt);
                return d.getMonth() === i &&
                    d.getFullYear() === new Date().getFullYear() &&
                    ['DELIVERED', 'COMPLETED'].includes(t.status);
            });
            const revenue = monthTx.reduce((sum, t) =>
                sum + (Number(t.amount) || 0), 0);
            return { month, revenue, count: monthTx.length };
        });
        return data;
    };

    // Top vehicles
    const getTopVehicles = () => {
        const map = {};
        transactions
            .filter(t => ['DELIVERED', 'COMPLETED'].includes(t.status))
            .forEach(t => {
                const key = `${t.vehicleBrand} ${t.vehicleModel}`;
                if (!map[key]) map[key] = { name: key, count: 0, revenue: 0 };
                map[key].count++;
                map[key].revenue += Number(t.amount) || 0;
            });
        return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
    };

    // Payment breakdown
    const getPaymentBreakdown = () => {
        const map = {};
        transactions.forEach(t => {
            const p = t.paymentMode?.replace(/_/g, ' ') || 'Unknown';
            map[p] = (map[p] || 0) + 1;
        });
        return Object.entries(map).map(([mode, count]) => ({ mode, count }));
    };

    const COLORS = ['#DC2626', '#2563EB', '#7C3AED', '#059669', '#D97706', '#DB2777'];
    const monthlyData = getMonthlyData();
    const topVehicles = getTopVehicles();
    const paymentBreakdown = getPaymentBreakdown();

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 animate-pulse">Loading analytics...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Sales Analytics</h2>
                    <p className="text-sm text-gray-400">Revenue and performance overview</p>
                </div>
                <div className="flex items-center gap-2">
                    <select value={period} onChange={e => setPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="day">Today</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                    <button onClick={handleExportPDF} disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60">
                        <Download size={16} />
                        {exporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₱${Number(stats?.totalRevenue || 0).toLocaleString()}`, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Total Orders', value: stats?.totalTransactions || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Completed', value: stats?.completedTransactions || 0, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pending', value: stats?.pendingTransactions || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                ].map(card => (
                    <div key={card.label} className={`${card.bg} rounded-2xl p-5`}>
                        <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        <p className="text-sm text-gray-500 font-semibold mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">Monthly Revenue ({new Date().getFullYear()})</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }}
                            tickFormatter={v => v >= 1000 ? `₱${(v/1000).toFixed(0)}k` : `₱${v}`} />
                        <Tooltip
                            formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Revenue']}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                            {monthlyData.map((_, i) => (
                                <Cell key={i} fill={i === new Date().getMonth() ? '#DC2626' : '#FECACA'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Vehicles */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Top Selling Vehicles</h3>
                    {topVehicles.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No completed sales yet</p>
                    ) : (
                        <div className="space-y-3">
                            {topVehicles.map((v, i) => (
                                <div key={v.name} className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800">{v.name}</p>
                                        <p className="text-xs text-gray-400">{v.count} sold</p>
                                    </div>
                                    <p className="text-sm font-bold text-red-600">
                                        ₱{Number(v.revenue).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Payment Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Payment Methods</h3>
                    {paymentBreakdown.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No transactions yet</p>
                    ) : (
                        <div className="space-y-3">
                            {paymentBreakdown.map((p, i) => {
                                const total = paymentBreakdown.reduce((s, x) => s + x.count, 0);
                                const pct = Math.round((p.count / total) * 100);
                                return (
                                    <div key={p.mode}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-gray-700">{p.mode}</span>
                                            <span className="text-xs text-gray-400">{p.count} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SalesAnalytics;