import { useState, useEffect } from 'react';
import { Star, Trash2, X, Check, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

const WARN_REASONS = [
    'Inappropriate comment or review',
    'Spamming / repeated reviews',
    'Offensive or vulgar language',
    'False information or misinformation',
    'Trolling',
    'Harassment',
    'Suspicious or fraudulent review',
];

function AdminReviews() {
    usePageTitle('Reviews');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showWarnModal, setShowWarnModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [warnReason, setWarnReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    useEffect(() => { fetchReviews(); }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/admin/reviews');
            setReviews(res.data.data || []);
        } catch (err) {
            setError('Failed to fetch reviews!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await api.delete(`/admin/reviews/${id}`);
            setSuccess('Review deleted!');
            fetchReviews();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete!');
        }
    };

    const handleWarn = async () => {
        const reason = warnReason === 'Other' ? customReason : warnReason;
        if (!reason.trim()) { setError('Please select or enter a reason!'); return; }
        try {
            await api.put(`/admin/users/${selectedReview.buyerId}/warn`, { reason });
            setSuccess('Warning issued to user!');
            setShowWarnModal(false);
            setWarnReason('');
            setCustomReason('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to warn user!');
        }
    };

    const StarDisplay = ({ rating }) => (
        <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
                <Star key={s} size={14}
                    className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Reviews Management</h2>
                <p className="text-sm text-gray-400">{reviews.length} total reviews</p>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}
            {error && !showWarnModal && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">⚠️ {error}</div>
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['#', 'Buyer', 'Vehicle', 'Rating', 'Comment', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No reviews found</td></tr>
                            ) : (
                                reviews.map(r => (
                                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{r.id}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-gray-800 text-xs">
                                                {r.buyerFirstName} {r.buyerLastName}
                                            </p>
                                            <p className="text-xs text-gray-400 max-w-[100px] truncate">{r.buyerEmail}</p>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-xs">
                                            {r.vehicleBrand} {r.vehicleModel}
                                        </td>
                                        <td className="py-3 px-4">
                                            <StarDisplay rating={r.rating} />
                                            <p className="text-xs text-gray-400 mt-0.5">{r.rating}/5</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-xs text-gray-600 max-w-[200px] truncate">{r.comment || '—'}</p>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-xs">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-PH') : '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedReview(r);
                                                        setWarnReason('');
                                                        setCustomReason('');
                                                        setError('');
                                                        setShowWarnModal(true);
                                                    }}
                                                    className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                                                    title="Warn User">
                                                    <AlertTriangle size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(r.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Review">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Warn Modal */}
            {showWarnModal && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Warn User</h3>
                            <button onClick={() => setShowWarnModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>
                            )}

                            {/* Review Preview */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {selectedReview.buyerFirstName?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {selectedReview.buyerFirstName} {selectedReview.buyerLastName}
                                        </p>
                                        <StarDisplay rating={selectedReview.rating} />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 italic">"{selectedReview.comment}"</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                                    Warning Reason *
                                </label>
                                <select value={warnReason}
                                    onChange={e => { setWarnReason(e.target.value); setCustomReason(''); }}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition">
                                    <option value="">Select a reason</option>
                                    {WARN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    <option value="Other">Other (specify below)</option>
                                </select>
                                {warnReason === 'Other' && (
                                    <textarea value={customReason}
                                        onChange={e => setCustomReason(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition mt-2"
                                        rows={2} placeholder="Specify reason..." />
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    ⚠️ 3 warnings = automatic account suspension
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-100">
                            <button onClick={() => setShowWarnModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleWarn}
                                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition">
                                Issue Warning
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminReviews;