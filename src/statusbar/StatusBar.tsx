'use client';

import React from 'react';

interface StatusBarProps {
  wordCount: number;
  charCount: number;
  pathElements: string[];
  onHistory?: () => void;
}

export default function StatusBar({ wordCount, charCount, pathElements, onHistory }: StatusBarProps) {
  return (
    <div className="mce-statusbar">
      <div className="mce-path" title="Element path" aria-label="Element path">
        {pathElements.length > 0 ? (
          <>
            <span className="mce-path-label">Path: </span>
            {pathElements.map((el, i) => (
              <span key={i}>
                {i > 0 && <span className="mce-path-sep"> › </span>}
                <span className="mce-path-el">{el}</span>
              </span>
            ))}
          </>
        ) : (
          <span className="mce-path-label">Path: </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onHistory && (
          <button
            onClick={onHistory}
            title="Edit History"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              color: '#0073aa',
              padding: '0 2px',
              lineHeight: 1,
            }}
          >
            History
          </button>
        )}
        <div className="mce-wordcount">
          <span title={`${charCount} characters`}>Word count: {wordCount}</span>
        </div>
      </div>
    </div>
  );
}
