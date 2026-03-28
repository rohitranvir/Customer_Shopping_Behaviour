import { motion } from 'framer-motion';

export default function PageTransition({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
        >
            {/* Gold curtain wipe element for page entering */}
            <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
                style={{
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'var(--gold)',
                    transformOrigin: 'right',
                    zIndex: 999999,
                    pointerEvents: 'none'
                }}
            />
            {/* Wipe element for returning/exiting */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 0 }}
                exit={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
                style={{
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'var(--gold)',
                    transformOrigin: 'left',
                    zIndex: 999999,
                    pointerEvents: 'none'
                }}
            />
            {children}
        </motion.div>
    );
}
