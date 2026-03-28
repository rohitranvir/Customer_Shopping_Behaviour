import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';

export default function ManageSkills() {
    const { data, updateData } = useData();
    const categories = data?.skills?.categories || ['Frontend', 'Backend', 'Data & ML', 'Tools'];
    const [skillsData, setSkillsData] = useState(data?.skills?.skills || {});
    const [activeTab, setActiveTab] = useState('Frontend');
    const [saved, setSaved] = useState('');

    function handleSave() {
        updateData('skills', { categories, skills: skillsData });
        setSaved('Skills saved successfully!');
        setTimeout(() => setSaved(''), 2000);
    }

    function addSkill() {
        const newSkill = { name: '', icon: '' };
        const currentCategorySkills = [...(skillsData[activeTab] || []), newSkill];
        setSkillsData({ ...skillsData, [activeTab]: currentCategorySkills });
    }

    function removeSkill(index) {
        const currentCategorySkills = skillsData[activeTab].filter((_, i) => i !== index);
        setSkillsData({ ...skillsData, [activeTab]: currentCategorySkills });
    }

    function updateSkill(index, field, value) {
        const currentCategorySkills = [...skillsData[activeTab]];
        currentCategorySkills[index] = { ...currentCategorySkills[index], [field]: value };
        setSkillsData({ ...skillsData, [activeTab]: currentCategorySkills });
    }

    const currentSkills = skillsData[activeTab] || [];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 500 }}>Manage Skills</h1>
                <button className="btn-gold" style={{ padding: '10px 24px', fontSize: '0.85rem' }} onClick={handleSave}>
                    <Save size={16} /> Save Changes
                </button>
            </div>
            {saved && <p style={{ color: '#22c55e', fontSize: '0.85rem', marginBottom: 16, padding: '8px 16px', background: 'rgba(34,197,94,0.08)', borderRadius: 6, display: 'inline-block' }}>✓ {saved}</p>}

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
                {categories.map(tab => (
                    <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="glass-card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                    {currentSkills.map((skill, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <GripVertical size={16} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />

                            <input
                                className="admin-input"
                                placeholder="Icon/Emoji (e.g. ⚛️)"
                                value={skill.icon}
                                onChange={e => updateSkill(index, 'icon', e.target.value)}
                                style={{ width: 140, marginBottom: 0 }}
                            />

                            <input
                                className="admin-input"
                                placeholder="Skill Name (e.g. React.js)"
                                value={skill.name}
                                onChange={e => updateSkill(index, 'name', e.target.value)}
                                style={{ flex: 1, marginBottom: 0 }}
                            />

                            <button onClick={() => removeSkill(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6 }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '10px 20px' }} onClick={addSkill}>
                    <Plus size={14} /> Add Skill to {activeTab}
                </button>
            </div>
        </div>
    );
}
