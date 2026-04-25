import { motion } from 'framer-motion';

const shimmer = {
    initial: { backgroundPosition: '-400px 0' },
    animate: {
        backgroundPosition: '400px 0',
        transition: { repeat: Infinity, duration: 1.5, ease: 'linear' },
    },
};

const shimmerStyle = {
    background: 'linear-gradient(90deg, rgba(201,168,76,0.04) 0%, rgba(201,168,76,0.12) 40%, rgba(201,168,76,0.04) 80%)',
    backgroundSize: '800px 100%',
    borderRadius: 16,
    border: '1px solid rgba(201,168,76,0.08)',
};

function ShimmerBox({ width = '100%', height = 200, style = {} }) {
    return (
        <motion.div
            variants={shimmer}
            initial="initial"
            animate="animate"
            style={{ width, height, ...shimmerStyle, ...style }}
        />
    );
}

/** Full-width section skeleton matching portfolio card layouts. */
export default function GoldSkeleton({ type = 'cards' }) {
    if (type === 'hero') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: '0 24px' }}>
                <ShimmerBox width={120} height={16} style={{ borderRadius: 8 }} />
                <ShimmerBox width="60%" height={48} style={{ borderRadius: 8, maxWidth: 500 }} />
                <ShimmerBox width="40%" height={20} style={{ borderRadius: 8, maxWidth: 300 }} />
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <ShimmerBox width={140} height={44} style={{ borderRadius: 4 }} />
                    <ShimmerBox width={140} height={44} style={{ borderRadius: 4 }} />
                </div>
            </div>
        );
    }

    if (type === 'section-header') {
        return (
            <div style={{ padding: '120px 24px 40px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                <ShimmerBox width={100} height={12} style={{ borderRadius: 6, margin: '0 auto 16px' }} />
                <ShimmerBox width={280} height={36} style={{ borderRadius: 8, margin: '0 auto' }} />
            </div>
        );
    }

    // Default: grid of card skeletons (Projects / Skills / Certifications)
    return (
        <div style={{ padding: '60px 24px 120px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <ShimmerBox width={80} height={12} style={{ borderRadius: 6, margin: '0 auto 16px' }} />
                <ShimmerBox width={220} height={32} style={{ borderRadius: 8, margin: '0 auto' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: 20 }}>
                {[1, 2, 3, 4].map(i => (
                    <ShimmerBox key={i} height={260} />
                ))}
            </div>
        </div>
    );
}
