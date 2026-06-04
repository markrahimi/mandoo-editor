'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  IconUploadFolder, IconSpinner, IconCheckCircle, IconErrorCircle,
  IconImageType, IconVideoType, IconAudioType, IconFileGeneric,
} from '../icons';
import type { MediaConfig, MediaFile, MediaUploadResult } from '../types';
import ImageEditor from '../plugins/ImageEditor';

interface MediaModalProps {
  config: MediaConfig;
  onInsert: (result: MediaUploadResult) => void;
  onClose: () => void;
  /** Show image editor after upload (imageEditor plugin) */
  imageEditor?: boolean;
}

type ModalTab = 'upload' | 'library';
type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

type MediaType = 'image' | 'video' | 'audio' | 'other';
const MEDIA_TYPES: { id: MediaType; label: string; Icon: React.ElementType; mime: string }[] = [
  { id: 'image', label: 'Image', Icon: IconImageType, mime: 'image/*' },
  { id: 'video', label: 'Video', Icon: IconVideoType, mime: 'video/*' },
  { id: 'audio', label: 'Audio', Icon: IconAudioType, mime: 'audio/*' },
  { id: 'other', label: 'Other', Icon: IconFileGeneric, mime: 'application/*,text/*' },
];

function typesToAccept(types: Set<MediaType>): string {
  if (types.has('other') && types.size === 1) return 'application/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.zip';
  if (types.size === 4) return '*/*'; // all selected = no restriction
  return Array.from(types).map(t => MEDIA_TYPES.find(m => m.id === t)!.mime).join(',');
}

