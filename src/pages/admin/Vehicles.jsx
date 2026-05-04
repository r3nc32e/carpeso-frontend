import { IMG_BASE } from '../../api/config';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

const CONDITIONS = ['BRAND_NEW', 'PRE_OWNED', 'CERTIFIED_PRE_OWNED'];
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Automatic', 'Manual'];


function Vehicles() {
    usePageTitle('Vehicles');
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editVehicle, setEditVehicle] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);

    const emptyForm = {
        categoryId: '', brand: '', model: '', year: '',
        price: '', color: '', fuelType: '', transmission: '',
        bodyType: '', mileage: '', description: '',
        engineNumber: '', chassisNumber: '', plateNumber: '',
        warrantyYears: '', warrantyDetails: '', condition: '',
        imageUrls: [], videoUrls: [], quantity: 1,
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [vRes, cRes] = await Promise.all([
                api.get('/admin/vehicles'),
                api.get('/admin/categories'),
            ]);
            setVehicles(vRes.data.data || []);
            setCategories(cRes.data.data || []);
        } catch (err) {
            setError('Failed to fetch data!');
        } finally {
            setLoading(false);
        }
    };

    const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const openAdd = () => {
        setForm(emptyForm);
        setEditVehicle(null);
        setError('');
        setShowModal(true);
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
            imageUrls: v.imageUrls || [],
            videoUrls: v.videoUrls || [],
            quantity: v.quantity ?? 1,
        });
        setEditVehicle(v);
        setError('');
        setShowModal(true);
    };

    const handleAddImages = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const currentUrls = form.imageUrls || [];
        if (currentUrls.length + files.length > 8) {
            setError(`Max 8 images!`); return;
        }
        setUploadingImages(true);
        try {
            const formData = new FormData();
            files.forEach(f => formData.append('files', f));
            const res = await api.post('/files/upload/images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setForm(prev => ({
                ...prev,
                imageUrls: [...(prev.imageUrls || []), ...res.data.data]
            }));
        } catch (err) {
            setError('Failed to upload images!');
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index) => {
        setForm(prev => ({
            ...prev,
            imageUrls: (prev.imageUrls || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddVideo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if ((form.videoUrls || []).length >= 3) {
            setError('Maximum 3 videos!'); return;
        }
        setUploadingVideo(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/files/upload/video', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setForm(prev => ({
                ...prev,
                videoUrls: [...(prev.videoUrls || []), res.data.data]
            }));
        } catch (err) {
            setError('Failed to upload video!');
        } finally {
            setUploadingVideo(false);
        }
    };

    const removeVideo = (index) => {
        setForm(prev => ({
            ...prev,
            videoUrls: (prev.videoUrls || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!form.brand || !form.model || !form.year || !form.price) {
            setError('Brand, Model, Year, and Price are required!'); return;
        }
        if (!form.categoryId) { setError('Please select a category!'); return; }
        if (!form.condition) { setError('Please select vehicle condition!'); return; }
        if (!form.imageUrls || form.imageUrls.length === 0) {
            setError('Please upload at least 1 photo!'); return;
        }
        try {
            const payload = { ...form, quantity: parseInt(form.quantity) || 0 };
            if (editVehicle) {
                await api.put(`/admin/vehicles/${editVehicle.id}`, payload);
                setSuccess('Vehicle updated!');
            } else {
                await api.post('/admin/vehicles', payload);
                setSuccess('Vehicle added!');
            }
            setShowModal(false);
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle?')) return;
        try {
            await api.delete(`/admin/vehicles/${id}`);
            setSuccess('Vehicle deleted!');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete!');
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        return `${IMG_BASE}${url.replace('/uploads', '')}`;
    };

    const statusColor = (status) => ({
        AVAILABLE: 'bg-green-100 text-green-700',
        RESERVED: 'bg-yellow-100 text-yellow-700',
        SOLD: 'bg-gray-100 text-gray-600',
    }[status] || 'bg-gray-100 text-gray-600');

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition";
    const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Vehicle Inventory</h2>
                    <p className="text-sm text-gray-400">{vehicles.length} vehicles total</p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition">
                    <Plus size={16} /> Add Vehicle
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

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['#', 'Photo', 'Brand & Model', 'Category', 'Price', 'Qty', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>
                            ) : vehicles.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No vehicles yet!</td></tr>
                            ) : (
                                vehicles.map(v => (
                                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{v.id}</td>
                                        <td className="py-3 px-4">
                                            {v.imageUrls?.length > 0 ? (
                                                <img src={getImageUrl(v.imageUrls[0])} alt=""
                                                    className="w-14 h-10 object-cover rounded-lg" />
                                            ) : (
                                                <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">No img</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-gray-800">{v.brand} {v.model}</p>
                                            <p className="text-xs text-gray-400">{v.year} • {v.color}</p>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-sm">{v.categoryName || '—'}</td>
                                        <td className="py-3 px-4 font-bold text-gray-800">₱{Number(v.price).toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${(v.quantity || 0) > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                                                {v.quantity || 0} units
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(v.status)}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(v)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(v.id)}
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
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
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Category *</label>
                                    <select name="categoryId" value={form.categoryId} onChange={handle} className={inputClass}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Condition *</label>
                                    <select name="condition" value={form.condition} onChange={handle} className={inputClass}>
                                        <option value="">Select Condition</option>
                                        {CONDITIONS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Brand *</label>
                                    <input name="brand" value={form.brand} onChange={handle} className={inputClass} placeholder="Toyota" />
                                </div>
                                <div>
                                    <label className={labelClass}>Model *</label>
                                    <input name="model" value={form.model} onChange={handle} className={inputClass} placeholder="Vios" />
                                </div>
                                <div>
                                    <label className={labelClass}>Year *</label>
                                    <input name="year" type="number" value={form.year} onChange={handle} className={inputClass} placeholder="2024" />
                                </div>
                                <div>
                                    <label className={labelClass}>Price *</label>
                                    <input name="price" type="number" value={form.price} onChange={handle} className={inputClass} placeholder="750000" />
                                </div>
                                <div>
                                    <label className={labelClass}>Color</label>
                                    <input name="color" value={form.color} onChange={handle} className={inputClass} placeholder="White" />
                                </div>
                                <div>
                                    <label className={labelClass}>Fuel Type</label>
                                    <select name="fuelType" value={form.fuelType} onChange={handle} className={inputClass}>
                                        <option value="">Select</option>
                                        {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Transmission</label>
                                    <select name="transmission" value={form.transmission} onChange={handle} className={inputClass}>
                                        <option value="">Select</option>
                                        {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Body Type</label>
                                    <input name="bodyType" value={form.bodyType} onChange={handle} className={inputClass} placeholder="Sedan" />
                                </div>
                                <div>
                                    <label className={labelClass}>Mileage (km)</label>
                                    <input name="mileage" type="number" value={form.mileage} onChange={handle} className={inputClass} placeholder="0" />
                                </div>
                                <div>
                                    <label className={labelClass}>Warranty Years</label>
                                    <input name="warrantyYears" type="number" value={form.warrantyYears} onChange={handle} className={inputClass} placeholder="2" />
                                </div>
                                <div>
                                    <label className={labelClass}>Engine Number</label>
                                    <input name="engineNumber" value={form.engineNumber} onChange={handle} className={inputClass} placeholder="ENG-001" />
                                </div>
                                <div>
                                    <label className={labelClass}>Chassis Number</label>
                                    <input name="chassisNumber" value={form.chassisNumber} onChange={handle} className={inputClass} placeholder="CHS-001" />
                                </div>
                                <div>
                                    <label className={labelClass}>Plate Number</label>
                                    <input name="plateNumber" value={form.plateNumber} onChange={handle} className={inputClass} placeholder="ABC 1234" />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Quantity (Units) *
                                    </label>
                                    <input name="quantity" type="number" min="0"
                                        value={form.quantity} onChange={handle}
                                        className={inputClass} placeholder="0" />
                                    <p className="text-xs text-gray-400 mt-1">Set to 0 = Sold / Out of Stock</p>
                                </div>
                            </div>

                            {/* Status Preview */}
                            {editVehicle && (
                                <div>
                                    <label className={labelClass}>Status Preview</label>
                                    <div className={`px-4 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 ${parseInt(form.quantity) > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        <div className={`w-2 h-2 rounded-full ${parseInt(form.quantity) > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        {parseInt(form.quantity) > 0 ? `Available — ${form.quantity} unit(s)` : 'Sold — Out of Stock'}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Updates automatically based on quantity</p>
                                </div>
                            )}

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea name="description" value={form.description} onChange={handle}
                                    className={inputClass} rows={3} placeholder="Vehicle description..." />
                            </div>
                            <div>
                                <label className={labelClass}>Warranty Details</label>
                                <textarea name="warrantyDetails" value={form.warrantyDetails} onChange={handle}
                                    className={inputClass} rows={2} placeholder="Warranty coverage details..." />
                            </div>

                            {/* Images */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className={labelClass}>
                                        Vehicle Images ({(form.imageUrls || []).length}/8) *
                                        {uploadingImages && <span className="text-blue-500 ml-2 font-normal">Uploading...</span>}
                                    </label>
                                    {(form.imageUrls || []).length < 8 && (
                                        <label className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-red-100 transition">
                                            <Plus size={12} /> Add Photos
                                            <input type="file" accept="image/*" multiple onChange={handleAddImages} className="hidden" />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mb-2">Max 8 images • First image = cover photo</p>
                                {(form.imageUrls || []).length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        {(form.imageUrls || []).map((url, i) => (
                                            <div key={i} className="relative group">
                                                <img src={getImageUrl(url)} alt=""
                                                    className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                                                {i === 0 && (
                                                    <span className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">Cover</span>
                                                )}
                                                <button onClick={() => removeImage(i)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-red-400 transition">
                                        <p className="text-gray-400 text-sm">Click to upload images</p>
                                        <input type="file" accept="image/*" multiple onChange={handleAddImages} className="hidden" />
                                    </label>
                                )}
                            </div>

                            {/* Videos */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className={labelClass}>
                                        Vehicle Videos ({(form.videoUrls || []).length}/3)
                                        {uploadingVideo && <span className="text-blue-500 ml-2 font-normal">Uploading...</span>}
                                    </label>
                                    {(form.videoUrls || []).length < 3 && (
                                        <label className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-200 transition">
                                            <Plus size={12} /> Add Video
                                            <input type="file" accept="video/*" onChange={handleAddVideo} className="hidden" />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mb-2">MP4 • Max 50MB • Up to 3 videos</p>
                                {(form.videoUrls || []).length > 0 ? (
                                    <div className="space-y-2">
                                        {(form.videoUrls || []).map((url, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                                <video src={`${IMG_BASE}${url.replace('/uploads', '')}`}
                                                    className="w-24 h-16 object-cover rounded" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-600 font-semibold">Video {i + 1}</p>
                                                </div>
                                                <button onClick={() => removeVideo(i)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-red-400 transition">
                                        <p className="text-gray-400 text-sm">Click to upload video</p>
                                        <input type="file" accept="video/*" onChange={handleAddVideo} className="hidden" />
                                    </label>
                                )}
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