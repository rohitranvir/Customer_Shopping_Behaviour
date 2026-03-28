import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token === 'authenticated_rohit_admin') {
            setIsAuth(true);
        }
    }, []);

    function login(username, password) {
        if (username === 'admin' && password === 'rohit@2025') {
            localStorage.setItem('adminToken', 'authenticated_rohit_admin');
            setIsAuth(true);
            return true;
        }
        return false;
    }

    function logout() {
        localStorage.removeItem('adminToken');
        setIsAuth(false);
    }

    return (
        <AuthContext.Provider value={{ isAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
