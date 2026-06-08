'use client';

import React from 'react';

interface TextEditorProps {
  value: string;
  onChange: (v: string) => void;
  height: number;
}

export default function TextEditor({ value, onChange, height }: TextEditorProps) {
  return (
    <>
      <textarea
        className="mce-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ minHeight: height }}
        spellCheck={false}
        aria-label="HTML source editor"
      />
      <div className="mce-textarea-footer">
        HTML mode
      </div>
    </>
  );
}
