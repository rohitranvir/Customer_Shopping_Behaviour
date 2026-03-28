import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import api from '../api/axios';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import FileUpload from '../components/FileUpload';

function getUserColor(name) {
    const colors = ['#F9A8D4', '#93C5FD', '#FCD34D', '#C084FC', '#FB923C', '#67E8F9', '#6EE7B7'];
    let h = 0;
    for (let i = 0; i < (name || '').length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
}

function Avatar({ name, size = 36, online = null, color }) {
    const c = color || getUserColor(name);
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: `linear-gradient(135deg, ${c}33, ${c}88)`,
            border: `1.5px solid ${c}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 700, color: c,
            fontFamily: "'DM Mono', monospace", flexShrink: 0, position: 'relative',
        }}>
            {(name || '?')[0]?.toUpperCase()}
            {online !== null && online && (
                <div style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: size * 0.28, height: size * 0.28, borderRadius: '50%',
                    background: '#4ADE80', border: '2px solid #0D0D14',
                    boxShadow: '0 0 6px #4ADE8099',
                }} />
            )}
        </div>
    );
}

export default function ChatRoom() {
    const { roomId } = useParams();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const {
        messages: liveMessages,
        onlineUsers, typingUsers, readReceipts,
        isConnected, sendMessage, sendTyping, sendReadReceipt,
    } = useWebSocket(roomId, token);

    const [pastMessages, setPastMessages] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [roomInfo, setRoomInfo] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const bottomRef = useRef(null);
    const typingTimer = useRef(null);
    const inputRef = useRef(null);

    // ── Fetch rooms + room info + messages on mount ──
    useEffect(() => {
        async function load() {
            try {
                const [roomsRes, roomRes, msgsRes] = await Promise.all([
                    api.get('/rooms/'),
                    api.get(`/rooms/${roomId}/`),
                    api.get(`/rooms/${roomId}/messages/`),
                ]);
                setRooms(roomsRes.data.results || roomsRes.data || []);
                setRoomInfo(roomRes.data);
                const msgs = msgsRes.data.results || msgsRes.data;
                setPastMessages(Array.isArray(msgs) ? msgs : []);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 404) navigate('/');
            } finally { setLoading(false); }
        }
        load();
    }, [roomId, navigate]);

    const allMessages = [...pastMessages, ...liveMessages];

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [allMessages.length]);

    const handleMessageVisible = useCallback((id) => sendReadReceipt(id), [sendReadReceipt]);

    function handleInputChange(e) {
        setInput(e.target.value);
        sendTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => sendTyping(false), 2000);
    }

    function handleSend() {
        const text = input.trim();
        if (!text) return;
        sendMessage(text);
        setInput('');
        sendTyping(false);
        clearTimeout(typingTimer.current);
    }

    // ── Derived data ──
    const onlineCount = Object.values(onlineUsers).filter(Boolean).length;
    const otherTyping = {};
    for (const [uid, data] of Object.entries(typingUsers)) {
        if (String(uid) !== String(user?.id)) otherTyping[uid] = data;
    }

    const members = roomInfo?.members || [];
    const onlineMembers = members.filter(m => onlineUsers[m.id]);
    const offlineMembers = members.filter(m => !onlineUsers[m.id]);

    if (loading) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#07070E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #1E293B', borderTopColor: '#6EE7B7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{
            width: '100vw', height: '100vh', background: '#07070E',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', overflow: 'hidden', position: 'relative',
        }}>
            {/* Ambient glow */}
            <div style={{ position: 'fixed', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #6EE7B711 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: -80, right: 100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #818CF811 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* ═════ SIDEBAR ═════ */}
            <div style={{
                width: sidebarOpen ? 260 : 0, minWidth: sidebarOpen ? 260 : 0, height: '100%',
                background: 'rgba(13,13,20,0.97)', borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(.4,0,.2,1)', position: 'relative', zIndex: 1,
                backdropFilter: 'blur(20px)',
            }}>
                {/* Logo */}
                <div style={{ padding: '20px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'linear-gradient(135deg, #6EE7B7, #3B82F6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, boxShadow: '0 0 16px #6EE7B733',
                        }}>⚡</div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', letterSpacing: 0.3 }}>ChatRooms</div>
                            <div style={{ fontSize: 10, color: '#4B5563', letterSpacing: 0.5 }}>WORKSPACE</div>
                        </div>
                    </div>
                </div>

                {/* Rooms list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
                    <div style={{ fontSize: 10, color: '#374151', fontWeight: 600, letterSpacing: 1, padding: '12px 10px 6px', textTransform: 'uppercase' }}>Rooms</div>
                    {rooms.map(room => (
                        <div key={room.id} className="room-item" onClick={() => navigate(`/room/${room.id}`)}
                            style={{
                                padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                                background: room.id === roomId ? 'rgba(110,231,183,0.08)' : 'transparent',
                                borderLeft: room.id === roomId ? '2px solid #6EE7B7' : '2px solid transparent',
                                transition: 'all 0.15s', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                            <span style={{ fontSize: 16, lineHeight: 1 }}>{room.room_type === 'private' ? '🔒' : '🌐'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 12.5, fontWeight: 500,
                                    color: room.id === roomId ? '#6EE7B7' : '#D1D5DB',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>{room.name}</div>
                                <div style={{ fontSize: 10, color: '#4B5563' }}>{room.member_count || 0} members</div>
                            </div>
                        </div>
                    ))}

                    {/* Online sidebar */}
                    <div style={{ fontSize: 10, color: '#374151', fontWeight: 600, letterSpacing: 1, padding: '16px 10px 6px', textTransform: 'uppercase' }}>
                        Online — {onlineCount}
                    </div>
                    {onlineMembers.map(m => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 10 }}>
                            <Avatar name={m.username} size={28} online={true} />
                            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{m.username}</span>
                        </div>
                    ))}
                </div>

                {/* My profile */}
                <div style={{
                    padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <Avatar name={user?.username} size={34} online={true} color="#6EE7B7" />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#E2E8F0' }}>{user?.username}</div>
                        <div style={{ fontSize: 10, color: '#4ADE80' }}>● Online</div>
                    </div>
                    <div className="icon-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}
                        style={{ padding: 6, borderRadius: 8, cursor: 'pointer', color: '#4B5563', fontSize: 14, transition: 'all 0.15s' }}>
                        ⏻
                    </div>
                </div>
            </div>

            {/* ═════ MAIN CHAT ═════ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
                {/* Top bar */}
                <div style={{
                    height: 60, background: 'rgba(10,10,16,0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px',
                    backdropFilter: 'blur(20px)',
                }}>
                    <button className="icon-btn" onClick={() => setSidebarOpen(p => !p)} style={{
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#6B7280',
                        fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                    }}>☰</button>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>
                            {roomInfo?.room_type === 'private' ? '🔒 ' : '🌐 '}{roomInfo?.name || 'Chat Room'}
                        </div>
                        <div style={{ fontSize: 11, color: '#4B5563' }}>{members.length} members · {roomInfo?.description || ''}</div>
                    </div>

                    {/* Stacked avatars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex' }}>
                            {onlineMembers.slice(0, 3).map((m, i) => (
                                <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 3 - i }}>
                                    <Avatar name={m.username} size={26} online={true} />
                                </div>
                            ))}
                        </div>
                        <span style={{ fontSize: 11, color: '#4B5563', marginLeft: 6 }}>{onlineCount} online</span>
                    </div>

                    {/* Connection status */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 99,
                        background: isConnected ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${isConnected ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: isConnected ? '#4ADE80' : '#EF4444',
                            boxShadow: isConnected ? '0 0 8px #4ADE8066' : 'none',
                        }} />
                        <span style={{ fontSize: 10, color: isConnected ? '#4ADE80' : '#EF4444', fontWeight: 500 }}>
                            {isConnected ? 'Live' : 'Reconnecting'}
                        </span>
                    </div>
                </div>

                {/* Messages area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Date divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 16px' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                        <span style={{ fontSize: 10, color: '#374151', letterSpacing: 0.5 }}>TODAY</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                    </div>

                    {allMessages.length === 0 && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: '#374151', fontSize: 13 }}>No messages yet. Start the conversation!</p>
                        </div>
                    )}

                    {allMessages.map((msg, idx) => {
                        const senderId = msg.sender_id || msg.sender?.id;
                        const isOwn = String(senderId) === String(user?.id);
                        const prevMsg = allMessages[idx - 1];
                        const prevSenderId = prevMsg ? (prevMsg.sender_id || prevMsg.sender?.id) : null;
                        const prevSameUser = prevSenderId !== null && String(prevSenderId) === String(senderId);
                        const receiptUsers = readReceipts[msg.message_id || msg.id] || [];
                        return (
                            <MessageBubble
                                key={msg.message_id || msg.id || idx}
                                message={msg}
                                isOwn={isOwn}
                                readCount={receiptUsers.length}
                                onVisible={!isOwn ? handleMessageVisible : undefined}
                                prevSameUser={prevSameUser}
                            />
                        );
                    })}

                    <TypingIndicator typingUsers={otherTyping} />
                    <div ref={bottomRef} />
                </div>

                {/* Input bar */}
                <div style={{
                    padding: '12px 20px 16px', background: 'rgba(10,10,16,0.9)',
                    borderTop: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 16, padding: '8px 8px 8px 16px', transition: 'border-color 0.2s',
                    }}>
                        <FileUpload roomId={roomId} onUploadComplete={() => { }} />

                        <input ref={inputRef} value={input} onChange={handleInputChange}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder={`Message ${roomInfo?.name || 'room'}...`}
                            style={{
                                flex: 1, background: 'transparent', border: 'none',
                                color: '#E2E8F0', fontSize: 13.5, fontFamily: 'inherit', caretColor: '#6EE7B7',
                            }}
                        />

                        <button className="send-btn" onClick={handleSend} style={{
                            background: input.trim() ? '#6EE7B7' : '#1E293B',
                            border: 'none', borderRadius: 12, width: 38, height: 38, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, transition: 'all 0.2s', color: input.trim() ? '#07070E' : '#4B5563',
                            boxShadow: input.trim() ? '0 0 14px #6EE7B744' : 'none',
                        }}>↑</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: 10, color: '#1F2937' }}>Enter to send · Shift+Enter for new line</span>
                    </div>
                </div>
            </div>

            {/* ═════ RIGHT PANEL — MEMBERS ═════ */}
            <div style={{
                width: 220, background: 'rgba(10,10,16,0.9)',
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                padding: '20px 14px', overflowY: 'auto', backdropFilter: 'blur(20px)',
            }}>
                <div style={{ fontSize: 10, color: '#374151', fontWeight: 600, letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase' }}>
                    Members · {members.length}
                </div>
                <div style={{ fontSize: 10, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Online — {onlineCount}
                </div>
                {onlineMembers.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 10, marginBottom: 2, cursor: 'pointer' }}>
                        <Avatar name={m.username} size={30} online={true} />
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#CBD5E1' }}>{m.username}</div>
                            <div style={{ fontSize: 10, color: '#4ADE80' }}>Active now</div>
                        </div>
                    </div>
                ))}

                <div style={{ fontSize: 10, color: '#374151', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Offline — {offlineMembers.length}
                </div>
                {offlineMembers.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 10, marginBottom: 2, opacity: 0.5 }}>
                        <Avatar name={m.username} size={30} />
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF' }}>{m.username}</div>
                            <div style={{ fontSize: 10, color: '#4B5563' }}>Offline</div>
                        </div>
                    </div>
                ))}

                {/* Room info card */}
                <div style={{
                    marginTop: 24, background: 'rgba(110,231,183,0.05)',
                    border: '1px solid rgba(110,231,183,0.12)', borderRadius: 14, padding: 14,
                }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6EE7B7', marginBottom: 8 }}>Room Info</div>
                    <div style={{ fontSize: 11, color: '#4B5563', marginBottom: 4 }}>Type</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>
                        {roomInfo?.room_type === 'public' ? '🌐 Public' : '🔒 Private'}
                    </div>
                    <div style={{ fontSize: 11, color: '#4B5563', marginBottom: 4 }}>Created</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                        {roomInfo?.created_at ? new Date(roomInfo.created_at).toLocaleDateString() : '—'}
                    </div>
                </div>
            </div>
        </div>
    );
}
