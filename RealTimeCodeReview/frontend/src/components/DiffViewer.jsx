import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

const DiffViewer = ({ original, modified, language, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col p-8">
            <div className="flex justify-between items-center bg-gray-800 p-4 border border-b-0 border-gray-700 rounded-t-lg">
                <div>
                    <h2 className="text-xl font-bold text-white">Version Diff Viewer</h2>
                    <p className="text-xs text-gray-400 flex gap-4 mt-1">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Left: Selected Version</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Right: Current Code</span>
                    </p>
                </div>
                <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium">
                    Back to History
                </button>
            </div>
            <div className="flex-1 bg-gray-900 border border-t-0 border-gray-700 rounded-b-lg overflow-hidden shadow-2xl">
                <DiffEditor
                    height="100%"
                    language={language}
                    original={original}
                    modified={modified}
                    theme="vs-dark"
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        renderSideBySide: true,
                        fontSize: 14,
                        automaticLayout: true
                    }}
                />
            </div>
        </div>
    );
};

export default DiffViewer;
