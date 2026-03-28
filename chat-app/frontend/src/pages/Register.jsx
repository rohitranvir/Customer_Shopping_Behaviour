import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(username, email, password);
            navigate('/');
        } catch (err) {
            const d = err.response?.data;
            if (d && typeof d === 'object') {
                const first = Object.values(d).flat()[0];
                setError(typeof first === 'string' ? first : 'Registration failed');
            } else { setError('Registration failed'); }
        } finally { setLoading(false); }
    }

    return (
        <div className="auth-container">
            <div style={{ position: 'fixed', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #6EE7B711 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: -80, right: 100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #818CF811 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="auth-card">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: 'linear-gradient(135deg, #6EE7B7, #3B82F6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, boxShadow: '0 0 24px #6EE7B733',
                    }}>⚡</div>
                </div>

                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', textAlign: 'center', marginBottom: 4 }}>
                    Create account
                </h1>
                <p style={{ fontSize: 13, color: '#4B5563', textAlign: 'center', marginBottom: 28 }}>
                    Join the conversation
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12.5, color: '#EF4444',
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: 0.5, marginBottom: 6, display: 'block', textTransform: 'uppercase' }}>Username</label>
                        <input className="auth-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username" required />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: 0.5, marginBottom: 6, display: 'block', textTransform: 'uppercase' }}>Email</label>
                        <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: 0.5, marginBottom: 6, display: 'block', textTransform: 'uppercase' }}>Password</label>
                        <input className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required />
                    </div>
                    <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: 6 }}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 12.5, color: '#4B5563', marginTop: 20 }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#6EE7B7', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
