import { useData } from '../../context/DataContext';
import { Mail, Trash2, Eye } from 'lucide-react';

export default function Messages() {
    const { data, updateData } = useData();
    const messages = data?.messages || [];

    function toggleRead(id) {
        updateData('messages', messages.map(m => m.id === id ? { ...m, read: !m.read } : m));
    }

    function remove(id) {
        if (confirm('Delete this message?')) {
            updateData('messages', messages.filter(m => m.id !== id));
        }
    }

    function exportCSV() {
        const header = 'Name,Email,Subject,Message,Date,Read\n';
        const rows = messages.map(m => `"${m.name}","${m.email}","${m.subject}","${(m.message || '').replace(/"/g, '""')}","${m.date}","${m.read}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'messages.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 500 }}>Messages</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{messages.length} messages • {messages.filter(m => !m.read).length} unread</p>
                </div>
                {messages.length > 0 && (
                    <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '10px 20px' }} onClick={exportCSV}>
                        Export CSV
                    </button>
                )}
            </div>

            {messages.length === 0 ? (
                <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
                    <Mail size={40} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)' }}>No messages yet. They'll appear here when visitors use the contact form.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[...messages].reverse().map(msg => (
                        <div key={msg.id} className="glass-card" style={{ padding: '20px 24px', borderLeft: `3px solid ${msg.read ? 'var(--border)' : 'var(--gold)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{msg.name}</span>
                                    <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.8rem' }}>{msg.email}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                                        {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                                    </span>
                                    <button onClick={() => toggleRead(msg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: msg.read ? 'var(--text-muted)' : 'var(--gold)' }}>
                                        <Eye size={16} />
                                    </button>
                                    <button onClick={() => remove(msg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'inline-block', padding: '3px 10px', background: 'rgba(201, 168, 76, 0.06)', border: '1px solid var(--border)', borderRadius: 4, marginBottom: 8 }}>
                                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--gold)', textTransform: 'uppercase' }}>{msg.subject}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{msg.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
