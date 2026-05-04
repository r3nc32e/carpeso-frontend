import { IMG_BASE } from '../../api/config';
import { useState, useEffect } from 'react';
import { Car, Search, SlidersHorizontal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';



function Catalog() {
    usePageTitle('Browse Vehicles');
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: 'ALL',
        condition: '',
        fuelType: '',
        transmission: '',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
    });
    const navigate = useNavigate();

    useEffect(() => { fetchVehicles(); }, []);

    const fetchVehicles = async () => {
        try {
            const res = await api.get('/public/vehicles');
            setVehicles(res.data.data);
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

    const clearFilters = () => {
        setFilters({ status: 'ALL', condition: '', fuelType: '', transmission: '', minPrice: '', maxPrice: '', minYear: '', maxYear: '' });
        setSearch('');
    };

    const filtered = vehicles.filter(v => {
        const matchSearch = search === '' ||
            `${v.brand} ${v.model} ${v.year} ${v.color} ${v.categoryName} ${v.fuelType} ${v.bodyType} ${v.transmission}`
                .toLowerCase().includes(search.toLowerCase());
        const matchStatus = filters.status === 'ALL' || v.status === filters.status;
        const matchCondition = !filters.condition || v.condition === filters.condition;
        const matchFuel = !filters.fuelType || v.fuelType === filters.fuelType;
        const matchTransmission = !filters.transmission || v.transmission === filters.transmission;
        const matchMinPrice = !filters.minPrice || Number(v.price) >= Number(filters.minPrice);
        const matchMaxPrice = !filters.maxPrice || Number(v.price) <= Number(filters.maxPrice);
        const matchMinYear = !filters.minYear || v.year >= Number(filters.minYear);
        const matchMaxYear = !filters.maxYear || v.year <= Number(filters.maxYear);
        return matchSearch && matchStatus && matchCondition && matchFuel &&
            matchTransmission && matchMinPrice && matchMaxPrice && matchMinYear && matchMaxYear;
    });

    const hasActiveFilters = filters.status !== 'ALL' || filters.condition ||
        filters.fuelType || filters.transmission || filters.minPrice ||
        filters.maxPrice || filters.minYear || filters.maxYear;

    const statusColor = (status) => ({
        AVAILABLE: 'bg-green-100 text-green-700',
        RESERVED: 'bg-yellow-100 text-yellow-700',
        SOLD: 'bg-gray-100 text-gray-500',
    }[status] || 'bg-gray-100 text-gray-600');

    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white transition";

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Browse Vehicles</h2>
                <p className="text-sm text-gray-400">{filtered.length} of {vehicles.length} vehicles</p>
            </div>

            {/* Search + Filter Toggle */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input type="text" value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white"
                        placeholder="Search brand, model, fuel type, body type..." />
                </div>
                <button onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${showFilters || hasActiveFilters ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
                    <SlidersHorizontal size={16} />
                    <span className="hidden sm:block">Filters</span>
                    {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full" />}
                </button>
                {hasActiveFilters && (
                    <button onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition">
                        <X size={14} /> Clear
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
                    <h3 className="font-bold text-gray-700 text-sm">Filter Vehicles</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Status</label>
                            <select value={filters.status}
                                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className={selectClass}>
                                <option value="ALL">All Status</option>
                                <option value="AVAILABLE">Available</option>
                                <option value="RESERVED">Reserved</option>
                                <option value="SOLD">Sold</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Condition</label>
                            <select value={filters.condition}
                                onChange={e => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                                className={selectClass}>
                                <option value="">All Conditions</option>
                                <option value="BRAND_NEW">Brand New</option>
                                <option value="PRE_OWNED">Pre-Owned</option>
                                <option value="CERTIFIED_PRE_OWNED">Certified Pre-Owned</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Fuel Type</label>
                            <select value={filters.fuelType}
                                onChange={e => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
                                className={selectClass}>
                                <option value="">All Fuel Types</option>
                                <option value="Gasoline">Gasoline</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Transmission</label>
                            <select value={filters.transmission}
                                onChange={e => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                                className={selectClass}>
                                <option value="">All Transmissions</option>
                                <option value="Automatic">Automatic</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Price Range (₱)</label>
                        <div className="flex gap-2 items-center">
                            <input type="number" value={filters.minPrice}
                                onChange={e => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Min price" />
                            <span className="text-gray-400 text-sm">—</span>
                            <input type="number" value={filters.maxPrice}
                                onChange={e => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Max price" />
                        </div>
                    </div>

                    {/* Year Range */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Year Range</label>
                        <div className="flex gap-2 items-center">
                            <input type="number" value={filters.minYear}
                                onChange={e => setFilters(prev => ({ ...prev, minYear: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="From year" />
                            <span className="text-gray-400 text-sm">—</span>
                            <input type="number" value={filters.maxYear}
                                onChange={e => setFilters(prev => ({ ...prev, maxYear: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="To year" />
                        </div>
                    </div>
                </div>
            )}

            {/* Vehicle Grid */}
            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading vehicles...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <Car size={48} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400">No vehicles found</p>
                    {hasActiveFilters && (
                        <button onClick={clearFilters}
                            className="mt-3 text-red-600 font-semibold text-sm hover:underline">
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(v => (
                        <div key={v.id}
                            onClick={() => navigate(`/buyer/vehicles/${v.id}`)}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer group">
                            {v.imageUrls?.length > 0 ? (
                                <img src={getImageUrl(v.imageUrls[0])}
                                    alt={`${v.brand} ${v.model}`}
                                    className="w-full h-40 object-cover group-hover:scale-105 transition duration-300" />
                            ) : (
                                <div className="bg-gray-100 h-40 flex items-center justify-center">
                                    <Car size={48} className="text-gray-300" />
                                </div>
                            )}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{v.brand} {v.model}</h3>
                                        <p className="text-xs text-gray-400">{v.year} • {v.color} • {v.categoryName}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${statusColor(v.status)}`}>
                                        {v.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                    {v.fuelType && <span>⛽ {v.fuelType}</span>}
                                    {v.transmission && <span>⚙️ {v.transmission}</span>}
                                    {v.condition && <span>🏷️ {v.condition.replace(/_/g, ' ')}</span>}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-red-600 font-bold text-lg">₱{Number(v.price).toLocaleString()}</p>
                                    <div className="text-right">
                                        {v.quantity > 0 && v.status === 'AVAILABLE' && (
                                            <p className="text-xs text-gray-400">{v.quantity} unit{v.quantity !== 1 ? 's' : ''} left</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Catalog;