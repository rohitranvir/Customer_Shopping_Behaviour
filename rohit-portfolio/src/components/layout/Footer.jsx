import { Github, Linkedin, Mail, Heart, ArrowUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { motion } from 'framer-motion';

const NAV_LINKS = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
];

export default function Footer() {
    const { data } = useData();
    const about = data?.about;

    return (
        <footer style={{ borderTop: '1px solid var(--border)', padding: '60px 24px 32px', background: 'var(--bg-secondary)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
                    {/* Branding */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="font-display" style={{ fontSize: '2rem', color: 'var(--gold)', fontWeight: 600 }}>RR</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 12, lineHeight: 1.6 }}>
                            {about?.tagline || "Building intelligent systems & elegant interfaces. Open to opportunities across India."}
                        </p>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h4 className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Quick Links</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {NAV_LINKS.map(link => (
                                <motion.a
                                    key={link.href}
                                    href={link.href}
                                    onClick={(e) => { e.preventDefault(); document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' }); }}
                                    style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}
                                    whileHover={{ color: 'var(--gold)', x: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {link.label}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Socials */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <h4 className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Connect</h4>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {[
                                { icon: Github, href: about?.social?.github || 'https://github.com/rohitranvir' },
                                { icon: Linkedin, href: about?.social?.linkedin || 'https://www.linkedin.com/in/rohit-ranveer' },
                                { icon: Mail, href: `mailto:${about?.social?.email || 'rohitranveer358@gmail.com'}` },
                            ].map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <motion.a
                                        key={i}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.5 + (i * 0.1), type: 'spring' }}
                                        whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(201,168,76,0.3)', borderColor: 'var(--gold)', color: 'var(--gold)' }}
                                        style={{
                                            width: 40, height: 40, borderRadius: 8,
                                            border: '1px solid var(--border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--text-muted)', textDecoration: 'none',
                                            background: 'var(--bg-primary)'
                                        }}
                                    >
                                        <Icon size={18} />
                                    </motion.a>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}
                >
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        © 2025 Rohit Ranvir. All Rights Reserved.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Designed & Developed with <Heart size={12} style={{ color: 'var(--gold)' }} /> by Rohit Ranvir
                        </p>
                        <motion.button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="btn-ghost"
                            whileHover={{ y: -5 }}
                            style={{ padding: '8px', border: 'none', color: 'var(--gold)' }}
                            title="Back to top"
                        >
                            <ArrowUp size={20} />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
