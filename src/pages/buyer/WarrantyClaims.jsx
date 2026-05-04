import { IMG_BASE } from '../../api/config';
import { useState, useEffect } from 'react';
import { ShieldCheck, X, Plus } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

function WarrantyClaims() {
    usePageTitle('Warranty Claims');
    const [claims, setClaims] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        transactionId: '',
        issue: '',
        evidenceFile: null,
        evidenceFileName: '',
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchClaims();
        fetchOrders();
        const interval = setInterval(fetchClaims, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchClaims = async () => {
        try {
            const res = await api.get('/buyer/warranty-claims');
            setClaims(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/buyer/orders');
            const eligible = (res.data.data || []).filter(o =>
                ['DELIVERED', 'COMPLETED'].includes(o.status));
            setOrders(eligible);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        if (!form.transactionId || !form.issue.trim()) {
            setError('Please fill all required fields!'); return;
        }
        setUploading(true);
        setError('');
        try {
            let evidenceUrl = null;

            // Upload evidence if provided
            if (form.evidenceFile) {
                const fd = new FormData();
                fd.append('files', form.evidenceFile);
                const uploadRes = await api.post('/files/upload/images', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                evidenceUrl = uploadRes.data.data?.[0] || null;
            }

            await api.post('/buyer/warranty-claims', {
                transactionId: parseInt(form.transactionId),
                issue: form.issue,
                evidenceUrl,
            });
            setSuccess('Warranty claim filed successfully!');
            setShowModal(false);
            setForm({ transactionId: '', issue: '', evidenceFile: null, evidenceFileName: '' });
            fetchClaims();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to file claim!');
        } finally {
            setUploading(false);
        }
    };

    const statusColor = (status) => ({
        OPEN: 'bg-yellow-100 text-yellow-700',
        IN_PROGRESS: 'bg-blue-100 text-blue-700',
        APPROVED: 'bg-green-100 text-green-700',
        REJECTED: 'bg-red-100 text-red-700',
        RESOLVED: 'bg-green-200 text-green-800',
        CLOSED: 'bg-gray-100 text-gray-600',
    }[status] || 'bg-gray-100 text-gray-600');

    

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Warranty Claims</h2>
                        <p className="text-sm text-gray-400">{claims.length} total claims</p>
                    </div>
                    <button onClick={() => { setShowModal(true); setError(''); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition">
                        <Plus size={16} /> File a Claim
                    </button>
                </div>

                {success && (
                    <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">✅ {success}</div>
                )}

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading claims...</div>
                ) : claims.length === 0 ? (
                    <div className="text-center py-16">
                        <ShieldCheck size={48} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-gray-400">No warranty claims yet</p>
                    </div>
                ) : (
                    <div className="space-y-4 mt-4">
                        {claims.map(c => (
                            <div key={c.id} className="bg-gray-50 rounded-2xl shadow-sm p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-bold text-gray-800">Claim #{c.id}</p>
                                        <p className="text-xs text-gray-400">
                                            Filed: {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-PH') : '—'}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(c.status?.toString())}`}>
                                        {c.status?.toString()?.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Issue Description</p>
                                    <p className="text-sm text-gray-700">{c.issue || '—'}</p>
                                </div>

                                {c.evidenceUrl && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Evidence Photo</p>
                                        <img src={`${IMG_BASE}${c.evidenceUrl.replace('/uploads', '')}`}
                                            alt="Evidence"
                                            className="w-full h-32 object-cover rounded-xl border border-gray-200 cursor-pointer"
                                            onClick={() => window.open(`${IMG_BASE}${c.evidenceUrl.replace('/uploads', '')}`, '_blank')} />
                                    </div>
                                )}

                                {c.adminResponse && (
                                    <div className={`rounded-xl p-4 ${['APPROVED', 'RESOLVED'].includes(c.status?.toString()) ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                        <p className={`text-xs font-bold uppercase mb-2 ${['APPROVED', 'RESOLVED'].includes(c.status?.toString()) ? 'text-green-600' : 'text-red-600'}`}>
                                            Admin Response
                                        </p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.adminResponse}</p>
                                    </div>
                                )}

                                {c.adminNotes && !c.adminResponse && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                        <p className="text-xs font-bold text-blue-600 uppercase mb-1">Admin Notes</p>
                                        <p className="text-sm text-blue-700">{c.adminNotes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* File Claim Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-lg font-bold text-gray-800">File a Warranty Claim</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Order *</label>
                                {orders.length === 0 ? (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                                        ⚠️ No eligible orders. Only DELIVERED or COMPLETED orders can file warranty claims.
                                    </div>
                                ) : (
                                    <select value={form.transactionId}
                                        onChange={e => setForm(prev => ({ ...prev, transactionId: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition">
                                        <option value="">Select your order</option>
                                        {orders.map(o => (
                                            <option key={o.id} value={o.id}>
                                                #{o.id} — {o.vehicleBrand} {o.vehicleModel} ({o.status})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Describe the Issue *</label>
                                <textarea value={form.issue}
                                    onChange={e => setForm(prev => ({ ...prev, issue: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                    rows={4}
                                    placeholder="Describe the defect or issue with your vehicle..." />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Evidence Photo
                                    <span className="text-gray-400 font-normal ml-1">(Optional — JPG, PNG only)</span>
                                </label>
                                <label className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${form.evidenceFileName ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-red-400'}`}>
                                    {form.evidenceFileName ? (
                                        <div>
                                            <p className="text-green-600 font-semibold text-sm">✅ {form.evidenceFileName}</p>
                                            <p className="text-xs text-gray-400 mt-1">Click to change</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-gray-500 text-sm font-semibold">📸 Upload Photo Evidence</p>
                                            <p className="text-gray-400 text-xs mt-1">JPG, PNG only • Max 5MB</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden"
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (!['image/jpeg','image/png','image/jpg'].includes(file.type)) {
                                                    setError('Only JPG and PNG files are accepted!'); return;
                                                }
                                                setForm(prev => ({
                                                    ...prev,
                                                    evidenceFile: file,
                                                    evidenceFileName: file.name,
                                                }));
                                                setError('');
                                            }
                                        }} />
                                </label>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs">
                                ⚠️ Warranty claims are subject to review. False claims may result in account suspension.
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} disabled={uploading || !form.transactionId}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60">
                                {uploading ? 'Submitting...' : 'Submit Claim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WarrantyClaims;