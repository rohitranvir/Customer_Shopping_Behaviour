import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (!login(username, password)) {
            setError('Invalid credentials. Please try again.');
            setTimeout(() => setError(''), 3000);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
            <div className="glass-card" style={{ padding: '48px 40px', width: '100%', maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div className="font-display" style={{ fontSize: '2.5rem', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>RR</div>
                    <p className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Admin Panel</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Username</label>
                        <input className="admin-input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" required />
                    </div>
                    <div>
                        <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Password</label>
                        <input className="admin-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</p>
                    )}

                    <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                        <Lock size={16} /> Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
