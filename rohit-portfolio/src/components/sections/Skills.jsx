import { useState } from 'react';
import { useScrollReveal } from '../../hooks/useAnimations';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Skills() {
    const { data } = useData();
    const [activeTab, setActiveTab] = useState('Frontend');
    const [ref, visible] = useScrollReveal(0.05);

    const categories = data?.skills?.categories || ['Frontend', 'Backend', 'Data & ML', 'Tools'];
    const skillData = data?.skills?.skills || {};
    const currentSkills = skillData[activeTab] || [];

    return (
        <section id="skills" style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
            <motion.div
                ref={ref}
                initial="hidden"
                animate={visible ? "visible" : "hidden"}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >
                <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} style={{ textAlign: 'center', marginBottom: 48 }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        — Technical Arsenal
                    </span>
                    <h2 className="font-display gold-underline" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, marginTop: 16 }}>
                        Technologies I work with
                    </h2>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { staggerChildren: 0.1 } } }}
                    style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 48 }}
                >
                    {categories.map(tab => (
                        <motion.button
                            key={tab}
                            variants={{ hidden: { scale: 0.8, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
                            onClick={() => setActiveTab(tab)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '12px 24px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background 0.3s, color 0.3s, border 0.3s',
                                border: `1px solid ${activeTab === tab ? 'var(--gold)' : 'var(--border)'}`,
                                background: activeTab === tab ? 'var(--gold)' : 'transparent',
                                color: activeTab === tab ? 'var(--bg-primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab ? 600 : 400,
                            }}
                        >
                            {tab}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Skill Grid */}
                <motion.div
                    key={activeTab}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                    }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}
                >
                    <AnimatePresence mode="popLayout">
                        {currentSkills.map((skill, index) => (
                            <motion.div
                                key={`${activeTab}-${skill.name}`}
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                whileHover={{
                                    y: -6,
                                    scale: 1.02,
                                    boxShadow: '0 10px 30px rgba(201, 168, 76, 0.15)',
                                    borderColor: 'var(--gold)'
                                }}
                                className="glass-card"
                                style={{
                                    padding: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    cursor: 'default',
                                }}
                            >
                                <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{skill.icon}</span>
                                <span className="font-body" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                    {skill.name}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

            </motion.div>
        </section>
    );
}
