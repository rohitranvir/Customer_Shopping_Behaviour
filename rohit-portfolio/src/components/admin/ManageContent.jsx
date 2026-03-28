import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function ManageContent() {
    const { data, updateData } = useData();
    const [tab, setTab] = useState('about');
    const [about, setAbout] = useState(data?.about || {});
    const [experience, setExperience] = useState(data?.experience || { experience: [], education: [] });
    const [saved, setSaved] = useState('');

    function saveAbout() {
        updateData('about', about);
        flash('About info saved!');
    }

    function saveExperience() {
        updateData('experience', experience);
        flash('Experience saved!');
    }

    function flash(msg) {
        setSaved(msg);
        setTimeout(() => setSaved(''), 2000);
    }

    const tabs = [
        { id: 'about', label: 'About Me' },
        { id: 'experience', label: 'Experience' },
        { id: 'education', label: 'Education' },
    ];

    return (
        <div>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 500, marginBottom: 8 }}>Manage Content</h1>
            {saved && <p style={{ color: '#22c55e', fontSize: '0.85rem', marginBottom: 16, padding: '8px 16px', background: 'rgba(34,197,94,0.08)', borderRadius: 6, display: 'inline-block' }}>✓ {saved}</p>}

            <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
                {tabs.map(t => (
                    <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ABOUT */}
            {tab === 'about' && (
                <div className="glass-card" style={{ padding: 32 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Name</label>
                                <input className="admin-input" value={about.name || ''} onChange={e => setAbout({ ...about, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Tagline</label>
                                <input className="admin-input" value={about.tagline || ''} onChange={e => setAbout({ ...about, tagline: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Bio Paragraphs</label>
                            {(about.bio || []).map((p, i) => (
                                <textarea key={i} className="admin-input" rows={3} value={p} style={{ marginBottom: 8, resize: 'vertical' }}
                                    onChange={e => { const b = [...about.bio]; b[i] = e.target.value; setAbout({ ...about, bio: b }); }} />
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <div>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Projects Count</label>
                                <input className="admin-input" value={about.stats?.projects || ''} onChange={e => setAbout({ ...about, stats: { ...about.stats, projects: e.target.value } })} />
                            </div>
                            <div>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Internships</label>
                                <input className="admin-input" value={about.stats?.internships || ''} onChange={e => setAbout({ ...about, stats: { ...about.stats, internships: e.target.value } })} />
                            </div>
                            <div>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>CGPA</label>
                                <input className="admin-input" value={about.stats?.cgpa || ''} onChange={e => setAbout({ ...about, stats: { ...about.stats, cgpa: e.target.value } })} />
                            </div>
                        </div>

                        <div>
                            <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Email</label>
                            <input className="admin-input" value={about.social?.email || ''} onChange={e => setAbout({ ...about, social: { ...about.social, email: e.target.value } })} />
                        </div>

                        <button className="btn-gold" style={{ alignSelf: 'flex-start' }} onClick={saveAbout}>
                            <Save size={16} /> Save About
                        </button>
                    </div>
                </div>
            )}

            {/* EXPERIENCE */}
            {tab === 'experience' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {(experience.experience || []).map((exp, i) => (
                        <div key={exp.id || i} className="glass-card" style={{ padding: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <input className="admin-input" placeholder="Role" value={exp.role} onChange={e => { const x = [...experience.experience]; x[i] = { ...x[i], role: e.target.value }; setExperience({ ...experience, experience: x }); }} />
                                <input className="admin-input" placeholder="Company" value={exp.company} onChange={e => { const x = [...experience.experience]; x[i] = { ...x[i], company: e.target.value }; setExperience({ ...experience, experience: x }); }} />
                            </div>
                            <input className="admin-input" placeholder="Duration" value={exp.duration} style={{ marginBottom: 12 }} onChange={e => { const x = [...experience.experience]; x[i] = { ...x[i], duration: e.target.value }; setExperience({ ...experience, experience: x }); }} />
                            <textarea className="admin-input" placeholder="Description (one per line)" rows={4} value={(exp.description || []).join('\n')} style={{ resize: 'vertical' }}
                                onChange={e => { const x = [...experience.experience]; x[i] = { ...x[i], description: e.target.value.split('\n') }; setExperience({ ...experience, experience: x }); }} />
                            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => { const x = experience.experience.filter((_, j) => j !== i); setExperience({ ...experience, experience: x }); }}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '10px 20px' }}
                            onClick={() => setExperience({ ...experience, experience: [...experience.experience, { id: Date.now(), role: '', company: '', duration: '', description: [], tools: [] }] })}>
                            <Plus size={14} /> Add Experience
                        </button>
                        <button className="btn-gold" style={{ fontSize: '0.8rem', padding: '10px 20px' }} onClick={saveExperience}>
                            <Save size={16} /> Save
                        </button>
                    </div>
                </div>
            )}

            {/* EDUCATION */}
            {tab === 'education' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {(experience.education || []).map((edu, i) => (
                        <div key={edu.id || i} className="glass-card" style={{ padding: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <input className="admin-input" placeholder="Degree" value={edu.degree} onChange={e => { const x = [...experience.education]; x[i] = { ...x[i], degree: e.target.value }; setExperience({ ...experience, education: x }); }} />
                                <input className="admin-input" placeholder="Institution" value={edu.institution} onChange={e => { const x = [...experience.education]; x[i] = { ...x[i], institution: e.target.value }; setExperience({ ...experience, education: x }); }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input className="admin-input" placeholder="Year" value={edu.year} onChange={e => { const x = [...experience.education]; x[i] = { ...x[i], year: e.target.value }; setExperience({ ...experience, education: x }); }} />
                                <input className="admin-input" placeholder="Score" value={edu.score} onChange={e => { const x = [...experience.education]; x[i] = { ...x[i], score: e.target.value }; setExperience({ ...experience, education: x }); }} />
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => { const x = experience.education.filter((_, j) => j !== i); setExperience({ ...experience, education: x }); }}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '10px 20px' }}
                            onClick={() => setExperience({ ...experience, education: [...experience.education, { id: Date.now(), degree: '', institution: '', year: '', score: '' }] })}>
                            <Plus size={14} /> Add Education
                        </button>
                        <button className="btn-gold" style={{ fontSize: '0.8rem', padding: '10px 20px' }} onClick={saveExperience}>
                            <Save size={16} /> Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
