import { useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

function Terms() {
    usePageTitle('Terms and Conditions');
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
                    <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>

                    <div className="space-y-8 text-gray-600 leading-relaxed">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Acceptance of Terms</h2>
                            <p>By accessing and using Carpeso ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. These terms apply to all users of the platform, including buyers, administrators, and guests.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Description of Service</h2>
                            <p>Carpeso is an automotive e-commerce platform that facilitates the buying and reserving of vehicles within the National Capital Region (NCR) of the Philippines. We connect buyers with quality vehicles — brand new, pre-owned, and certified pre-owned.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">3. User Accounts</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You must provide accurate, complete, and current information when creating an account.</li>
                                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                                <li>You must immediately notify Carpeso of any unauthorized use of your account.</li>
                                <li>Carpeso reserves the right to suspend or terminate accounts that violate these terms.</li>
                                <li>One account per person is allowed. Multiple accounts are strictly prohibited.</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Vehicle Reservation Policy</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>A reservation is valid for 48 hours from the time of submission.</li>
                                <li>If the reservation is not confirmed within 48 hours, it will automatically expire and the vehicle will return to available status.</li>
                                <li>Buyers may cancel their reservation while it is in PENDING status.</li>
                                <li>Carpeso reserves the right to cancel any reservation at its discretion.</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Payment Policy</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Accepted payment methods include Cash, GCash, Maya, Bank Transfer, Car Financing, and Credit Card.</li>
                                <li>All transactions are subject to verification by our admin team.</li>
                                <li>Carpeso is not responsible for any payment disputes arising outside the platform.</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">6. Warranty Policy</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Warranty coverage begins upon delivery confirmation.</li>
                                <li>Warranty claims must be filed through the platform within the warranty period.</li>
                                <li>Warranty does not cover damage caused by accidents, misuse, or unauthorized modifications.</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">7. Prohibited Activities</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Providing false or misleading information</li>
                                <li>Using the platform for any fraudulent or illegal activity</li>
                                <li>Posting inappropriate, offensive, or defamatory content in reviews</li>
                                <li>Creating multiple accounts to circumvent bans or restrictions</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">8. Governing Law</h2>
                            <p>These Terms and Conditions are governed by the laws of the Republic of the Philippines. Any disputes shall be subject to the exclusive jurisdiction of the courts of Metro Manila.</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">9. Contact Information</h2>
                            <div className="mt-3 bg-gray-50 rounded-xl p-4">
                                <p className="font-semibold text-gray-800">Carpeso</p>
                                <p>Email: support@carpeso.com</p>
                                <p>Coverage Area: National Capital Region (NCR), Philippines</p>
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

export default Terms;