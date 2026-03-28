import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 60);

            const sections = NAV_LINKS.map(l => l.href.slice(1));
            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(sections[i]);
                if (el && el.getBoundingClientRect().top <= 200) {
                    setActiveSection(sections[i]);
                    break;
                }
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    function handleClick(href) {
        setMobileOpen(false);
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <>
            <AnimatePresence>
                <motion.nav
                    initial={{ y: '-100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        padding: scrolled ? '12px 0' : '20px 0',
                        background: scrolled ? 'rgba(8, 8, 8, 0.85)' : 'transparent',
                        backdropFilter: scrolled ? 'blur(20px)' : 'none',
                        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
                        borderBottom: scrolled ? '1px solid rgba(201, 168, 76, 0.08)' : 'none',
                        transition: 'padding 0.4s, background 0.4s, backdrop-filter 0.4s, border-bottom 0.4s',
                    }}
                >
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Logo */}
                        <motion.a
                            href="#"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="font-display"
                            animate={{ textShadow: ['0 0 10px rgba(201,168,76,0.3)', '0 0 25px rgba(201,168,76,0.8)', '0 0 10px rgba(201,168,76,0.3)'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                fontSize: '28px',
                                color: 'var(--gold)',
                                fontWeight: 600,
                                textDecoration: 'none',
                                letterSpacing: '0.2em',
                                transition: 'all 0.3s',
                            }}
                        >
                            RR
                        </motion.a>

                        {/* Desktop Links */}
                        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="nav-desktop">
                            {NAV_LINKS.map(link => {
                                const isActive = activeSection === link.href.slice(1);
                                return (
                                    <motion.a
                                        key={link.href}
                                        href={link.href}
                                        onClick={(e) => { e.preventDefault(); handleClick(link.href); }}
                                        className="font-body nav-link"
                                        whileHover="hover"
                                        initial="initial"
                                        animate={isActive ? "active" : "initial"}
                                        variants={{
                                            initial: { color: 'var(--text-muted)', letterSpacing: '0.06em' },
                                            hover: { color: 'var(--gold-light)', letterSpacing: '0.08em' },
                                            active: { color: 'var(--gold)', letterSpacing: '0.06em', textShadow: '0 0 8px rgba(201,168,76,0.5)' }
                                        }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            textDecoration: 'none',
                                            fontSize: '0.85rem',
                                            textTransform: 'uppercase',
                                            position: 'relative',
                                            display: 'inline-block'
                                        }}
                                    >
                                        {link.label}
                                        <motion.div
                                            variants={{
                                                initial: { scaleX: 0, originX: 0 },
                                                hover: { scaleX: 1, originX: 0 },
                                                active: { scaleX: 1, originX: 0 }
                                            }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            style={{
                                                position: 'absolute',
                                                bottom: -4,
                                                left: 0,
                                                right: 0,
                                                height: 2,
                                                background: 'var(--gold)',
                                            }}
                                        />
                                    </motion.a>
                                );
                            })}
                        </div>

                        {/* Hire Me */}
                        <motion.a
                            href="#contact"
                            onClick={(e) => { e.preventDefault(); handleClick('#contact'); }}
                            className="btn-hire nav-desktop relative overflow-hidden"
                            whileHover="hover"
                            initial="initial"
                            style={{
                                padding: '10px 24px',
                                fontSize: '0.8rem',
                                border: '1px solid transparent',
                                color: 'var(--gold)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                textDecoration: 'none',
                                position: 'relative',
                                zIndex: 1,
                                borderRadius: '4px'
                            }}
                        >
                            <motion.div
                                variants={{
                                    initial: { opacity: 0, pathLength: 0 },
                                    hover: { opacity: 1, pathLength: 1 }
                                }}
                                transition={{ duration: 0.4 }}
                                style={{
                                    position: 'absolute', inset: 0,
                                    border: '1px solid var(--gold)',
                                    borderRadius: '4px',
                                    zIndex: -2
                                }}
                            />
                            <motion.div
                                variants={{
                                    initial: { y: '100%' },
                                    hover: { y: '0%' }
                                }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'var(--gold)',
                                    zIndex: -1
                                }}
                            />
                            <motion.span
                                variants={{
                                    initial: { color: 'var(--gold)' },
                                    hover: { color: 'var(--bg-primary)' }
                                }}
                            >
                                Hire Me
                            </motion.span>
                        </motion.a>

                        {/* Mobile Hamburger */}
                        <button
                            className="nav-mobile"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', display: 'none' }}
                        >
                            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </motion.nav>
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.4 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 999,
                            background: 'rgba(8, 8, 8, 0.97)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32,
                        }}
                    >
                        {NAV_LINKS.map((link, i) => (
                            <motion.a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => { e.preventDefault(); handleClick(link.href); }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                                className="font-display"
                                style={{ textDecoration: 'none', fontSize: '2rem', color: 'var(--text-primary)', fontWeight: 300, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 0.3s' }}
                                onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                                onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
                            >
                                {link.label}
                            </motion.a>
                        ))}
                        <motion.a
                            href="#contact"
                            onClick={(e) => { e.preventDefault(); handleClick('#contact'); }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className="btn-gold"
                            style={{ marginTop: 16 }}
                        >
                            Hire Me
                        </motion.a>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: block !important; }
        }
      `}</style>
        </>
    );
}
