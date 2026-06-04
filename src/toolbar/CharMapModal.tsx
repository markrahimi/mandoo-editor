'use client';

import React, { useRef, useEffect } from 'react';

const CHARS = [
  ['!','@','#','$','%','^','&','*','(',')','-','_','=','+'],
  ['[',']','{','}','|','\\',';',':','\'','"',',','.','<','>'],
  ['/', '?', '~', '`', '©', '®', '™', '€', '£', '¥', '¢', '§', '¶', '†'],
  ['‡','•','…','–','—','\'','‘','’','"','"','"','«','»','‹'],
  ['›','°','±','×','÷','¼','½','¾','∞','≈','≠','≤','≥','√'],
  ['∑','∏','∫','←','→','↑','↓','↔','↕','⇐','⇒','⇑','⇓','⇔'],
  ['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ'],
  ['ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω','Α','Β','Γ','Δ'],
  ['Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ','Ν','Ξ','Ο','Π','Ρ','Σ'],
  ['Τ','Υ','Φ','Χ','Ψ','Ω','à','á','â','ã','ä','å','æ','ç'],
  ['è','é','ê','ë','ì','í','î','ï','ñ','ò','ó','ô','õ','ö'],
  ['ù','ú','û','ü','ý','ÿ','À','Á','Â','Ã','Ä','Å','Æ','Ç'],
];

interface CharMapModalProps {
  onSelect: (char: string) => void;
  onClose: () => void;
}

export default function CharMapModal({ onSelect, onClose }: CharMapModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState('');

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  return (
    <div className="mce-modal-overlay" onMouseDown={onClose}>
      <div
        ref={ref}
        className="mce-modal mce-charmap-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mce-modal-header">
          <span>Special Characters</span>
          <button type="button" className="mce-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="mce-modal-body">
          {hovered && (
            <div className="mce-charmap-preview">
              <span className="mce-charmap-char">{hovered}</span>
              <span className="mce-charmap-code">U+{hovered.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}</span>
            </div>
          )}
          <div className="mce-charmap-grid">
            {CHARS.flat().map((ch, i) => (
              <button
                key={i}
                type="button"
                title={`U+${ch.codePointAt(0)?.toString(16).toUpperCase().padStart(4,'0')}`}
                className="mce-charmap-cell"
                onMouseEnter={() => setHovered(ch)}
                onMouseLeave={() => setHovered('')}
                onClick={() => { onSelect(ch); onClose(); }}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
