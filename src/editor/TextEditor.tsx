'use client';

import React from 'react';
import styles from '../styles/mandoo.module.css';

interface TextEditorProps {
  value: string;
  onChange: (v: string) => void;
  height: number;
}

export default function TextEditor({ value, onChange, height }: TextEditorProps) {
  return (
    <>
      <textarea
        className={styles['mce-textarea']}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ minHeight: height }}
        spellCheck={false}
        aria-label="HTML source editor"
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 8px', background: '#ebebeb', borderTop: '1px solid #ddd', fontSize: 12, color: '#888' }}>
        HTML mode
      </div>
    </>
  );
}
