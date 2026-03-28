import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing a WebSocket connection to a chat room.
 *
 * @param {string} roomId  - UUID of the room to connect to
 * @param {string} token   - JWT access token for authentication
 * @returns {object}       - State and action methods for the WebSocket
 */
export default function useWebSocket(roomId, token) {
    // ── State ──
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [typingUsers, setTypingUsers] = useState({});
    const [readReceipts, setReadReceipts] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    // ── Refs ──
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const typingTimeoutsRef = useRef({});

    // ── Incoming message handler ──
    function handleIncomingMessage(data) {
        switch (data.type) {
            case 'chat_message':
                setMessages((prev) => [...prev, data]);
                break;

            case 'presence_update':
                setOnlineUsers((prev) => ({
                    ...prev,
                    [data.user_id]: data.is_online,
                }));
                break;

            case 'typing_indicator':
                setTypingUsers((prev) => ({
                    ...prev,
                    [data.user_id]: {
                        username: data.username,
                        isTyping: data.is_typing,
                    },
                }));

                // Auto-clear typing indicator after 3 seconds
                if (data.is_typing) {
                    if (typingTimeoutsRef.current[data.user_id]) {
                        clearTimeout(typingTimeoutsRef.current[data.user_id]);
                    }
                    typingTimeoutsRef.current[data.user_id] = setTimeout(() => {
                        setTypingUsers((prev) => ({
                            ...prev,
                            [data.user_id]: {
                                username: data.username,
                                isTyping: false,
                            },
                        }));
                    }, 3000);
                }
                break;

            case 'read_receipt':
                setReadReceipts((prev) => ({
                    ...prev,
                    [data.message_id]: [
                        ...(prev[data.message_id] || []),
                        data.user_id,
                    ],
                }));
                break;

            default:
                break;
        }
    }

    // ── WebSocket connection lifecycle ──
    useEffect(() => {
        if (!roomId || !token) return;

        function connect() {
            const wsUrl = `ws://localhost:8000/ws/chat/${roomId}/?token=${token}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                setConnectionError(null);
            };

            ws.onclose = () => {
                setIsConnected(false);

                // Auto-reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            };

            ws.onerror = () => {
                setConnectionError('Connection failed');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleIncomingMessage(data);
                } catch {
                    // Ignore malformed messages
                }
            };
        }

        connect();

        // Cleanup on unmount or dependency change
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            // Clear all typing timeouts
            Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
            typingTimeoutsRef.current = {};

            if (wsRef.current) {
                wsRef.current.onclose = null; // Prevent reconnect on intentional close
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [roomId, token]);

    // ── Actions ──

    const sendMessage = useCallback((content) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({ type: 'chat_message', content })
            );
        }
    }, []);

    const sendTyping = useCallback((isTyping) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({ type: 'typing', is_typing: isTyping })
            );
        }
    }, []);

    const sendReadReceipt = useCallback((messageId) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({ type: 'read_receipt', message_id: messageId })
            );
        }
    }, []);

    return {
        messages,
        setMessages,
        onlineUsers,
        typingUsers,
        readReceipts,
        isConnected,
        connectionError,
        sendMessage,
        sendTyping,
        sendReadReceipt,
    };
}
