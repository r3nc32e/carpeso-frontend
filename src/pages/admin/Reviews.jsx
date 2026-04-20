import { useState, useEffect } from 'react';
import { Star, Trash2, AlertTriangle, Check, X } from 'lucide-react';
import api from '../../api/axios';

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [showWarnModal, setShowWarnModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [warnReason, setWarnReason] = useState('');

    useEffect(() => { fetchReviews(); }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/admin/reviews');
            setReviews(res.data.data);
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
            setError('Failed to delete review!');
        }
    };

    const handleWarn = async () => {
        if (!warnReason) { setError('Please provide a reason!'); return; }
        try {
            await api.post(`/admin/users/${selectedReview.buyer?.id}/warn?reason=${warnReason}`);
            setSuccess('Warning issued to user!');
            setShowWarnModal(false);
            setWarnReason('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to warn user!');
        }
    };

    const StarDisplay = ({ value }) => (
        <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
                <Star key={s} size={14}
                    className={s <= value
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'} />
            ))}
        </div>
    );

    const filtered = filter === 'ALL'
        ? reviews
        : reviews.filter(r => r.status === filter);

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
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(f => (
                    <button key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === f ? 'bg-red-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Reviews */}
            <div className="space-y-3">
                {loading ? (
                    <p className="text-center py-12 text-gray-400 text-sm">Loading...</p>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <Star size={48} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-gray-400 text-sm">No reviews found</p>
                    </div>
                ) : (
                    filtered.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {r.buyer?.firstName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">
                                                {r.buyer?.firstName} {r.buyer?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {r.vehicle?.brand} {r.vehicle?.model}
                                            </p>
                                        </div>
                                        <StarDisplay value={r.rating} />
                                    </div>
                                    {r.comment && (
                                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 ml-11">
                                            "{r.comment}"
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => {
                                            setSelectedReview(r);
                                            setWarnReason('');
                                            setError('');
                                            setShowWarnModal(true);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition"
                                    >
                                        <AlertTriangle size={12} /> Warn
                                    </button>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition"
                                    >
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Warn Modal */}
            {showWarnModal && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Warn User</h3>
                            <button onClick={() => setShowWarnModal(false)}
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
                            <p className="text-sm text-gray-600">
                                Issuing warning to: <strong>{selectedReview.buyer?.firstName} {selectedReview.buyer?.lastName}</strong>
                            </p>
                            {selectedReview.comment && (
                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                    "{selectedReview.comment}"
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                    Reason *
                                </label>
                                <textarea
                                    value={warnReason}
                                    onChange={e => setWarnReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    rows={3}
                                    placeholder="e.g. Inappropriate language in review..."
                                />
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

export default Reviews;