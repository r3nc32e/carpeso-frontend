import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [sessionTimer, setSessionTimer] = useState(null);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.clear();
        if (sessionTimer) clearTimeout(sessionTimer);
        window.location.href = '/login';
    }, [sessionTimer]);

    const resetSessionTimer = useCallback(() => {
        if (sessionTimer) clearTimeout(sessionTimer);
        const timer = setTimeout(() => {
            alert('Session expired. Please login again.');
            logout();
        }, SESSION_TIMEOUT);
        setSessionTimer(timer);
    }, [sessionTimer, logout]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const loginTime = localStorage.getItem('loginTime');

        if (storedUser && storedToken) {
            // Check if session expired
            if (loginTime) {
                const elapsed = Date.now() - parseInt(loginTime);
                if (elapsed > SESSION_TIMEOUT) {
                    localStorage.clear();
                    setLoading(false);
                    return;
                }
            }
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            resetSessionTimer();
        }
        setLoading(false);
    }, []);

    // Reset timer on user activity
    useEffect(() => {
        if (!token) return;
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        const handleActivity = () => resetSessionTimer();
        events.forEach(e => document.addEventListener(e, handleActivity));
        return () => events.forEach(e => document.removeEventListener(e, handleActivity));
    }, [token, resetSessionTimer]);

    const login = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', tokenData);
        localStorage.setItem('loginTime', Date.now().toString());
        resetSessionTimer();
    };

    const isAuthenticated = () => !!token;
    const isBuyer = () => user?.role === 'BUYER';
    const isAdmin = () => user?.role === 'ADMIN';
    const isSuperAdmin = () => user?.role === 'SUPERADMIN';
    const isAdminOrSuper = () => isAdmin() || isSuperAdmin();

    return (
        <AuthContext.Provider value={{
            user, token, loading,
            login, logout,
            isAuthenticated, isBuyer, isAdmin,
            isSuperAdmin, isAdminOrSuper
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);