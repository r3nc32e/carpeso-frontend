import { useAuth } from '../../context/AuthContext';

function BuyerDashboard() {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '32px'
            }}>
                <h1 style={{ color: '#1a1a2e' }}>🚗 Carpeso</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#666' }}>Welcome, <strong>{user?.fullName}</strong></span>
                    <button onClick={logout} style={{
                        padding: '8px 16px', backgroundColor: '#e94560',
                        color: 'white', border: 'none', borderRadius: '8px',
                        cursor: 'pointer'
                    }}>Logout</button>
                </div>
            </div>
            <h2 style={{ color: '#333' }}>Buyer Dashboard</h2>
            <p style={{ color: '#666' }}>Coming soon — catalog, orders, warranty claims!</p>
        </div>
    );
}

export default BuyerDashboard;