import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Eye, EyeOff, CheckCircle, Circle } from 'lucide-react';

function Register() {
    const [step, setStep] = useState(1);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        firstName: '', lastName: '', middleName: '',
        email: '', phone: '', password: '', confirmPassword: '',
        cityName: '', barangayName: '', streetNo: '', lotNo: '',
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/locations/cities').then(res => setCities(res.data.data));
    }, []);

    const handleCityChange = async (cityId) => {
        const city = cities.find(c => c.id === parseInt(cityId));
        setForm(prev => ({ ...prev, cityName: city?.name || '', barangayName: '' }));
        if (cityId) {
            const res = await api.get(`/locations/barangays/${cityId}`);
            setBarangays(res.data.data);
        }
    };

    const handle = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Password strength
    const pwChecks = {
        length: form.password.length >= 8,
        upper: /[A-Z]/.test(form.password),
        number: /[0-9]/.test(form.password),
        special: /[!@#$%^&*]/.test(form.password),
    };
    const pwStrength = Object.values(pwChecks).filter(Boolean).length;
    const pwStrengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];
    const pwStrengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][pwStrength];

    // Field progress
    const step1Fields = [form.firstName, form.lastName, form.email, form.phone];
    const step1Progress = Math.round((step1Fields.filter(Boolean).length / step1Fields.length) * 100);
    const step2Fields = [form.cityName, form.barangayName, form.password, form.confirmPassword];
    const step2Progress = Math.round((step2Fields.filter(Boolean).length / step2Fields.length) * 100);

    const handleSubmit = async () => {
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters!');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', {
                firstName: form.firstName,
                lastName: form.lastName,
                middleName: form.middleName,
                email: form.email,
                phone: form.phone,
                password: form.password,
                cityName: form.cityName,
                barangayName: form.barangayName,
                streetNo: form.streetNo,
                lotNo: form.lotNo,
            });
            const data = res.data.data;
            login({
                userId: data.userId,
                email: data.email,
                fullName: data.fullName,
                role: data.role,
                privileges: data.privileges,
            }, data.token);
            navigate('/buyer/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-red-600 flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-700 to-red-500 opacity-90" />
                <div className="relative z-10 text-center">
                    <img src="/logo.png" alt="Carpeso"
                        className="w-32 h-32 rounded-full mx-auto mb-8 object-cover border-4 border-white shadow-2xl" />
                    <h1 className="text-4xl font-bold text-white mb-4">Join Carpeso</h1>
                    <p className="text-red-100 text-lg max-w-sm italic">
                        "Drive the deal. Own the wheel."
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="flex justify-center mb-6 lg:hidden">
                        <img src="/logo.png" alt="Carpeso"
                            className="w-20 h-20 rounded-full object-cover border-4 border-red-600 shadow-lg" />
                    </div>

                    {/* Step Progress */}
                    <div className="flex items-center justify-center mb-6 gap-3">
                        {[1, 2].map((s, i) => (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {step > s ? '✓' : s}
                                </div>
                                {i < 1 && (
                                    <div className={`h-1 w-16 rounded transition ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {step === 1 ? 'Personal Info' : 'Address & Password'}
                            </h2>
                            <span className="text-xs text-gray-400">Step {step} of 2</span>
                        </div>

                        {/* Field Progress Bar */}
                        <div className="mb-5">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Form Progress</span>
                                <span>{step === 1 ? step1Progress : step2Progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${step === 1 ? step1Progress : step2Progress}%` }}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>
                                        First Name * {form.firstName && <span className="text-green-500">✓</span>}
                                    </label>
                                    <input name="firstName" value={form.firstName}
                                        onChange={handle}
                                        className={`${inputClass} ${form.firstName ? 'border-green-400' : ''}`}
                                        placeholder="Juan" />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Last Name * {form.lastName && <span className="text-green-500">✓</span>}
                                    </label>
                                    <input name="lastName" value={form.lastName}
                                        onChange={handle}
                                        className={`${inputClass} ${form.lastName ? 'border-green-400' : ''}`}
                                        placeholder="Dela Cruz" />
                                </div>
                                <div>
                                    <label className={labelClass}>Middle Name</label>
                                    <input name="middleName" value={form.middleName}
                                        onChange={handle}
                                        className={inputClass}
                                        placeholder="Santos (optional)" />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Email Address * {form.email && <span className="text-green-500">✓</span>}
                                    </label>
                                    <input name="email" type="email"
                                        value={form.email}
                                        onChange={handle}
                                        className={`${inputClass} ${form.email ? 'border-green-400' : ''}`}
                                        placeholder="juan@email.com" />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Phone Number * {form.phone && <span className="text-green-500">✓</span>}
                                    </label>
                                    <input name="phone" value={form.phone}
                                        onChange={e => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                                        className={`${inputClass} ${form.phone ? 'border-green-400' : ''}`}
                                        placeholder="09171234567" maxLength={11} />
                                </div>
                                <button
                                    onClick={() => {
                                        if (!form.firstName || !form.lastName || !form.email || !form.phone) {
                                            setError('Please fill all required fields!');
                                            return;
                                        }
                                        setError('');
                                        setStep(2);
                                    }}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-wider transition mt-2"
                                >
                                    Next →
                                </button>
                                <p className="text-center text-sm text-gray-500">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-red-600 font-bold hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>
                                        City * {form.cityName && <span className="text-green-500">✓</span>}
                                    </label>
                                    <select
                                        onChange={e => handleCityChange(e.target.value)}
                                        className={`${inputClass} ${form.cityName ? 'border-green-400' : ''}`}
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Barangay * {form.barangayName && <span className="text-green-500">✓</span>}
                                    </label>
                                    <select
                                        name="barangayName"
                                        value={form.barangayName}
                                        onChange={handle}
                                        className={`${inputClass} ${form.barangayName ? 'border-green-400' : ''}`}
                                    >
                                        <option value="">Select Barangay</option>
                                        {barangays.map(b => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Street / Address</label>
                                    <input name="streetNo" value={form.streetNo}
                                        onChange={handle}
                                        className={inputClass}
                                        placeholder="123 Main Street (optional)" />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Password * {form.password && <span className="text-green-500">✓</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={handle}
                                            className={`${inputClass} pr-11 ${form.password ? 'border-green-400' : ''}`}
                                            placeholder="Min. 8 characters"
                                        />
                                        <button type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {/* Password Strength */}
                                    {form.password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[1,2,3,4].map(i => (
                                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength ? pwStrengthColor : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                            <p className={`text-xs font-semibold ${pwStrength <= 1 ? 'text-red-500' : pwStrength === 2 ? 'text-orange-400' : pwStrength === 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                Password Strength: {pwStrengthLabel}
                                            </p>
                                            <div className="grid grid-cols-2 gap-1 mt-2">
                                                {[
                                                    { check: pwChecks.length, label: 'Min. 8 characters' },
                                                    { check: pwChecks.upper, label: 'Uppercase letter' },
                                                    { check: pwChecks.number, label: 'Number' },
                                                    { check: pwChecks.special, label: 'Special character' },
                                                ].map(({ check, label }) => (
                                                    <div key={label} className={`flex items-center gap-1 text-xs ${check ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {check ? <CheckCircle size={12} /> : <Circle size={12} />}
                                                        <span>{label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Confirm Password * {form.confirmPassword && <span className="text-green-500">✓</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="confirmPassword"
                                            type={showConfirm ? 'text' : 'password'}
                                            value={form.confirmPassword}
                                            onChange={handle}
                                            className={`${inputClass} pr-11 ${form.confirmPassword && form.confirmPassword === form.password ? 'border-green-400' : form.confirmPassword ? 'border-red-400' : ''}`}
                                            placeholder="Re-enter password"
                                        />
                                        <button type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {form.confirmPassword && (
                                        <p className={`text-xs mt-1 font-semibold ${form.confirmPassword === form.password ? 'text-green-500' : 'text-red-500'}`}>
                                            {form.confirmPassword === form.password ? '✓ Passwords match' : '✗ Passwords do not match'}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-wider transition disabled:opacity-60"
                                    >
                                        {loading ? 'Creating...' : 'Create Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;