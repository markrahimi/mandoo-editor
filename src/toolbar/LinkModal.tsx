'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LinkCheckerWidget } from '../plugins/LinkChecker';

interface LinkModalProps {
  onConfirm: (url: string, text: string, newTab: boolean) => void;
  onClose: () => void;
  selectedText?: string;
  /** Pass true when the linkChecker plugin is enabled */
  showChecker?: boolean;
}

export default function LinkModal({ onConfirm, onClose, selectedText = '', showChecker = false }: LinkModalProps) {
  const [url, setUrl] = useState('https://');
  const [text, setText] = useState(selectedText);
  const [newTab, setNewTab] = useState(false);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => { urlRef.current?.focus(); urlRef.current?.select(); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim()) onConfirm(url.trim(), text, newTab);
  }

  return (
    <div className="mce-modal-overlay" onMouseDown={onClose}>
      <div className="mce-modal" onMouseDown={e => e.stopPropagation()} onKeyDown={e => e.key === 'Escape' && onClose()}>
        <div className="mce-modal-header">
          <span>Insert / Edit Link</span>
          <button type="button" className="mce-modal-close" onClick={onClose} title="Close">×</button>
        </div>
        <form onSubmit={handleSubmit} className="mce-modal-body">
          <div className="mce-modal-field">
            <label>URL</label>
            <input
              ref={urlRef}
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
            {showChecker && <LinkCheckerWidget url={url === 'https://' ? '' : url} />}
          </div>
          <div className="mce-modal-field">
            <label>Link Text</label>
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Link text (optional)" />
          </div>
          <div className="mce-modal-field mce-modal-checkbox">
            <label>
              <input type="checkbox" checked={newTab} onChange={e => setNewTab(e.target.checked)} />
              Open in new tab
            </label>
          </div>
          <div className="mce-modal-footer">
            <button type="submit" className="mce-btn-primary">Insert Link</button>
            <button type="button" className="mce-btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