export default function MediaModal({ config, onInsert, onClose, imageEditor = false }: MediaModalProps) {
  const [tab, setTab] = useState<ModalTab>(config.onListFiles ? 'library' : 'upload');
  const enabledTypes = (() => {
    const accept = config.accept ?? 'image/*';
    const types = new Set<MediaType>();
    if (accept === '*' || accept === '*/*') {
      types.add('image'); types.add('video'); types.add('audio'); types.add('other');
    } else {
      if (accept.includes('image')) types.add('image');
      if (accept.includes('video')) types.add('video');
      if (accept.includes('audio')) types.add('audio');
      if (accept.includes('application') || accept.includes('text/') || accept.includes('.pdf') || accept.includes('.doc') || accept.includes('.zip')) types.add('other');
      if (types.size === 0) types.add('image');
    }
    return types;
  })();
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Load existing files when library tab is active
  useEffect(() => {
    if (tab !== 'library' || !config.onListFiles) return;
    let cancelled = false;
    // Defer setState out of the synchronous effect body to avoid cascading renders
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setLoadingFiles(true);
      try {
        const data = await config.onListFiles!();
        if (!cancelled) setFiles(data);
      } catch {
        if (!cancelled) setFiles([]);
      } finally {
        if (!cancelled) setLoadingFiles(false);
      }
    });
    return () => { cancelled = true; };
  }, [tab, config.onListFiles]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const computedAccept = typesToAccept(enabledTypes);

  const doUpload = useCallback(async (file: File) => {
    if (!config.onUpload) return;
    const maxSize = config.maxSize ?? 10 * 1024 * 1024;
    if (file.size > maxSize) { setErrorMsg(`File too large (max ${Math.round(maxSize / 1024 / 1024)} MB)`); setStatus('error'); return; }
    setStatus('uploading'); setErrorMsg(''); setProgress(10);
    const ticker = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 300);
    try {
      const result = await config.onUpload(file);
      clearInterval(ticker); setProgress(100); setStatus('done');
      setTimeout(() => {
        onInsert({ url: result.url, alt: result.alt ?? file.name, name: result.name ?? file.name });
      }, 400);
    } catch (err: unknown) {
      clearInterval(ticker);
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
    }
  }, [config, onInsert]);

  const uploadFile = useCallback((file: File) => {
    // If image + imageEditor plugin active → show crop first
    if (imageEditor && file.type.startsWith('image/')) {
      const src = URL.createObjectURL(file);
      setPendingFile(file);
      setCropSrc(src);
      return;
    }
    doUpload(file);
  }, [doUpload, imageEditor]);

  const handleFilePick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleInsertSelected = useCallback(() => {
    if (!selectedFile) return;
    onInsert({ url: selectedFile.url, alt: altText || selectedFile.name, name: selectedFile.name });
  }, [selectedFile, altText, onInsert]);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const isImage = (file: MediaFile) =>
    file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(file.url);

  // Image editor overlay (shown when imageEditor plugin is enabled)
  if (cropSrc) {
    return (
      <ImageEditor
        src={cropSrc}
        onApply={async (_blob, dataUrl) => {
          setCropSrc(null);
          if (!pendingFile || !config.onUpload) {
            // Fallback: insert as data URL inline
            onInsert({ url: dataUrl, alt: pendingFile?.name ?? 'image', name: pendingFile?.name });
            return;
          }
          // Convert data URL to File and upload
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const croppedFile = new File([blob], pendingFile.name, { type: 'image/jpeg' });
          setPendingFile(null);
          doUpload(croppedFile);
        }}
        onClose={() => { setCropSrc(null); setPendingFile(null); URL.revokeObjectURL(cropSrc); }}
      />
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={S.backdrop} />

      {/* Modal */}
      <div style={S.modal} role="dialog" aria-modal="true" aria-label="Media Library">
        {/* Header */}
        <div style={S.header}>
          <span style={S.headerTitle}>Add Media</span>
          <button style={S.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {config.onUpload && (
            <button style={{ ...S.tabBtn, ...(tab === 'upload' ? S.tabBtnActive : {}) }} onClick={() => setTab('upload')}>Upload File</button>
          )}
          {config.onListFiles && (
            <button style={{ ...S.tabBtn, ...(tab === 'library' ? S.tabBtnActive : {}) }} onClick={() => setTab('library')}>Media Library</button>
          )}
        </div>

        {/* Body */}
        <div style={S.body}>

          {/* ── UPLOAD TAB ── */}
          {tab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Allowed types — read-only, driven by config.accept */}
              {enabledTypes.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginRight: 2 }}>Types:</span>
                  {MEDIA_TYPES.filter(mt => enabledTypes.has(mt.id)).map(mt => (
                    <span
                      key={mt.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 16, border: '1.5px solid #6366f1', background: '#eef2ff', color: '#4f46e5', fontSize: 12, fontWeight: 700 }}
                    >
                      <mt.Icon size={12} /> {mt.label}
                    </span>
                  ))}
                </div>
              )}
              {/* Drop zone */}
              <div
                ref={dropRef}
                style={{ ...S.dropzone, ...(isDragging ? S.dropzoneDrag : {}) }}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => status === 'idle' && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={computedAccept}
                  style={{ display: 'none' }}
                  onChange={handleFilePick}
                />

                {status === 'idle' && (
                  <>
                    <IconUploadFolder size={40} />
                    <p style={{ margin: '8px 0 4px', fontWeight: 600, color: '#333' }}>
                      Drag & drop a file here
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                      or click to browse · {computedAccept} · max {Math.round((config.maxSize ?? 10485760) / 1024 / 1024)} MB
                    </p>
                  </>
                )}

                {status === 'uploading' && (
                  <>
                    <IconSpinner size={40} />
                    <p style={{ margin: '8px 0 12px', fontWeight: 600 }}>Uploading…</p>
                    <div style={S.progressTrack}>
                      <div style={{ ...S.progressBar, width: `${progress}%` }} />
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#666' }}>{progress}%</p>
                  </>
                )}

                {status === 'done' && (
                  <>
                    <IconCheckCircle size={40} />
                    <p style={{ margin: '8px 0 0', fontWeight: 600, color: '#2e7d32' }}>Upload complete!</p>
                  </>
                )}

                {status === 'error' && (
                  <>
                    <IconErrorCircle size={40} />
                    <p style={{ margin: '8px 0 4px', fontWeight: 600, color: '#c62828' }}>Upload failed</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#c62828' }}>{errorMsg}</p>
                    <button
                      style={S.retryBtn}
                      onClick={e => { e.stopPropagation(); setStatus('idle'); setProgress(0); }}
                    >
                      Try again
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── LIBRARY TAB ── */}
          {tab === 'library' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loadingFiles ? (
                <div style={S.emptyState}>Loading files…</div>
              ) : files.length === 0 ? (
                <div style={S.emptyState}>No files found. Upload some files first.</div>
              ) : (
                <div style={S.grid}>
                  {files.map((file, i) => (
                    <div
                      key={i}
                      style={{ ...S.gridItem, ...(selectedFile === file ? S.gridItemSelected : {}) }}
                      onClick={() => { setSelectedFile(file); setAltText(file.name); }}
                      title={file.name}
                    >
                      {isImage(file) ? (

                        <img
                          src={file.thumbnail ?? file.url}
                          alt={file.name}
                          style={S.gridThumb}
                          loading="lazy"
                        />
                      ) : (
                        <div style={S.gridFileIcon}><IconFileGeneric size={36} /></div>
                      )}
                      <div style={S.gridLabel}>{file.name}</div>
                      {file.size && <div style={S.gridSize}>{formatSize(file.size)}</div>}
                    </div>
                  ))}
                </div>
              )}

              {selectedFile && (
                <div style={S.selectedPanel}>
                  <strong style={{ fontSize: 13 }}>Selected: {selectedFile.name}</strong>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#555' }}>Alt text</span>
                    <input
                      style={S.altInput}
                      value={altText}
                      onChange={e => setAltText(e.target.value)}
                      placeholder="Describe the image…"
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === 'library' && selectedFile && (
          <div style={S.footer}>
            <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={S.insertBtn} onClick={handleInsertSelected}>Insert into editor</button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.55)',
    zIndex: 9998,
  },
  modal: {
    position: 'fixed',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(780px, 95vw)',
    maxHeight: '85vh',
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e5e5',
    background: '#f9f9f9',
  },
  headerTitle: { fontWeight: 700, fontSize: 16, color: '#1a1a2e' },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 18, color: '#888', padding: '4px 8px', borderRadius: 4,
    lineHeight: 1,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e5e5',
    padding: '0 20px',
    gap: 0,
  },
  tabBtn: {
    padding: '10px 18px',
    border: 'none', borderBottom: '2px solid transparent',
    background: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, color: '#666',
    transition: 'all 0.1s',
  },
  tabBtnActive: {
    color: '#0073aa',
    borderBottomColor: '#0073aa',
    fontWeight: 700,
  },
  body: {
    flex: 1, overflowY: 'auto',
    padding: 20,
  },
  dropzone: {
    border: '2px dashed #ccc',
    borderRadius: 8,
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: '#fafafa',
    minHeight: 200,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  dropzoneDrag: {
    borderColor: '#0073aa',
    background: '#e8f4fc',
  },
  uploadIcon: { fontSize: 40, lineHeight: 1 },
  progressTrack: {
    width: '80%', height: 6, background: '#e0e0e0',
    borderRadius: 3, overflow: 'hidden',
  },
  progressBar: {
    height: '100%', background: '#0073aa',
    borderRadius: 3, transition: 'width 0.3s ease',
  },
  retryBtn: {
    marginTop: 12, padding: '6px 16px',
    border: '1px solid #c62828', borderRadius: 4,
    background: 'none', color: '#c62828', cursor: 'pointer', fontSize: 13,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 10,
  },
  gridItem: {
    border: '2px solid #e5e5e5',
    borderRadius: 6, padding: 6,
    cursor: 'pointer', textAlign: 'center',
    background: '#fafafa',
    transition: 'all 0.1s',
  },
  gridItemSelected: {
    borderColor: '#0073aa',
    background: '#e8f4fc',
  },
  gridThumb: {
    width: '100%', height: 80,
    objectFit: 'cover', borderRadius: 4,
    display: 'block',
  },
  gridFileIcon: {
    fontSize: 40, height: 80,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 11, color: '#555', marginTop: 4,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  gridSize: { fontSize: 10, color: '#999', marginTop: 2 },
  selectedPanel: {
    background: '#f0f6ff', border: '1px solid #bcd4ed',
    borderRadius: 6, padding: '12px 16px',
  },
  altInput: {
    width: '100%', padding: '6px 10px',
    border: '1px solid #ccc', borderRadius: 4,
    fontSize: 13, boxSizing: 'border-box',
  },
  emptyState: {
    textAlign: 'center', color: '#999',
    padding: '60px 20px', fontSize: 14,
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: 10,
    padding: '14px 20px', borderTop: '1px solid #e5e5e5',
    background: '#f9f9f9',
  },
  cancelBtn: {
    padding: '8px 18px', border: '1px solid #ccc',
    borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13,
  },
  insertBtn: {
    padding: '8px 20px',
    border: 'none', borderRadius: 4,
    background: '#0073aa', color: '#fff',
    cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
};
