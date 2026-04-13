import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import api from '../../api/axios';

const CONDITIONS = ['BRAND_NEW', 'PRE_OWNED', 'CERTIFIED_PRE_OWNED'];
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Automatic', 'Manual'];

function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editVehicle, setEditVehicle] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const emptyForm = {
        categoryId: '', brand: '', model: '', year: '',
        price: '', color: '', fuelType: '', transmission: '',
        bodyType: '', mileage: '', description: '',
        engineNumber: '', chassisNumber: '', plateNumber: '',
        warrantyYears: '', warrantyDetails: '', condition: '',
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [vRes, cRes] = await Promise.all([
                api.get('/admin/vehicles'),
                api.get('/admin/categories'),
            ]);
            setVehicles(vRes.data.data);
            setCategories(cRes.data.data);
        } catch (err) {
            setError('Failed to fetch data!');
        } finally {
            setLoading(false);
        }
    };

    const handle = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const openAdd = () => {
        setForm(emptyForm);
        setEditVehicle(null);
        setShowModal(true);
        setError('');
    };

    const openEdit = (v) => {
        setForm({
            categoryId: v.categoryId || '',
            brand: v.brand || '',
            model: v.model || '',
            year: v.year || '',
            price: v.price || '',
            color: v.color || '',
            fuelType: v.fuelType || '',
            transmission: v.transmission || '',
            bodyType: v.bodyType || '',
            mileage: v.mileage || '',
            description: v.description || '',
            engineNumber: v.engineNumber || '',
            chassisNumber: v.chassisNumber || '',
            plateNumber: v.plateNumber || '',
            warrantyYears: v.warrantyYears || '',
            warrantyDetails: v.warrantyDetails || '',
            condition: v.condition || '',
        });
        setEditVehicle(v);
        setShowModal(true);
        setError('');
    };

    const handleSubmit = async () => {
        if (!form.brand || !form.model || !form.year || !form.price) {
            setError('Please fill all required fields!');
            return;
        }
        try {
            if (editVehicle) {
                await api.put(`/admin/vehicles/${editVehicle.id}`, form);
                setSuccess('Vehicle updated successfully!');
            } else {
                await api.post('/admin/vehicles', form);
                setSuccess('Vehicle added successfully!');
            }
            setShowModal(false);
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save vehicle!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await api.delete(`/admin/vehicles/${id}`);
            setSuccess('Vehicle deleted!');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete vehicle!');
        }
    };

    const statusColor = (status) => {
        const colors = {
            AVAILABLE: 'bg-green-100 text-green-700',
            RESERVED: 'bg-yellow-100 text-yellow-700',
            SOLD: 'bg-gray-100 text-gray-600',
        };
        return colors[status] || 'bg-gray-100 text-gray-600';
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition";
    const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Vehicle Inventory</h2>
                    <p className="text-sm text-gray-400">{vehicles.length} vehicles total</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition"
                >
                    <Plus size={16} /> Add Vehicle
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

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['#', 'Brand & Model', 'Category', 'Price', 'Condition', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                        Loading vehicles...
                                    </td>
                                </tr>
                            ) : vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                        No vehicles yet — add one!
                                    </td>
                                </tr>
                            ) : (
                                vehicles.map(v => (
                                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{v.id}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-gray-800">{v.brand} {v.model}</p>
                                            <p className="text-xs text-gray-400">{v.year} • {v.color}</p>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{v.categoryName}</td>
                                        <td className="py-3 px-4 font-bold text-gray-800">
                                            ₱{Number(v.price).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-xs">
                                            {v.condition?.replace('_', ' ') || '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(v.status)}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(v)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(v.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                            </h3>
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
                                    <label className={labelClass}>Category</label>
                                    <select name="categoryId" value={form.categoryId}
                                        onChange={handle} className={inputClass}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Condition</label>
                                    <select name="condition" value={form.condition}
                                        onChange={handle} className={inputClass}>
                                        <option value="">Select Condition</option>
                                        {CONDITIONS.map(c => (
                                            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Brand *</label>
                                    <input name="brand" value={form.brand}
                                        onChange={handle} className={inputClass}
                                        placeholder="Toyota" />
                                </div>
                                <div>
                                    <label className={labelClass}>Model *</label>
                                    <input name="model" value={form.model}
                                        onChange={handle} className={inputClass}
                                        placeholder="Vios" />
                                </div>
                                <div>
                                    <label className={labelClass}>Year *</label>
                                    <input name="year" type="number" value={form.year}
                                        onChange={handle} className={inputClass}
                                        placeholder="2023" />
                                </div>
                                <div>
                                    <label className={labelClass}>Price *</label>
                                    <input name="price" type="number" value={form.price}
                                        onChange={handle} className={inputClass}
                                        placeholder="750000" />
                                </div>
                                <div>
                                    <label className={labelClass}>Color</label>
                                    <input name="color" value={form.color}
                                        onChange={handle} className={inputClass}
                                        placeholder="White" />
                                </div>
                                <div>
                                    <label className={labelClass}>Fuel Type</label>
                                    <select name="fuelType" value={form.fuelType}
                                        onChange={handle} className={inputClass}>
                                        <option value="">Select Fuel Type</option>
                                        {FUEL_TYPES.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Transmission</label>
                                    <select name="transmission" value={form.transmission}
                                        onChange={handle} className={inputClass}>
                                        <option value="">Select Transmission</option>
                                        {TRANSMISSIONS.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Body Type</label>
                                    <input name="bodyType" value={form.bodyType}
                                        onChange={handle} className={inputClass}
                                        placeholder="Sedan" />
                                </div>
                                <div>
                                    <label className={labelClass}>Mileage (km)</label>
                                    <input name="mileage" type="number" value={form.mileage}
                                        onChange={handle} className={inputClass}
                                        placeholder="15000" />
                                </div>
                                <div>
                                    <label className={labelClass}>Warranty Years</label>
                                    <input name="warrantyYears" type="number" value={form.warrantyYears}
                                        onChange={handle} className={inputClass}
                                        placeholder="2" />
                                </div>
                                <div>
                                    <label className={labelClass}>Engine Number</label>
                                    <input name="engineNumber" value={form.engineNumber}
                                        onChange={handle} className={inputClass}
                                        placeholder="ENG-2023-001" />
                                </div>
                                <div>
                                    <label className={labelClass}>Chassis Number</label>
                                    <input name="chassisNumber" value={form.chassisNumber}
                                        onChange={handle} className={inputClass}
                                        placeholder="CHS-2023-001" />
                                </div>
                                <div>
                                    <label className={labelClass}>Plate Number</label>
                                    <input name="plateNumber" value={form.plateNumber}
                                        onChange={handle} className={inputClass}
                                        placeholder="ABC 1234" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea name="description" value={form.description}
                                    onChange={handle} className={inputClass}
                                    rows={3} placeholder="Vehicle description..." />
                            </div>
                            <div>
                                <label className={labelClass}>Warranty Details</label>
                                <textarea name="warrantyDetails" value={form.warrantyDetails}
                                    onChange={handle} className={inputClass}
                                    rows={2} placeholder="Warranty coverage details..." />
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleSubmit}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                                {editVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Vehicles;