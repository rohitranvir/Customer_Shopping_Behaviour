import { useData } from '../../context/DataContext';
import { useScrollReveal } from '../../hooks/useAnimations';
import { Award, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Certifications() {
    const { data } = useData();
    const certs = data?.certifications || [];
    const [ref, visible] = useScrollReveal(0.1);

    return (
        <section style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
            <motion.div
                ref={ref}
                initial="hidden"
                animate={visible ? "visible" : "hidden"}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                }}
            >
                <motion.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', textAlign: 'center' }}>
                    — Credentials
                </motion.span>
                <motion.h2 variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="font-display gold-underline" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, textAlign: 'center', marginTop: 16, marginBottom: 48, display: 'inline-block' }}>
                    Certifications
                </motion.h2>

                <motion.div
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                    style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, scrollSnapType: 'x mandatory' }}
                >
                    {certs.map((cert, index) => (
                        <motion.div
                            key={cert.id}
                            variants={{ hidden: { x: 50, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.6 } } }}
                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderColor: 'var(--gold)' }}
                            className="glass-card"
                            style={{ padding: '28px 24px', minWidth: 280, flex: '0 0 280px', scrollSnapAlign: 'start', transition: 'border-color 0.3s' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(201, 168, 76, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Award size={20} style={{ color: 'var(--gold)' }} />
                                </div>
                                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {cert.date}
                                </span>
                            </div>
                            <h3 className="font-body" style={{ fontSize: '1rem', fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>
                                {cert.name}
                            </h3>
                            <p style={{ color: 'var(--gold)', fontSize: '0.8rem', marginBottom: 20 }}>{cert.platform}</p>
                            {cert.link && (
                                <motion.a
                                    href={cert.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono"
                                    whileHover={{ x: 5, color: 'var(--gold)' }}
                                    style={{ fontSize: '0.7rem', color: 'var(--gold-light)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                                >
                                    View Certificate <ExternalLink size={12} />
                                </motion.a>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
}
