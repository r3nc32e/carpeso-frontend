import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Shield, Star, ArrowRight, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import usePageTitle from '../hooks/usePageTitle';

const IMG_BASE = 'http://localhost:8080/api/files';

function Landing() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    usePageTitle('');

    useEffect(() => { fetchVehicles(); }, []);

    useEffect(() => {
        if (vehicles.length > 0) {
            const interval = setInterval(() => {
                setCurrentSlide(i => (i + 1) % Math.min(vehicles.length, 3));
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [vehicles]);

    const fetchVehicles = async () => {
        try {
            const res = await api.get('/public/vehicles');
            setVehicles(res.data.data || []);
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

    const featuredVehicles = vehicles.slice(0, 6);
    const heroVehicles = vehicles.filter(v => v.status === 'AVAILABLE').slice(0, 3);

    const statusColor = (status) => ({
        AVAILABLE: 'bg-green-100 text-green-700',
        RESERVED: 'bg-yellow-100 text-yellow-700',
        SOLD: 'bg-gray-100 text-gray-500',
    }[status] || 'bg-gray-100 text-gray-600');

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <header className="bg-red-600 text-white fixed top-0 left-0 right-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Carpeso"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white" />
                        <span className="font-bold text-lg hidden sm:block">Carpeso</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#featured" className="text-red-100 hover:text-white text-sm font-semibold transition">Vehicles</a>
                        <a href="#why" className="text-red-100 hover:text-white text-sm font-semibold transition">Why Us</a>
                        <a href="#how" className="text-red-100 hover:text-white text-sm font-semibold transition">How It Works</a>
                    </nav>
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={() => navigate('/login')}
                            className="px-4 py-2 text-sm font-bold text-white border border-white rounded-xl hover:bg-red-700 transition">
                            Sign In
                        </button>
                        <button onClick={() => navigate('/register')}
                            className="px-4 py-2 text-sm font-bold bg-white text-red-600 rounded-xl hover:bg-red-50 transition">
                            Register
                        </button>
                    </div>
                    <button onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-red-700 transition">
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                {mobileOpen && (
                    <div className="md:hidden border-t border-red-500 px-4 py-3 space-y-2">
                        <a href="#featured" onClick={() => setMobileOpen(false)}
                            className="block text-red-100 hover:text-white text-sm font-semibold py-2">Vehicles</a>
                        <a href="#why" onClick={() => setMobileOpen(false)}
                            className="block text-red-100 hover:text-white text-sm font-semibold py-2">Why Us</a>
                        <a href="#how" onClick={() => setMobileOpen(false)}
                            className="block text-red-100 hover:text-white text-sm font-semibold py-2">How It Works</a>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => navigate('/login')}
                                className="flex-1 py-2 text-sm font-bold text-white border border-white rounded-xl hover:bg-red-700 transition">
                                Sign In
                            </button>
                            <button onClick={() => navigate('/register')}
                                className="flex-1 py-2 text-sm font-bold bg-white text-red-600 rounded-xl hover:bg-red-50 transition">
                                Register
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="pt-16 bg-gradient-to-br from-red-600 via-red-700 to-gray-900 min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-white">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            Drive the Deal.<br />
                            <span className="text-red-300">Own the Wheel.</span>
                        </h1>
                        <p className="text-red-100 text-lg mb-8 leading-relaxed">
                            Find your dream car at Carpeso — your trusted automotive marketplace in the Philippines.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => navigate('/register')}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-red-600 rounded-2xl font-bold text-lg hover:bg-red-50 transition shadow-lg">
                                Get Started <ArrowRight size={20} />
                            </button>
                            <button onClick={() => { document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }); }}
                                className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-red-600 transition">
                                Browse Vehicles <Car size={20} />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-6 mt-12">
                            {[
                                { value: `${vehicles.length}+`, label: 'Vehicles' },
                                { value: 'NCR', label: 'Coverage' },
                                { value: '24/7', label: 'Support' },
                            ].map(stat => (
                                <div key={stat.label}>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                    <p className="text-red-300 text-sm">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero Carousel */}
                    <div className="relative">
                        {heroVehicles.length > 0 ? (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                {heroVehicles.map((v, i) => (
                                    <div key={v.id}
                                        className={`transition-opacity duration-700 ${i === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                                        {v.imageUrls?.length > 0 ? (
                                            <img src={getImageUrl(v.imageUrls[0])} alt={`${v.brand} ${v.model}`}
                                                className="w-full h-72 sm:h-96 object-cover" />
                                        ) : (
                                            <div className="w-full h-72 sm:h-96 bg-gray-800 flex items-center justify-center">
                                                <Car size={80} className="text-gray-600" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                                            <p className="text-white font-bold text-xl">{v.brand} {v.model}</p>
                                            <p className="text-gray-300 text-sm">{v.year} • ₱{Number(v.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {heroVehicles.length > 1 && (
                                    <>
                                        <button onClick={() => setCurrentSlide(i => i === 0 ? heroVehicles.length - 1 : i - 1)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80 transition">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button onClick={() => setCurrentSlide(i => (i + 1) % heroVehicles.length)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80 transition">
                                            <ChevronRight size={20} />
                                        </button>
                                        <div className="absolute bottom-16 right-4 flex gap-1">
                                            {heroVehicles.map((_, i) => (
                                                <button key={i} onClick={() => setCurrentSlide(i)}
                                                    className={`w-2 h-2 rounded-full transition ${i === currentSlide ? 'bg-white' : 'bg-white bg-opacity-40'}`} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-gray-800 h-72 sm:h-96 flex items-center justify-center">
                                <Car size={80} className="text-gray-600" />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Why Us */}
            <section id="why" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Carpeso?</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">We make car buying simple, safe, and transparent.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            { icon: <Shield size={32} />, title: 'Secure Transactions', desc: 'Every purchase is protected with JWT authentication, OTP verification, and AES-256 encryption.' },
                            { icon: <Car size={32} />, title: 'Quality Vehicles', desc: 'Brand new, pre-owned, and certified pre-owned vehicles — all verified and inspected.' },
                            { icon: <Star size={32} />, title: 'Warranty Included', desc: 'Every vehicle comes with a warranty. File claims easily through our platform.' },
                        ].map(item => (
                            <div key={item.title} className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition">
                                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Vehicles — ALL including reserved/sold */}
            <section id="featured" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Featured Vehicles</h2>
                            <p className="text-gray-500 mt-2">Browse our inventory</p>
                        </div>
                        <button onClick={() => navigate('/login')}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition">
                            View All <ArrowRight size={16} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-16 text-gray-400">Loading vehicles...</div>
                    ) : featuredVehicles.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">No vehicles available</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredVehicles.map(v => (
                                <div key={v.id}
                                    onClick={() => navigate(`/vehicles/${v.id}`)}
                                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer group">
                                    {v.imageUrls?.length > 0 ? (
                                        <img src={getImageUrl(v.imageUrls[0])} alt={`${v.brand} ${v.model}`}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
                                    ) : (
                                        <div className="bg-gray-100 h-48 flex items-center justify-center">
                                            <Car size={48} className="text-gray-300" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{v.brand} {v.model}</h3>
                                                <p className="text-xs text-gray-400">{v.year} • {v.color} • {v.categoryName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <p className="text-red-600 font-bold text-xl">₱{Number(v.price).toLocaleString()}</p>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(v.status)}`}>
                                                    {v.status}
                                                </span>
                                                {v.quantity > 0 && v.status === 'AVAILABLE' && (
                                                    <p className="text-xs text-gray-400 mt-1">{v.quantity} unit{v.quantity !== 1 ? 's' : ''} left</p>
                                                )}
                                            </div>
                                        </div>
                                        {v.status === 'AVAILABLE' ? (
                                            <button
                                                onClick={e => { e.stopPropagation(); navigate('/register'); }}
                                                className="mt-3 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition">
                                                Login to Reserve
                                            </button>
                                        ) : (
                                            <div className={`mt-3 w-full py-2 rounded-xl text-xs font-bold text-center ${
                                                v.status === 'RESERVED' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {v.status === 'RESERVED' ? '🔒 Reserved' : '✅ Sold'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works */}
            <section id="how" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-500">Simple steps to own your dream car</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        {[
                            { step: '01', title: 'Register', desc: 'Create your account with email verification.' },
                            { step: '02', title: 'Browse', desc: 'Explore our inventory of quality vehicles.' },
                            { step: '03', title: 'Reserve', desc: 'Reserve your chosen vehicle within 48 hours.' },
                            { step: '04', title: 'Own It', desc: 'Complete the transaction and receive your vehicle with warranty.' },
                        ].map((item, i) => (
                            <div key={item.step} className="text-center relative">
                                <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                    {item.step}
                                </div>
                                {i < 3 && (
                                    <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-red-200" />
                                )}
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
                <div className="max-w-4xl mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Drive Your Dream Car?</h2>
                    <p className="text-red-100 text-lg mb-8">Join thousands of happy buyers at Carpeso.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => navigate('/register')}
                            className="px-8 py-4 bg-white text-red-600 rounded-2xl font-bold text-lg hover:bg-red-50 transition shadow-lg">
                            Create Account
                        </button>
                        <button onClick={() => navigate('/login')}
                            className="px-8 py-4 border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-red-600 transition">
                            Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img src="/logo.png" alt="Carpeso" className="w-8 h-8 rounded-full object-cover border border-gray-600" />
                        <span className="text-white font-bold">Carpeso</span>
                    </div>
                    <p className="text-sm italic text-gray-500 mb-2">"Drive the deal. Own the wheel."</p>
                    <p className="text-xs">© 2026 Carpeso — All Rights Reserved</p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;