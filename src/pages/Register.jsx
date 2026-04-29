import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Eye, EyeOff, CheckCircle, Circle, Upload } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

function Register() {
    usePageTitle('Register');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [primaryIdName, setPrimaryIdName] = useState('');
    const [secondaryIdName, setSecondaryIdName] = useState('');
    const [primaryIdFile, setPrimaryIdFile] = useState(null);
    const [secondaryIdFile, setSecondaryIdFile] = useState(null);

    const [form, setForm] = useState({
        firstName: '', lastName: '', middleName: '', suffix: '',
        email: '', phone: '',
        password: '', confirmPassword: '',
        cityName: '', barangayName: '', streetNo: '',
        agreedToTerms: false,
    });

    const { login } = useAuth();
    const navigate = useNavigate();
    const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    useEffect(() => {
        api.get('/locations/cities').then(res => setCities(res.data.data || []));
    }, []);

    const handleCityChange = async (cityId) => {
        const city = cities.find(c => c.id === parseInt(cityId));
        setForm(prev => ({ ...prev, cityName: city?.name || '', barangayName: '' }));
        if (cityId) {
            const res = await api.get(`/locations/barangays/${cityId}`);
            setBarangays(res.data.data || []);
        }
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

    const handleStep1Next = () => {
        if (!form.firstName || !form.lastName || !form.email || !form.phone) {
            setError('Please fill all required fields!'); return;
        }
        setError(''); setStep(2);
    };

    const handleStep2Next = () => {
        if (!form.password || !form.confirmPassword) {
            setError('Please fill all required fields!'); return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match!'); return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters!'); return;
        }
        if (!form.agreedToTerms) {
            setError('You must agree to the Terms and Conditions!'); return;
        }
        setError(''); setStep(3);
    };

    const handleStep3Next = () => {
        if (!primaryIdFile || !secondaryIdFile) {
            setError('Please upload both IDs to continue!'); return;
        }
        setError('');
        handleSubmit();
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/auth/register', {
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
            });
            setRegisteredEmail(form.email);
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed!');
            setStep(3);
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
                email: registeredEmail, otp,
            });
            const data = res.data.data;

            if (primaryIdFile) {
                try {
                    const fd1 = new FormData();
                    fd1.append('file', primaryIdFile);
                    await fetch('http://localhost:8080/api/buyer/profile/id/primary', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${data.token}` },
                        body: fd1,
                    });
                } catch (e) { console.log('Primary ID upload failed:', e); }
            }
            if (secondaryIdFile) {
                try {
                    const fd2 = new FormData();
                    fd2.append('file', secondaryIdFile);
                    await fetch('http://localhost:8080/api/buyer/profile/id/secondary', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${data.token}` },
                        body: fd2,
                    });
                } catch (e) { console.log('Secondary ID upload failed:', e); }
            }

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

    const steps = [
        { step: 1, label: 'Personal Info' },
        { step: 2, label: 'Password & Terms' },
        { step: 3, label: 'Address & IDs' },
        { step: 4, label: 'Verify Email' },
    ];

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-red-600 flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-700 to-red-500 opacity-90" />
                <div className="relative z-10 text-center">
                    <img src="/logo.png" alt="Carpeso"
                        className="w-32 h-32 rounded-full mx-auto mb-8 object-cover border-4 border-white shadow-2xl" />
                    <h1 className="text-4xl font-bold text-white mb-4">Join Carpeso</h1>
                    <p className="text-red-100 text-lg max-w-sm italic">"Drive the deal. Own the wheel."</p>
                    <div className="mt-8 text-left bg-red-700 bg-opacity-50 rounded-2xl p-6 space-y-3">
                        {steps.map(s => (
                            <div key={s.step} className={`flex items-center gap-3 ${step >= s.step ? 'text-white' : 'text-red-300'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step > s.step ? 'bg-green-500' : step === s.step ? 'bg-white text-red-600' : 'bg-red-500'}`}>
                                    {step > s.step ? '✓' : s.step}
                                </div>
                                <span className="text-sm font-semibold">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8 overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-6 lg:hidden">
                        <img src="/logo.png" alt="Carpeso"
                            className="w-20 h-20 rounded-full object-cover border-4 border-red-600 shadow-lg" />
                    </div>

                    <div className="flex items-center justify-center mb-6 gap-2">
                        {[1, 2, 3, 4].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {step > s ? '✓' : s}
                                </div>
                                {i < 3 && <div className={`h-1 w-6 rounded transition ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {step === 1 ? 'Personal Info' :
                                 step === 2 ? 'Password & Terms' :
                                 step === 3 ? 'Address & IDs' : 'Verify Email'}
                            </h2>
                            <span className="text-xs text-gray-400">Step {step} of 4</span>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>First Name *</label>
                                    <input name="firstName" value={form.firstName} onChange={handle}
                                        className={`${inputClass} ${form.firstName ? 'border-green-400' : ''}`}
                                        placeholder="Juan" />
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name *</label>
                                    <input name="lastName" value={form.lastName} onChange={handle}
                                        className={`${inputClass} ${form.lastName ? 'border-green-400' : ''}`}
                                        placeholder="Dela Cruz" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Middle Name</label>
                                        <input name="middleName" value={form.middleName} onChange={handle}
                                            className={inputClass} placeholder="Santos" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Suffix</label>
                                        <select name="suffix" value={form.suffix} onChange={handle} className={inputClass}>
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
                                    <input name="email" type="email" value={form.email} onChange={handle}
                                        className={`${inputClass} ${form.email ? 'border-green-400' : ''}`}
                                        placeholder="juan@gmail.com" />
                                    <p className="text-xs text-gray-400 mt-1">📧 Verification code will be sent here</p>
                                </div>
                                <div>
                                    <label className={labelClass}>Phone Number *</label>
                                    <input name="phone" value={form.phone}
                                        onChange={e => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                                        className={`${inputClass} ${form.phone ? 'border-green-400' : ''}`}
                                        placeholder="09171234567" maxLength={11} />
                                </div>
                                <button onClick={handleStep1Next}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition mt-2">
                                    Next →
                                </button>
                                <p className="text-center text-sm text-gray-500">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-red-600 font-bold hover:underline">Sign in</Link>
                                </p>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Password *</label>
                                    <div className="relative">
                                        <input name="password" type={showPassword ? 'text' : 'password'}
                                            value={form.password} onChange={handle}
                                            className={`${inputClass} pr-11 ${form.password ? 'border-green-400' : ''}`}
                                            placeholder="Min. 8 characters" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-gray-400">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {form.password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[1,2,3,4].map(i => (
                                                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= pwStrength ? pwStrengthColor : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                            <p className={`text-xs font-semibold ${pwStrength <= 1 ? 'text-red-500' : pwStrength === 2 ? 'text-orange-400' : pwStrength === 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                Password Strength: {pwStrengthLabel}
                                            </p>
                                            <div className="grid grid-cols-2 gap-1 mt-1">
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
                                    <label className={labelClass}>Confirm Password *</label>
                                    <div className="relative">
                                        <input name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                                            value={form.confirmPassword} onChange={handle}
                                            className={`${inputClass} pr-11 ${form.confirmPassword && form.confirmPassword === form.password ? 'border-green-400' : form.confirmPassword ? 'border-red-400' : ''}`}
                                            placeholder="Re-enter password" />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-2.5 text-gray-400">
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {form.confirmPassword && (
                                        <p className={`text-xs mt-1 font-semibold ${form.confirmPassword === form.password ? 'text-green-500' : 'text-red-500'}`}>
                                            {form.confirmPassword === form.password ? '✓ Passwords match' : '✗ Do not match'}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={form.agreedToTerms}
                                            onChange={e => setForm(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                                            className="w-4 h-4 mt-0.5 accent-red-600 flex-shrink-0" />
                                        <span className="text-xs text-gray-600 leading-relaxed">
                                            I have read and agree to the{' '}
                                            <a href="/terms" target="_blank" className="text-red-600 font-bold hover:underline">Terms and Conditions</a>
                                            {' '}and{' '}
                                            <a href="/privacy" target="_blank" className="text-red-600 font-bold hover:underline">Privacy Policy</a>
                                            {' '}of Carpeso. I consent to the collection and processing of my personal data in accordance with R.A. 10173.
                                        </span>
                                    </label>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => { setStep(1); setError(''); }}
                                        className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                        ← Back
                                    </button>
                                    <button onClick={handleStep2Next}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-700 mb-3">
                                        📍 Delivery Address
                                        <span className="text-xs text-gray-400 font-normal ml-1">(saved as Address 1)</span>
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <label className={labelClass}>City / Municipality</label>
                                            <select onChange={e => handleCityChange(e.target.value)}
                                                className={`${inputClass} ${form.cityName ? 'border-green-400' : ''}`}>
                                                <option value="">Select City</option>
                                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Barangay</label>
                                            <select name="barangayName" value={form.barangayName}
                                                onChange={handle}
                                                disabled={!form.cityName}
                                                className={`${inputClass} ${form.barangayName ? 'border-green-400' : ''} disabled:bg-gray-50 disabled:text-gray-400`}>
                                                <option value="">Select Barangay</option>
                                                {barangays.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Street / House No.</label>
                                            <input name="streetNo" value={form.streetNo} onChange={handle}
                                                className={inputClass} placeholder="123 Main Street (optional)" />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                <div>
                                    <p className="text-sm font-bold text-gray-700 mb-3">
                                        🪪 Government IDs
                                        <span className="text-xs text-red-500 font-normal ml-1">* Required</span>
                                    </p>
                                    <div className="mb-3">
                                        <label className={labelClass}>
                                            Primary ID — Driver's License *
                                            {primaryIdName && <span className="text-green-500 ml-2">✓</span>}
                                        </label>
                                        <label className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${primaryIdName ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-red-400'}`}>
                                            {primaryIdName ? (
                                                <div>
                                                    <p className="text-green-600 font-semibold text-sm">✅ {primaryIdName}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Click to change</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Upload size={20} className="mx-auto mb-1 text-gray-400" />
                                                    <p className="text-gray-500 text-sm font-semibold">Upload Driver's License</p>
                                                    <p className="text-gray-400 text-xs mt-0.5">JPG, PNG, PDF • Max 5MB</p>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*,.pdf" className="hidden"
                                                onChange={e => {
                                                    if (e.target.files[0]) {
                                                        setPrimaryIdName(e.target.files[0].name);
                                                        setPrimaryIdFile(e.target.files[0]);
                                                    }
                                                }} />
                                        </label>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Secondary ID — PhilSys / TIN / Passport *
                                            {secondaryIdName && <span className="text-green-500 ml-2">✓</span>}
                                        </label>
                                        <label className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${secondaryIdName ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-red-400'}`}>
                                            {secondaryIdName ? (
                                                <div>
                                                    <p className="text-green-600 font-semibold text-sm">✅ {secondaryIdName}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Click to change</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Upload size={20} className="mx-auto mb-1 text-gray-400" />
                                                    <p className="text-gray-500 text-sm font-semibold">Upload Secondary ID</p>
                                                    <p className="text-gray-400 text-xs mt-0.5">PhilSys, TIN, Passport, UMID • Max 5MB</p>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*,.pdf" className="hidden"
                                                onChange={e => {
                                                    if (e.target.files[0]) {
                                                        setSecondaryIdName(e.target.files[0].name);
                                                        setSecondaryIdFile(e.target.files[0]);
                                                    }
                                                }} />
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs">
                                    🔒 Your IDs are stored securely in compliance with R.A. 10173.
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => { setStep(2); setError(''); }}
                                        className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                        ← Back
                                    </button>
                                    <button onClick={handleStep3Next} disabled={loading}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                        {loading ? 'Creating Account...' : 'Next →'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                                    📧 We sent a 6-digit verification code to:<br />
                                    <strong>{registeredEmail}</strong>
                                </div>
                                <div>
                                    <label className={labelClass}>Verification Code *</label>
                                    <input type="text" value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        required maxLength={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-3xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                        placeholder="000000" />
                                    <p className="text-xs text-gray-400 mt-1 text-center">Code expires in 10 minutes</p>
                                </div>
                                <button type="submit" disabled={loading || otp.length < 6}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                    {loading ? 'Verifying...' : 'Verify & Complete Registration'}
                                </button>
                                <button type="button"
                                    onClick={async () => {
                                        try {
                                            await api.post('/auth/forgot-password', { email: registeredEmail });
                                            alert('New OTP sent!');
                                        } catch { setError('Failed to resend OTP!'); }
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