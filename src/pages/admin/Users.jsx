import { useState, useEffect } from 'react';
import { Eye, ShieldAlert, ShieldOff, ShieldCheck, Trash2, X, Check } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

function Users() {
    usePageTitle('Users');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [warnReason, setWarnReason] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data || []);
        } catch (err) {
            setError('Failed to fetch users!');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (u) => {
        setSelected(u);
        setWarnReason('');
        setShowModal(true);
        setError('');
    };

    const handleWarn = async () => {
        if (!warnReason.trim()) { setError('Please provide a reason!'); return; }
        try {
            await api.put(`/admin/users/${selected.id}/warn`,
                { reason: warnReason });
            setSuccess('Warning issued!');
            setShowModal(false);
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to warn user!');
        }
    };

    const handleSuspend = async (id) => {
        if (!window.confirm('Suspend this user?')) return;
        try {
            await api.put(`/admin/users/${id}/suspend`);
            setSuccess('User suspended!');
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to suspend!');
        }
    };

    const handleUnsuspend = async (id) => {
        if (!window.confirm('Unsuspend this user?')) return;
        try {
            await api.put(`/admin/users/${id}/unsuspend`);
            setSuccess('User unsuspended!');
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to unsuspend!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setSuccess('User deleted!');
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete!');
        }
    };

    const filtered = filter === 'ALL' ? users
        : filter === 'SUSPENDED' ? users.filter(u => u.suspended)
        : users.filter(u => !u.suspended);

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                <p className="text-sm text-gray-400">{users.length} registered buyers</p>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}
            {error && !showModal && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">⚠️ {error}</div>
            )}

            <div className="flex gap-2">
                {['ALL', 'ACTIVE', 'SUSPENDED'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filter === f ? 'bg-red-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                        {f}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['#', 'Name', 'Email', 'Phone', 'Warnings', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Loading users...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No users found</td></tr>
                            ) : (
                                filtered.map(u => (
                                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{u.id}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-gray-800">{u.fullName}</p>
                                            <p className="text-xs text-gray-400">{u.cityName || '—'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-gray-600 text-xs max-w-[140px] truncate" title={u.email}>{u.email}</p>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-xs">{u.phone || '—'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.warningCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {u.warningCount || 0}x
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.suspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {u.suspended ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-1">
                                                <button onClick={() => openModal(u)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                                    <Eye size={14} />
                                                </button>
                                                {u.suspended ? (
                                                    <button onClick={() => handleUnsuspend(u.id)}
                                                        className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition">
                                                        <ShieldCheck size={14} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleSuspend(u.id)}
                                                        className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition">
                                                        <ShieldOff size={14} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(u.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && selected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-lg font-bold text-gray-800">User Details</h3>
                            <button onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>
                            )}

                            {/* User Avatar */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                    {selected.fullName?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-800 truncate">{selected.fullName}</p>
                                    <p className="text-xs text-gray-500 break-all">{selected.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Phone', value: selected.phone || '—' },
                                    { label: 'City', value: selected.cityName || '—' },
                                    { label: 'Barangay', value: selected.barangayName || '—' },
                                    { label: 'Warnings', value: `${selected.warningCount || 0} warning(s)` },
                                    { label: 'Status', value: selected.suspended ? '🔴 Suspended' : '🟢 Active' },
                                    { label: 'Member Since', value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-PH') : '—' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
                                        <p className="text-sm text-gray-800 font-medium truncate">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                    Issue Warning — Reason
                                </label>
                                <textarea value={warnReason}
                                    onChange={e => setWarnReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    rows={3} placeholder="Enter reason for warning..." />
                                <p className="text-xs text-gray-400 mt-1">
                                    3 warnings = automatic account suspension
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleWarn}
                                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2">
                                <ShieldAlert size={16} /> Issue Warning
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;