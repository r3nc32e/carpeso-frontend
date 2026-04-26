import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Eye, EyeOff, CheckCircle, Circle } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';


function Register() {
    usePageTitle('Register');
    const [step, setStep] = useState(1);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [otp, setOtp] = useState('');

    const [form, setForm] = useState({
        firstName: '', lastName: '', middleName: '', suffix: '',
        email: '', phone: '', password: '', confirmPassword: '',
        cityName: '', barangayName: '', streetNo: '', lotNo: '',
        agreedToTerms: false,
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

    const pwChecks = {
        length: form.password.length >= 8,
        upper: /[A-Z]/.test(form.password),
        number: /[0-9]/.test(form.password),
        special: /[!@#$%^&*]/.test(form.password),
    };
    const pwStrength = Object.values(pwChecks).filter(Boolean).length;
    const pwStrengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];
    const pwStrengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][pwStrength];

    const step1Fields = [form.firstName, form.lastName, form.email, form.phone];
    const step1Progress = Math.round((step1Fields.filter(Boolean).length / step1Fields.length) * 100);
    const step2Fields = [form.cityName, form.barangayName, form.password, form.confirmPassword];
    const step2Progress = Math.round((step2Fields.filter(Boolean).length / step2Fields.length) * 100);

    const handleSubmit = async () => {
        if (!form.agreedToTerms) {
            setError('You must agree to the Terms and Conditions to register!');
            return;
        }
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
                suffix: form.suffix,
                email: form.email,
                phone: form.phone,
                password: form.password,
                cityName: form.cityName,
                barangayName: form.barangayName,
                streetNo: form.streetNo,
                lotNo: form.lotNo,
            });
            setRegisteredEmail(form.email);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-registration', {
                email: registeredEmail,
                otp,
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
            setError(err.response?.data?.message || 'Invalid OTP!');
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
                        {[1, 2, 3].map((s, i) => (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {step > s ? '✓' : s}
                                </div>
                                {i < 2 && (
                                    <div className={`h-1 w-12 rounded transition ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {step === 1 ? 'Personal Info' : step === 2 ?  'Address & Password' : 'Verify Email'}
                            </h2>
                            <span className="text-xs text-gray-400">Step {step} of 3</span>
                        </div>

                        {step < 3 && (
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
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Step 1 — Personal Info */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>First Name *</label>
                                    <input name="firstName" value={form.firstName}
                                        onChange={handle} className={`${inputClass} ${form.firstName ? 'border-green-400' : ''}`}
                                        placeholder="Juan" />
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name *</label>
                                    <input name="lastName" value={form.lastName}
                                        onChange={handle} className={`${inputClass} ${form.lastName ? 'border-green-400' : ''}`}
                                        placeholder="Dela Cruz" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Middle Name</label>
                                        <input name="middleName" value={form.middleName}
                                            onChange={handle} className={inputClass}
                                            placeholder="Santos (optional)" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Suffix</label>
                                        <select name="suffix" value={form.suffix}
                                            onChange={handle} className={inputClass}>
                                            <option value="">None</option>
                                            <option value="Jr.">Jr.</option>
                                            <option value="Sr.">Sr.</option>
                                            <option value="II">II</option>
                                            <option value="III">III</option>
                                            <option value="IV">IV</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Email Address *</label>
                                    <input name="email" type="email" value={form.email}
                                        onChange={handle}
                                        className={`${inputClass} ${form.email ? 'border-green-400' : ''}`}
                                        placeholder="juan@gmail.com" />
                                    <p className="text-xs text-gray-400 mt-1">
                                        📧 A verification code will be sent to this email
                                    </p>
                                </div>
                                <div>
                                    <label className={labelClass}>Phone Number *</label>
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
                                    <Link to="/login" className="text-red-600 font-bold hover:underline">Sign in</Link>
                                </p>
                            </div>
                        )}

                        {/* Step 2 — Address & Password */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>City *</label>
                                    <select onChange={e => handleCityChange(e.target.value)}
                                        className={`${inputClass} ${form.cityName ? 'border-green-400' : ''}`}>
                                        <option value="">Select City</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Barangay *</label>
                                    <select name="barangayName" value={form.barangayName}
                                        onChange={handle}
                                        className={`${inputClass} ${form.barangayName ? 'border-green-400' : ''}`}>
                                        <option value="">Select Barangay</option>
                                        {barangays.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Street / Address</label>
                                    <input name="streetNo" value={form.streetNo}
                                        onChange={handle} className={inputClass}
                                        placeholder="123 Main Street (optional)" />
                                </div>
                                <div>
                                    <label className={labelClass}>Password * {form.password && <span className="text-green-500">✓</span>}</label>
                                    <div className="relative">
                                        <input name="password" type={showPassword ? 'text' : 'password'}
                                            value={form.password} onChange={handle}
                                            className={`${inputClass} pr-11 ${form.password ? 'border-green-400' : ''}`}
                                            placeholder="Min. 8 characters" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
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
                                    <label className={labelClass}>Confirm Password * {form.confirmPassword && <span className="text-green-500">✓</span>}</label>
                                    <div className="relative">
                                        <input name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                                            value={form.confirmPassword} onChange={handle}
                                            className={`${inputClass} pr-11 ${form.confirmPassword && form.confirmPassword === form.password ? 'border-green-400' : form.confirmPassword ? 'border-red-400' : ''}`}
                                            placeholder="Re-enter password" />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
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
                                {/* Terms Agreement */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.agreedToTerms}
                                            onChange={e => setForm(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                                            className="w-4 h-4 mt-0.5 accent-red-600 flex-shrink-0"
                                        />
                                        <span className="text-xs text-gray-600 leading-relaxed">
                                            I have read and agree to the{' '}
                                            <a href="/terms" target="_blank"
                                                className="text-red-600 font-bold hover:underline">
                                                Terms and Conditions
                                            </a>{' '}
                                            and{' '}
                                            <a href="/privacy" target="_blank"
                                                className="text-red-600 font-bold hover:underline">
                                                Privacy Policy
                                            </a>{' '}
                                            of Carpeso. I consent to the collection and processing of my personal
                                            data in accordance with the Data Privacy Act of 2012 (R.A. 10173).
                                        </span>
                                    </label>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setStep(1)}
                                        className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                        ← Back
                                    </button>
                                    <button onClick={handleSubmit} disabled={loading}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                        {loading ? 'Creating...' : 'Create Account'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3 — Email OTP Verification */}
                        {step === 3 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                                    📧 We sent a 6-digit verification code to:<br />
                                    <strong>{registeredEmail}</strong>
                                </div>
                                <div>
                                    <label className={labelClass}>Verification Code *</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        required
                                        maxLength={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-3xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                        placeholder="000000"
                                    />
                                    <p className="text-xs text-gray-400 mt-1 text-center">
                                        Code expires in 10 minutes
                                    </p>
                                </div>
                                <button type="submit" disabled={loading || otp.length < 6}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                    {loading ? 'Verifying...' : 'Verify Email'}
                                </button>
                                <button type="button"
                                    onClick={async () => {
                                        try {
                                            await api.post('/auth/forgot-password', { email: registeredEmail });
                                            setError('');
                                            alert('New OTP sent!');
                                        } catch (err) {
                                            setError('Failed to resend OTP!');
                                        }
                                    }}
                                    className="w-full py-2 text-sm text-red-600 hover:underline">
                                    Didn't receive the code? Resend
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;