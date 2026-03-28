import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Edit3, Trash2, X, Star, Eye, EyeOff } from 'lucide-react';

const emptyProject = { name: '', category: 'Web Dev', featured: false, shortDesc: '', fullDesc: '', tech: [], highlight: '', github: '', live: '', visible: true };

export default function ManageProjects() {
    const { data, updateData } = useData();
    const projects = data?.projects || [];
    const [editing, setEditing] = useState(null);
    const [techInput, setTechInput] = useState('');

    function save() {
        if (!editing.name) return;
        let updated;
        if (editing.id) {
            updated = projects.map(p => (p.id === editing.id ? editing : p));
        } else {
            updated = [...projects, { ...editing, id: Date.now() }];
        }
        updateData('projects', updated);
        setEditing(null);
    }

    function remove(id) {
        if (confirm('Delete this project?')) {
            updateData('projects', projects.filter(p => p.id !== id));
        }
    }

    function toggleField(id, field) {
        updateData('projects', projects.map(p => p.id === id ? { ...p, [field]: !p[field] } : p));
    }

    function addTech() {
        if (techInput.trim() && editing) {
            setEditing({ ...editing, tech: [...editing.tech, techInput.trim()] });
            setTechInput('');
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 500 }}>Projects</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{projects.length} projects total</p>
                </div>
                <button className="btn-gold" style={{ fontSize: '0.8rem', padding: '10px 20px' }} onClick={() => { setEditing({ ...emptyProject }); setTechInput(''); }}>
                    <Plus size={16} /> Add Project
                </button>
            </div>

            {/* Table */}
            <div className="glass-card" style={{ overflow: 'hidden', borderRadius: 12 }}>
                <table className="admin-table">
                    <thead>
                        <tr><th>Project</th><th>Category</th><th>Tech</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id}>
                                <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {p.featured && <Star size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />}
                                    {p.name || p.title}
                                </td>
                                <td><span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>{p.category}</span></td>
                                <td><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.tech.slice(0, 3).join(', ')}{p.tech.length > 3 ? '...' : ''}</span></td>
                                <td>
                                    <button onClick={() => toggleField(p.id, 'visible')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.visible ? '#22c55e' : 'var(--text-muted)' }}>
                                        {p.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => { setEditing({ ...p }); setTechInput(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)' }}><Edit3 size={16} /></button>
                                        <button onClick={() => remove(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {editing && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative' }}>
                        <button onClick={() => setEditing(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                        <h2 className="font-display" style={{ fontSize: '1.5rem', marginBottom: 24 }}>{editing.id ? 'Edit' : 'Add'} Project</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <input className="admin-input" placeholder="Project Name" value={editing.name || editing.title || ''} onChange={e => setEditing({ ...editing, name: e.target.value, title: e.target.value })} />
                            <select className="admin-input" value={editing.category || 'Web Dev'} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                                {['ML & AI', 'Web Dev', 'Data', 'Tools'].map(c => <option key={c}>{c}</option>)}
                            </select>
                            <input className="admin-input" placeholder="Short Description" value={editing.shortDesc || editing.description || ''} onChange={e => setEditing({ ...editing, shortDesc: e.target.value, description: e.target.value })} />
                            <textarea className="admin-input" placeholder="Full Description" rows={3} value={editing.fullDesc || editing.description || ''} onChange={e => setEditing({ ...editing, fullDesc: e.target.value })} style={{ resize: 'vertical' }} />
                            <input className="admin-input" placeholder="Highlight (optional)" value={editing.highlight || ''} onChange={e => setEditing({ ...editing, highlight: e.target.value })} />

                            {/* Tech Tags */}
                            <div>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <input className="admin-input" placeholder="Add tech stack..." value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())} />
                                    <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem', flexShrink: 0 }} onClick={addTech}>Add</button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {(editing.tech || []).map((t, i) => (
                                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(201, 168, 76, 0.1)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.75rem', color: 'var(--gold-light)' }}>
                                            {t}
                                            <button onClick={() => setEditing({ ...editing, tech: editing.tech.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, lineHeight: 1 }}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input className="admin-input" placeholder="GitHub URL" value={editing.github || editing.githubUrl || ''} onChange={e => setEditing({ ...editing, github: e.target.value, githubUrl: e.target.value })} />
                                <input className="admin-input" placeholder="Live Demo URL" value={editing.live || editing.liveUrl || ''} onChange={e => setEditing({ ...editing, live: e.target.value, liveUrl: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: 24 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <input type="checkbox" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} style={{ accentColor: 'var(--gold)' }} /> Featured
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <input type="checkbox" checked={editing.visible} onChange={e => setEditing({ ...editing, visible: e.target.checked })} style={{ accentColor: 'var(--gold)' }} /> Visible
                                </label>
                            </div>

                            <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={save}>
                                {editing.id ? 'Save Changes' : 'Add Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
