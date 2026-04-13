import { useState, useEffect } from 'react';
import { Eye, X, Check } from 'lucide-react';
import api from '../../api/axios';

const STATUSES = [
    'PENDING', 'CONFIRMED', 'PREPARING', 'READY',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'
];

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/admin/transactions');
            setTransactions(res.data.data);
        } catch (err) {
            setError('Failed to fetch transactions!');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (t) => {
        setSelected(t);
        setNewStatus(t.status);
        setAdminNotes(t.adminNotes || '');
        setShowModal(true);
        setError('');
    };

    const handleUpdateStatus = async () => {
        try {
            await api.put(`/admin/transactions/${selected.id}/status?status=${newStatus}${adminNotes ? `&notes=${adminNotes}` : ''}`);
            setSuccess('Status updated successfully!');
            setShowModal(false);
            fetchTransactions();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status!');
        }
    };

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
            EXPIRED: 'bg-gray-100 text-gray-500',
        };
        return colors[status] || 'bg-gray-100 text-gray-600';
    };

    const filtered = filter === 'ALL'
        ? transactions
        : transactions.filter(t => t.status === filter);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Transactions</h2>
                    <p className="text-sm text-gray-400">{transactions.length} total transactions</p>
                </div>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {['ALL', ...STATUSES].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === s ? 'bg-red-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                    >
                        {s.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['#', 'Buyer', 'Vehicle', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(t => (
                                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{t.id}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-gray-800">{t.buyerFullName}</p>
                                            <p className="text-xs text-gray-400">{t.buyerPhone}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-gray-700">{t.vehicleBrand} {t.vehicleModel}</p>
                                            <p className="text-xs text-gray-400">{t.vehicleYear} • {t.vehicleColor}</p>
                                        </td>
                                        <td className="py-3 px-4 font-bold text-gray-800">
                                            ₱{Number(t.amount).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-xs">
                                            {t.paymentMode?.replace(/_/g, ' ') || '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(t.status)}`}>
                                                {t.status?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-xs">
                                            {new Date(t.createdAt).toLocaleDateString('en-PH')}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => openModal(t)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && selected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-lg font-bold text-gray-800">Transaction #{selected.id}</h3>
                            <button onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Buyer', value: selected.buyerFullName },
                                    { label: 'Email', value: selected.buyerEmail },
                                    { label: 'Phone', value: selected.buyerPhone },
                                    { label: 'Vehicle', value: `${selected.vehicleBrand} ${selected.vehicleModel}` },
                                    { label: 'Year', value: selected.vehicleYear },
                                    { label: 'Color', value: selected.vehicleColor },
                                    { label: 'Amount', value: `₱${Number(selected.amount).toLocaleString()}` },
                                    { label: 'Payment', value: selected.paymentMode?.replace(/_/g, ' ') || '—' },
                                    { label: 'Delivery Address', value: selected.deliveryAddress },
                                    { label: 'Expires At', value: selected.expiresAt ? new Date(selected.expiresAt).toLocaleString('en-PH') : '—' },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
                                        <p className="text-sm text-gray-800 font-medium">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-gray-100" />

                            {/* Update Status */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                    Update Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                >
                                    {STATUSES.map(s => (
                                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                    Admin Notes
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    rows={3}
                                    placeholder="Add notes for this transaction..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleUpdateStatus}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transactions;