import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, onMount }) => {
    return (
        <div className="flex-1 h-full w-full">
            <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={onChange}
                onMount={onMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
