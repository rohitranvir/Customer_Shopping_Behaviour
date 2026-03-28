import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({ id: decoded.user_id, username: decoded.username }); // Adjust based on JWT claims
                }
            } catch (err) {
                logout();
            }
        }
    }, []);

    const login = async (username, password) => {
        const res = await api.post('auth/login/', { username, password });
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        const decoded = jwtDecode(res.data.access);
        setUser({ id: decoded.user_id, username: decoded.username });
        navigate('/');
    };

    const register = async (username, email, password) => {
        await api.post('auth/register/', { username, email, password });
        await login(username, password);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
