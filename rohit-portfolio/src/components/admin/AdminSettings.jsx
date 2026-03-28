import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Save, RefreshCw } from 'lucide-react';

export default function AdminSettings() {
    const { data, updateData, resetData } = useData();
    const settings = data?.settings || {};
    const [local, setLocal] = useState(settings);
    const [saved, setSaved] = useState(false);

    function save() {
        updateData('settings', local);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 500, marginBottom: 32 }}>Settings</h1>

            <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                <h2 className="font-body" style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 20 }}>SEO Settings</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Site Title</label>
                        <input className="admin-input" value={local.siteTitle || ''} onChange={e => setLocal({ ...local, siteTitle: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Meta Description</label>
                        <textarea className="admin-input" rows={3} value={local.metaDescription || ''} onChange={e => setLocal({ ...local, metaDescription: e.target.value })} style={{ resize: 'vertical' }} />
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                <h2 className="font-body" style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 20 }}>Section Visibility</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {Object.entries(local.sectionVisibility || {}).map(([key, val]) => (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                            <input type="checkbox" checked={val} onChange={e => setLocal({ ...local, sectionVisibility: { ...local.sectionVisibility, [key]: e.target.checked } })} style={{ accentColor: 'var(--gold)' }} />
                            {key}
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-gold" onClick={save}>
                    <Save size={16} /> {saved ? '✓ Saved!' : 'Save Settings'}
                </button>
                <button className="btn-ghost" onClick={() => { if (confirm('Reset all data to defaults? This cannot be undone.')) resetData(); }}>
                    <RefreshCw size={16} /> Reset All Data
                </button>
            </div>
        </div>
    );
}
