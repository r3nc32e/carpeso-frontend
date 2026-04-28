import { useState, useEffect } from 'react';
import { Eye, X, Check } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

const STATUSES = [
    'PENDING', 'CONFIRMED', 'PREPARING', 'READY',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED',
];

const NEXT_STATUS = {
    PENDING: 'CONFIRMED',
    CONFIRMED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'OUT_FOR_DELIVERY',
    OUT_FOR_DELIVERY: 'DELIVERED',
    DELIVERED: 'COMPLETED',
};

function Transactions() {
    usePageTitle('Transactions');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [activeInfoTab, setActiveInfoTab] = useState('order');

    useEffect(() => { fetchTransactions(); }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/admin/transactions');
            setTransactions(res.data.data || []);
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
        setActiveInfoTab('order');
    };

    const handleUpdateStatus = async () => {
        if (!newStatus || newStatus === selected.status) {
            setError('Please select a new status!');
            return;
        }
        try {
            await api.put(
                `/admin/transactions/${selected.id}/status?status=${newStatus}${adminNotes ? `&notes=${encodeURIComponent(adminNotes)}` : ''}`
            );
            setSuccess('Status updated successfully!');
            setShowModal(false);
            fetchTransactions();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update!');
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
        EXPIRED: 'bg-gray-100 text-gray-500',
    }[status] || 'bg-gray-100 text-gray-600');

    const filtered = filter === 'ALL'
        ? transactions
        : transactions.filter(t => t.status === filter);

    const isFinal = (status) =>
        ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(status);

    return (
        <div className="space-y-4">
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
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === s ? 'bg-red-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
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
                                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Loading transactions...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No transactions found</td></tr>
                            ) : (
                                filtered.map(t => (
                                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{t.id}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-gray-800">{t.buyerFullName}</p>
                                            <p className="text-xs text-gray-400">{t.buyerEmail}</p>
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
                                            <button onClick={() => openModal(t)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
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
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    Transaction #{selected.id}
                                </h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusColor(selected.status)}`}>
                                    {selected.status?.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Info Tabs */}
                        <div className="flex gap-1 p-3 border-b border-gray-100 bg-gray-50">
                            {[
                                { id: 'order', label: '📦 Order Info' },
                                { id: 'buyer', label: '👤 Buyer Info' },
                                { id: 'delivery', label: '🚚 Delivery' },
                            ].map(tab => (
                                <button key={tab.id}
                                    onClick={() => setActiveInfoTab(tab.id)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${activeInfoTab === tab.id ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:bg-white'}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Order Info Tab */}
                            {activeInfoTab === 'order' && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase">Vehicle & Transaction Details</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Vehicle', value: `${selected.vehicleBrand} ${selected.vehicleModel}` },
                                            { label: 'Year', value: selected.vehicleYear || '—' },
                                            { label: 'Color', value: selected.vehicleColor || '—' },
                                            { label: 'Amount', value: `₱${Number(selected.amount).toLocaleString()}` },
                                            { label: 'Payment Mode', value: selected.paymentMode?.replace(/_/g, ' ') || '—' },
                                            { label: 'Order Date', value: selected.createdAt ? new Date(selected.createdAt).toLocaleString('en-PH') : '—' },
                                            { label: 'Expires At', value: selected.expiresAt ? new Date(selected.expiresAt).toLocaleString('en-PH') : '—' },
                                            { label: 'Receipt No.', value: selected.receiptNumber || 'Not yet generated' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
                                                <p className="text-sm text-gray-800 font-semibold mt-0.5">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Warranty */}
                                    {selected.warrantyStartDate && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                                            <p className="text-xs font-bold text-green-600 uppercase mb-1">Warranty Period</p>
                                            <p className="text-sm text-green-700">
                                                {new Date(selected.warrantyStartDate).toLocaleDateString('en-PH')} —{' '}
                                                {selected.warrantyEndDate ? new Date(selected.warrantyEndDate).toLocaleDateString('en-PH') : 'N/A'}
                                            </p>
                                        </div>
                                    )}

                                    {selected.adminNotes && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                            <p className="text-xs font-bold text-blue-600 uppercase mb-1">Admin Notes</p>
                                            <p className="text-sm text-blue-700">{selected.adminNotes}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Buyer Info Tab */}
                            {activeInfoTab === 'buyer' && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase">Buyer Information</h4>

                                    {/* Buyer Avatar */}
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                            {selected.buyerFullName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{selected.buyerFullName || '—'}</p>
                                            <p className="text-xs text-gray-500">{selected.buyerEmail || '—'}</p>
                                            <p className="text-xs text-gray-500">{selected.buyerPhone || 'No phone'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Full Name', value: selected.buyerFullName || '—' },
                                            { label: 'Email', value: selected.buyerEmail || '—' },
                                            { label: 'Phone', value: selected.buyerPhone || '—' },
                                            { label: 'City', value: selected.buyerCityName || '—' },
                                            { label: 'Barangay', value: selected.buyerBarangayName || '—' },
                                            { label: 'Street', value: selected.buyerStreetNo || '—' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
                                                <p className="text-sm text-gray-800 font-semibold mt-0.5 break-all">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ID Documents — Mock */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <p className="text-xs font-bold text-amber-600 uppercase mb-2">ID Documents</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">📄</span>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700">Primary ID — Driver's License</p>
                                                    <p className="text-xs text-gray-400">Submitted during registration (Demo)</p>
                                                </div>
                                                <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded font-bold">Submitted</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">📄</span>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700">Secondary ID — PhilSys / TIN</p>
                                                    <p className="text-xs text-gray-400">Submitted during registration (Demo)</p>
                                                </div>
                                                <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded font-bold">Submitted</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Delivery Info Tab */}
                            {activeInfoTab === 'delivery' && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase">Delivery Information</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-400 font-semibold uppercase">Delivery Address</p>
                                            <p className="text-sm text-gray-800 font-semibold mt-1">
                                                {selected.deliveryAddress || '—'}
                                            </p>
                                        </div>
                                        {selected.deliveryNotes && (
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase">Delivery Notes</p>
                                                <p className="text-sm text-gray-600 mt-1">{selected.deliveryNotes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Progress */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-3">Order Progress</p>
                                        <div className="space-y-2">
                                            {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].map((step, i) => {
                                                const steps = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'];
                                                const currentIdx = steps.indexOf(selected.status);
                                                const stepIdx = steps.indexOf(step);
                                                return (
                                                    <div key={step} className="flex items-center gap-3">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${stepIdx < currentIdx ? 'bg-green-500 text-white' : stepIdx === currentIdx ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                            {stepIdx < currentIdx ? '✓' : i + 1}
                                                        </div>
                                                        <span className={`text-xs font-semibold ${stepIdx <= currentIdx ? 'text-gray-800' : 'text-gray-300'}`}>
                                                            {step.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Update */}
                            {!isFinal(selected.status) && (
                                <div className="border-t border-gray-100 pt-4 space-y-3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">
                                        Update Status
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {NEXT_STATUS[selected.status] && (
                                            <button
                                                onClick={() => setNewStatus(NEXT_STATUS[selected.status])}
                                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${newStatus === NEXT_STATUS[selected.status] ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                                → {NEXT_STATUS[selected.status].replace(/_/g, ' ')}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setNewStatus('CANCELLED')}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${newStatus === 'CANCELLED' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                                            ✕ Cancel Order
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Current: <strong>{selected.status.replace(/_/g, ' ')}</strong>
                                        {newStatus && newStatus !== selected.status && (
                                            <span className="text-green-600 ml-2">→ {newStatus.replace(/_/g, ' ')}</span>
                                        )}
                                    </p>

                                    {/* Admin Notes */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                            Admin Notes
                                        </label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={e => setAdminNotes(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                            rows={2}
                                            placeholder="Add notes for this transaction..." />
                                    </div>
                                </div>
                            )}

                            {isFinal(selected.status) && (
                                <div className={`px-4 py-3 rounded-xl text-sm font-semibold text-center ${selected.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : selected.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                                    {selected.status === 'COMPLETED' ? '✅ Order Completed' :
                                     selected.status === 'CANCELLED' ? '❌ Order Cancelled' :
                                     '⏰ Order Expired'}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Close
                            </button>
                            {!isFinal(selected.status) && (
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={!newStatus || newStatus === selected.status}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                    Update Status
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transactions;