import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, X } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';


function WarrantyClaims() {
    usePageTitle('Warranty Claims');
    
    const [claims, setClaims] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        transactionId: '',
        issue: '',
        evidenceUrl: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [claimsRes, ordersRes] = await Promise.all([
                api.get('/buyer/warranty-claims'),
                api.get('/buyer/orders'),
            ]);
            setClaims(claimsRes.data.data);
            // Only delivered/completed orders eligible
            setOrders(ordersRes.data.data.filter(o =>
                ['DELIVERED', 'COMPLETED'].includes(o.status)
            ));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.transactionId || !form.issue) {
            setError('Please fill all required fields!');
            return;
        }
        try {
            await api.post('/buyer/warranty-claims', {
                transactionId: parseInt(form.transactionId),
                issue: form.issue,
                evidenceUrl: form.evidenceUrl,
            });
            setSuccess('Warranty claim submitted successfully!');
            setShowModal(false);
            fetchData();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit claim!');
        }
    };

    const statusColor = (status) => {
        const colors = {
            OPEN: 'bg-yellow-100 text-yellow-700',
            IN_PROGRESS: 'bg-blue-100 text-blue-700',
            RESOLVED: 'bg-green-100 text-green-700',
            CLOSED: 'bg-gray-100 text-gray-500',
        };
        return colors[status] || 'bg-gray-100 text-gray-600';
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition";

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Warranty Claims</h2>
                    <p className="text-sm text-gray-400">{claims.length} total claims</p>
                </div>
                <button
                    onClick={() => {
                        setForm({ transactionId: '', issue: '', evidenceUrl: '' });
                        setError('');
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition"
                >
                    <Plus size={16} /> File Claim
                </button>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                    ✅ {success}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading claims...</div>
            ) : claims.length === 0 ? (
                <div className="text-center py-16">
                    <ShieldCheck size={48} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400">No warranty claims yet</p>
                    <p className="text-xs text-gray-300 mt-1">
                        File a claim for delivered vehicles
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {claims.map(c => (
                        <div key={c.id} className="bg-white rounded-2xl shadow-sm p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 rounded-xl p-3">
                                        <ShieldCheck size={22} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">
                                            Claim #{c.id}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Transaction #{c.transaction?.id}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">{c.issue}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(c.status)}`}>
                                    {c.status?.replace(/_/g, ' ')}
                                </span>
                            </div>
                            {c.adminNotes && (
                                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Admin Response</p>
                                    <p className="text-sm text-blue-700">{c.adminNotes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* File Claim Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">File Warranty Claim</h3>
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

                            {orders.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 text-sm">
                                        No eligible orders for warranty claim.
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Only delivered or completed orders are eligible.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                            Select Order *
                                        </label>
                                        <select
                                            value={form.transactionId}
                                            onChange={e => setForm(prev => ({ ...prev, transactionId: e.target.value }))}
                                            className={inputClass}
                                        >
                                            <option value="">Select Order</option>
                                            {orders.map(o => (
                                                <option key={o.id} value={o.id}>
                                                    #{o.id} — {o.vehicleBrand} {o.vehicleModel} ({o.status})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                            Issue Description *
                                        </label>
                                        <textarea
                                            value={form.issue}
                                            onChange={e => setForm(prev => ({ ...prev, issue: e.target.value }))}
                                            className={inputClass}
                                            rows={4}
                                            placeholder="Describe the issue with your vehicle..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                            Evidence URL (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.evidenceUrl}
                                            onChange={e => setForm(prev => ({ ...prev, evidenceUrl: e.target.value }))}
                                            className={inputClass}
                                            placeholder="Link to photo/video evidence..."
                                        />
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs">
                                        ⚠️ Warranty claims are subject to review by our team.
                                    </div>
                                </>
                            )}
                        </div>
                        {orders.length > 0 && (
                            <div className="flex gap-3 p-6 border-t border-gray-100">
                                <button onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                    Cancel
                                </button>
                                <button onClick={handleSubmit}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                    Submit Claim
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WarrantyClaims;