'use client';

import React, { useState, useEffect, useRef } from 'react';

// ─── YouTube URL → Video ID ────────────────────────────────────────────────────

export function extractYoutubeId(url: string): string | null {
  if (!url.trim()) return null;
  try {
    const u = new URL(url.includes('://') ? url : `https://${url}`);
    // youtu.be/ID
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0] || null;
    // youtube.com/watch?v=ID
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      // youtube.com/embed/ID
      const parts = u.pathname.split('/');
      const idx = parts.indexOf('embed');
      if (idx !== -1) return parts[idx + 1] || null;
    }
  } catch { /* invalid URL */ }
  // Plain video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

export function youtubeEmbedHtml(videoId: string): string {
  return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin:8px 0"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy" title="YouTube video"></iframe></div>`;
}

// ─── Modal UI ─────────────────────────────────────────────────────────────────

interface YoutubeModalProps {
  onInsert: (html: string) => void;
  onClose: () => void;
}

export default function YoutubeModal({ onInsert, onClose }: YoutubeModalProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleInsert = () => {
    const id = extractYoutubeId(url.trim());
    if (!id) { setError('Invalid YouTube URL or video ID'); return; }
    onInsert(youtubeEmbedHtml(id));
  };

  const preview = extractYoutubeId(url.trim());

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,.45)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,.2)', width: 'min(480px,94vw)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff0000">
              <path fillRule="evenodd" d="M21.7 8.037a4.26 4.26 0 0 0-.789-1.964 2.84 2.84 0 0 0-1.984-.839c-2.767-.2-6.926-.2-6.926-.2s-4.157 0-6.928.2a2.836 2.836 0 0 0-1.983.839 4.225 4.225 0 0 0-.79 1.965 30.146 30.146 0 0 0-.2 3.206v1.5a30.12 30.12 0 0 0 .2 3.206c.094.712.364 1.39.784 1.972.604.536 1.38.837 2.187.848 1.583.151 6.731.2 6.731.2s4.161 0 6.928-.2a2.844 2.844 0 0 0 1.985-.84 4.27 4.27 0 0 0 .787-1.965 30.12 30.12 0 0 0 .2-3.206v-1.516a30.672 30.672 0 0 0-.202-3.206Zm-11.692 6.554v-5.62l5.4 2.819-5.4 2.801Z" clipRule="evenodd"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Embed YouTube Video</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer', padding: '2px 6px' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
            YouTube URL or Video ID
          </label>
          <input
            ref={inputRef}
            value={url}
            onChange={e => { setUrl(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleInsert()}
            placeholder="https://youtube.com/watch?v=... or youtu.be/..."
            style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 8, fontSize: 13, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
          />
          {error && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#dc2626' }}>{error}</p>}

          {/* Live preview thumbnail */}
          {preview && (
            <div style={{ marginTop: 14, borderRadius: 8, overflow: 'hidden', background: '#000', position: 'relative', paddingBottom: '28%' }}>

              <img
                src={`https://img.youtube.com/vi/${preview}/mqdefault.jpg`}
                alt="preview"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .85 }}
              />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#ff0000">
                    <path d="M6 4l6 4-6 4V4z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleInsert} style={{ padding: '8px 22px', border: 'none', borderRadius: 8, background: '#ff0000', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Insert Video
          </button>
        </div>
      </div>
    </>
  );
}
