import { IMG_BASE } from '../../api/config';
import { useState, useEffect } from 'react';
import { Eye, X, Check, ShieldCheck, ShieldOff } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';



function AdminWarrantyClaims() {
    usePageTitle('Warranty Claims');
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [adminResponse, setAdminResponse] = useState('');

    useEffect(() => {
        fetchClaims();
        const interval = setInterval(fetchClaims, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchClaims = async () => {
        try {
            const res = await api.get('/admin/warranty-claims');
            setClaims(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch claims:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateClaim = async (status) => {
        if (!adminResponse.trim()) {
            setError('Please write a response before submitting!');
            return;
        }
        try {
            await api.put(`/admin/warranty-claims/${selected.id}/status`, {
                status,
                adminResponse,
            });
            setSuccess(`Claim ${status.toLowerCase()}!`);
            setShowModal(false);
            fetchClaims();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update!');
        }
    };

    const statusColor = (status) => ({
        OPEN: 'bg-yellow-100 text-yellow-700',
        IN_PROGRESS: 'bg-blue-100 text-blue-700',
        APPROVED: 'bg-green-100 text-green-700',
        REJECTED: 'bg-red-100 text-red-700',
        RESOLVED: 'bg-green-200 text-green-800',
        CLOSED: 'bg-gray-100 text-gray-600',
    }[status] || 'bg-gray-100 text-gray-600');

    const getImageUrl = (url) => {
        if (!url) return null;
        return `${IMG_BASE}${url.replace('/uploads', '')}`;
    };

    const filtered = filter === 'ALL'
        ? claims
        : claims.filter(c => c.status?.toString() === filter);

    const isFinal = (status) =>
        ['APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'].includes(status?.toString());

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Warranty Claims</h2>
                <p className="text-sm text-gray-400">{claims.length} total claims</p>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}
            {error && !showModal && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">⚠️ {error}</div>
            )}

            <div className="flex gap-2 flex-wrap">
                {['ALL', 'OPEN', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === s ? 'bg-red-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                        {s.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['#', 'Buyer', 'Issue', 'Status', 'Filed', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No claims found</td></tr>
                            ) : (
                                filtered.map(c => (
                                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{c.id}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-gray-800 text-xs">
                                                {c.buyer?.firstName} {c.buyer?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-400 break-all max-w-[120px] truncate">
                                                {c.buyer?.email}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-xs text-gray-600 max-w-[180px] truncate">{c.issue || '—'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(c.status?.toString())}`}>
                                                {c.status?.toString()?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-xs">
                                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-PH') : '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button onClick={() => {
                                                setSelected(c);
                                                setAdminResponse('');
                                                setError('');
                                                setShowModal(true);
                                            }}
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
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Warranty Claim #{selected.id}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusColor(selected.status?.toString())}`}>
                                    {selected.status?.toString()?.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>
                            )}

                            {/* Buyer Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Buyer</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {selected.buyer?.firstName?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {selected.buyer?.firstName} {selected.buyer?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 break-all">{selected.buyer?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle */}
                            {selected.transaction && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Vehicle / Transaction</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Transaction #{selected.transaction.id}
                                    </p>
                                </div>
                            )}

                            {/* Issue */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-xs font-bold text-red-600 uppercase mb-2">Issue Reported</p>
                                <p className="text-sm text-gray-700">{selected.issue || '—'}</p>
                            </div>

                            {/* Evidence */}
                            {selected.evidenceUrl && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Evidence Photo</p>
                                    <img src={getImageUrl(selected.evidenceUrl)} alt="Evidence"
                                        className="w-full h-40 object-cover rounded-xl border border-gray-200 cursor-pointer"
                                        onClick={() => window.open(getImageUrl(selected.evidenceUrl), '_blank')} />
                                    <p className="text-xs text-blue-600 mt-1 cursor-pointer hover:underline"
                                        onClick={() => window.open(getImageUrl(selected.evidenceUrl), '_blank')}>
                                        View Full Size ↗
                                    </p>
                                </div>
                            )}

                            {/* Buyer IDs */}
                            {(selected.buyer?.primaryIdUrl || selected.buyer?.secondaryIdUrl) && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Buyer IDs</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selected.buyer?.primaryIdUrl && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Primary ID</p>
                                                <img src={getImageUrl(selected.buyer.primaryIdUrl)} alt="Primary ID"
                                                    className="w-full h-24 object-contain bg-gray-50 rounded-xl border border-gray-200 cursor-pointer"
                                                    onClick={() => window.open(getImageUrl(selected.buyer.primaryIdUrl), '_blank')} />
                                            </div>
                                        )}
                                        {selected.buyer?.secondaryIdUrl && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Secondary ID</p>
                                                <img src={getImageUrl(selected.buyer.secondaryIdUrl)} alt="Secondary ID"
                                                    className="w-full h-24 object-contain bg-gray-50 rounded-xl border border-gray-200 cursor-pointer"
                                                    onClick={() => window.open(getImageUrl(selected.buyer.secondaryIdUrl), '_blank')} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Existing Response */}
                            {selected.adminResponse && isFinal(selected.status?.toString()) && (
                                <div className={`rounded-xl p-4 ${['APPROVED','RESOLVED'].includes(selected.status?.toString()) ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                    <p className={`text-xs font-bold uppercase mb-2 ${['APPROVED','RESOLVED'].includes(selected.status?.toString()) ? 'text-green-600' : 'text-red-600'}`}>
                                        Admin Response Sent
                                    </p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.adminResponse}</p>
                                </div>
                            )}

                            {/* Response Form — only for pending */}
                            {!isFinal(selected.status?.toString()) && (
                                <div className="space-y-3 border-t border-gray-100 pt-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Admin Response *</p>

                                    {/* Quick Templates */}
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-400">Quick Templates:</p>
                                        <button type="button"
                                            onClick={() => setAdminResponse(
                                                `Dear ${selected.buyer?.firstName || 'Valued Customer'},\n\nThank you for filing your warranty claim. After careful review, we are pleased to inform you that your claim has been APPROVED.\n\nYour vehicle has a verified defect covered under our warranty policy. Please visit our service center at:\n\n📍 123 Carpeso Service Center, Metro Manila\n\nPlease bring:\n• This warranty receipt\n• Your valid government ID\n• Original purchase receipt\n\nOur technicians will repair or replace the defective component at no cost to you. We sincerely apologize for the inconvenience and thank you for choosing Carpeso.\n\nBest regards,\nCarpeso Service Team`
                                            )}
                                            className="w-full text-left px-3 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs hover:bg-green-100 transition">
                                            ✅ Approve — Company Fault (Warranty Covered)
                                        </button>
                                        <button type="button"
                                            onClick={() => setAdminResponse(
                                                `Dear ${selected.buyer?.firstName || 'Valued Customer'},\n\nThank you for contacting us regarding your warranty claim.\n\nAfter thorough review of your claim and the submitted evidence, we regret to inform you that your warranty claim has been REJECTED.\n\nReason: The reported issue appears to be caused by external factors, misuse, or accidental damage, which are not covered under our warranty policy.\n\nOur warranty covers manufacturer defects and factory-related issues only. For repairs, you may visit any authorized service center.\n\nWe apologize for any inconvenience. If you have any questions, please contact us at support@carpeso.com.\n\nBest regards,\nCarpeso Support Team`
                                            )}
                                            className="w-full text-left px-3 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs hover:bg-red-100 transition">
                                            ❌ Reject — Not Covered / User Fault
                                        </button>
                                    </div>

                                    <textarea value={adminResponse}
                                        onChange={e => setAdminResponse(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                        rows={8}
                                        placeholder="Write your response to the buyer... (Required)" />

                                    <p className="text-xs text-gray-400">
                                        ℹ️ This response will be sent to the buyer's email and visible in their Warranty Claims page.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Close
                            </button>
                            {!isFinal(selected.status?.toString()) && (
                                <>
                                    <button onClick={() => handleUpdateClaim('REJECTED')}
                                        className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2">
                                        <ShieldOff size={14} /> Reject
                                    </button>
                                    <button onClick={() => handleUpdateClaim('APPROVED')}
                                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2">
                                        <ShieldCheck size={14} /> Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminWarrantyClaims;