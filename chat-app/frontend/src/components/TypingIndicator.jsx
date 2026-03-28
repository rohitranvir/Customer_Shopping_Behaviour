export default function TypingIndicator({ typingUsers, allUsers = [] }) {
    const typing = Object.values(typingUsers || {}).filter((u) => u.isTyping);
    if (typing.length === 0) return null;

    let text;
    if (typing.length === 1) text = `${typing[0].username} is typing`;
    else if (typing.length === 2) text = `${typing[0].username} and ${typing[1].username} are typing`;
    else text = `${typing[0].username} and ${typing.length - 1} others are typing`;

    // Find user info for avatar
    const typingUser = typing[0];
    const userInfo = allUsers.find(u => String(u.id) === String(Object.keys(typingUsers).find(k => typingUsers[k]?.isTyping)));
    const color = userInfo?.color || '#F9A8D4';
    const initial = typingUser.username?.[0]?.toUpperCase() || '?';

    return (
        <div className="msg-new" style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 8 }}>
            {/* Avatar */}
            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}33, ${color}88)`,
                border: `1.5px solid ${color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: color,
                fontFamily: "'DM Mono', monospace", flexShrink: 0,
            }}>
                {initial}
            </div>
            {/* Dots bubble */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '4px 18px 18px 18px',
                backdropFilter: 'blur(10px)',
                padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 6,
            }}>
                <span style={{ fontSize: 12, color: '#4B5563' }}>{text}</span>
                <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                        <span key={i} style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#6EE7B7',
                            animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                            opacity: 0.7, display: 'inline-block',
                        }} />
                    ))}
                </span>
            </div>
        </div>
    );
}
