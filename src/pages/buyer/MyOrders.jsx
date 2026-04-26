import { useState, useEffect } from 'react';
import { Car, X } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

function MyOrders() {
    usePageTitle('My Orders');
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [cancelling, setCancelling] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/buyer/orders');
            setOrders(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
        setCancelling(true);
        try {
            await api.put(`/buyer/orders/${selected.id}/cancel`);
            setSuccess('Reservation cancelled successfully!');
            setShowModal(false);
            fetchOrders();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel!');
        } finally {
            setCancelling(false);
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

    const ORDER_STEPS = [
        'PENDING', 'CONFIRMED', 'PREPARING',
        'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'
    ];

    const getStepIndex = (status) => ORDER_STEPS.indexOf(status);

    const filtered = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800">My Orders</h2>
                <p className="text-sm text-gray-400">{orders.length} total orders</p>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                    ✅ {success}
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY',
                  'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === s ? 'bg-red-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                        {s.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading orders...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <Car size={48} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400">No orders found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(o => (
                        <div key={o.id}
                            className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition cursor-pointer"
                            onClick={() => { setSelected(o); setShowModal(true); }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 rounded-xl p-3">
                                        <Car size={24} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">
                                            {o.vehicleBrand} {o.vehicleModel}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {o.vehicleYear} • {o.vehicleColor} • Order #{o.id}
                                        </p>
                                        <p className="text-red-600 font-bold text-sm mt-1">
                                            ₱{Number(o.amount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(o.status)}`}>
                                        {o.status?.replace(/_/g, ' ')}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(o.createdAt).toLocaleDateString('en-PH')}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {!['CANCELLED', 'EXPIRED'].includes(o.status) && (
                                <div className="mt-4">
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.max(5, ((getStepIndex(o.status) + 1) / ORDER_STEPS.length) * 100)}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-gray-400">Pending</span>
                                        <span className="text-xs text-gray-400">Completed</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            {showModal && selected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-lg font-bold text-gray-800">Order #{selected.id}</h3>
                            <button onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Status Badge */}
                            <div className="flex justify-center">
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColor(selected.status)}`}>
                                    {selected.status?.replace(/_/g, ' ')}
                                </span>
                            </div>

                            {/* Progress Steps */}
                            {!['CANCELLED', 'EXPIRED'].includes(selected.status) && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Order Progress</p>
                                    <div className="space-y-2">
                                        {ORDER_STEPS.map((step, i) => (
                                            <div key={step} className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                    i < getStepIndex(selected.status) ? 'bg-green-500 text-white' :
                                                    i === getStepIndex(selected.status) ? 'bg-red-600 text-white' :
                                                    'bg-gray-200 text-gray-400'
                                                }`}>
                                                    {i < getStepIndex(selected.status) ? '✓' : i + 1}
                                                </div>
                                                <span className={`text-sm font-semibold ${i <= getStepIndex(selected.status) ? 'text-gray-800' : 'text-gray-300'}`}>
                                                    {step.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Vehicle', value: `${selected.vehicleBrand} ${selected.vehicleModel}` },
                                    { label: 'Year', value: selected.vehicleYear },
                                    { label: 'Color', value: selected.vehicleColor },
                                    { label: 'Amount', value: `₱${Number(selected.amount).toLocaleString()}` },
                                    { label: 'Payment Mode', value: selected.paymentMode?.replace(/_/g, ' ') || '—' },
                                    { label: 'Delivery Address', value: selected.deliveryAddress || '—' },
                                    { label: 'Order Date', value: new Date(selected.createdAt).toLocaleString('en-PH') },
                                    { label: 'Expires At', value: selected.expiresAt ? new Date(selected.expiresAt).toLocaleString('en-PH') : '—' },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
                                        <p className="text-sm text-gray-800 font-medium">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {selected.adminNotes && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Admin Notes</p>
                                    <p className="text-sm text-blue-700">{selected.adminNotes}</p>
                                </div>
                            )}

                            {/* Warranty Info */}
                            {selected.warrantyStartDate && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                                    <p className="text-xs font-bold text-green-600 uppercase mb-1">Warranty</p>
                                    <p className="text-sm text-green-700">
                                        {new Date(selected.warrantyStartDate).toLocaleDateString('en-PH')} —{' '}
                                        {selected.warrantyEndDate ? new Date(selected.warrantyEndDate).toLocaleDateString('en-PH') : 'N/A'}
                                    </p>
                                </div>
                            )}

                            {/* Download Receipt */}
                            {selected.receiptGenerated && (
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`http://localhost:8080/api/buyer/orders/${selected.id}/receipt`, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        const blob = await res.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `receipt-${selected.id}.pdf`;
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    }}
                                    className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                                >
                                    📄 Download Receipt & Warranty
                                </button>
                            )}

                            {/* Cancel Reservation */}
                            {selected.status === 'PENDING' && (
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition disabled:opacity-60"
                                >
                                    {cancelling ? 'Cancelling...' : '✕ Cancel Reservation'}
                                </button>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button onClick={() => setShowModal(false)}
                                className="w-full py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyOrders;