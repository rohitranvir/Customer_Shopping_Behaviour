import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function ManageCertifications() {
    const { data, updateData } = useData();
    const [certs, setCerts] = useState(data?.certifications || []);
    const [saved, setSaved] = useState('');

    function handleSave() {
        updateData('certifications', certs);
        setSaved('Certifications saved successfully!');
        setTimeout(() => setSaved(''), 2000);
    }

    function addCert() {
        setCerts([...certs, { id: Date.now(), name: '', platform: '', date: '', link: '' }]);
    }

    function updateCert(index, field, value) {
        const updated = [...certs];
        updated[index] = { ...updated[index], [field]: value };
        setCerts(updated);
    }

    function removeCert(index) {
        setCerts(certs.filter((_, i) => i !== index));
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 500 }}>Manage Certifications</h1>
                <button className="btn-gold" style={{ padding: '10px 24px', fontSize: '0.85rem' }} onClick={handleSave}>
                    <Save size={16} /> Save Changes
                </button>
            </div>
            {saved && <p style={{ color: '#22c55e', fontSize: '0.85rem', marginBottom: 16, padding: '8px 16px', background: 'rgba(34,197,94,0.08)', borderRadius: 6, display: 'inline-block' }}>✓ {saved}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {certs.map((cert, index) => (
                    <div key={cert.id || index} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Certification Name</label>
                                <input className="admin-input" placeholder="e.g. Machine Learning Specialization" value={cert.name} onChange={e => updateCert(index, 'name', e.target.value)} style={{ marginBottom: 0 }} />
                            </div>
                            <div>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Platform / Issuer</label>
                                <input className="admin-input" placeholder="e.g. Coursera" value={cert.platform} onChange={e => updateCert(index, 'platform', e.target.value)} style={{ marginBottom: 0 }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                            <div>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Date / Year</label>
                                <input className="admin-input" placeholder="e.g. 2024" value={cert.date} onChange={e => updateCert(index, 'date', e.target.value)} style={{ marginBottom: 0 }} />
                            </div>
                            <div>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Certificate URL / Link</label>
                                <input className="admin-input" placeholder="https://" value={cert.link} onChange={e => updateCert(index, 'link', e.target.value)} style={{ marginBottom: 0 }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button onClick={() => removeCert(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                                <Trash2 size={14} /> Remove
                            </button>
                        </div>
                    </div>
                ))}

                <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '10px 20px', alignSelf: 'flex-start' }} onClick={addCert}>
                    <Plus size={14} /> Add Certification
                </button>
            </div>
        </div>
    );
}
