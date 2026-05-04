import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Check, Pencil, X, CheckCircle, Circle } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

function AdminProfile() {
    usePageTitle('My Profile');
    const { user, token, login, logout } = useAuth();
    const navigate = useNavigate();

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState(null);

    // ─── Personal info form (name, phone) — requires current password only ───
    const [form, setForm] = useState({
        firstName: '', lastName: '', middleName: '',
        suffix: '', phone: '',
    });
    const [currentPasswordForProfile, setCurrentPasswordForProfile] = useState('');
    const [showProfilePassword, setShowProfilePassword] = useState(false);

    // ─── Password change — requires OTP ──────────────────────────────────────
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    });
    const [passwordStep, setPasswordStep] = useState('form');
    const [passwordOtp, setPasswordOtp] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // ─── Email change — requires OTP ─────────────────────────────────────────
    const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '', otp: '' });
    const [emailStep, setEmailStep] = useState('form');
    const [sendingEmailOtp, setSendingEmailOtp] = useState(false);

    const isSuperAdmin = user?.role === 'SUPERADMIN';

    const pwChecks = {
        length:  passwordForm.newPassword.length >= 8,
        upper:   /[A-Z]/.test(passwordForm.newPassword),
        number:  /[0-9]/.test(passwordForm.newPassword),
        special: /[!@#$%^&*]/.test(passwordForm.newPassword),
    };
    const pwStrength = Object.values(pwChecks).filter(Boolean).length;
    const pwStrengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][pwStrength];
    const pwStrengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            const u = res.data.data;
            setProfileData(u);
            setForm({
                firstName:  u.firstName  || '',
                lastName:   u.lastName   || '',
                middleName: u.middleName || '',
                suffix:     u.suffix     || '',
                phone:      u.phone      || '',
            });
        } catch (err) { console.error(err); }
    };

    const showMsg = (msg, isErr = false) => {
        if (isErr) { setError(msg); setTimeout(() => setError(''), 4000); }
        else { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    };

    // ─── UPDATE PROFILE (name, phone) — NO OTP needed, only current password ─
    // Per your request: minor details like name/phone only need current password.
    const handleUpdateProfile = async () => {
        if (!form.firstName || !form.lastName) {
            setError('First name and last name are required!'); return;
        }
        if (!currentPasswordForProfile) {
            setError('Please enter your current password to confirm changes!'); return;
        }
        setError(''); setLoading(true);
        try {
            // Verify password first by attempting a local check via the profile endpoint
            // The backend /admin/profile endpoint accepts these fields plus optional currentPassword for verification
            const res = await api.put('/admin/profile', {
                ...form,
                currentPassword: currentPasswordForProfile,
            });
            const updated = res.data.data;
            login({ ...user, fullName: updated.fullName }, token);
            showMsg('Profile updated!');
            setEditMode(false);
            setCurrentPasswordForProfile('');
            fetchProfile();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile!');
        } finally { setLoading(false); }
    };

    // ─── CHANGE PASSWORD — Step 1: enter fields & send OTP ───────────────────
    const handleRequestPasswordOtp = async () => {
        if (!passwordForm.currentPassword) {
            setError('Please enter current password!'); return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match!'); return;
        }
        if (pwStrength < 3) {
            setError('Password is too weak! Need uppercase, number, and special character.'); return;
        }
        setSendingOtp(true); setError('');
        try {
            await api.post('/auth/forgot-password', { email: user?.email });
            setPasswordStep('otp');
            showMsg('OTP sent to your email!');
        } catch {
            setError('Failed to send OTP!');
        } finally { setSendingOtp(false); }
    };

    const handleChangePasswordWithOtp = async () => {
        if (!passwordOtp || passwordOtp.length < 6) {
            setError('Please enter the OTP!'); return;
        }
        setLoading(true); setError('');
        try {
            await api.post('/auth/verify-password-change-otp', {
                email:           user?.email,
                otp:             passwordOtp,
                currentPassword: passwordForm.currentPassword,
                newPassword:     passwordForm.newPassword,
            });
            showMsg('Password changed!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordOtp('');
            setPasswordStep('form');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed!');
        } finally { setLoading(false); }
    };

    // ─── CHANGE EMAIL — Step 1: enter new email & password & send OTP ────────
    const handleRequestEmailOtp = async () => {
        if (!emailForm.newEmail || !emailForm.newEmail.includes('@gmail.com')) {
            setError('Please enter a valid Gmail address!'); return;
        }
        if (!emailForm.currentPassword) {
            setError('Please enter your current password!'); return;
        }
        setSendingEmailOtp(true); setError('');
        try {
            await api.post('/auth/forgot-password', { email: user?.email });
            setEmailStep('otp');
            showMsg('OTP sent to your current email!');
        } catch {
            setError('Failed to send OTP!');
        } finally { setSendingEmailOtp(false); }
    };

    const handleChangeEmail = async () => {
        if (!emailForm.otp || emailForm.otp.length < 6) {
            setError('Please enter the OTP!'); return;
        }
        setLoading(true); setError('');
        try {
            // SuperAdmin uses /superadmin/change-email
            // SubAdmin (ADMIN role) uses /auth/change-email
            if (isSuperAdmin) {
                // SuperAdmin: first request OTP via /superadmin/send-otp then use /superadmin/change-email
                await api.put('/superadmin/change-email', {
                    currentPassword: emailForm.currentPassword,
                    newEmail:        emailForm.newEmail,
                    otp:             emailForm.otp,
                });
            } else {
                await api.put('/auth/change-email', {
                    currentPassword: emailForm.currentPassword,
                    newEmail:        emailForm.newEmail,
                    otp:             emailForm.otp,
                });
            }
            showMsg('Email changed! Please login again with your new email.');
            setTimeout(() => { logout(); navigate('/login'); }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change email!');
        } finally { setLoading(false); }
    };

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ${isSuperAdmin ? 'bg-yellow-500' : 'bg-red-600'}`}>
                        {user?.fullName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-800">{user?.fullName}</h2>
                        <p className="text-gray-400 text-sm break-all">{user?.email}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${isSuperAdmin ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                            {isSuperAdmin ? 'Super Admin' : user?.privileges?.[0]?.replace(/_/g, ' ') || 'Admin'}
                        </span>
                    </div>
                </div>

                {profileData && !editMode && (
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                        {[
                            { label: 'First Name',  value: profileData.firstName  || '—' },
                            { label: 'Last Name',   value: profileData.lastName   || '—' },
                            { label: 'Middle Name', value: profileData.middleName || '—' },
                            { label: 'Suffix',      value: profileData.suffix     || '—' },
                            { label: 'Phone',       value: profileData.phone      || '—' },
                            { label: 'Email',       value: profileData.email      || '—' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
                                <p className="text-sm font-semibold text-gray-800 break-all">{value}</p>
                            </div>
                        ))}
                        <div className="col-span-2 pt-2">
                            <button onClick={() => { setEditMode(true); setError(''); setCurrentPasswordForProfile(''); }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition">
                                <Pencil size={14} /> Edit Personal Info
                            </button>
                        </div>
                    </div>
                )}

                {editMode && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">Edit Personal Info</h3>
                            <button onClick={() => { setEditMode(false); setError(''); setCurrentPasswordForProfile(''); }}
                                className="p-1 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Info note */}
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                            ℹ️ Changing your name and phone only requires your current password — no OTP needed.
                            To change your email or password, use the tabs below.
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>First Name *</label>
                                <input value={form.firstName}
                                    onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                                    className={inputClass} placeholder="Juan" />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name *</label>
                                <input value={form.lastName}
                                    onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                                    className={inputClass} placeholder="Dela Cruz" />
                            </div>
                            <div>
                                <label className={labelClass}>Middle Name</label>
                                <input value={form.middleName}
                                    onChange={e => setForm(prev => ({ ...prev, middleName: e.target.value }))}
                                    className={inputClass} placeholder="Santos" />
                            </div>
                            <div>
                                <label className={labelClass}>Suffix</label>
                                <select value={form.suffix}
                                    onChange={e => setForm(prev => ({ ...prev, suffix: e.target.value }))}
                                    className={inputClass}>
                                    <option value="">None</option>
                                    <option value="Jr.">Jr.</option>
                                    <option value="Sr.">Sr.</option>
                                    <option value="II">II</option>
                                    <option value="III">III</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Phone Number</label>
                            <input value={form.phone}
                                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                                className={inputClass} placeholder="09171234567" maxLength={11} />
                        </div>

                        {/* Current password confirmation (required, no OTP) */}
                        <div>
                            <label className={labelClass}>Current Password (to confirm changes) *</label>
                            <div className="relative">
                                <input
                                    type={showProfilePassword ? 'text' : 'password'}
                                    value={currentPasswordForProfile}
                                    onChange={e => setCurrentPasswordForProfile(e.target.value)}
                                    className={`${inputClass} pr-11`}
                                    placeholder="Enter your current password" />
                                <button type="button" onClick={() => setShowProfilePassword(!showProfilePassword)}
                                    className="absolute right-3 top-2.5 text-gray-400">
                                    {showProfilePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => { setEditMode(false); setError(''); setCurrentPasswordForProfile(''); }}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleUpdateProfile} disabled={loading}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">⚠️ {error}</div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-2xl shadow-sm p-2">
                {[
                    { id: 'info',     label: 'My Info' },
                    { id: 'email',    label: 'Change Email' },
                    { id: 'password', label: 'Change Password' },
                ].map(tab => (
                    <button key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
                        className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${activeTab === tab.id ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Info Tab */}
            {activeTab === 'info' && profileData && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Account Information</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Full Name',  value: profileData.fullName },
                            { label: 'Email',      value: profileData.email },
                            { label: 'Phone',      value: profileData.phone || '—' },
                            { label: 'Role',       value: isSuperAdmin ? 'Super Admin' : profileData.privileges?.[0]?.replace(/_/g, ' ') || 'Admin' },
                            { label: 'Status',     value: profileData.active ? '✅ Active' : '❌ Inactive' },
                            { label: 'Last Login', value: profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleString('en-PH') : '—' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <p className="text-sm text-gray-500 font-semibold">{label}</p>
                                <p className="text-sm font-semibold text-gray-800">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Change Email Tab — available to BOTH admin and superadmin */}
            {activeTab === 'email' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-gray-800">Change Email Address</h3>
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                        ⚠️ Changing your email will log you out. You will need to login with your new email.
                    </div>
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                        📧 Only Gmail addresses are accepted for the system's OTP email service.
                    </div>
                    {emailStep === 'form' ? (
                        <>
                            <div>
                                <label className={labelClass}>New Gmail Address *</label>
                                <input type="email" value={emailForm.newEmail}
                                    onChange={e => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                                    className={inputClass} placeholder="newadmin@gmail.com" />
                                <p className="text-xs text-gray-400 mt-1">Must be a valid Gmail address (@gmail.com)</p>
                            </div>
                            <div>
                                <label className={labelClass}>Current Password *</label>
                                <input type="password" value={emailForm.currentPassword}
                                    onChange={e => setEmailForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className={inputClass} placeholder="Enter your current password" />
                            </div>
                            <button onClick={handleRequestEmailOtp} disabled={sendingEmailOtp}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                {sendingEmailOtp ? 'Sending OTP...' : 'Send Verification OTP'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                                📧 OTP sent to your current email: <strong>{user?.email}</strong>
                            </div>
                            <div>
                                <label className={labelClass}>Enter OTP *</label>
                                <input type="text" value={emailForm.otp}
                                    onChange={e => setEmailForm(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                                    maxLength={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-3xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    placeholder="000000" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setEmailStep('form'); setEmailForm(prev => ({ ...prev, otp: '' })); setError(''); }}
                                    className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                    ← Back
                                </button>
                                <button onClick={handleChangeEmail} disabled={loading || emailForm.otp.length < 6}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                    {loading ? 'Changing...' : 'Confirm Change Email'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-gray-800">Change Password</h3>
                    {passwordStep === 'form' ? (
                        <>
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                                🔒 An OTP will be sent to your email for verification.
                            </div>
                            <div>
                                <label className={labelClass}>Current Password</label>
                                <div className="relative">
                                    <input type={showCurrent ? 'text' : 'password'}
                                        value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className={`${inputClass} pr-11`} placeholder="Enter current password" />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-2.5 text-gray-400">
                                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>New Password</label>
                                <div className="relative">
                                    <input type={showNew ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className={`${inputClass} pr-11`} placeholder="Min. 8 characters" />
                                    <button type="button" onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-2.5 text-gray-400">
                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordForm.newPassword && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= pwStrength ? pwStrengthColor : 'bg-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-semibold ${pwStrength <= 1 ? 'text-red-500' : pwStrength === 2 ? 'text-orange-400' : pwStrength === 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                                            {pwStrengthLabel}
                                        </p>
                                        <div className="grid grid-cols-2 gap-1 mt-1">
                                            {[
                                                { check: pwChecks.length,  label: 'Min. 8 characters' },
                                                { check: pwChecks.upper,   label: 'Uppercase letter' },
                                                { check: pwChecks.number,  label: 'Number' },
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
                                <label className={labelClass}>Confirm New Password</label>
                                <div className="relative">
                                    <input type={showConfirm ? 'text' : 'password'}
                                        value={passwordForm.confirmPassword}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className={`${inputClass} pr-11 ${passwordForm.confirmPassword && passwordForm.confirmPassword === passwordForm.newPassword ? 'border-green-400' : passwordForm.confirmPassword ? 'border-red-400' : ''}`}
                                        placeholder="Re-enter new password" />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-2.5 text-gray-400">
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordForm.confirmPassword && (
                                    <p className={`text-xs mt-1 font-semibold ${passwordForm.confirmPassword === passwordForm.newPassword ? 'text-green-500' : 'text-red-500'}`}>
                                        {passwordForm.confirmPassword === passwordForm.newPassword ? '✓ Passwords match' : '✗ Do not match'}
                                    </p>
                                )}
                            </div>
                            <button onClick={handleRequestPasswordOtp} disabled={sendingOtp}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                {sendingOtp ? 'Sending OTP...' : 'Send OTP to Email'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                                📧 OTP sent to <strong>{user?.email}</strong>
                            </div>
                            <div>
                                <label className={labelClass}>Enter OTP *</label>
                                <input type="text" value={passwordOtp}
                                    onChange={e => setPasswordOtp(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-3xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    placeholder="000000" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setPasswordStep('form'); setPasswordOtp(''); setError(''); }}
                                    className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                    ← Back
                                </button>
                                <button onClick={handleChangePasswordWithOtp} disabled={loading || passwordOtp.length < 6}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminProfile;