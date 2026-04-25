import { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useScrollReveal } from '../../hooks/useAnimations';
import { Mail, MapPin, Phone, Linkedin, Github, Send, Copy, Check, Loader2, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import api from '../../services/api';

// ── EmailJS config from env ──────────────────────────────────────────────────
const EMAILJS_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || '';
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_AUTOREPLY = import.meta.env.VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID || '';
const EMAILJS_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || '';

// ── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
    const bg = type === 'success'
        ? 'rgba(34, 197, 94, 0.12)'
        : 'rgba(239, 68, 68, 0.12)';
    const border = type === 'success'
        ? 'rgba(34, 197, 94, 0.3)'
        : 'rgba(239, 68, 68, 0.3)';
    const color = type === 'success' ? '#22c55e' : '#ef4444';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
                position: 'fixed', bottom: 32, right: 32, zIndex: 99999,
                padding: '16px 24px', borderRadius: 12,
                background: bg, border: `1px solid ${border}`,
                backdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                maxWidth: 400,
            }}
        >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {type === 'success' ? <Check size={14} style={{ color }} /> : <X size={14} style={{ color }} />}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, marginLeft: 4 }}>
                <X size={14} />
            </button>
        </motion.div>
    );
}

// ── Main Contact Component ───────────────────────────────────────────────────
export default function Contact() {
    const { data, addMessage } = useData();
    const about = data?.about;
    const [ref, visible] = useScrollReveal(0.1);
    const formRef = useRef(null);

    const [form, setForm] = useState({ name: '', email: '', subject: 'Job Opportunity', message: '' });
    const [sending, setSending] = useState(false);
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }
    // Fix 12: Check if resume PDF actually has content before showing download button
    const [resumeReady, setResumeReady] = useState(null); // null=checking, true=ok, false=empty/missing

    useEffect(() => {
        fetch('/resume.pdf', { method: 'HEAD' })
            .then(res => {
                const size = Number(res.headers.get('content-length') || 0);
                setResumeReady(res.ok && size > 1000); // > 1KB = likely a real PDF
            })
            .catch(() => setResumeReady(false));
    }, []);

    function showToast(message, type = 'success', duration = 4000) {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
    }

    // ── Form Submit with EmailJS ─────────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        if (sending) return;
        setSending(true);

        const templateParams = {
            from_name: form.name,
            from_email: form.email,
            subject: form.subject,
            message: form.message,
            to_email: 'rohitranveer358@gmail.com',
        };

        try {
            // Send notification email to you
            if (EMAILJS_SERVICE && EMAILJS_TEMPLATE && EMAILJS_KEY) {
                await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams, EMAILJS_KEY);

                // Send auto-reply to the person who contacted
                if (EMAILJS_AUTOREPLY) {
                    await emailjs.send(EMAILJS_SERVICE, EMAILJS_AUTOREPLY, {
                        to_name: form.name,
                        to_email: form.email,
                        from_name: 'Rohit Ranvir',
                    }, EMAILJS_KEY);
                }
            }

            // Fix 8: Save message to Django PostgreSQL database
            try {
                await api.post('/messages/', {
                    name: form.name,
                    email: form.email,
                    subject: form.subject,
                    message: form.message,
                });
            } catch (apiErr) {
                // Don't block success — EmailJS already worked
                console.error('Failed to save message to DB:', apiErr);
            }

            // Also save via DataContext (local state)
            addMessage(form);

            setForm({ name: '', email: '', subject: 'Job Opportunity', message: '' });
            showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
        } catch (err) {
            console.error('EmailJS Error:', err);
            // Still save to localStorage even if email fails
            addMessage(form);
            showToast('Email delivery failed, but your message was saved. Try emailing directly!', 'error', 6000);
        } finally {
            setSending(false);
        }
    }

    // ── Copy Email ───────────────────────────────────────────────────────────
    function copyEmail() {
        navigator.clipboard.writeText('rohitranveer358@gmail.com');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // ── Resume Download Tracking ─────────────────────────────────────────────
    function trackResumeDownload() {
        console.log('[Analytics] Resume downloaded at', new Date().toISOString());
        showToast('Thanks for downloading my resume! 🎉', 'success');
    }

    // ── Contact Info Data ────────────────────────────────────────────────────
    const EMAIL = about?.social?.email || 'rohitranveer358@gmail.com';
    const contactInfo = [
        { icon: Mail, label: EMAIL, href: `mailto:${EMAIL}`, copyable: true },
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
                    {/* ── Left Column ─────────────────────────────────────── */}
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
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', flex: 1 }}>{item.label}</span>

                                        {/* Copy Email Button */}
                                        {item.copyable && (
                                            <motion.button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyEmail(); }}
                                                whileTap={{ scale: 0.85 }}
                                                whileHover={{ scale: 1.1 }}
                                                style={{
                                                    background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(201,168,76,0.08)',
                                                    border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                                                    borderRadius: 6, padding: '6px 12px',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                                    transition: 'all 0.3s',
                                                }}
                                            >
                                                <AnimatePresence mode="wait">
                                                    {copied ? (
                                                        <motion.span key="copied" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Check size={12} style={{ color: '#22c55e' }} />
                                                            <span className="font-mono" style={{ fontSize: '0.6rem', color: '#22c55e' }}>Copied!</span>
                                                        </motion.span>
                                                    ) : (
                                                        <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Copy size={12} style={{ color: 'var(--gold)' }} />
                                                            <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>Copy</span>
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </motion.button>
                                        )}
                                    </motion.div>
                                );
                                return item.href ? (
                                    <a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                        {inner}
                                    </a>
                                ) : <div key={i}>{inner}</div>;
                            })}
                        </motion.div>

                        {/* Fix 12: Resume Download — only shows if PDF file actually has content */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} style={{ marginTop: 24 }}>
                            {resumeReady === null && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Checking resume…</span>
                            )}
                            {resumeReady === true && (
                                <motion.a
                                    href="/resume.pdf"
                                    download="Rohit_Ranvir_Resume.pdf"
                                    onClick={trackResumeDownload}
                                    className="btn-ghost"
                                    style={{ padding: '12px 24px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                                    whileHover={{ scale: 1.03, boxShadow: '0 0 16px rgba(201,168,76,0.15)' }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Download size={16} /> Download Resume
                                </motion.a>
                            )}
                            {resumeReady === false && (
                                <div style={{
                                    padding: '12px 20px',
                                    background: 'rgba(201,168,76,0.04)',
                                    border: '1px solid rgba(201,168,76,0.15)',
                                    borderRadius: 8,
                                    fontSize: '0.82rem',
                                    color: 'var(--text-muted)',
                                    lineHeight: 1.6,
                                }}>
                                    Resume available on request —{' '}
                                    <a
                                        href="mailto:rohitranveer358@gmail.com"
                                        style={{ color: 'var(--gold)', textDecoration: 'none' }}
                                    >
                                        rohitranveer358@gmail.com
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* ── Right Column — Form ─────────────────────────────── */}
                    <motion.div variants={{ hidden: { x: 50, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.6 } } }}>
                        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>Full Name</label>
                                <input className="admin-input" type="text" name="from_name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" disabled={sending} />
                            </motion.div>
                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>Email Address</label>
                                <input className="admin-input" type="email" name="from_email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" disabled={sending} />
                            </motion.div>
                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>Subject</label>
                                <select className="admin-input" name="subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} disabled={sending}>
                                    <option>Job Opportunity</option>
                                    <option>Freelance Project</option>
                                    <option>Collaboration</option>
                                    <option>General Inquiry</option>
                                </select>
                            </motion.div>
                            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                <label className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>Message</label>
                                <textarea className="admin-input" name="message" required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell me about your project..." style={{ resize: 'vertical', minHeight: 120 }} disabled={sending} />
                            </motion.div>
                            <motion.button
                                type="submit"
                                className="btn-gold"
                                disabled={sending}
                                style={{
                                    width: '100%', justifyContent: 'center',
                                    opacity: sending ? 0.7 : 1,
                                    cursor: sending ? 'not-allowed' : 'pointer',
                                }}
                                whileHover={sending ? {} : { scale: 1.02, boxShadow: '0 0 20px rgba(201,168,76,0.3)' }}
                                whileTap={sending ? {} : { scale: 0.98 }}
                            >
                                {sending ? (
                                    <><Loader2 size={16} className="spin-loader" /> Sending...</>
                                ) : (
                                    <><Send size={16} /> Send Message</>
                                )}
                            </motion.button>
                        </form>

                        {/* EmailJS setup hint */}
                        {!EMAILJS_SERVICE && (
                            <p className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.5, marginTop: 12, textAlign: 'center' }}>
                                EmailJS not configured — messages saved locally
                            </p>
                        )}
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Toast Notification ───────────────────────────────────── */}
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            {/* ── Loader spinner keyframes ─────────────────────────────── */}
            <style>{`
                .spin-loader {
                    animation: spin-gold 1s linear infinite;
                }
                @keyframes spin-gold {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </section>
    );
}
