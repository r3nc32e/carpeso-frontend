import { useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

function Privacy() {
    usePageTitle('Privacy Policy');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-red-600 text-white py-4 px-6 flex items-center gap-4 sticky top-0 z-10 shadow-lg">
                <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/register')}
                    className="text-white hover:text-red-200 font-semibold text-sm flex items-center gap-2">
                    ← Back
                </button>
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Carpeso" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                    <span className="font-bold">Carpeso</span>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                    <p className="text-gray-400 text-sm mb-2">Last updated: April 2026</p>
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm mb-8">
                        🔒 This Privacy Policy is in compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> of the Philippines.
                    </div>

                    <div className="space-y-8 text-gray-600 leading-relaxed">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Introduction</h2>
                            <p>Carpeso is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform, in accordance with the Data Privacy Act of 2012 (R.A. 10173).</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Personal Data We Collect</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Identity Information:</strong> First name, middle name, last name, suffix</li>
                                <li><strong>Contact Information:</strong> Email address, phone number</li>
                                <li><strong>Address Information:</strong> City/Municipality, Barangay, Street address</li>
                                <li><strong>Transaction Information:</strong> Purchase history, reservation details, payment method</li>
                                <li><strong>Account Information:</strong> Login credentials (passwords are encrypted)</li>
                                <li><strong>Activity Logs:</strong> Login times, actions performed on the platform</li>
                                <li><strong>Government IDs:</strong> Driver's License, PhilSys, TIN, or Passport (for identity verification)</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">3. How We Use Your Data</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To create and manage your account</li>
                                <li>To process vehicle reservations and transactions</li>
                                <li>To send email notifications about your orders and account</li>
                                <li>To verify your identity for vehicle purchases</li>
                                <li>To detect and prevent fraud or unauthorized activities</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Data Storage and Security</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Your data is stored in a secure PostgreSQL database</li>
                                <li>Sensitive data is encrypted using AES-256 encryption</li>
                                <li>Passwords are hashed using BCrypt</li>
                                <li>All data transmissions are protected using JWT authentication</li>
                                <li>We implement security headers to protect against XSS and CSRF attacks</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Your Rights Under R.A. 10173</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Right to be Informed</strong> — You have the right to know how your data is collected and used</li>
                                <li><strong>Right to Access</strong> — You can request a copy of your personal data</li>
                                <li><strong>Right to Rectification</strong> — You can correct inaccurate personal data</li>
                                <li><strong>Right to Erasure</strong> — You can request deletion of your account and data</li>
                                <li><strong>Right to Object</strong> — You can object to the processing of your personal data</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">6. Contact Our Data Protection Officer</h2>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="font-semibold text-gray-800">Carpeso Data Protection Officer</p>
                                <p>Email: privacy@carpeso.com</p>
                                <p>Coverage: National Capital Region (NCR), Philippines</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/register')}
                            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">
                            I Understand — Go Back
                        </button>
                    </div>
                </div>
            </div>

            <footer className="bg-red-600 text-red-100 text-center py-3 text-xs">
                © 2026 Carpeso — All Rights Reserved
            </footer>
        </div>
    );
}

export default Privacy;