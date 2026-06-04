'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import BlockItem from './BlockItem';

interface Block {
  id: string;
  tag: string;
  html: string;
}

const BLOCK_LABELS: Record<string, string> = {
  p: 'Paragraph',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  ul: 'Bulleted List',
  ol: 'Numbered List',
  blockquote: 'Blockquote',
  pre: 'Preformatted',
  figure: 'Figure',
  div: 'Div',
};

function parseBlocks(html: string): Block[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '<p></p>', 'text/html');
  const elements = Array.from(doc.body.children);
  if (elements.length === 0) return [{ id: uid(), tag: 'p', html: '' }];
  return elements.map(el => ({
    id: uid(),
    tag: el.tagName.toLowerCase(),
    html: el.innerHTML,
  }));
}

function serializeBlocks(blocks: Block[]): string {
  return blocks.map(b => `<${b.tag}>${b.html}</${b.tag}>`).join('\n');
}

function uid() {
  return Math.random().toString(36).slice(2);
}

const IconGrip = () => (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
    <circle cx="3.5" cy="4"  r="1.4"/>
    <circle cx="8.5" cy="4"  r="1.4"/>
    <circle cx="3.5" cy="8"  r="1.4"/>
    <circle cx="8.5" cy="8"  r="1.4"/>
    <circle cx="3.5" cy="12" r="1.4"/>
    <circle cx="8.5" cy="12" r="1.4"/>
  </svg>
);

interface BlockEditorProps {
  html: string;
  height: number;
  onChange?: (html: string) => void;
}

export default function BlockEditor({ html, height, onChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseBlocks(html));
  const [dragOverIndex, setDragOverIndex] = useState<number>(-1);
  const [dragOverPos, setDragOverPos] = useState<'top' | 'bottom'>('top');

  const blocksRef = useRef(blocks);
  const dragIndexRef = useRef(-1);
  const mountedRef = useRef(false);
  const skipParseRef = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (skipParseRef.current) { skipParseRef.current = false; return; }
    const parsed = parseBlocks(html);
    blocksRef.current = parsed;
    setBlocks(parsed);
  }, [html]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = useCallback((next: Block[]) => {
    blocksRef.current = next;
    setBlocks(next);
    const serialized = serializeBlocks(next);
    skipParseRef.current = true;
    setTimeout(() => onChangeRef.current?.(serialized), 0);
  }, []);

  const update = useCallback((id: string, newHtml: string) =>
    commit(blocksRef.current.map(b => b.id === id ? { ...b, html: newHtml } : b))
  , [commit]);

  const addBlock = useCallback(() =>
    commit([...blocksRef.current, { id: uid(), tag: 'p', html: '' }])
  , [commit]);

  const removeBlock = useCallback((id: string) => {
    if (blocksRef.current.length === 1) return;
    commit(blocksRef.current.filter(b => b.id !== id));
  }, [commit]);

  const changeTag = useCallback((id: string, tag: string) =>
    commit(blocksRef.current.map(b => b.id === id ? { ...b, tag } : b))
  , [commit]);

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
    const el = (e.currentTarget as HTMLElement).closest('.mce-block-wrap') as HTMLElement;
    if (el) e.dataTransfer.setDragImage(el, 20, 20);
  }, []);

  const handleDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos: 'top' | 'bottom' = e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
    setDragOverIndex(index);
    setDragOverPos(pos);
  }, []);

  const handleDrop = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    const pos = dragOverPos;
    setDragOverIndex(-1);
    dragIndexRef.current = -1;
    if (from === -1 || from === index) return;

    const next = [...blocksRef.current];
    const [moved] = next.splice(from, 1);
    let to = index > from ? index - 1 : index;
    if (pos === 'bottom') to += 1;
    next.splice(to, 0, moved);
    commit(next);
  }, [commit, dragOverPos]);

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = -1;
    setDragOverIndex(-1);
  }, []);

  return (
    <div className="mce-block-editor" style={{ minHeight: height, padding: '16px 20px', background: '#fff' }}>
      {blocks.map((block, index) => {
        const isOver = dragOverIndex === index;
        const cls = [
          'mce-block-wrap',
          isOver && dragOverPos === 'top'    ? 'mce-drag-over-top'    : '',
          isOver && dragOverPos === 'bottom' ? 'mce-drag-over-bottom' : '',
        ].filter(Boolean).join(' ');

        return (
          <div
            key={block.id}
            className={cls}
            onDragOver={handleDragOver(index)}
            onDrop={handleDrop(index)}
            onDragEnd={handleDragEnd}
          >
            <div className="mce-block-header">
              <div
                className="mce-block-drag-handle"
                title="Drag to reorder"
                draggable
                onDragStart={handleDragStart(index)}
              >
                <IconGrip />
              </div>

              <select
                className="mce-block-type-select"
                value={block.tag}
                onChange={e => changeTag(block.id, e.target.value)}
              >
                {Object.entries(BLOCK_LABELS).map(([tag, label]) => (
                  <option key={tag} value={tag}>{label}</option>
                ))}
              </select>

              <button
                className="mce-block-remove"
                title="Remove block"
                tabIndex={-1}
                onClick={() => removeBlock(block.id)}
              >
                ×
              </button>
            </div>

            <BlockItem
              key={`${block.id}-${block.tag}`}
              block={block}
              onUpdate={h => update(block.id, h)}
            />
          </div>
        );
      })}
      <button className="mce-block-add-btn" onClick={addBlock}>
        + Add Block
      </button>
    </div>
  );
}
