import { useData } from '../../context/DataContext';
import { FolderKanban, Wrench, MessageSquare, Clock } from 'lucide-react';

export default function Dashboard({ onNavigate }) {
    const { data } = useData();

    const stats = [
        { label: 'Total Projects', value: data?.projects?.length || 0, icon: FolderKanban, color: '#C9A84C' },
        { label: 'Total Skills', value: Object.values(data?.skills?.skills || {}).flat().length, icon: Wrench, color: '#22c55e' },
        { label: 'Unread Messages', value: (data?.messages || []).filter(m => !m.read).length, icon: MessageSquare, color: '#3b82f6' },
        { label: 'Last Updated', value: 'Now', icon: Clock, color: '#a855f7' },
    ];

    return (
        <div>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 500, marginBottom: 8 }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.9rem' }}>Welcome back, Rohit. Here's your portfolio overview.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
                {stats.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={20} style={{ color: s.color }} />
                                </div>
                            </div>
                            <div className="font-display" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</div>
                            <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <h2 className="font-body" style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                    { label: 'Manage Projects', tab: 'projects' },
                    { label: 'Edit Content', tab: 'content' },
                    { label: 'View Messages', tab: 'messages' },
                    { label: 'Site Settings', tab: 'settings' },
                ].map(action => (
                    <button key={action.tab} className="btn-ghost" style={{ padding: '10px 20px', fontSize: '0.8rem' }} onClick={() => onNavigate(action.tab)}>
                        {action.label}
                    </button>
                ))}
            </div>

            {/* Recent Messages */}
            {data?.messages?.length > 0 && (
                <div style={{ marginTop: 40 }}>
                    <h2 className="font-body" style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 16 }}>Recent Messages</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {data.messages.slice(-3).reverse().map(msg => (
                            <div key={msg.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{msg.name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 8 }}>— {msg.subject}</span>
                                </div>
                                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                    {msg.read ? 'Read' : '● New'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
