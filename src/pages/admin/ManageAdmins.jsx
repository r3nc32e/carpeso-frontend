import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';

const ALL_PRIVILEGES = [
    'INVENTORY_MANAGER',
    'TRANSACTION_MANAGER',
    'ACCOUNT_MANAGER',
    'CONTENT_MODERATOR',
    'SALES_ANALYST',
];

function ManageAdmins() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPrivModal, setShowPrivModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '',
        privileges: [],
    });

    const [editPrivileges, setEditPrivileges] = useState([]);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/superadmin/admins');
            setAdmins(res.data.data);
        } catch (err) {
            setError('Failed to fetch admins!');
        } finally {
            setLoading(false);
        }
    };

    const handle = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const togglePrivilege = (priv) => {
        setForm(prev => ({
            ...prev,
            privileges: prev.privileges.includes(priv)
                ? prev.privileges.filter(p => p !== priv)
                : [...prev.privileges, priv],
        }));
    };

    const toggleEditPrivilege = (priv) => {
        setEditPrivileges(prev =>
            prev.includes(priv)
                ? prev.filter(p => p !== priv)
                : [...prev, priv]
        );
    };

    const handleCreateAdmin = async () => {
        if (!form.firstName || !form.lastName || !form.email || !form.password) {
            setError('Please fill all required fields!');
            return;
        }
        try {
            await api.post('/superadmin/admins', {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
                privileges: new Set(form.privileges),
            });
            setSuccess('Admin created successfully!');
            setShowModal(false);
            fetchAdmins();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin!');
        }
    };

    const openPrivModal = (admin) => {
        setSelectedAdmin(admin);
        setEditPrivileges(admin.privileges || []);
        setShowPrivModal(true);
        setError('');
    };

    const handleUpdatePrivileges = async () => {
        try {
            await api.put(`/superadmin/admins/${selectedAdmin.id}/privileges`, editPrivileges);
            setSuccess('Privileges updated!');
            setShowPrivModal(false);
            fetchAdmins();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update privileges!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this admin?')) return;
        try {
            await api.delete(`/superadmin/admins/${id}`);
            setSuccess('Admin deleted!');
            fetchAdmins();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete admin!');
        }
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition";
    const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Manage Admins</h2>
                    <p className="text-sm text-gray-400">{admins.length} admins total</p>
                </div>
                <button
                    onClick={() => {
                        setForm({ firstName: '', lastName: '', email: '', password: '', privileges: [] });
                        setError('');
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition"
                >
                    <Plus size={16} /> Create Admin
                </button>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}

            {error && !showModal && !showPrivModal && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['#', 'Name', 'Email', 'Privileges', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                                        Loading admins...
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                                        No admins yet — create one!
                                    </td>
                                </tr>
                            ) : (
                                admins.map(a => (
                                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{a.id}</td>
                                        <td className="py-3 px-4 font-semibold text-gray-800">{a.fullName}</td>
                                        <td className="py-3 px-4 text-gray-600">{a.email}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {a.privileges?.length > 0 ? (
                                                    a.privileges.map(p => (
                                                        <span key={p} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                                            {p.replace(/_/g, ' ')}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No privileges</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${a.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {a.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => openPrivModal(a)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit Privileges"
                                                >
                                                    <ShieldCheck size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(a.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Admin"
                                                >
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

            {/* Create Admin Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-lg font-bold text-gray-800">Create Admin</h3>
                            <button onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    ⚠️ {error}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>First Name *</label>
                                    <input name="firstName" value={form.firstName}
                                        onChange={handle} className={inputClass}
                                        placeholder="Juan" />
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name *</label>
                                    <input name="lastName" value={form.lastName}
                                        onChange={handle} className={inputClass}
                                        placeholder="Dela Cruz" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Email *</label>
                                <input name="email" type="email" value={form.email}
                                    onChange={handle} className={inputClass}
                                    placeholder="admin@carpeso.com" />
                            </div>
                            <div>
                                <label className={labelClass}>Password *</label>
                                <input name="password" type="password" value={form.password}
                                    onChange={handle} className={inputClass}
                                    placeholder="Min. 8 characters" />
                            </div>
                            <div>
                                <label className={labelClass}>Privileges</label>
                                <div className="space-y-2 mt-2">
                                    {ALL_PRIVILEGES.map(p => (
                                        <label key={p} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.privileges.includes(p)}
                                                onChange={() => togglePrivilege(p)}
                                                className="w-4 h-4 accent-red-600"
                                            />
                                            <span className="text-sm text-gray-700 font-medium">
                                                {p.replace(/_/g, ' ')}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleCreateAdmin}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                Create Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Privileges Modal */}
            {showPrivModal && selectedAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Edit Privileges</h3>
                            <button onClick={() => setShowPrivModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-3">
                            <p className="text-sm text-gray-500">
                                Admin: <strong>{selectedAdmin.fullName}</strong>
                            </p>
                            {ALL_PRIVILEGES.map(p => (
                                <label key={p} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editPrivileges.includes(p)}
                                        onChange={() => toggleEditPrivilege(p)}
                                        className="w-4 h-4 accent-red-600"
                                    />
                                    <span className="text-sm text-gray-700 font-medium">
                                        {p.replace(/_/g, ' ')}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-100">
                            <button onClick={() => setShowPrivModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleUpdatePrivileges}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                Save Privileges
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageAdmins;