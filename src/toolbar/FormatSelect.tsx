'use client';

import React from 'react';
import { BlockFormat } from '../types';

const FORMAT_OPTIONS: { value: BlockFormat; label: string }[] = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
  { value: 'pre', label: 'Preformatted' },
  { value: 'address', label: 'Address' },
];

interface FormatSelectProps {
  value: string;
  onChange: (format: BlockFormat) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function FormatSelect({ value, onChange, onMouseDown }: FormatSelectProps) {
  const current =
    FORMAT_OPTIONS.find((o) => o.value === value)?.label ?? 'Paragraph';

  return (
    <span className="mce-format-select-wrap" onMouseDown={onMouseDown}>
      <select
        className="mce-format-select"
        value={value || 'p'}
        title="Paragraph format"
        onChange={(e) => onChange(e.target.value as BlockFormat)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {FORMAT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="mce-format-select-label" aria-hidden="true">
        {current}
      </span>
    </span>
  );
}
