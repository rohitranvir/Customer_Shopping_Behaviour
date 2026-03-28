import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [loading, setLoading] = useState(true);

    // Fetch current user profile on mount if token exists
    useEffect(() => {
        if (token) {
            fetchMe().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    async function login(username, password) {
        const { data } = await api.post('/login/', { username, password });
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        setToken(data.tokens.access);
        setUser(data.user);
        return data;
    }

    async function register(username, email, password) {
        const { data } = await api.post('/register/', {
            username,
            email,
            password,
        });

        // The register endpoint returns { tokens, user }
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        setToken(data.tokens.access);
        setUser(data.user);
        return data;
    }

    function logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setUser(null);
    }

    async function fetchMe() {
        try {
            const { data } = await api.get('/me/');
            setUser(data);
        } catch {
            // Token might be expired and refresh also failed
            logout();
        }
    }

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, logout, fetchMe }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
