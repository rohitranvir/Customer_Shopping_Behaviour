import { motion } from 'framer-motion';

export default function Marquee() {
    const items1 = "Python • React • Flask • Machine Learning • SQL • TensorFlow • Java • Node.js • Deep Learning • REST APIs • Django • Data Analysis • CNN • NLP • Power BI • ";
    const items2 = "HTML5 • CSS3 • JavaScript • Tailwind • Bootstrap • Pandas • NumPy • MongoDB • Git • Express.js • Keras • Matplotlib • PostgreSQL • Redis • Streamlit • ";

    const marqueeVariants1 = {
        animate: {
            x: [0, -1000],
            transition: {
                x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                },
            },
        },
    };

    const marqueeVariants2 = {
        animate: {
            x: [-1000, 0],
            transition: {
                x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                },
            },
        },
    };

    return (
        <section style={{ padding: '24px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ overflow: 'hidden', marginBottom: 12, position: 'relative' }}>
                <motion.div
                    className="marquee-track"
                    variants={marqueeVariants1}
                    animate="animate"
                    whileHover={{ animationPlayState: 'paused' }} // CSS fallback
                    style={{ display: 'flex', whiteSpace: 'nowrap', width: 'fit-content' }}
                >
                    <span className="font-display" style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', color: 'var(--gold)', fontWeight: 300, letterSpacing: '0.04em', opacity: 0.7, paddingRight: '1rem' }}>
                        {items1}{items1}{items1}
                    </span>
                </motion.div>
            </div>
            <div style={{ overflow: 'hidden', position: 'relative' }}>
                <motion.div
                    className="marquee-track"
                    variants={marqueeVariants2}
                    animate="animate"
                    whileHover={{ animationPlayState: 'paused' }}
                    style={{ display: 'flex', whiteSpace: 'nowrap', width: 'fit-content' }}
                >
                    <span className="font-display" style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', color: 'var(--gold-dim)', fontWeight: 300, letterSpacing: '0.04em', opacity: 0.5, paddingRight: '1rem' }}>
                        {items2}{items2}{items2}
                    </span>
                </motion.div>
            </div>
        </section>
    );
}
