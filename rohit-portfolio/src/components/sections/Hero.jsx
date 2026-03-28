import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useScrollReveal } from '../../hooks/useAnimations';
import { ChevronDown, Download, ArrowRight } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

function Typewriter({ roles = ["Python Full Stack Developer", "Data Analyst"] }) {
    const [roleIdx, setRoleIdx] = useState(0);
    const [text, setText] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const currentRole = roles[roleIdx] || '';
        let timer;

        if (!deleting && text.length < currentRole.length) {
            timer = setTimeout(() => setText(currentRole.slice(0, text.length + 1)), 80);
        } else if (!deleting && text.length === currentRole.length) {
            timer = setTimeout(() => setDeleting(true), 2000);
        } else if (deleting && text.length > 0) {
            timer = setTimeout(() => setText(text.slice(0, -1)), 40);
        } else if (deleting && text.length === 0) {
            setDeleting(false);
            setRoleIdx((roleIdx + 1) % roles.length);
        }
        return () => clearTimeout(timer);
    }, [text, deleting, roleIdx, roles]);

    return (
        <span className="font-mono" style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)', color: 'var(--gold-light)', letterSpacing: '0.02em' }}>
            {text}<span className="typewriter-cursor" />
        </span>
    );
}

export default function Hero() {
    const { data } = useData();
    const about = data?.about;
    const [ref, visible] = useScrollReveal(0.1);

    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const letterVariants = {
        hidden: { x: -10, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
        hover: { scale: 1.1, color: "var(--gold-light)", transition: { duration: 0.2 } }
    };

    return (
        <section
            id="hero"
            ref={ref}
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '120px 24px 60px',
                textAlign: 'center',
                overflow: 'hidden',
                background: 'var(--bg-primary)'
            }}
        >
            {/* Particles Background */}
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={{
                    background: { color: { value: "transparent" } },
                    fpsLimit: 60,
                    interactivity: {
                        events: {
                            onHover: { enable: true, mode: "repulse" },
                            resize: true,
                        },
                        modes: {
                            repulse: { distance: 100, duration: 0.4 },
                        },
                    },
                    particles: {
                        color: { value: "#c9a84c" },
                        links: { color: "#c9a84c", distance: 150, enable: true, opacity: 0.2, width: 1 },
                        move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: true, speed: 1, straight: false },
                        number: { density: { enable: true, area: 800 }, value: window.innerWidth < 768 ? 20 : 50 },
                        opacity: { value: 0.3 },
                        shape: { type: "circle" },
                        size: { value: { min: 1, max: 3 } },
                    },
                    detectRetina: true,
                }}
                style={{ position: 'absolute', inset: 0, zIndex: 1 }}
            />

            {/* Mesh & Shapes */}
            <div className="hero-mesh" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.15 }} />
            <div className="hero-shape" style={{ position: 'absolute', top: '10%', left: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }} />
            <div className="hero-shape" style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={visible ? "visible" : "hidden"}
                style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}
            >
                {/* Badge */}
                <motion.div variants={itemVariants} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 999, marginBottom: 40, background: 'rgba(34, 197, 94, 0.05)' }}>
                    <div className="pulse-dot" />
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: '#22c55e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Available for Opportunities
                    </span>
                </motion.div>

                {/* Name */}
                <motion.h1 variants={itemVariants} className="font-display" style={{ fontWeight: 300, lineHeight: 0.95, marginBottom: 24, userSelect: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {"ROHIT".split('').map((char, i) => (
                            <motion.span
                                key={`r-${i}`}
                                variants={letterVariants}
                                whileHover="hover"
                                style={{ display: 'inline-block', fontSize: 'clamp(4rem, 12vw, 9rem)', color: 'var(--gold)', letterSpacing: '-0.02em', cursor: 'default' }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {"RANVIR".split('').map((char, i) => (
                            <motion.span
                                key={`v-${i}`}
                                variants={letterVariants}
                                whileHover={{ WebkitTextStroke: '0px transparent', color: 'var(--gold)', scale: 1.1, zIndex: 10, transition: { duration: 0.2 } }}
                                style={{
                                    display: 'inline-block',
                                    fontSize: 'clamp(4rem, 12vw, 9rem)',
                                    color: 'transparent',
                                    WebkitTextStroke: '2px rgba(245, 245, 240, 0.7)',
                                    letterSpacing: '-0.02em',
                                    cursor: 'default',
                                    position: 'relative'
                                }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </div>
                </motion.h1>

                {/* Typewriter */}
                <motion.div variants={itemVariants} style={{ marginBottom: 24, minHeight: 30 }}>
                    <Typewriter roles={about?.roles || ["Python Full Stack Developer", "Data Analyst", "Machine Learning Engineer", "Software Developer"]} />
                </motion.div>

                {/* Tagline */}
                <motion.p variants={itemVariants} className="font-body" style={{
                    fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
                    color: 'var(--text-muted)',
                    maxWidth: 560,
                    margin: '0 auto 40px',
                    lineHeight: 1.7,
                }}>
                    {about?.tagline || "Building intelligent systems & elegant interfaces from Pusad, Maharashtra."}
                </motion.p>

                {/* CTAs */}
                <motion.div variants={itemVariants} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <motion.a
                        href="#projects"
                        onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="btn-gold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        View My Work <ArrowRight size={16} />
                    </motion.a>
                    <motion.a
                        href="/resume.pdf"
                        download
                        className="btn-ghost"
                        whileHover={{ scale: 1.05, borderColor: 'var(--gold-light)' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Download Resume <Download size={16} />
                    </motion.a>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="scroll-indicator"
                style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'var(--gold-dim)' }}
                animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <ChevronDown size={28} />
            </motion.div>
        </section>
    );
}
