import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, Tag } from 'lucide-react';
import api from '../../api/axios';

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', description: '', isActive: true });

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/admin/categories');
            setCategories(res.data.data);
        } catch (err) {
            setError('Failed to fetch categories!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.name) { setError('Category name is required!'); return; }
        try {
            await api.post('/admin/categories', form);
            setSuccess('Category added!');
            setShowModal(false);
            setForm({ name: '', description: '', isActive: true });
            fetchCategories();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add category!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            setSuccess('Category deleted!');
            fetchCategories();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete category!');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Categories</h2>
                    <p className="text-sm text-gray-400">{categories.length} categories total</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setError(''); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition"
                >
                    <Plus size={16} /> Add Category
                </button>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}

            {error && !showModal && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    ⚠️ {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <p className="text-gray-400 text-sm col-span-3 text-center py-12">Loading...</p>
                ) : categories.length === 0 ? (
                    <p className="text-gray-400 text-sm col-span-3 text-center py-12">No categories yet!</p>
                ) : (
                    categories.map(c => (
                        <div key={c.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{c.name}</p>
                                    <p className="text-xs text-gray-400">{c.description || 'No description'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(c.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Add Category</h3>
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
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                    Category Name *
                                </label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    placeholder="e.g. SUV, Sedan, Truck"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    rows={3}
                                    placeholder="Optional description..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-100">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleSubmit}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                Add Category
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Categories;