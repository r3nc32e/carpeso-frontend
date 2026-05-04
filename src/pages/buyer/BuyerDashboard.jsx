import { IMG_BASE } from '../../api/config';
import { useState, useEffect } from 'react';
import { Car, ClipboardList, ShieldCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';



function BuyerDashboard() {
    usePageTitle('Dashboard');
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, vehiclesRes, claimsRes] = await Promise.all([
                api.get('/buyer/orders'),
                api.get('/public/vehicles'),
                api.get('/buyer/warranty-claims'),
            ]);
            setOrders(ordersRes.data.data || []);
            setVehicles(vehiclesRes.data.data || []);
            setClaims(claimsRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        return `${IMG_BASE}${url.replace('/uploads', '')}`;
    };

    const activeOrder = orders.find(o =>
        !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(o.status));
    const completedOrders = orders.filter(o => o.status === 'COMPLETED');
    const featuredVehicles = vehicles
        .filter(v => v.status === 'AVAILABLE').slice(0, 4);

    const statusColor = (status) => ({
        PENDING: 'bg-yellow-100 text-yellow-700',
        CONFIRMED: 'bg-blue-100 text-blue-700',
        PREPARING: 'bg-purple-100 text-purple-700',
        READY: 'bg-indigo-100 text-indigo-700',
        OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
        DELIVERED: 'bg-green-100 text-green-700',
        COMPLETED: 'bg-green-200 text-green-800',
        CANCELLED: 'bg-red-100 text-red-700',
    }[status] || 'bg-gray-100 text-gray-600');

    const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING',
                         'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'];

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-1">
                    Hello, {user?.fullName?.split(' ')[0]}! 👋
                </h2>
                <p className="text-red-100 text-sm">
                    Welcome back to Carpeso — your trusted automotive marketplace.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    {
                        label: 'My Orders',
                        value: orders.length,
                        icon: <ClipboardList size={20} />,
                        color: 'bg-blue-50 text-blue-600',
                        path: '/buyer/orders',
                    },
                    {
                        label: 'Completed',
                        value: completedOrders.length,
                        icon: <Car size={20} />,
                        color: 'bg-green-50 text-green-600',
                        path: '/buyer/orders',
                    },
                    {
                        label: 'Warranty Claims',
                        value: claims.length,
                        icon: <ShieldCheck size={20} />,
                        color: 'bg-purple-50 text-purple-600',
                        path: '/buyer/warranty-claims',
                    },
                    {
                        label: 'Available Cars',
                        value: vehicles.filter(v => v.status === 'AVAILABLE').length,
                        icon: <Star size={20} />,
                        color: 'bg-red-50 text-red-600',
                        path: '/buyer/catalog',
                    },
                ].map(card => (
                    <div key={card.label}
                        onClick={() => navigate(card.path)}
                        className={`${card.color} rounded-2xl p-4 cursor-pointer hover:shadow-md transition`}>
                        <div className="flex items-center gap-2 mb-2">
                            {card.icon}
                            <span className="text-xs font-semibold uppercase">{card.label}</span>
                        </div>
                        <p className="text-3xl font-bold">{loading ? '—' : card.value}</p>
                    </div>
                ))}
            </div>

            {/* Active Order */}
            {activeOrder && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">Active Reservation</h3>
                        <button onClick={() => navigate('/buyer/orders')}
                            className="text-red-600 text-sm font-semibold hover:underline">
                            View All →
                        </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-bold text-gray-800">
                                    {activeOrder.vehicleBrand} {activeOrder.vehicleModel}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Order #{activeOrder.id} • {activeOrder.vehicleYear} • {activeOrder.vehicleColor}
                                </p>
                                <p className="text-red-600 font-bold text-sm mt-1">
                                    ₱{Number(activeOrder.amount).toLocaleString()}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(activeOrder.status)}`}>
                                {activeOrder.status?.replace(/_/g, ' ')}
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.max(5, ((ORDER_STEPS.indexOf(activeOrder.status) + 1) / ORDER_STEPS.length) * 100)}%`
                                    }} />
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-400">Pending</span>
                                <span className="text-xs text-gray-400">Completed</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Featured Vehicles */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Available Vehicles</h3>
                    <button onClick={() => navigate('/buyer/catalog')}
                        className="text-red-600 text-sm font-semibold hover:underline">
                        Browse All →
                    </button>
                </div>
                {loading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
                ) : featuredVehicles.length === 0 ? (
                    <div className="text-center py-8">
                        <Car size={40} className="mx-auto mb-2 text-gray-200" />
                        <p className="text-gray-400 text-sm">No available vehicles at the moment</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {featuredVehicles.map(v => (
                            <div key={v.id}
                                onClick={() => navigate(`/buyer/vehicles/${v.id}`)}
                                className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer group">
                                {v.imageUrls?.length > 0 ? (
                                    <img src={getImageUrl(v.imageUrls[0])}
                                        alt={`${v.brand} ${v.model}`}
                                        className="w-full h-28 object-cover group-hover:scale-105 transition duration-300" />
                                ) : (
                                    <div className="bg-gray-200 h-28 flex items-center justify-center">
                                        <Car size={32} className="text-gray-300" />
                                    </div>
                                )}
                                <div className="p-2">
                                    <p className="font-bold text-gray-800 text-xs truncate">
                                        {v.brand} {v.model}
                                    </p>
                                    <p className="text-red-600 font-bold text-xs">
                                        ₱{Number(v.price).toLocaleString()}
                                    </p>
                                    {v.quantity > 0 && (
                                        <p className="text-gray-400 text-xs">
                                            {v.quantity} unit{v.quantity !== 1 ? 's' : ''} left
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BuyerDashboard;