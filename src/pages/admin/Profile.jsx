import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Check } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

function AdminProfile() {
    usePageTitle('My Profile');
    const { user, token, login } = useAuth();

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    const [form, setForm] = useState({
        firstName: '', lastName: '', middleName: '',
        suffix: '', phone: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            const u = res.data.data;
            setForm({
                firstName: u.firstName || '',
                lastName: u.lastName || '',
                middleName: u.middleName || '',
                suffix: u.suffix || '',
                phone: u.phone || '',
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateProfile = async () => {
        if (!form.firstName || !form.lastName) {
            setError('First name and last name are required!');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await api.put('/buyer/profile', form);
            const updated = res.data.data;
            login({ ...user, fullName: updated.fullName }, token);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile!');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match!');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            setError('Password must be at least 8 characters!');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await api.put('/buyer/profile/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setSuccess('Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password!');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

    const isSuperAdmin = user?.role === 'SUPERADMIN';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ${isSuperAdmin ? 'bg-yellow-500' : 'bg-red-600'}`}>
                    {user?.fullName?.charAt(0)}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{user?.fullName}</h2>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${isSuperAdmin ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                        {user?.role}
                    </span>
                </div>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-2xl shadow-sm p-2">
                {[
                    { id: 'personal', label: 'Personal Info' },
                    { id: 'password', label: 'Change Password' },
                ].map(tab => (
                    <button key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${activeTab === tab.id ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Personal Info */}
            {activeTab === 'personal' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-gray-800">Personal Information</h3>
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                        ℹ️ Email cannot be changed here. Contact the SuperAdmin to update your email.
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
                                className={inputClass} placeholder="Santos (optional)" />
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
                                <option value="IV">IV</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Phone Number</label>
                        <input value={form.phone}
                            onChange={e => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                            className={inputClass} placeholder="09171234567" maxLength={11} />
                    </div>

                    {/* Privileges Display */}
                    {!isSuperAdmin && user?.privileges?.length > 0 && (
                        <div>
                            <label className={labelClass}>My Privileges</label>
                            <div className="flex flex-wrap gap-2">
                                {user.privileges.map(p => (
                                    <span key={p} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                        {p.replace(/_/g, ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={handleUpdateProfile} disabled={loading}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}

            {/* Change Password */}
            {activeTab === 'password' && (
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-gray-800">Change Password</h3>
                    <div>
                        <label className={labelClass}>Current Password</label>
                        <div className="relative">
                            <input type={showCurrent ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className={`${inputClass} pr-11`} placeholder="Enter current password" />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
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
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
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
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordForm.confirmPassword && (
                            <p className={`text-xs mt-1 font-semibold ${passwordForm.confirmPassword === passwordForm.newPassword ? 'text-green-500' : 'text-red-500'}`}>
                                {passwordForm.confirmPassword === passwordForm.newPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </p>
                        )}
                    </div>
                    <button onClick={handleChangePassword} disabled={loading}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                        {loading ? 'Changing...' : 'Change Password'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default AdminProfile;