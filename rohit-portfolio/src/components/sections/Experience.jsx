import { useState } from 'react';
import { useScrollReveal } from '../../hooks/useAnimations';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Experience() {
    const { data } = useData();
    const [activeTab, setActiveTab] = useState('Experience');
    const [ref, visible] = useScrollReveal(0.05);

    const experienceData = data?.experience?.experience || [];
    const educationData = data?.experience?.education || [];

    return (
        <section id="experience" style={{ padding: '120px 24px', maxWidth: 1000, margin: '0 auto' }}>
            <motion.div
                ref={ref}
                initial="hidden"
                animate={visible ? "visible" : "hidden"}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >
                {/* Header */}
                <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} style={{ textAlign: 'center', marginBottom: 48 }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        — My Journey
                    </span>
                    <h2 className="font-display gold-underline" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, marginTop: 16 }}>
                        Experience & Education
                    </h2>
                </motion.div>

                {/* Tabs */}
                <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 60 }}>
                    {['Experience', 'Education'].map(tab => (
                        <motion.button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '12px 32px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background 0.3s, color 0.3s, border 0.3s',
                                border: `1px solid var(--gold)`,
                                background: activeTab === tab ? 'var(--gold)' : 'transparent',
                                color: activeTab === tab ? 'var(--bg-primary)' : 'var(--gold)',
                                fontWeight: activeTab === tab ? 600 : 400,
                            }}
                        >
                            {tab}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Content */}
                <div style={{ minHeight: 400, position: 'relative' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'Experience' && (
                            <motion.div
                                key="experience-tab"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                                style={{ position: 'relative', paddingLeft: 48 }}
                            >
                                {/* Vertical Line */}
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    style={{ position: 'absolute', left: 24, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, var(--gold), rgba(201, 168, 76, 0.1))', transformOrigin: 'top' }}
                                />

                                {experienceData.map((exp, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 + (index * 0.15) }}
                                        style={{ position: 'relative', marginBottom: 48 }}
                                    >
                                        {/* Dot */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.4, delay: 0.4 + (index * 0.15), type: 'spring' }}
                                            style={{ position: 'absolute', left: -31, top: 24, width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-primary)', border: '2px solid var(--gold)', zIndex: 2 }}
                                        />

                                        <motion.div
                                            className="glass-card"
                                            whileHover={{ scale: 1.02, x: 10, boxShadow: '0 10px 40px rgba(201, 168, 76, 0.15)', borderColor: 'var(--gold)' }}
                                            style={{ padding: 32, cursor: 'default' }}
                                        >
                                            <h3 className="font-body" style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
                                                🏢 {exp.role}
                                            </h3>
                                            <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '0.05em', marginBottom: 20 }}>
                                                {exp.company} <span style={{ color: 'var(--text-muted)' }}>|</span> {exp.duration}
                                            </div>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {exp.description.map((item, i) => (
                                                    <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, display: 'flex', gap: 12 }}>
                                                        <span style={{ color: 'var(--gold)', flexShrink: 0 }}>•</span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>Tools:</span>
                                                {exp.tools.join(', ')}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'Education' && (
                            <motion.div
                                key="education-tab"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                            >
                                {educationData.map((edu, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 * index, ease: "easeOut" }}
                                        whileHover={{ scale: 1.02, y: -5, boxShadow: '0 10px 40px rgba(201, 168, 76, 0.15)', borderColor: 'var(--gold)' }}
                                        className="glass-card"
                                        style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start', cursor: 'default' }}
                                    >
                                        <div style={{ fontSize: '2.5rem', background: 'rgba(201, 168, 76, 0.1)', width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {edu.icon || (index === 0 ? '🎓' : '🏫')}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 className="font-body" style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
                                                {edu.degree}
                                            </h3>
                                            <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: 12 }}>
                                                {edu.specialization}
                                            </p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 16 }}>
                                                {edu.institution}
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                                <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{edu.year}</span>
                                                <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: 'rgba(201, 168, 76, 0.1)', padding: '4px 12px', borderRadius: 4, border: '1px solid var(--border)' }}>
                                                    {edu.score}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </section>
    );
}
