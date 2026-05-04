import { useState, useEffect } from 'react';
import { Shield, Lock, Zap, Eye, Key, Server, CheckCircle, AlertTriangle, Globe, Wifi } from 'lucide-react';
import api from '../../api/axios';
import usePageTitle from '../../hooks/usePageTitle';

const Badge = ({ label, color }) => {
    const colors = {
        green:  'bg-green-100 text-green-700 border-green-200',
        blue:   'bg-blue-100 text-blue-700 border-blue-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        red:    'bg-red-100 text-red-600 border-red-200',
        amber:  'bg-amber-100 text-amber-700 border-amber-200',
        gray:   'bg-gray-100 text-gray-600 border-gray-200',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${colors[color] || colors.gray}`}>
            {label}
        </span>
    );
};

const SecurityCard = ({ icon, title, status, description, details, color }) => {
    const [expanded, setExpanded] = useState(false);
    const colors = {
        green:  { border: 'border-green-200', icon: 'bg-green-100 text-green-600', dot: 'bg-green-500' },
        blue:   { border: 'border-blue-200',  icon: 'bg-blue-100 text-blue-600',   dot: 'bg-blue-500' },
        purple: { border: 'border-purple-200',icon: 'bg-purple-100 text-purple-600',dot: 'bg-purple-500' },
        red:    { border: 'border-red-200',   icon: 'bg-red-100 text-red-600',     dot: 'bg-red-500' },
        amber:  { border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500' },
    };
    const c = colors[color] || colors.green;

    return (
        <div className={`bg-white rounded-2xl border-2 ${c.border} p-5 transition hover:shadow-md cursor-pointer`}
            onClick={() => setExpanded(!expanded)}>
            <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
                            <span className="text-xs font-semibold text-gray-500">{status}</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                </div>
                <span className="text-gray-300 text-xs flex-shrink-0">{expanded ? '▲' : '▼'}</span>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    {details.map((d, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <CheckCircle size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-600">{d}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function SecurityInfo() {
    usePageTitle('Security Info');

    const [vpnInfo, setVpnInfo]       = useState(null);
    const [rateLimits, setRateLimits] = useState(null);
    const [loading, setLoading]       = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [vpn, rate] = await Promise.all([
                    api.get('/public/security/vpn-info'),
                    api.get('/public/security/rate-limits'),
                ]);
                setVpnInfo(vpn.data.data);
                setRateLimits(rate.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const securityCards = [
        {
            icon: <Key size={20} />,
            title: 'JWT — Session Security',
            status: 'ACTIVE',
            color: 'green',
            description: 'Stateless authentication using JSON Web Tokens. All API calls are verified server-side.',
            details: [
                'RS256-signed tokens — tamper-proof',
                '7-day expiration with 30-minute session timeout',
                'Token stored in localStorage, sent via Authorization: Bearer header',
                'On 401 response — auto logout and redirect to login',
                'STRIDE: Spoofing mitigation',
            ],
        },
        {
            icon: <Shield size={20} />,
            title: 'RBAC — Role-Based Access Control',
            status: 'ACTIVE',
            color: 'blue',
            description: '3-tier role system: SUPERADMIN → ADMIN (with privileges) → BUYER. Each role has strictly defined access.',
            details: [
                'SUPERADMIN — full system access, manages sub-admins',
                'ADMIN — 5 privilege types: Inventory, Transaction, Account, Content, Sales',
                'BUYER — can only access their own data',
                'Every API endpoint checks role before processing',
                'STRIDE: Elevation of Privilege mitigation',
            ],
        },
        {
            icon: <Lock size={20} />,
            title: 'MFA / OTP — Multi-Factor Authentication',
            status: 'ACTIVE',
            color: 'purple',
            description: 'Email-based OTP required for registration, email changes, and password changes.',
            details: [
                '6-digit OTP sent to registered Gmail via Spring Mail',
                'OTP expires after 10 minutes',
                'Required for: registration verification, email change, password change',
                'Prevents account takeover even if password is compromised',
                'STRIDE: Spoofing mitigation',
            ],
        },
        {
            icon: <Zap size={20} />,
            title: 'Rate Limiting — Brute Force Protection',
            status: 'ACTIVE',
            color: 'red',
            description: 'Sliding window counter per IP. Login blocked after 5 failed attempts per minute.',
            details: [
                'Login: 5 attempts / 60 seconds per IP',
                'Register: 3 attempts / 60 seconds per IP',
                'Forgot Password: 3 attempts / 60 seconds per IP',
                'Returns 429 Too Many Requests with Retry-After header',
                'Pure Java ConcurrentHashMap — no external dependency',
                'STRIDE: Denial of Service mitigation',
            ],
        },
        {
            icon: <Wifi size={20} />,
            title: 'VPN — IP Whitelist Tunnel',
            status: vpnInfo?.configuration?.enabled ? 'ACTIVE' : 'INACTIVE',
            color: 'amber',
            description: 'Admin endpoints restricted to trusted IP addresses — simulates VPN tunnel access control.',
            details: [
                'All /api/admin/** and /api/superadmin/** are VPN-protected',
                `Trusted IPs: ${vpnInfo?.configuration?.allowedIps?.join(', ') || 'Loading...'}`,
                'Returns 403 Forbidden with VPN rejection message for untrusted IPs',
                'X-VPN-Status header added to every response (visible in DevTools)',
                'Production: replace with WireGuard/OpenVPN subnet',
                'STRIDE: Spoofing + Information Disclosure mitigation',
            ],
        },
        {
            icon: <Eye size={20} />,
            title: 'AES-256 — Encryption at Rest',
            status: 'ACTIVE',
            color: 'green',
            description: 'Sensitive fields encrypted in the database using AES-256 via JPA AttributeConverter.',
            details: [
                'AesEncryptConverter applied to sensitive User fields',
                'Encrypted before INSERT — decrypted on SELECT automatically',
                'Even if DB is compromised, data is unreadable without the key',
                'Key stored in application.properties (production: use AWS KMS)',
                'STRIDE: Information Disclosure mitigation',
            ],
        },
        {
            icon: <Server size={20} />,
            title: 'Audit Trail — Forensic Logging',
            status: 'ACTIVE',
            color: 'blue',
            description: 'Every significant action is logged with user, timestamp, entity, and change details.',
            details: [
                'Logs: login, logout, CRUD operations, admin actions, security events',
                'Stored in audit_logs table — immutable once written',
                'Accessible only to SUPERADMIN and SALES_ANALYST role',
                'Non-repudiation — users cannot deny their actions',
                'STRIDE: Repudiation mitigation',
            ],
        },
        {
            icon: <Globe size={20} />,
            title: 'TLS 1.3 — Encryption in Transit',
            status: 'READY',
            color: 'purple',
            description: 'HTTPS via self-signed certificate. TLS 1.3 + 1.2 enabled. One config change to activate.',
            details: [
                'carpeso-keystore.p12 already generated (RSA 2048-bit, SHA384)',
                'CN=Carpeso Automotive, O=Carpeso Inc, L=Quezon City, C=PH',
                'Protocols: TLSv1.3 (preferred), TLSv1.2 (fallback)',
                'To activate: uncomment 6 lines in application.properties + update config.js',
                'STRIDE: Tampering + Information Disclosure mitigation',
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <Shield size={22} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Security Stack</h2>
                        <p className="text-red-200 text-sm">Carpeso Automotive E-Commerce Supersystem</p>
                    </div>
                </div>
                <p className="text-red-100 text-sm mt-3 leading-relaxed">
                    Implements real-world cybersecurity architecture across the 7 domains of IT infrastructure.
                    All 6 STRIDE threat categories are addressed.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                    {['RBAC', 'JWT', 'OTP/MFA', 'AES-256', 'TLS 1.3', 'Rate Limiting', 'VPN Simulation', 'Audit Trail'].map(t => (
                        <span key={t} className="px-2.5 py-1 bg-white bg-opacity-20 rounded-full text-xs font-bold text-white">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* STRIDE coverage */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">
                    STRIDE Threat Coverage
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                        { threat: 'Spoofing',              mitigation: 'JWT + OTP + VPN',      color: 'green' },
                        { threat: 'Tampering',             mitigation: 'AES-256 + TLS',         color: 'blue' },
                        { threat: 'Repudiation',           mitigation: 'Audit Trail',            color: 'purple' },
                        { threat: 'Info Disclosure',       mitigation: 'RBAC + AES + VPN',      color: 'red' },
                        { threat: 'Denial of Service',     mitigation: 'Rate Limiting',          color: 'amber' },
                        { threat: 'Elevation of Privilege',mitigation: 'RBAC + IP Whitelist',   color: 'green' },
                    ].map(({ threat, mitigation, color }) => (
                        <div key={threat} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs font-bold text-gray-700">{threat}</p>
                            <Badge label={mitigation} color={color} />
                        </div>
                    ))}
                </div>
            </div>

            {/* VPN Status Card */}
            {vpnInfo && (
                <div className={`rounded-2xl p-5 border-2 ${
                    vpnInfo.yourConnection?.canAccessAdmin
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <Wifi size={20} className={vpnInfo.yourConnection?.canAccessAdmin ? 'text-green-600' : 'text-red-500'} />
                        <div>
                            <p className="font-bold text-gray-800 text-sm">Your VPN Status</p>
                            <p className={`text-sm font-semibold ${vpnInfo.yourConnection?.canAccessAdmin ? 'text-green-700' : 'text-red-600'}`}>
                                {vpnInfo.yourConnection?.status}
                            </p>
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-xs text-gray-400">Your IP</p>
                            <p className="text-sm font-bold text-gray-700 font-mono">{vpnInfo.yourConnection?.ipAddress}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Cards */}
            <div>
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">
                    Security Components — click any card for details
                </h3>
                {loading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading security info...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {securityCards.map((card, i) => (
                            <SecurityCard key={i} {...card} />
                        ))}
                    </div>
                )}
            </div>

            {/* Rate limit summary */}
            {rateLimits && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                        <Zap size={16} className="text-red-500" /> Rate Limit Configuration
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(rateLimits.limits || {}).map(([endpoint, limit]) => (
                            <div key={endpoint} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <code className="text-xs text-gray-600 font-mono">{endpoint}</code>
                                <Badge label={limit} color="red" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-center text-xs text-gray-300 pb-4">
                Carpeso Security Stack — SBIT-3C © 2026
            </p>
        </div>
    );
}

export default SecurityInfo;