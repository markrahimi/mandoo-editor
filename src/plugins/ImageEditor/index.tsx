'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ImageEditorProps {
  src: string;          // blob URL or data URL of the original image
  onApply: (blob: Blob, dataUrl: string) => void;
  onClose: () => void;
}

interface CropRect { x: number; y: number; w: number; h: number }

export default function ImageEditor({ src, onApply, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState<'move' | 'resize' | null>(null);
  const dragStart = useRef<{ mx: number; my: number; crop: CropRect } | null>(null);
  const [outputW, setOutputW] = useState(0);
  const [outputH, setOutputH] = useState(0);
  const [scale, setScale] = useState(1); // canvas display scale

  const CANVAS_MAX = 520; // max canvas display size

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const s = Math.min(CANVAS_MAX / img.naturalWidth, CANVAS_MAX / img.naturalHeight, 1);
      setScale(s);
      const w = Math.round(img.naturalWidth * s);
      const h = Math.round(img.naturalHeight * s);
      const initCrop: CropRect = { x: Math.round(w * 0.1), y: Math.round(h * 0.1), w: Math.round(w * 0.8), h: Math.round(h * 0.8) };
      setCrop(initCrop);
      setOutputW(img.naturalWidth);
      setOutputH(img.naturalHeight);
      setLoaded(true);
    };
    img.src = src;
  }, [src]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !loaded) return;
    const s = scale;
    canvas.width = Math.round(img.naturalWidth * s);
    canvas.height = Math.round(img.naturalHeight * s);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Clear crop area
    ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
    ctx.drawImage(img, crop.x / s, crop.y / s, crop.w / s, crop.h / s, crop.x, crop.y, crop.w, crop.h);
    // Crop border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
    // Corner handles
    const hs = 8;
    [[crop.x, crop.y], [crop.x + crop.w, crop.y], [crop.x, crop.y + crop.h], [crop.x + crop.w, crop.y + crop.h]].forEach(([hx, hy]) => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
      ctx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
    });
    // Rule of thirds
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    [1, 2].forEach(t => {
      ctx.beginPath(); ctx.moveTo(crop.x + crop.w * t / 3, crop.y); ctx.lineTo(crop.x + crop.w * t / 3, crop.y + crop.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(crop.x, crop.y + crop.h * t / 3); ctx.lineTo(crop.x + crop.w, crop.y + crop.h * t / 3); ctx.stroke();
    });
    ctx.setLineDash([]);
  }, [crop, loaded, scale]);

  useEffect(() => { draw(); }, [draw]);

  // Mouse events
  const getHitZone = (mx: number, my: number): 'move' | 'resize' | null => {
    const hs = 10;
    const { x, y, w, h } = crop;
    if (Math.abs(mx - (x + w)) < hs && Math.abs(my - (y + h)) < hs) return 'resize';
    if (mx > x && mx < x + w && my > y && my < y + h) return 'move';
    return null;
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const zone = getHitZone(mx, my);
    if (zone) { setDragging(zone); dragStart.current = { mx, my, crop: { ...crop } }; }
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !dragStart.current || !canvasRef.current || !imgRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const dx = mx - dragStart.current.mx, dy = my - dragStart.current.my;
    const base = dragStart.current.crop;
    const cW = canvasRef.current.width, cH = canvasRef.current.height;
    if (dragging === 'move') {
      setCrop({ ...base, x: Math.max(0, Math.min(cW - base.w, base.x + dx)), y: Math.max(0, Math.min(cH - base.h, base.y + dy)) });
    } else {
      const nw = Math.max(30, Math.min(cW - base.x, base.w + dx));
      const nh = Math.max(30, Math.min(cH - base.y, base.h + dy));
      setCrop({ ...base, w: nw, h: nh });
      setOutputW(Math.round(nw / scale));
      setOutputH(Math.round(nh / scale));
    }
  }, [dragging, scale]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  // Apply crop
  const apply = () => {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement('canvas');
    out.width = outputW;
    out.height = outputH;
    const ctx = out.getContext('2d')!;
    ctx.drawImage(img, crop.x / scale, crop.y / scale, crop.w / scale, crop.h / scale, 0, 0, outputW, outputH);
    out.toBlob(blob => {
      if (blob) onApply(blob, out.toDataURL('image/jpeg', 0.92));
    }, 'image/jpeg', 0.92);
  };

  const cursor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const zone = getHitZone(e.clientX - r.left, e.clientY - r.top);
    e.currentTarget.style.cursor = zone === 'resize' ? 'se-resize' : zone === 'move' ? 'move' : 'crosshair';
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,.6)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, background: '#1a1f2e', borderRadius: 14, boxShadow: '0 24px 80px rgba(0,0,0,.5)', overflow: 'hidden', maxWidth: '95vw', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>✂️ Image Editor</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        {/* Canvas */}
        <div style={{ padding: 20, overflowAuto: 'auto', display: 'flex', justifyContent: 'center' } as React.CSSProperties}>
          {loaded ? (
            <canvas
              ref={canvasRef}
              onMouseDown={onMouseDown}
              onMouseMove={cursor}
              style={{ borderRadius: 8, maxWidth: '100%', display: 'block' }}
            />
          ) : (
            <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading…</div>
          )}
        </div>
        {/* Controls */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Output size:</span>
          {[['W', outputW, setOutputW], ['H', outputH, setOutputH]].map(([l, v, s]) => (
            <label key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{l as string}</span>
              <input
                type="number" value={v as number} min={10}
                onChange={e => (s as (n: number) => void)(Number(e.target.value))}
                style={{ width: 70, padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 12 }}
              />
              <span style={{ fontSize: 11, color: '#64748b' }}>px</span>
            </label>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '8px 18px', border: '1px solid #334155', borderRadius: 8, background: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={apply} style={{ padding: '8px 22px', border: 'none', borderRadius: 8, background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Apply & Insert</button>
          </div>
        </div>
      </div>
    </>
  );
}
