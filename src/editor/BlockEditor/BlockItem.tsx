'use client';

import React, { useRef, useLayoutEffect } from 'react';

interface BlockItemProps {
  block: { id: string; tag: string; html: string };
  onUpdate: (html: string) => void;
}

export default function BlockItem({ block, onUpdate }: BlockItemProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (elRef.current) elRef.current.innerHTML = block.html;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={elRef}
      className="mce-block-content mce-content-body"
      contentEditable
      suppressContentEditableWarning
      data-tag={block.tag}
      onInput={e => onUpdate((e.currentTarget as HTMLElement).innerHTML)}
    />
  );
}
