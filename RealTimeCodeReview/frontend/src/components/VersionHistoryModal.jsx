import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DiffViewer from './DiffViewer';

const VersionHistoryModal = ({ roomId, currentCode, language, onClose }) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState(null);

    useEffect(() => {
        api.get(`versions/?room=${roomId}`)
            .then(res => {
                setVersions(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load versions', err);
                setLoading(false);
            });
    }, [roomId]);

    if (selectedVersion) {
        return (
            <DiffViewer
                original={selectedVersion.code_content}
                modified={currentCode}
                language={language}
                onClose={() => setSelectedVersion(null)}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-700 shadow-2xl">
                <div className="flex justify-between items-center p-5 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Version History</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-xl leading-none">
                        &times;
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="text-center text-gray-400 py-10">Loading versions...</div>
                    ) : versions.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            <p className="mb-2">No saved versions found for this room.</p>
                            <p className="text-sm">Click "Save Version" in the room toolbar to create a snapshot.</p>
                        </div>
                    ) : (
                        versions.map(v => (
                            <div key={v.id} className="bg-gray-750 border border-gray-600 flex justify-between items-center p-4 rounded hover:bg-gray-700 transition-colors">
                                <div>
                                    <p className="font-semibold text-indigo-300">Saved by {v.created_by?.username || 'Unknown'}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(v.created_at).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedVersion(v)}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors"
                                >
                                    Compare with Current
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionHistoryModal;
