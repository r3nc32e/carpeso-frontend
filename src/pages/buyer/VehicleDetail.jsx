import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Car, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

const IMG_BASE = 'http://localhost:8080/api/files';

function VehicleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [vehicle, setVehicle] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReserveModal, setShowReserveModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');
    const [currentImg, setCurrentImg] = useState(0);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    usePageTitle(vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle Details');

    const [reserveForm, setReserveForm] = useState({
        deliveryNotes: '',
        paymentMode: '',
        cityName: '',
        barangayName: '',
        streetNo: '',
    });

    const PAYMENT_MODES = ['CASH', 'GCASH', 'MAYA', 'BANK_TRANSFER', 'CAR_FINANCING', 'CREDIT_CARD'];

    useEffect(() => {
        fetchVehicle();
        fetchReviews();
        api.get('/locations/cities').then(res => setCities(res.data.data));
    }, [id]);

    const handleCityChange = async (cityId) => {
        const city = cities.find(c => c.id === parseInt(cityId));
        setReserveForm(prev => ({
            ...prev,
            cityName: city?.name || '',
            barangayName: '',
        }));
        if (cityId) {
            const res = await api.get(`/locations/barangays/${cityId}`);
            setBarangays(res.data.data);
        }
    };

    const fetchVehicle = async () => {
        try {
            const res = await api.get(`/public/vehicles/${id}`);
            setVehicle(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/public/vehicles/${id}/reviews`);
            setReviews(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        return `${IMG_BASE}${url.replace('/uploads', '')}`;
    };

    const allMedia = [
        ...(vehicle?.imageUrls || []).map(url => ({ type: 'image', url })),
        ...(vehicle?.videoUrls || []).map(url => ({ type: 'video', url })),
        ...(vehicle?.videoUrl && !vehicle?.videoUrls?.length
            ? [{ type: 'video', url: vehicle.videoUrl }]
            : []),
    ];

    const handleReserve = async () => {
        if (!reserveForm.paymentMode || !reserveForm.cityName || !reserveForm.barangayName) {
            setError('Please fill all required fields!');
            return;
        }
        const fullAddress = `${reserveForm.streetNo ? reserveForm.streetNo + ', ' : ''}${reserveForm.barangayName}, ${reserveForm.cityName}`;
        try {
            await api.post('/buyer/reserve', {
                vehicleId: parseInt(id),
                deliveryAddress: fullAddress,
                deliveryNotes: reserveForm.deliveryNotes,
                paymentMode: reserveForm.paymentMode,
            });
            setSuccess('Reservation submitted!');
            setShowReserveModal(false);
            fetchVehicle();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reserve!');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated()) { navigate('/login'); return; }
        if (!comment.trim()) { setReviewError('Please write a comment!'); return; }
        setSubmitting(true);
        setReviewError('');
        try {
            await api.post('/buyer/reviews', {
                vehicleId: parseInt(id),
                rating,
                comment: comment.trim(),
            });
            setComment('');
            setRating(5);
            setReviewSuccess('Review posted!');
            fetchReviews();
            setTimeout(() => setReviewSuccess(''), 3000);
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to post review!');
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ value, onChange, size = 20 }) => (
        <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => onChange && onChange(s)}>
                    <Star size={size} className={s <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                </button>
            ))}
        </div>
    );

    const statusColor = (status) => ({
        AVAILABLE: 'bg-green-100 text-green-700',
        RESERVED: 'bg-yellow-100 text-yellow-700',
        SOLD: 'bg-gray-100 text-gray-500',
    }[status] || 'bg-gray-100 text-gray-600');

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 animate-pulse">Loading vehicle...</p>
        </div>
    );

    if (!vehicle) return (
        <div className="text-center py-16">
            <p className="text-gray-400">Vehicle not found</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-red-600 font-semibold">← Go Back</button>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition font-semibold text-sm">
                <ArrowLeft size={16} /> Back
            </button>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                    ✅ {success}
                </div>
            )}

            {/* Vehicle Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                {/* Media Carousel */}
                {allMedia.length > 0 ? (
                    <div className="relative bg-black">
                        <div className="relative h-64 sm:h-80 flex items-center justify-center">
                            {allMedia[currentImg]?.type === 'image' ? (
                                <img src={getImageUrl(allMedia[currentImg].url)}
                                    alt="vehicle" className="h-full w-full object-contain" />
                            ) : (
                                <video
                                    src={`${IMG_BASE}${allMedia[currentImg]?.url?.replace('/uploads', '')}`}
                                    controls className="h-full w-full object-contain" />
                            )}

                            {allMedia.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImg(i => i === 0 ? allMedia.length - 1 : i - 1)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80 transition">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImg(i => i === allMedia.length - 1 ? 0 : i + 1)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80 transition">
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}

                            <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                                {currentImg + 1} / {allMedia.length}
                                {allMedia[currentImg]?.type === 'video' && ' 🎥'}
                            </div>
                        </div>

                        {allMedia.length > 1 && (
                            <div className="flex gap-2 p-3 overflow-x-auto bg-gray-900">
                                {allMedia.map((media, i) => (
                                    <button key={i} onClick={() => setCurrentImg(i)}
                                        className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${currentImg === i ? 'border-red-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                        {media.type === 'image' ? (
                                            <img src={getImageUrl(media.url)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs">🎥</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-100 h-64 sm:h-80 flex items-center justify-center">
                        <Car size={80} className="text-gray-300" />
                    </div>
                )}

                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{vehicle.brand} {vehicle.model}</h1>
                            <p className="text-gray-400 text-sm mt-1">{vehicle.year} • {vehicle.color} • {vehicle.categoryName}</p>
                            {reviews.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <StarRating value={Math.round(vehicle.averageRating || 0)} size={16} />
                                    <span className="text-sm text-gray-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-red-600">₱{Number(vehicle.price).toLocaleString()}</p>
                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${statusColor(vehicle.status)}`}>
                                {vehicle.status}
                            </span>
                            {vehicle.quantity > 0 && vehicle.status === 'AVAILABLE' && (
                                <p className="text-xs text-gray-400 mt-1">{vehicle.quantity} unit{vehicle.quantity !== 1 ? 's' : ''} available</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                        {[
                            { label: 'Condition', value: vehicle.condition?.replace(/_/g, ' ') || '—' },
                            { label: 'Fuel Type', value: vehicle.fuelType || '—' },
                            { label: 'Transmission', value: vehicle.transmission || '—' },
                            { label: 'Body Type', value: vehicle.bodyType || '—' },
                            { label: 'Mileage', value: vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : '—' },
                            { label: 'Warranty', value: vehicle.warrantyYears ? `${vehicle.warrantyYears} year(s)` : '—' },
                            { label: 'Plate No.', value: vehicle.plateNumber || '—' },
                            { label: 'Engine No.', value: vehicle.engineNumber || '—' },
                            { label: 'Chassis No.', value: vehicle.chassisNumber || '—' },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                            </div>
                        ))}
                    </div>

                    {vehicle.description && (
                        <div className="mb-6">
                            <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Description</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{vehicle.description}</p>
                        </div>
                    )}

                    {vehicle.warrantyDetails && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                            <p className="text-xs font-bold text-green-600 uppercase mb-1">Warranty Coverage</p>
                            <p className="text-sm text-green-700">{vehicle.warrantyDetails}</p>
                        </div>
                    )}

                    {vehicle.status === 'AVAILABLE' && isAuthenticated() && user?.role === 'BUYER' && (
                        <button
                            onClick={() => {
                                setReserveForm({ deliveryNotes: '', paymentMode: '', cityName: '', barangayName: '', streetNo: '' });
                                setError('');
                                setShowReserveModal(true);
                            }}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition">
                            Reserve This Vehicle
                        </button>
                    )}
                    {!isAuthenticated() && vehicle.status === 'AVAILABLE' && (
                        <button onClick={() => navigate('/login')}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition">
                            Login to Reserve
                        </button>
                    )}
                    {vehicle.status !== 'AVAILABLE' && (
                        <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-center">
                            {vehicle.status === 'RESERVED' ? '🔒 Currently Reserved' : '✅ Already Sold'}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Reviews & Ratings
                    {reviews.length > 0 && <span className="ml-2 text-sm text-gray-400 font-normal">({reviews.length})</span>}
                </h2>

                {isAuthenticated() && user?.role === 'BUYER' && (
                    <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Write a Review</p>
                        {reviewError && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">⚠️ {reviewError}</div>}
                        {reviewSuccess && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs">✅ {reviewSuccess}</div>}
                        <div>
                            <StarRating value={rating} onChange={setRating} />
                            <p className="text-xs text-gray-400 mt-1">{['','Poor','Fair','Good','Very Good','Excellent'][rating]}</p>
                        </div>
                        <textarea value={comment} onChange={e => setComment(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                            rows={3} placeholder="Share your experience with this vehicle..." />
                        <button type="submit" disabled={submitting}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition disabled:opacity-60">
                            {submitting ? 'Posting...' : 'Post Review'}
                        </button>
                    </form>
                )}

                {!isAuthenticated() && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-sm text-gray-500">
                            <button onClick={() => navigate('/login')} className="text-red-600 font-bold hover:underline">Login</button>{' '}to write a review
                        </p>
                    </div>
                )}

                {reviews.length === 0 ? (
                    <div className="text-center py-8">
                        <Star size={32} className="mx-auto mb-2 text-gray-200" />
                        <p className="text-gray-400 text-sm">No reviews yet — be the first!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map(r => (
                            <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {r.buyer?.firstName?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{r.buyer?.firstName} {r.buyer?.lastName}</p>
                                        <div className="flex gap-0.5 mt-0.5">
                                            {[1,2,3,4,5].map(s => (
                                                <Star key={s} size={12} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {r.comment && <p className="text-sm text-gray-600 ml-11">{r.comment}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reserve Modal */}
            {showReserveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-lg font-bold text-gray-800">Reserve Vehicle</h3>
                            <button onClick={() => setShowReserveModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="font-bold text-gray-800">{vehicle.brand} {vehicle.model}</p>
                                <p className="text-sm text-gray-500">{vehicle.year} • ₱{Number(vehicle.price).toLocaleString()}</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Payment Mode *</label>
                                <select value={reserveForm.paymentMode}
                                    onChange={e => setReserveForm(prev => ({ ...prev, paymentMode: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition">
                                    <option value="">Select Payment Mode</option>
                                    {PAYMENT_MODES.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">City / Municipality *</label>
                                <select onChange={e => handleCityChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition">
                                    <option value="">Select City</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Barangay *</label>
                                <select value={reserveForm.barangayName}
                                    onChange={e => setReserveForm(prev => ({ ...prev, barangayName: e.target.value }))}
                                    disabled={!reserveForm.cityName}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition disabled:bg-gray-50 disabled:text-gray-400">
                                    <option value="">Select Barangay</option>
                                    {barangays.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Street / House No.</label>
                                <input value={reserveForm.streetNo}
                                    onChange={e => setReserveForm(prev => ({ ...prev, streetNo: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    placeholder="123 Main Street (optional)" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Delivery Notes</label>
                                <textarea value={reserveForm.deliveryNotes}
                                    onChange={e => setReserveForm(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    rows={2} placeholder="Landmark, special instructions (optional)..." />
                            </div>

                            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs">
                                ⚠️ Reservation expires in 48 hours. Admin will confirm your booking.
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button onClick={() => setShowReserveModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleReserve}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                Confirm Reservation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VehicleDetail;