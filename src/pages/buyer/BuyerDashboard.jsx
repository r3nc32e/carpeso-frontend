import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, ClipboardList, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';


const IMG_BASE = 'http://localhost:8080/api/files';

function BuyerDashboard() {
    usePageTitle('Dashboard');
    
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, vehiclesRes, claimsRes] = await Promise.all([
                    api.get('/buyer/orders'),
                    api.get('/public/vehicles'),
                    api.get('/buyer/warranty-claims'),
                ]);
                setOrders(ordersRes.data.data || []);
                setVehicles(vehiclesRes.data.data?.slice(0, 3) || []);
                setClaims(claimsRes.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getImageUrl = (url) => {
        if (!url) return null;
        return `${IMG_BASE}${url.replace('/uploads', '')}`;
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
    }[status] || 'bg-gray-100 text-gray-600');

    const activeOrder = orders.find(o =>
        !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(o.status)
    );

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-1">
                    Welcome back, {user?.fullName?.split(' ')[0]}! 👋
                </h2>
                <p className="text-red-100 text-sm">
                    Find your dream car today — browse our latest vehicles.
                </p>
                <button
                    onClick={() => navigate('/buyer/catalog')}
                    className="mt-4 flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-50 transition"
                >
                    Browse Vehicles <ArrowRight size={16} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Orders', value: orders.length, icon: <ClipboardList size={22} />, color: 'bg-blue-500', path: '/buyer/orders' },
                    { label: 'Active Order', value: activeOrder ? '1' : '0', icon: <Car size={22} />, color: 'bg-red-600', path: '/buyer/orders' },
                    { label: 'Warranty Claims', value: claims.length, icon: <ShieldCheck size={22} />, color: 'bg-green-500', path: '/buyer/warranty-claims' },
                ].map(stat => (
                    <button key={stat.label}
                        onClick={() => navigate(stat.path)}
                        className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition text-left w-full"
                    >
                        <div className={`${stat.color} text-white p-3 rounded-xl`}>{stat.icon}</div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Active Order */}
            {activeOrder && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">Active Order</h3>
                        <button onClick={() => navigate('/buyer/orders')}
                            className="text-red-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-bold text-gray-800">{activeOrder.vehicleBrand} {activeOrder.vehicleModel}</p>
                            <p className="text-sm text-gray-500">{activeOrder.vehicleYear} • ₱{Number(activeOrder.amount).toLocaleString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(activeOrder.status)}`}>
                            {activeOrder.status?.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>
            )}

            {/* Featured Vehicles */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Featured Vehicles</h3>
                    <button onClick={() => navigate('/buyer/catalog')}
                        className="text-red-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                        View All <ArrowRight size={14} />
                    </button>
                </div>
                {loading ? (
                    <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
                ) : vehicles.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No vehicles available</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {vehicles.map(v => (
                            <div key={v.id}
                                onClick={() => navigate(`/buyer/vehicles/${v.id}`)}
                                className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer">
                                {v.imageUrls?.length > 0 ? (
                                    <img
                                        src={getImageUrl(v.imageUrls[0])}
                                        alt={`${v.brand} ${v.model}`}
                                        className="w-full h-32 object-cover"
                                    />
                                ) : (
                                    <div className="bg-gray-100 h-32 flex items-center justify-center">
                                        <Car size={40} className="text-gray-300" />
                                    </div>
                                )}
                                <div className="p-3">
                                    <p className="font-bold text-gray-800 text-sm">{v.brand} {v.model}</p>
                                    <p className="text-xs text-gray-400 mb-2">{v.year} • {v.color}</p>
                                    <p className="text-red-600 font-bold">₱{Number(v.price).toLocaleString()}</p>
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