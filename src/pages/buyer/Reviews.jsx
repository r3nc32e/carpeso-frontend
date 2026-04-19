import { useState, useEffect } from 'react';
import { Star, X, Check } from 'lucide-react';
import api from '../../api/axios';

function Reviews() {
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        transactionId: '',
        vehicleId: '',
        rating: 5,
        comment: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const ordersRes = await api.get('/buyer/orders');
            const completed = ordersRes.data.data.filter(o =>
                ['DELIVERED', 'COMPLETED'].includes(o.status)
            );
            setOrders(completed);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.transactionId || !form.rating) {
            setError('Please fill all required fields!');
            return;
        }
        try {
            await api.post('/buyer/reviews', {
                transactionId: parseInt(form.transactionId),
                vehicleId: parseInt(form.vehicleId),
                rating: form.rating,
                comment: form.comment,
            });
            setSuccess('Review submitted! Pending approval.');
            setShowModal(false);
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review!');
        }
    };

    const StarRating = ({ value, onChange }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange && onChange(star)}
                    className="transition"
                >
                    <Star
                        size={28}
                        className={star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                </button>
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">My Reviews</h2>
                    <p className="text-sm text-gray-400">Rate your purchased vehicles</p>
                </div>
                <button
                    onClick={() => {
                        setForm({ transactionId: '', vehicleId: '', rating: 5, comment: '' });
                        setError('');
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition"
                >
                    <Star size={16} /> Write Review
                </button>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16">
                    <Star size={48} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400">No completed orders to review yet</p>
                    <p className="text-xs text-gray-300 mt-1">
                        Only delivered or completed orders can be reviewed
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map(o => (
                        <div key={o.id} className="bg-white rounded-2xl shadow-sm p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-800">
                                        {o.vehicleBrand} {o.vehicleModel}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {o.vehicleYear} • Order #{o.id}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setForm({
                                            transactionId: String(o.id),
                                            vehicleId: String(o.vehicleId || ''),
                                            rating: 5,
                                            comment: '',
                                        });
                                        setError('');
                                        setShowModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition"
                                >
                                    Rate This
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Write a Review</h3>
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

                            {!form.transactionId && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                        Select Order *
                                    </label>
                                    <select
                                        value={form.transactionId}
                                        onChange={e => {
                                            const selected = orders.find(o => String(o.id) === e.target.value);
                                            setForm(prev => ({
                                                ...prev,
                                                transactionId: e.target.value,
                                                vehicleId: selected?.vehicleId ? String(selected.vehicleId) : '',
                                            }));
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    >
                                        <option value="">Select Order</option>
                                        {orders.map(o => (
                                            <option key={o.id} value={o.id}>
                                                #{o.id} — {o.vehicleBrand} {o.vehicleModel}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                                    Rating *
                                </label>
                                <StarRating
                                    value={form.rating}
                                    onChange={v => setForm(prev => ({ ...prev, rating: v }))}
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                    Comment
                                </label>
                                <textarea
                                    value={form.comment}
                                    onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    rows={4}
                                    placeholder="Share your experience with this vehicle..."
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs">
                                ⚠️ Reviews are subject to moderation before publishing.
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-100">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleSubmit}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reviews;