'use client';

import { useRef, useCallback, useState } from 'react';

// ─── Snapshot store ────────────────────────────────────────────────────────────

export interface Snapshot {
  id: string;
  html: string;
  ts: number;       // unix ms
  label?: string;
}

const MAX_SNAPSHOTS = 20;

export function useHistory() {
  const snaps = useRef<Snapshot[]>([]);
  const lastHtml = useRef('');

  const save = useCallback((html: string, label?: string) => {
    if (html === lastHtml.current) return; // no change
    lastHtml.current = html;
    const snap: Snapshot = { id: Math.random().toString(36).slice(2), html, ts: Date.now(), label };
    snaps.current = [snap, ...snaps.current].slice(0, MAX_SNAPSHOTS);
  }, []);

  const snapshots = () => snaps.current;
  const restore = (id: string) => snaps.current.find(s => s.id === id)?.html ?? null;
  const clear = () => { snaps.current = []; };

  return { save, snapshots, restore, clear };
}

// ─── History Panel UI ──────────────────────────────────────────────────────────

interface HistoryPanelProps {
  snapshots: Snapshot[];
  onRestore: (html: string) => void;
  onClose: () => void;
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

function wordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function HistoryPanel({ snapshots, onRestore, onClose }: HistoryPanelProps) {
  const [preview, setPreview] = useState<Snapshot | null>(null);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9997, background: 'rgba(0,0,0,.3)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, zIndex: 9998, background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Edit History</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{snapshots.length} snapshots saved</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>

        {snapshots.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: 32, textAlign: 'center' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No history yet</div>
            <div style={{ fontSize: 13 }}>Snapshots are saved automatically as you edit.</div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {snapshots.map((snap, i) => (
              <div key={snap.id}
                style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', transition: 'background .1s', background: preview?.id === snap.id ? '#eef2ff' : 'transparent' }}
                onClick={() => setPreview(snap)}
              >
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#6366f1' : '#e2e8f0', border: '2px solid', borderColor: i === 0 ? '#6366f1' : '#cbd5e1', marginTop: 3 }} />
                  {i < snapshots.length - 1 && <div style={{ width: 2, flex: 1, background: '#e2e8f0', marginTop: 2 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontWeight: i === 0 ? 700 : 500, fontSize: 13, color: i === 0 ? '#6366f1' : '#374151' }}>
                      {snap.label ?? (i === 0 ? 'Latest' : `Revision ${snapshots.length - i}`)}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtTime(snap.ts)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wordCount(snap.html)} words
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview + Restore */}
        {preview && (
          <div style={{ borderTop: '1px solid #e2e8f0' }}>
            <div style={{ padding: '12px 20px', background: '#f8fafc', maxHeight: 180, overflow: 'auto', fontSize: 13, color: '#374151', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: preview.html }} />
            <div style={{ padding: '10px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setPreview(null)} style={{ padding: '7px 16px', border: '1px solid #e2e8f0', borderRadius: 7, background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Close preview</button>
              <button onClick={() => { onRestore(preview.html); onClose(); }} style={{ padding: '7px 18px', border: 'none', borderRadius: 7, background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Restore this version</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
