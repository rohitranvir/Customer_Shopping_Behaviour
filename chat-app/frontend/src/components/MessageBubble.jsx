import { useEffect, useRef } from 'react';

export default function MessageBubble({ message, isOwn, readCount = 0, onVisible, prevSameUser = false }) {
    const ref = useRef(null);

    useEffect(() => {
        if (isOwn || !onVisible) return;
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { onVisible(message.message_id || message.id); observer.unobserve(el); } },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [message.message_id, message.id, isOwn, onVisible]);

    function formatTime(ts) {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    const senderName = message.sender_username || message.sender?.username || 'User';
    const senderColor = isOwn ? '#6EE7B7' : getUserColor(senderName);
    const initial = senderName[0]?.toUpperCase() || '?';
    const showAvatar = !prevSameUser && !isOwn;

    function renderFile() {
        if (!message.file) return null;
        if (message.file_type?.startsWith('image')) {
            return <img src={message.file} alt="Shared" style={{ maxWidth: 240, borderRadius: 12, marginTop: 6, cursor: 'pointer' }} loading="lazy" />;
        }
        return (
            <a href={message.file} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '6px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, color: '#9CA3AF', fontSize: 12, textDecoration: 'none' }}>
                📄 Download file
            </a>
        );
    }

    return (
        <div ref={ref} className="msg-new" style={{
            display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row',
            gap: 10, alignItems: 'flex-end',
            marginTop: !prevSameUser ? 12 : 2,
        }}>
            {/* Avatar column */}
            <div style={{ width: 32, flexShrink: 0 }}>
                {showAvatar && (
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${senderColor}33, ${senderColor}88)`,
                        border: `1.5px solid ${senderColor}66`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: senderColor,
                        fontFamily: "'DM Mono', monospace",
                    }}>
                        {initial}
                    </div>
                )}
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: '62%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                {showAvatar && (
                    <span style={{ fontSize: 11, color: senderColor, fontWeight: 600, marginBottom: 4, marginLeft: 2 }}>
                        {senderName}
                    </span>
                )}
                <div style={{
                    background: isOwn
                        ? 'linear-gradient(135deg, #065F46, #064E3B)'
                        : 'rgba(255,255,255,0.05)',
                    border: isOwn
                        ? '1px solid rgba(110,231,183,0.2)'
                        : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: isOwn ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    padding: '10px 14px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: isOwn ? '0 2px 12px rgba(110,231,183,0.1)' : 'none',
                }}>
                    {message.content && (
                        <p style={{ fontSize: 13.5, color: isOwn ? '#D1FAE5' : '#D1D5DB', lineHeight: 1.55, wordBreak: 'break-word', margin: 0 }}>
                            {message.content}
                        </p>
                    )}
                    {renderFile()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, padding: '0 4px' }}>
                    <span style={{ fontSize: 10, color: '#374151', fontFamily: "'DM Mono', monospace" }}>
                        {formatTime(message.timestamp)}
                    </span>
                    {isOwn && (
                        <span style={{ fontSize: 11, marginLeft: 4, color: readCount > 0 ? '#6EE7B7' : '#4B5563' }}>
                            {readCount > 0 ? '✓✓' : '✓'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Deterministic color from username */
function getUserColor(name) {
    const colors = ['#F9A8D4', '#93C5FD', '#FCD34D', '#C084FC', '#FB923C', '#67E8F9', '#A78BFA'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}
