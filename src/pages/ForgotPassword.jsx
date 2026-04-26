import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

function ForgotPassword() {
    usePageTitle('Forgot Password');
    
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setSuccess('OTP sent!');
            setStep('otp');
        } catch (err) {
            setError(err.response?.data?.message || 'Email not found!');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setStep('reset');
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters!');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email,
                otp,
                newPassword,
            });
            setSuccess('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password!');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['email', 'otp', 'reset'];
    const currentStep = steps.indexOf(step) + 1;

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-red-600 flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-700 to-red-500 opacity-90" />
                <div className="relative z-10 text-center">
                    <img src="/logo.png" alt="Carpeso"
                        className="w-32 h-32 rounded-full mx-auto mb-8 object-cover border-4 border-white shadow-2xl" />
                    <h1 className="text-4xl font-bold text-white mb-4">Reset Password</h1>
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
                        {[1, 2, 3].map((s, i) => (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition ${currentStep > s ? 'bg-green-500 text-white' : currentStep === s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {currentStep > s ? '✓' : s}
                                </div>
                                {i < 2 && (
                                    <div className={`h-1 w-12 rounded transition ${currentStep > s ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {step === 'email' && 'Forgot Password'}
                            {step === 'otp' && 'Verify OTP'}
                            {step === 'reset' && 'New Password'}
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            {step === 'email' && 'Enter your email to receive an OTP'}
                            {step === 'otp' && 'Enter the OTP sent to your email'}
                            {step === 'reset' && 'Enter your new password'}
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {success && step === 'email' && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-5 text-sm">
                                ✅ {success}
                            </div>
                        )}

                        {success && step === 'reset' && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-5 text-sm">
                                ✅ {success} Redirecting to login...
                            </div>
                        )}

                        {/* Step 1 — Email */}
                        {step === 'email' && (
                            <form onSubmit={handleSendOtp} className="space-y-4">
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
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-wider transition disabled:opacity-60"
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                                <p className="text-center text-sm text-gray-500">
                                    Remember your password?{' '}
                                    <Link to="/login" className="text-red-600 font-bold hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </form>
                        )}

                        {/* Step 2 — OTP */}
                        {step === 'otp' && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                                    📧 OTP sent to <strong>{email}</strong>
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
                                    disabled={otp.length < 6}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-wider transition disabled:opacity-60"
                                >
                                    Verify OTP
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold"
                                >
                                    ← Back
                                </button>
                            </form>
                        )}

                        {/* Step 3 — New Password */}
                        {step === 'reset' && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition pr-11"
                                            placeholder="Min. 8 characters"
                                        />
                                        <button type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition pr-11 ${confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : confirmPassword ? 'border-green-400' : 'border-gray-300'}`}
                                            placeholder="Re-enter password"
                                        />
                                        <button type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {confirmPassword && (
                                        <p className={`text-xs mt-1 font-semibold ${confirmPassword === newPassword ? 'text-green-500' : 'text-red-500'}`}>
                                            {confirmPassword === newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || newPassword !== confirmPassword}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-wider transition disabled:opacity-60"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;