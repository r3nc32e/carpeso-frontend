import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';

function Login() {
    const [step, setStep] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.data.otpRequired) {
                setOtpCode(res.data.data.otpCode);
                setStep('otp');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed!');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email, otp });
            const data = res.data.data;
            login({
                userId: data.userId,
                email: data.email,
                fullName: data.fullName,
                role: data.role,
                privileges: data.privileges,
            }, data.token);
            if (data.role === 'BUYER') navigate('/buyer/dashboard');
            else navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-red-600 flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-700 to-red-500 opacity-90" />
                <div className="relative z-10 text-center">
                    <img src="/logo.png" alt="Carpeso"
                        className="w-32 h-32 rounded-full mx-auto mb-8 object-cover border-4 border-white shadow-2xl" />
                    <h1 className="text-4xl font-bold text-white mb-4">Welcome to Carpeso</h1>
                    <p className="text-red-100 text-lg max-w-sm italic">
                        "Drive the deal. Own the wheel."
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="flex justify-center mb-8 lg:hidden">
                        <img src="/logo.png" alt="Carpeso"
                            className="w-20 h-20 rounded-full object-cover border-4 border-red-600 shadow-lg" />
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-6 gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 'login' ? 'bg-red-600 text-white' : 'bg-green-500 text-white'}`}>
                            {step === 'login' ? '1' : '✓'}
                        </div>
                        <div className={`h-1 w-16 rounded ${step === 'otp' ? 'bg-red-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === 'otp' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            2
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {step === 'login' ? 'Sign In' : 'Verify OTP'}
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            {step === 'login'
                                ? 'Enter your credentials to access your account'
                                : 'Enter the OTP sent to your email'}
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}

                        {step === 'login' ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                        placeholder="juan@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition pr-11"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-wider transition disabled:opacity-60 mt-2"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                                <p className="text-center text-sm text-gray-500 pt-2">
                                    No account?{' '}
                                    <Link to="/register" className="text-red-600 font-bold hover:underline">
                                        Register here
                                    </Link>
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                                    📧 Your OTP Code: <strong className="text-2xl tracking-widest">{otpCode}</strong>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        OTP Code
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        required
                                        maxLength={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-3xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                        placeholder="000000"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-wider transition disabled:opacity-60"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('login')}
                                    className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold"
                                >
                                    ← Back to Login
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;