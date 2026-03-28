import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function getUserColor(name) {
    const colors = ['#F9A8D4', '#93C5FD', '#FCD34D', '#C084FC', '#FB923C', '#67E8F9', '#6EE7B7'];
    let h = 0;
    for (let i = 0; i < (name || '').length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
}

export default function RoomList() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: '', description: '', room_type: 'public', password: '' });
    const [error, setError] = useState('');

    useEffect(() => { fetchRooms(); }, []);

    async function fetchRooms() {
        try { const { data } = await api.get('/rooms/'); setRooms(data.results || data); }
        catch { /**/ } finally { setLoading(false); }
    }

    async function handleCreate(e) {
        e.preventDefault(); setError('');
        try {
            const { data } = await api.post('/rooms/', newRoom);
            setNewRoom({ name: '', description: '', room_type: 'public', password: '' });
            setShowCreate(false);
            navigate(`/room/${data.id}`);
        } catch (err) {
            setError(err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to create room');
        }
    }

    if (loading) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#07070E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #1E293B', borderTopColor: '#6EE7B7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#07070E', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
            {/* Ambient glows */}
            <div style={{ position: 'fixed', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #6EE7B711 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: -80, right: 100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #818CF811 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Header */}
            <header style={{
                background: 'rgba(13,13,20,0.97)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backdropFilter: 'blur(20px)', position: 'relative', zIndex: 1,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6EE7B7, #3B82F6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, boxShadow: '0 0 16px #6EE7B733',
                    }}>⚡</div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9' }}>ChatRooms</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 12.5, color: '#4B5563' }}>
                        Hello, <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{user?.username}</span>
                    </span>
                    <button onClick={() => { logout(); navigate('/login'); }}
                        style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#EF4444', fontSize: 12, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                        Logout
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px', position: 'relative', zIndex: 1 }}>
                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12.5, color: '#EF4444' }}>{error}</div>
                )}

                {/* Action bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9' }}>Rooms</h2>
                    <button onClick={() => setShowCreate(!showCreate)} className="send-btn"
                        style={{ background: '#6EE7B7', border: 'none', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', color: '#07070E', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 0 12px #6EE7B733' }}>
                        {showCreate ? 'Cancel' : '+ New Room'}
                    </button>
                </div>

                {/* Create room form */}
                {showCreate && (
                    <form onSubmit={handleCreate} style={{
                        background: 'rgba(13,13,20,0.95)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12,
                        backdropFilter: 'blur(20px)',
                    }}>
                        <input className="auth-input" placeholder="Room name" required value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} />
                        <input className="auth-input" placeholder="Description (optional)" value={newRoom.description} onChange={e => setNewRoom({ ...newRoom, description: e.target.value })} />
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <select value={newRoom.room_type} onChange={e => setNewRoom({ ...newRoom, room_type: e.target.value })}
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: '#E2E8F0', fontSize: 13, fontFamily: 'inherit' }}>
                                <option value="public">🌐 Public</option>
                                <option value="private">🔒 Private</option>
                            </select>
                            {newRoom.room_type === 'private' && (
                                <input className="auth-input" type="password" placeholder="Room password" value={newRoom.password} onChange={e => setNewRoom({ ...newRoom, password: e.target.value })} style={{ flex: 1 }} />
                            )}
                        </div>
                        <button className="auth-btn" type="submit">Create Room</button>
                    </form>
                )}

                {/* Room list */}
                {rooms.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <p style={{ color: '#374151', fontSize: 13 }}>No rooms yet. Create the first one!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {rooms.map(room => (
                            <div key={room.id} className="room-item" onClick={() => navigate(`/room/${room.id}`)}
                                style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: 14, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.15s',
                                    display: 'flex', alignItems: 'center', gap: 14,
                                }}>
                                <span style={{ fontSize: 24 }}>{room.room_type === 'private' ? '🔒' : '🌐'}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>{room.name}</span>
                                        <span style={{
                                            fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                                            background: room.room_type === 'public' ? 'rgba(74,222,128,0.1)' : 'rgba(250,204,21,0.1)',
                                            color: room.room_type === 'public' ? '#4ADE80' : '#FACC15',
                                            border: `1px solid ${room.room_type === 'public' ? 'rgba(74,222,128,0.2)' : 'rgba(250,204,21,0.2)'}`,
                                        }}>{room.room_type}</span>
                                    </div>
                                    {room.description && <p style={{ fontSize: 11.5, color: '#4B5563', marginTop: 3 }}>{room.description}</p>}
                                    <p style={{ fontSize: 10, color: '#374151', marginTop: 4 }}>{room.member_count} member{room.member_count !== 1 ? 's' : ''}</p>
                                </div>
                                <span style={{ color: '#374151', fontSize: 18 }}>→</span>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
