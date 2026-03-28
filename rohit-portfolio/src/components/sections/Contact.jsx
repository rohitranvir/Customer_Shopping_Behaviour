import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useScrollReveal } from '../../hooks/useAnimations';
import { Mail, MapPin, Phone, Linkedin, Github, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
    const { data, addMessage } = useData();
    const about = data?.about;
    const [ref, visible] = useScrollReveal(0.1);
    const [form, setForm] = useState({ name: '', email: '', subject: 'Job Opportunity', message: '' });
    const [sent, setSent] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        addMessage(form);
        setSent(true);
        setForm({ name: '', email: '', subject: 'Job Opportunity', message: '' });
        setTimeout(() => setSent(false), 4000);
    }

    const contactInfo = [
        { icon: Mail, label: about?.social?.email || 'rohitranveer358@gmail.com', href: `mailto:${about?.social?.email || 'rohitranveer358@gmail.com'}` },
        { icon: Phone, label: about?.social?.phone || '+91 9158000676', href: `tel:${about?.social?.phone || '+919158000676'}` },
        { icon: MapPin, label: about?.info?.location || 'Pusad, Maharashtra, India', href: null },
        { icon: Linkedin, label: about?.social?.linkedin?.replace('https://www.', '') || 'linkedin.com/in/rohit-ranveer', href: about?.social?.linkedin || 'https://www.linkedin.com/in/rohit-ranveer' },
        { icon: Github, label: about?.social?.github?.replace('https://', '') || 'github.com/rohitranvir', href: about?.social?.github || 'https://github.com/rohitranvir' },
    ];

    return (
        <section id="contact" style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
            <motion.div
                ref={ref}
                initial="hidden"
                animate={visible ? "visible" : "hidden"}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 60 }}>
                    {/* Left */}
                    <motion.div variants={{ hidden: { x: -50, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.6 } } }}>
                        <motion.span variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            — Contact
                        </motion.span>
                        <motion.h2 variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="font-display gold-underline" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, marginTop: 16, marginBottom: 16, lineHeight: 1.2 }}>
                            Let's Build Something Great.
                        </motion.h2>
                        <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 40 }}>
                            Open to full-time roles, freelance projects & collaborations across India.
                        </motion.p>

                        <motion.div
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                        >
                            {contactInfo.map((item, i) => {
                                const Icon = item.icon;
                                const inner = (
                                    <motion.div
                                        variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { type: 'spring' } } }}
                                        whileHover={{ x: 10, borderColor: 'var(--gold)' }}
                                        className="glass-card"
                                        style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, borderRadius: 10, transition: 'border-color 0.3s', cursor: item.href ? 'pointer' : 'default' }}
                                    >
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(201, 168, 76, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Icon size={16} style={{ color: 'var(--gold)' }} />
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.label}</span>
                                    </motion.div>
                                );
                                return item.href ? (
                                    <a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                        {inner}
                                    </a>
                                ) : <div key={i}>{inner}</div>;
                            })}
                        </motion.div>
                    </motion.div>

                    {/* Right — Form */}
                    <motion.div variants={{ hidden: { x: 50, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.6 } } }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>Full Name</label>
                                <input className="admin-input" type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                            </motion.div>
                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>Email Address</label>
                                <input className="admin-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
                            </motion.div>
                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>Subject</label>
                                <select className="admin-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                                    <option>Job Opportunity</option>
                                    <option>Freelance Project</option>
                                    <option>Collaboration</option>
                                    <option>General Inquiry</option>
                                </select>
                            </motion.div>
                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>Message</label>
                                <textarea className="admin-input" required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell me about your project..." style={{ resize: 'vertical', minHeight: 120 }} />
                            </motion.div>
                            <motion.button
                                type="submit"
                                className="btn-gold"
                                style={{ width: '100%', justifyContent: 'center' }}
                                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(201,168,76,0.3)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {sent ? '✓ Message Sent!' : <><Send size={16} /> Send Message</>}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
