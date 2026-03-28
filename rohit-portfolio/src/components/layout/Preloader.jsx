import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader({ onFinish }) {
    const [stage, setStage] = useState(0);

    /*
      Cinematic Timeline (4s total):
      0.0s — Black screen
      0.3s — "R" fades + slides up from bottom (gold, 200px)
      0.6s — Second "R" fades + slides up
      1.0s — Gold line draws under "RR"
      1.3s — "ROHIT RANVIR" appears below (staggered)
      2.0s — "Portfolio 2025" fades in
      2.3s — Progress bar fills
      3.0s — Everything scales up & fades out
      3.5s — Black overlay slides up (handled by AnimatePresence exit)
      4.0s — Unmount
    */

    useEffect(() => {
        // We use timeouts to manage the stages since it's a fixed cinematic sequence
        const t1 = setTimeout(() => setStage(1), 300);    // 1st R
        const t2 = setTimeout(() => setStage(2), 600);    // 2nd R
        const t3 = setTimeout(() => setStage(3), 1000);   // Gold line
        const t4 = setTimeout(() => setStage(4), 1300);   // ROHIT RANVIR
        const t5 = setTimeout(() => setStage(5), 2000);   // Portfolio 2025
        const t6 = setTimeout(() => setStage(6), 2300);   // Progress Bar
        const t7 = setTimeout(() => setStage(7), 3000);   // Scale & Fade Out
        const t8 = setTimeout(() => {
            setStage(8);
            onFinish();
        }, 3500); // Trigger page reveal

        return () => {
            [t1, t2, t3, t4, t5, t6, t7, t8].forEach(clearTimeout);
        };
    }, [onFinish]);

    const nameText = "ROHIT RANVIR";

    return (
        <motion.div
            initial={{ y: 0 }}
            exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.7, 0, 0.3, 1] } }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100000,
                background: '#080808',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <motion.div
                animate={stage >= 7 ? { scale: 1.1, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                {/* Double R Logo */}
                <div style={{ display: 'flex', position: 'relative' }}>
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={stage >= 1 ? { y: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="font-display"
                        style={{ fontSize: '180px', color: 'var(--gold)', lineHeight: 0.8, marginRight: '-20px' }}
                    >
                        R
                    </motion.div>
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={stage >= 2 ? { y: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="font-display"
                        style={{ fontSize: '180px', color: 'var(--gold)', lineHeight: 0.8 }}
                    >
                        R
                    </motion.div>
                </div>

                {/* Gold Line Under Logo */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={stage >= 3 ? { width: '120px' } : {}}
                    transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
                    style={{ height: '2px', background: 'var(--gold)', marginTop: '20px' }}
                />

                {/* Staggered Name */}
                <div style={{ display: 'flex', marginTop: '20px', overflow: 'hidden' }}>
                    {nameText.split('').map((char, index) => (
                        <motion.span
                            key={index}
                            initial={{ y: 20, opacity: 0 }}
                            animate={stage >= 4 ? { y: 0, opacity: 1 } : {}}
                            transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
                            className="font-mono"
                            style={{
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                letterSpacing: '0.3em',
                                marginRight: char === ' ' ? '0.5em' : '0'
                            }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </div>

                {/* Portfolio 2025 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={stage >= 5 ? { opacity: 0.6, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="font-body"
                    style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                    Portfolio 2025
                </motion.div>

                {/* Progress Bar Container */}
                <div style={{ width: '250px', height: '2px', background: 'rgba(201, 168, 76, 0.15)', marginTop: '40px', borderRadius: '2px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={stage >= 6 ? { width: '100%' } : {}}
                        transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
                        style={{ height: '100%', background: 'var(--gold)', borderRadius: '2px', boxShadow: '0 0 10px rgba(201,168,76,0.6)' }}
                    />
                </div>

            </motion.div>
        </motion.div>
    );
}
