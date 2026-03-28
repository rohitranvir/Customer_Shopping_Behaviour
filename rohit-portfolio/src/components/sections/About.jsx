import { useEffect, useState } from 'react';
import { useScrollReveal } from '../../hooks/useAnimations';
import { useData } from '../../context/DataContext';
import { MapPin, GraduationCap, BarChart3, Globe, Mail, Briefcase } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

function StatCard({ endValue, suffix, label }) {
    const [ref, visible] = useScrollReveal(0.1);
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (visible && !started) {
            setStarted(true);
            const isFloat = String(endValue).includes('.');
            let current = 0;
            const increment = endValue / 40; // 40 steps
            const timer = setInterval(() => {
                current += increment;
                if (current >= endValue) {
                    setCount(isFloat ? endValue.toFixed(1) : Math.ceil(endValue));
                    clearInterval(timer);
                } else {
                    setCount(isFloat ? current.toFixed(1) : Math.ceil(current));
                }
            }, 30);
            return () => clearInterval(timer);
        }
    }, [visible, started, endValue]);

    return (
        <div ref={ref} className="glass-card" style={{ padding: '20px 16px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 600, color: 'var(--gold)', lineHeight: 1 }}>
                {count}{suffix}
            </div>
            <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>
                {label}
            </div>
        </div>
    );
}



export default function About() {
    const { data } = useData();
    const [ref, visible] = useScrollReveal(0.05);

    const aboutData = data?.about || {};

    const infoGrid = [
        { icon: MapPin, label: 'Location', value: aboutData.info?.location },
        { icon: GraduationCap, label: 'Degree', value: aboutData.info?.degree },
        { icon: BarChart3, label: 'CGPA', value: aboutData.info?.cgpa },
        { icon: Globe, label: 'Languages', value: aboutData.info?.languages },
        { icon: Mail, label: 'Email', value: aboutData.info?.email },
        { icon: Briefcase, label: 'Status', value: aboutData.info?.status },
    ].filter(item => item.value); // Only show if value exists

    return (
        <section id="about" style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
            <motion.div
                ref={ref}
                initial="hidden"
                animate={visible ? "visible" : "hidden"}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 60, alignItems: 'start' }}
            >
                {/* LEFT COLUMN — Photo + Stats */}
                <motion.div variants={{ hidden: { x: -50, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } } }}>
                    {/* Luxury Frame */}
                    <motion.div
                        className="luxury-frame"
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ width: '100%', maxWidth: 400, margin: '0 auto', aspectRatio: '3/4', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                    >
                        {/* Corner Brackets */}
                        <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />

                        <div style={{ textAlign: 'center', padding: 20 }}>
                            <div className="font-display" style={{ fontSize: '6rem', color: 'var(--gold)', fontWeight: 300, lineHeight: 1 }}>RR</div>
                        </div>

                        {/* Open to Work Badge */}
                        <div style={{ position: 'absolute', bottom: -16, right: -16, background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '30px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 10 }}>
                            <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }} />
                            {aboutData.availability && (
                                <span className="font-mono" style={{ fontSize: '0.7rem', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{aboutData.availability}</span>
                            )}
                        </div>
                    </motion.div>

                    {/* Animated Stats */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 40, maxWidth: 400, margin: '40px auto 0' }}>
                        <StatCard endValue={parseFloat(aboutData.stats?.projects || 5)} suffix="+" label="Projects Completed" />
                        <StatCard endValue={parseFloat(aboutData.stats?.internships || 2)} suffix="" label="Internships Done" />
                        <StatCard endValue={parseFloat(aboutData.stats?.cgpa || 7.5)} suffix="" label="CGPA Score" />
                    </div>
                </motion.div>

                {/* RIGHT COLUMN — Bio */}
                <motion.div variants={{ hidden: { x: 50, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } } }}>
                    <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="font-mono" style={{ display: 'inline-block', fontSize: '0.8rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        — ABOUT ME
                    </motion.span>

                    <h2 className={`font-display gold-underline ${visible ? 'visible' : ''}`} style={{ fontSize: 'clamp(2.5rem, 4vw, 3.2rem)', fontWeight: 400, marginTop: 16, marginBottom: 32, lineHeight: 1.2 }}>
                        Crafting Code With Purpose & Precision.
                    </h2>

                    <motion.div className="font-body" style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {(aboutData.bio || []).map((paragraph, idx) => (
                            <motion.p key={idx} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: 0.1 * idx } } }}>
                                {paragraph}
                            </motion.p>
                        ))}
                    </motion.div>

                    {/* Gold Divider */}
                    <motion.div
                        variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.8, delay: 0.4 } } }}
                        style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, var(--gold), transparent)', margin: '40px 0', opacity: 0.5, transformOrigin: 'left' }}
                    />

                    {/* Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px' }}>
                        {infoGrid.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={index}
                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.5 + (0.1 * index) } } }}
                                    whileHover={{ x: 5, color: 'var(--gold)', '& .icon-container': { background: 'rgba(201,168,76,0.2)', scale: 1.1 } }}
                                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'default', transition: 'color 0.3s' }}
                                >
                                    <div className="icon-container" style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' }}>
                                        <Icon size={18} style={{ color: 'var(--gold)' }} />
                                    </div>
                                    <div>
                                        <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                                            {item.label}
                                        </div>
                                        <div className="font-body" style={{ fontSize: '0.9rem', color: 'inherit', fontWeight: 500, transition: 'color 0.3s' }}>
                                            {item.value}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
