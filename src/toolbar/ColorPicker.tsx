'use client';

import React, { useState, useRef, useEffect } from 'react';

const COLORS = [
  '#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#ffffff',
  '#ff0000','#ff4500','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff',
  '#9900ff','#ff00ff','#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#9fc5e8',
  '#b4a7d6','#ea99d5','#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6fa8dc',
  '#8e7cc3','#c27ba0','#cc0000','#e69138','#f1c232','#6aa84f','#45818e','#3d85c8',
  '#674ea7','#a64d79','#990000','#b45f06','#bf9000','#38761d','#134f5c','#1155cc',
  '#351c75','#741b47','#660000','#783f04','#7f6000','#274e13','#0c343d','#1c4587',
  '#20124d','#4c1130',
];

interface ColorPickerProps {
  current: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

export default function ColorPicker({ current, onSelect, onClose }: ColorPickerProps) {
  const [custom, setCustom] = useState(current);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  return (
    <div ref={ref} className="mce-colorpicker" onMouseDown={(e) => e.preventDefault()}>
      <div className="mce-colorpicker-title">Text Color</div>
      <div className="mce-colorpicker-grid">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            className={`mce-color-swatch${c === current ? ' mce-selected' : ''}`}
            style={{ background: c }}
            onClick={() => { onSelect(c); onClose(); }}
          />
        ))}
      </div>
      <div className="mce-colorpicker-custom">
        <label>Custom:</label>
        <input
          type="color"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button
          type="button"
          onClick={() => { onSelect(custom); onClose(); }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
