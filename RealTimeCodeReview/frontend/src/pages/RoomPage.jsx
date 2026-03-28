import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CodeEditor from '../components/CodeEditor';
import CommentPanel from '../components/CommentPanel';
import VersionHistoryModal from '../components/VersionHistoryModal';
import { useAuth } from '../services/AuthContext';

const RoomPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [code, setCode] = useState('// Loading code...');
    const [language, setLanguage] = useState('javascript');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ws, setWs] = useState(null);
    const [showVersions, setShowVersions] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [executionOutput, setExecutionOutput] = useState('');
    const [showOutput, setShowOutput] = useState(false);
    const editorRef = useRef(null);

    // Fetch room data from Django API
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                await api.post(`rooms/${roomId}/join/`);
                const response = await api.get(`rooms/${roomId}/`);
                setRoom(response.data);

                const commentsRes = await api.get(`comments/?room=${roomId}`);
                setComments(commentsRes.data || []);

                if (response.data.code_snippet) {
                    setCode(response.data.code_snippet.content);
                    setLanguage(response.data.code_snippet.language);
                } else {
                    setCode('// Start coding here\n');
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to load room", err);
                setError("Could not load room details. You might not have access.");
                setLoading(false);
            }
        };

        fetchRoomData();
    }, [roomId]);

    // WebSocket Connection setup
    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8001/ws/room/${roomId}`);

        socket.onopen = () => {
            console.log('WebSocket Connected');
            setWs(socket);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'code_update') {
                setCode(prevCode => {
                    if (prevCode !== data.content) return data.content;
                    return prevCode;
                });
            } else if (data.type === 'cursor_move') {
                // TODO: Show remote cursors
            } else if (data.type === 'language_update') {
                setLanguage(prev => {
                    if (prev !== data.language) return data.language;
                    return prev;
                });
            } else if (data.type === 'comment_added') {
                setComments(prev => [...prev, data.comment]);
            } else if (data.type === 'user_joined' || data.type === 'user_left') {
                // Re-fetch users to keep member list updated
                api.get(`rooms/${roomId}/`).then(res => setRoom(res.data)).catch(console.error);
            }
        };

        return () => {
            socket.close();
            setWs(null);
        };
    }, [roomId]);

    const handleEditorMount = (editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition((e) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'cursor_move',
                    position: {
                        lineNumber: e.position.lineNumber,
                        column: e.position.column
                    },
                    user: user?.username
                }));
            }
        });
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'code_update',
                content: newCode
            }));
        }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'language_update',
                language: newLang
            }));
        }
    };

    const handleAddComment = async (commentData) => {
        try {
            const response = await api.post('comments/', {
                ...commentData,
                room: roomId
            });
            const newComment = response.data;
            setComments(prev => [...prev, newComment]);

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'comment_added',
                    comment: newComment
                }));
            }
        } catch (err) {
            console.error("Failed to add comment:", err);
            alert("Failed to add comment. Please try again.");
        }
    };

    const handleExecuteCode = async () => {
        setExecuting(true);
        setShowOutput(true);
        setExecutionOutput('Executing...');
        try {
            const res = await api.post(`rooms/${roomId}/execute/`);
            setExecutionOutput(res.data.output || 'No output.');
        } catch (err) {
            setExecutionOutput(err.response?.data?.error || 'Execution failed.');
        } finally {
            setExecuting(false);
        }
    };

    const handleGitHubImport = async () => {
        const url = prompt("Enter GitHub Raw URL or standard file URL:");
        if (!url) return;
        try {
            const res = await api.post(`rooms/${roomId}/github/`, { repo_url: url });
            setCode(res.data.content);
            setLanguage(res.data.language);
            alert("Code imported successfully.");
            // Broadcast WS change
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'code_update', content: res.data.content }));
                ws.send(JSON.stringify({ type: 'language_update', language: res.data.language }));
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to import from GitHub.");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Room...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
                <div>
                    <h1 className="text-xl font-bold">{room?.name || 'Code Review Room'}</h1>
                    <p className="text-xs text-gray-400">ID: {roomId}</p>
                </div>
                <div className="flex gap-4 items-center">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-gray-700 text-white px-3 py-1 rounded text-sm outline-none"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                    </select>
                    <button
                        onClick={handleGitHubImport}
                        className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm font-medium transition-colors"
                    >
                        Import GitHub
                    </button>
                    <button
                        onClick={handleExecuteCode}
                        disabled={executing}
                        className={`px-3 py-1 rounded text-white text-sm font-medium transition-colors ${executing ? 'bg-green-800' : 'bg-green-600 hover:bg-green-500'}`}
                    >
                        {executing ? 'Running...' : 'Run Code'}
                    </button>
                    <button
                        onClick={() => setShowVersions(true)}
                        className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-white text-sm font-medium transition-colors"
                    >
                        History
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                await api.post('versions/', { room: roomId, code_content: code });
                                alert('Version saved successfully!');
                                // Also send a WS message to notify others?
                                if (ws) ws.send(JSON.stringify({ type: 'version_saved' }));
                            } catch (e) { console.error('Error saving version', e); alert('Failed to save version'); }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-white text-sm"
                    >
                        Save Version
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                    >
                        Leave Room
                    </button>
                </div>
            </header>

            {/* Main Content Areas */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor Container */}
                <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-700">
                    <div className="flex-1 overflow-hidden">
                        <CodeEditor
                            code={code}
                            language={language}
                            onChange={handleCodeChange}
                            onMount={handleEditorMount}
                        />
                    </div>
                    {/* Execution Output Panel */}
                    {showOutput && (
                        <div className="h-48 bg-gray-900 border-t border-gray-700 flex flex-col">
                            <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                                <span className="font-semibold text-sm text-white">Execution Output</span>
                                <button onClick={() => setShowOutput(false)} className="text-gray-400 hover:text-white">&times;</button>
                            </div>
                            <pre className="flex-1 p-4 overflow-y-auto text-sm font-mono text-gray-300">
                                {executionOutput}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Sidebar container */}
                <div className="w-80 bg-gray-800 flex flex-col border-l border-gray-700">
                    <div className="p-4 border-b border-gray-700 shrink-0">
                        <h2 className="text-lg font-semibold mb-2">Members</h2>
                        <ul className="space-y-2">
                            {room?.members?.map((member) => (
                                <li key={member.user.id} className="flex justify-between items-center bg-gray-700 p-2 rounded text-sm">
                                    <span>{member.user.username} {user?.id === member.user.id && '(You)'}</span>
                                    <span className="text-xs bg-gray-600 px-2 py-1 rounded">{member.role}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <CommentPanel comments={comments} onAddComment={handleAddComment} />
                    </div>
                </div>
            </div>

            {/* Version History / Diff Modal */}
            {showVersions && (
                <VersionHistoryModal
                    roomId={roomId}
                    currentCode={code}
                    language={language}
                    onClose={() => setShowVersions(false)}
                />
            )}
        </div>
    );
};

export default RoomPage;
