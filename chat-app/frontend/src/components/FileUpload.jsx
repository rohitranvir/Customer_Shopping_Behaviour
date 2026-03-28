import { useRef, useState } from 'react';
import api from '../api/axios';

export default function FileUpload({ roomId, onUploadComplete }) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true); setProgress(0);
        try {
            await api.post(`/rooms/${roomId}/upload/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (ev) => { if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total)); },
            });
            onUploadComplete?.();
        } catch (err) { console.error('Upload failed:', err); }
        finally { setUploading(false); setProgress(0); if (fileInputRef.current) fileInputRef.current.value = ''; }
    }

    return (
        <>
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
            <button className="icon-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                style={{
                    background: 'none', border: 'none', cursor: uploading ? 'wait' : 'pointer',
                    color: '#4B5563', fontSize: 18, padding: 4, borderRadius: 8,
                    display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                }}>
                {uploading ? (
                    <span style={{ fontSize: 11, color: '#6EE7B7', fontFamily: "'DM Mono', monospace" }}>{progress}%</span>
                ) : '📎'}
            </button>
        </>
    );
}
