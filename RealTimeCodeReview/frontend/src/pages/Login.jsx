import React, { useState, useContext } from 'react';
import { AuthContext } from '../services/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.username, formData.password);
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Username" required
                        className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                    />
                    <input type="password" placeholder="Password" required
                        className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="submit" className="w-full py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition">
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p>Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Register</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
