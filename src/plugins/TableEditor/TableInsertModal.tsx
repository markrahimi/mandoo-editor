'use client';

import React, { useState } from 'react';

interface Props {
  onInsert: (rows: number, cols: number, hasHeader: boolean) => void;
  onClose: () => void;
}

const MAX = 10;

export default function TableInsertModal({ onInsert, onClose }: Props) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [header, setHeader] = useState(true);
  const [hovered, setHovered] = useState<[number, number] | null>(null);

  // Grid picker — hover to select dimensions
  const pick = hovered ?? [rows - 1, cols - 1];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,.4)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, background: '#fff', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,.2)', padding: 24, width: 320 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Insert Table</div>

        {/* Visual grid picker */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
            Click to set size: <strong style={{ color: '#6366f1' }}>{pick[0] + 1} × {pick[1] + 1}</strong>
          </div>
          <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${MAX},22px)`, gap: 3, cursor: 'pointer' }}>
            {Array.from({ length: MAX }, (_, r) =>
              Array.from({ length: MAX }, (_, c) => {
                const active = r <= pick[0] && c <= pick[1];
                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseEnter={() => setHovered([r, c])}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => { setRows(r + 1); setCols(c + 1); }}
                    style={{ width: 20, height: 20, borderRadius: 3, border: `1.5px solid ${active ? '#6366f1' : '#e2e8f0'}`, background: active ? '#eef2ff' : '#f8fafc', transition: 'all .08s' }}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Number inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[['Rows', rows, setRows], ['Columns', cols, setCols]].map(([label, val, setter]) => (
            <label key={label as string} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label as string}</span>
              <input
                type="number" min={1} max={20} value={val as number}
                onChange={e => (setter as (n: number) => void)(Math.max(1, Math.min(20, Number(e.target.value))))}
                style={{ padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 14, textAlign: 'center' }}
              />
            </label>
          ))}
        </div>

        {/* Header row toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
          <div onClick={() => setHeader(h => !h)} style={{ width: 36, height: 20, borderRadius: 10, background: header ? '#6366f1' : '#e2e8f0', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 2, left: header ? 18 : 2, width: 16, height: 16, borderRadius: 8, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
          </div>
          <span style={{ fontSize: 13, color: '#374151' }}>First row as header</span>
        </label>

        {/* Preview */}
        <div style={{ marginBottom: 20, overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
            <tbody>
              {Array.from({ length: Math.min(rows, 4) }, (_, r) => (
                <tr key={r}>
                  {Array.from({ length: Math.min(cols, 6) }, (_, c) => {
                    const isHeader = r === 0 && header;
                    const Tag = isHeader ? 'th' : 'td';
                    return (
                      <Tag key={c} style={{ border: '1px solid #e2e8f0', padding: '4px 8px', background: isHeader ? '#f1f5f9' : '#fff', fontWeight: isHeader ? 700 : 400, color: '#64748b' }}>
                        {isHeader ? `H${c + 1}` : `R${r}C${c + 1}`}
                      </Tag>
                    );
                  })}
                  {cols > 6 && <td style={{ border: '1px solid #e2e8f0', padding: '4px 8px', color: '#94a3b8', fontSize: 10 }}>…</td>}
                </tr>
              ))}
              {rows > 4 && <tr><td colSpan={Math.min(cols, 6) + 1} style={{ padding: '2px 8px', color: '#94a3b8', fontSize: 10, textAlign: 'center' }}>…</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onInsert(rows, cols, header)} style={{ padding: '8px 20px', border: 'none', borderRadius: 8, background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Insert Table</button>
        </div>
      </div>
    </>
  );
}
