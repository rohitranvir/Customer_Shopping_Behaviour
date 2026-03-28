import { useScrollReveal } from '../../hooks/useAnimations';
import { ExternalLink, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Publications() {
    const [ref, visible] = useScrollReveal(0.1);

    return (
        <section style={{ padding: '120px 24px', maxWidth: 900, margin: '0 auto' }}>
            <motion.div
                ref={ref}
                initial="hidden"
                animate={visible ? "visible" : "hidden"}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <motion.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block' }}>
                        — Research
                    </motion.span>
                    <motion.h2 variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="font-display gold-underline" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, marginTop: 16, marginBottom: 48, display: 'inline-block' }}>
                        Publication
                    </motion.h2>
                </div>

                <motion.div
                    variants={{ hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.6 } } }}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderColor: 'var(--gold)' }}
                    className="glass-card"
                    style={{ padding: '40px 48px', position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'border-color 0.3s' }}
                >
                    {/* Published Badge */}
                    <div style={{
                        position: 'absolute', top: 24, right: 24,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(201, 168, 76, 0.1)',
                        border: '1px solid var(--gold)',
                        borderRadius: 6,
                        padding: '6px 14px',
                    }}>
                        <Award size={14} style={{ color: 'var(--gold)' }} />
                        <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Published</span>
                    </div>

                    <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Research Paper • 2025
                    </div>

                    <h3 className="font-display" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 500, lineHeight: 1.4, marginBottom: 20, maxWidth: '85%' }}>
                        Exploring Sentiment Analysis through Deep Learning: A Comprehensive Review
                    </h3>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 12 }}>
                        A comprehensive review of deep learning approaches for sentiment classification, evaluating CNN-based models on YouTube comment datasets. Published in the International Journal of Innovative Science and Research Technology (IJISRT).
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                        <span style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 500 }}>IJISRT</span>
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>International Journal of Innovative Science and Research Technology</span>
                    </div>

                    {/* Decorative line */}
                    <div style={{ width: '100%', height: 1, background: 'var(--border)', margin: '0 0 24px' }} />

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                        {['Deep Learning', 'CNN', 'Sentiment Analysis', 'NLP', 'YouTube Dataset', 'TensorFlow'].map(tag => (
                            <span key={tag} className="font-mono" style={{ fontSize: '0.6rem', padding: '4px 10px', background: 'rgba(201, 168, 76, 0.06)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {tag}
                            </span>
                        ))}
                    </div>

                    <motion.a
                        href="#"
                        className="btn-ghost"
                        style={{ padding: '10px 24px', fontSize: '0.8rem' }}
                        whileHover={{ scale: 1.05, borderColor: 'var(--gold)' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Read Paper <ExternalLink size={14} />
                    </motion.a>
                </motion.div>
            </motion.div>
        </section>
    );
}
