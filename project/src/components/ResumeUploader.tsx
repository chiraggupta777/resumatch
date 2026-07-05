import React, { useRef, useState } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';

interface ResumeUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
}

export default function ResumeUploader({ file, onFileChange, error }: ResumeUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const validateFile = (f: File): string | null => {
    if (f.type !== 'application/pdf') return 'Only PDF files are supported';
    if (f.size > 10 * 1024 * 1024) return 'File size must be under 10MB';
    return null;
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      onFileChange(null);
      // surface error via prop — parent can pass back
      return;
    }
    onFileChange(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const isActive = dragOver || hover;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      {file ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 16px',
          width: '100%',
          borderRadius: 10,
          border: '1px solid #22c55e',
          backgroundColor: 'rgba(34,197,94,0.05)',
        }}>
          <CheckCircle size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 14, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.name}
          </span>
          <button
            onClick={() => { onFileChange(null); if (inputRef.current) inputRef.current.value = ''; }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2, flexShrink: 0 }}
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            cursor: 'pointer',
            borderRadius: 10,
            border: `2px dashed ${isActive ? '#6366f1' : error ? '#ef4444' : '#1e1e2e'}`,
            backgroundColor: isActive ? 'rgba(99,102,241,0.04)' : 'transparent',
            padding: '32px 20px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
        >
          <Upload size={28} style={{ color: isActive ? '#6366f1' : '#6b7280' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 14, color: isActive ? '#a5b4fc' : '#9ca3af', fontWeight: 500 }}>
              Drag your resume here or <span style={{ color: '#6366f1' }}>click to browse</span>
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#4b5563' }}>PDF only · Max 10MB</p>
          </div>
        </div>
      )}
      {error && (
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ef4444' }}>{error}</p>
      )}
    </div>
  );
}
