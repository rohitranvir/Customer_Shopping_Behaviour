import React, { useState } from 'react';

const CommentPanel = ({ comments, onAddComment }) => {
    const [newLineNumber, setNewLineNumber] = useState('');
    const [newMessage, setNewMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onAddComment({
                line_number: newLineNumber ? parseInt(newLineNumber) : null,
                message: newMessage.trim(),
            });
            setNewLineNumber('');
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 p-4 border-l border-gray-700">
            <h2 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Comments</h2>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No comments yet. Start a discussion!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id || Math.random()} className="bg-gray-700 p-3 rounded-lg text-sm shadow-sm relative">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-indigo-300">
                                    {comment.user?.username || 'Unknown'}
                                </span>
                                {comment.line_number && (
                                    <span className="text-xs bg-gray-600 px-2 py-0.5 rounded text-gray-300">
                                        Line {comment.line_number}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-100 whitespace-pre-wrap">{comment.message}</p>
                            <span className="text-[10px] text-gray-400 absolute bottom-1 right-2">
                                {new Date(comment.created_at || Date.now()).toLocaleTimeString()}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-auto bg-gray-750 p-3 rounded-lg border border-gray-600">
                <div className="flex gap-2 mb-2">
                    <input
                        type="number"
                        placeholder="Line (opt)"
                        value={newLineNumber}
                        onChange={(e) => setNewLineNumber(e.target.value)}
                        className="bg-gray-900 border border-gray-600 text-white text-sm rounded px-2 w-20 focus:outline-none focus:border-indigo-500"
                        min="1"
                    />
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-600 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-1.5 rounded transition-colors"
                >
                    Post Comment
                </button>
            </form>
        </div>
    );
};

export default CommentPanel;
