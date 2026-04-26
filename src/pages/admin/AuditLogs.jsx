import { useState, useEffect } from 'react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';


function AuditLogs() {
    usePageTitle('Audit Logs');
    
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/admin/audit-logs');
            setLogs(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const actionColor = (action) => {
        if (action?.includes('LOGIN_FAILED')) return 'bg-red-100 text-red-700';
        if (action?.includes('LOGIN')) return 'bg-green-100 text-green-700';
        if (action?.includes('REGISTERED')) return 'bg-blue-100 text-blue-700';
        if (action?.includes('DELETED')) return 'bg-red-100 text-red-700';
        if (action?.includes('SUSPENDED')) return 'bg-orange-100 text-orange-700';
        if (action?.includes('VEHICLE')) return 'bg-purple-100 text-purple-700';
        if (action?.includes('TRANSACTION') || action?.includes('RESERVATION')) return 'bg-yellow-100 text-yellow-700';
        if (action?.includes('CATEGORY')) return 'bg-indigo-100 text-indigo-700';
        return 'bg-gray-100 text-gray-600';
    };

    const actions = ['ALL', ...new Set(logs.map(l => l.action))];

    const filtered = logs.filter(l => {
        const matchFilter = filter === 'ALL' || l.action === filter;
        const matchSearch = search === '' ||
            l.performedBy?.toLowerCase().includes(search.toLowerCase()) ||
            l.action?.toLowerCase().includes(search.toLowerCase()) ||
            l.details?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-gray-800">Audit Logs</h2>
                <p className="text-sm text-gray-400">{logs.length} total log entries</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    placeholder="Search by user, action, or details..."
                />
                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white"
                >
                    {actions.map(a => (
                        <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['#', 'Action', 'Performed By', 'Target', 'Details', 'IP Address', 'Timestamp'].map(h => (
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
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                        No logs found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(l => (
                                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{l.id}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${actionColor(l.action)}`}>
                                                {l.action?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700 font-medium">{l.performedBy}</td>
                                        <td className="py-3 px-4 text-gray-500 text-xs">
                                            {l.targetEntity} {l.targetId ? `#${l.targetId}` : ''}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-xs max-w-xs truncate">
                                            {l.details}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-xs font-mono">
                                            {l.ipAddress}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-xs">
                                            {new Date(l.timestamp).toLocaleString('en-PH')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AuditLogs;