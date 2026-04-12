import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', tokenData);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.clear();
        window.location.href = '/login';
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