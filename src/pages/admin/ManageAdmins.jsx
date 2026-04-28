import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

const PRIVILEGE_OPTIONS = [
    { value: 'INVENTORY_MANAGER', label: 'Inventory Manager', desc: 'Vehicles & Categories' },
    { value: 'TRANSACTION_MANAGER', label: 'Transaction Manager', desc: 'Transactions only' },
    { value: 'ACCOUNT_MANAGER', label: 'Account Manager', desc: 'Users only' },
    { value: 'CONTENT_MODERATOR', label: 'Content Moderator', desc: 'Reviews only' },
    { value: 'SALES_ANALYST', label: 'Sales Analyst', desc: 'Audit Logs & Sales Analytics' },
];

function ManageAdmins() {
    usePageTitle('Manage Admins');
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '',
        password: '', privilege: '',
    });

    useEffect(() => { fetchAdmins(); }, []);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/superadmin/admins');
            setAdmins(res.data.data || []);
        } catch (err) {
            setError('Failed to fetch admins!');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!form.firstName || !form.lastName || !form.email || !form.password || !form.privilege) {
            setError('All fields are required!');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters!');
            return;
        }
        try {
            await api.post('/superadmin/admins', {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
                privileges: [form.privilege],
            });
            setSuccess('Admin created! Credentials sent to their email.');
            setShowModal(false);
            setForm({ firstName: '', lastName: '', email: '', password: '', privilege: '' });
            fetchAdmins();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this admin?')) return;
        try {
            await api.delete(`/superadmin/admins/${id}`);
            setSuccess('Admin deleted!');
            fetchAdmins();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete!');
        }
    };

    const getPrivilegeLabel = (privileges) => {
        if (!privileges || privileges.length === 0) return 'No privilege';
        const p = PRIVILEGE_OPTIONS.find(o => o.value === privileges[0]);
        return p ? p.label : privileges[0];
    };

    const privilegeColor = (privilege) => ({
        INVENTORY_MANAGER: 'bg-blue-100 text-blue-700',
        TRANSACTION_MANAGER: 'bg-purple-100 text-purple-700',
        ACCOUNT_MANAGER: 'bg-green-100 text-green-700',
        CONTENT_MODERATOR: 'bg-yellow-100 text-yellow-700',
        SALES_ANALYST: 'bg-orange-100 text-orange-700',
    }[privilege] || 'bg-gray-100 text-gray-600');

    const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition";

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Manage Admins</h2>
                    <p className="text-sm text-gray-400">{admins.length} sub-admin{admins.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => { setShowModal(true); setError(''); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition">
                    <Plus size={16} /> Add Admin
                </button>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}
            {error && !showModal && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">⚠️ {error}</div>
            )}

            {/* Privilege Legend */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Privilege Levels</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PRIVILEGE_OPTIONS.map(p => (
                        <div key={p.value} className="text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${privilegeColor(p.value)}`}>
                                {p.label}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['#', 'Name', 'Email', 'Privilege', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>
                            ) : admins.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No sub-admins yet</td></tr>
                            ) : (
                                admins.map(admin => (
                                    <tr key={admin.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{admin.id}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {admin.firstName?.charAt(0)}
                                                </div>
                                                <p className="font-semibold text-gray-800">{admin.fullName}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-sm">{admin.email}</td>
                                        <td className="py-3 px-4">
                                            {admin.privileges?.length > 0 ? (
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${privilegeColor(admin.privileges[0])}`}>
                                                    {getPrivilegeLabel(admin.privileges)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">None</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${admin.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {admin.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button onClick={() => handleDelete(admin.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Admin Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={20} className="text-red-600" />
                                <h3 className="text-lg font-bold text-gray-800">Create Sub-Admin</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name *</label>
                                    <input value={form.firstName}
                                        onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                                        className={inputClass} placeholder="Juan" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name *</label>
                                    <input value={form.lastName}
                                        onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                                        className={inputClass} placeholder="Dela Cruz" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                                <input type="email" value={form.email}
                                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                    className={inputClass} placeholder="admin@carpeso.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Temporary Password *</label>
                                <input type="password" value={form.password}
                                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                                    className={inputClass} placeholder="Min. 8 characters" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assign Role / Privilege *</label>
                                <select value={form.privilege}
                                    onChange={e => setForm(prev => ({ ...prev, privilege: e.target.value }))}
                                    className={inputClass}>
                                    <option value="">Select Privilege</option>
                                    {PRIVILEGE_OPTIONS.map(p => (
                                        <option key={p.value} value={p.value}>
                                            {p.label} — {p.desc}
                                        </option>
                                    ))}
                                </select>
                                {form.privilege && (
                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-xs text-blue-700 font-semibold">
                                            Access: {PRIVILEGE_OPTIONS.find(p => p.value === form.privilege)?.desc}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs">
                                ⚠️ Login credentials will be sent to the admin's email upon creation.
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-100">
                            <button onClick={() => { setShowModal(false); setError(''); }}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleCreate}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                Create Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageAdmins;