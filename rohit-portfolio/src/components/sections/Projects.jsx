import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useScrollReveal } from '../../hooks/useAnimations';
import { Github, ExternalLink, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FILTERS = ['All', 'ML & AI', 'Web Dev', 'Data', 'Tools'];

export default function Projects() {
    const { data } = useData();
    const projects = data?.projects || [];
    const [filter, setFilter] = useState('All');
    const [ref, visible] = useScrollReveal(0.05);
    const navigate = useNavigate();

    // Slug mapping for projects that have case study pages
    const caseStudySlugs = {
        'Vendor Connect India': 'vendor-connect-india',
        'Multi-Tenant SaaS Expense Manager': 'multi-tenant-saas-expense-manager',
        'YouTube Comment Sentiment Analysis': 'youtube-comment-sentiment-analysis',
        'SmartReview AI': 'smartreview-ai',
    };

    function getSlug(project) {
        const name = project.name || project.title;
        return caseStudySlugs[name] || null;
    }

    const visibleProjects = projects.filter(p => p.visible !== false);
    const filtered = filter === 'All' ? visibleProjects : visibleProjects.filter(p => p.category === filter);

    return (
        <section id="projects" style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
            <motion.div
                ref={ref}
                initial="hidden"
                animate={visible ? "visible" : "hidden"}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <motion.span variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block' }}>
                        — Portfolio
                    </motion.span>
                    <motion.h2 variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="font-display gold-underline" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, marginTop: 16, marginBottom: 48, display: 'inline-block' }}>
                        Selected Works
                    </motion.h2>
                </div>

                {/* Filters */}
                <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
                    {FILTERS.map(f => (
                        <motion.button
                            key={f}
                            className={`tab-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {f}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Bento Grid */}
                <motion.div
                    layout
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))',
                        gap: 20,
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {filtered.map((project, i) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.4, type: 'spring' }}
                                whileHover={{
                                    y: -8,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                    borderColor: 'var(--gold)',
                                    transition: { duration: 0.3 }
                                }}
                                className="glass-card"
                                style={{
                                    padding: 0,
                                    overflow: 'hidden',
                                    gridColumn: project.featured ? 'span 2' : 'span 1',
                                    position: 'relative',
                                    minHeight: project.featured ? 320 : 260,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: getSlug(project) ? 'pointer' : 'default',
                                }}
                                onClick={() => {
                                    const s = getSlug(project);
                                    if (s) navigate(`/projects/${s}`);
                                }}
                            >
                                {/* Top section */}
                                <div style={{ padding: '28px 28px 0', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div>
                                            {project.featured && (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(201, 168, 76, 0.1)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', marginBottom: 12 }}>
                                                    <Star size={12} style={{ color: 'var(--gold)' }} />
                                                    <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured</span>
                                                </div>
                                            )}
                                            <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                                                {project.category}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {(project.github || project.githubUrl) && (
                                                <motion.a
                                                    href={project.github || project.githubUrl}
                                                    target="_blank" rel="noopener noreferrer"
                                                    whileHover={{ scale: 1.2, color: 'var(--gold)' }}
                                                    style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }}
                                                >
                                                    <Github size={18} />
                                                </motion.a>
                                            )}
                                            {(project.live || project.liveUrl) && (
                                                <motion.a
                                                    href={project.live || project.liveUrl}
                                                    target="_blank" rel="noopener noreferrer"
                                                    whileHover={{ scale: 1.2, color: 'var(--gold)' }}
                                                    style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }}
                                                >
                                                    <ExternalLink size={18} />
                                                </motion.a>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-display" style={{ fontSize: project.featured ? '1.6rem' : '1.3rem', fontWeight: 500, marginBottom: 12, lineHeight: 1.3 }}>
                                        {project.name || project.title}
                                    </h3>
                                    <p className="font-body" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 8 }}>
                                        {project.featured ? (project.fullDesc || project.description) : (project.shortDesc || project.description)}
                                    </p>
                                    {project.highlight && (
                                        <p className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: 8 }}>
                                            ★ {project.highlight}
                                        </p>
                                    )}
                                    {getSlug(project) && (
                                        <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--gold)', opacity: 0.7, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                            View Case Study →
                                        </span>
                                    )}
                                </div>

                                {/* Tags */}
                                <div style={{ padding: '0 28px 24px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {project.tech.map(t => (
                                        <span key={t} className="font-mono" style={{
                                            fontSize: '0.6rem',
                                            padding: '4px 10px',
                                            letterSpacing: '0.05em',
                                            background: 'rgba(201, 168, 76, 0.06)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 4,
                                            color: 'var(--gold-light)',
                                            textTransform: 'uppercase',
                                        }}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </motion.div>

            <style>{`
        @media (max-width: 768px) {
          .glass-card[style*="grid-column: span 2"] {
            grid-column: span 1 !important;
          }
        }
      `}</style>
        </section>
    );
}
