'use client';

import React from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export default function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
  onMouseDown,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      tabIndex={-1}
      aria-label={title}
      aria-pressed={active}
      className={`mce-btn${active ? ' mce-active' : ''}${disabled ? ' mce-disabled' : ''}`}
      onMouseDown={onMouseDown ?? ((e) => e.preventDefault())}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
