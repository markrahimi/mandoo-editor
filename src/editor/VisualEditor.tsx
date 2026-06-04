'use client';

import React, { useEffect } from 'react';

interface VisualEditorProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  initialValue?: string;
  placeholder?: string;
  height?: number;
  onInput: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onFocus: () => void;
}

export default function VisualEditor({
  editorRef,
  initialValue = '',
  placeholder = 'Start writing…',
  height = 300,
  onInput,
  onKeyDown,
  onPaste,
  onFocus,
}: VisualEditorProps) {
  useEffect(() => {
    if (editorRef.current && initialValue) {
      editorRef.current.innerHTML = initialValue;
    }
  // only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mce-content-wrap">
      <div
        ref={editorRef}
        className="mce-content-body"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{ minHeight: height }}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onFocus={onFocus}
        spellCheck
        role="textbox"
        aria-multiline="true"
        aria-label="Rich text editor"
      />
    </div>
  );
}
