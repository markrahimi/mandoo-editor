'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';

interface TableContextBarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

/** Finds the <table> ancestor of the current selection, if any. */
function getSelectedTable(editor: HTMLDivElement): HTMLTableElement | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node: Node | null = sel.anchorNode;
  if (node?.nodeType === Node.TEXT_NODE) node = node.parentNode;
  while (node && node !== editor) {
    if ((node as Element).tagName === 'TABLE') return node as HTMLTableElement;
    node = node.parentNode;
  }
  return null;
}

function getCellPosition(table: HTMLTableElement, editor: HTMLDivElement): { row: number; col: number; rowCount: number; colCount: number } | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node: Node | null = sel.anchorNode;
  if (node?.nodeType === Node.TEXT_NODE) node = node.parentNode;
  while (node && node !== editor) {
    const tag = (node as Element).tagName;
    if (tag === 'TD' || tag === 'TH') {
      const cell = node as HTMLTableCellElement;
      const row = (cell.parentElement as HTMLTableRowElement);
      const tbody = row.parentElement as HTMLTableSectionElement;
      const ri = Array.from(tbody?.children ?? []).indexOf(row);
      const ci = Array.from(row.children).indexOf(cell);
      const rowCount = table.rows.length;
      const colCount = table.rows[0]?.cells.length ?? 0;
      return { row: ri, col: ci, rowCount, colCount };
    }
    node = node.parentNode;
  }
  return null;
}

export default function TableContextBar({ editorRef }: TableContextBarProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [cellInfo, setCellInfo] = useState<{ row: number; col: number; rowCount: number; colCount: number } | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  const update = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) { setPos(null); return; }
    const table = getSelectedTable(editor);
    if (!table) { setPos(null); tableRef.current = null; return; }
    tableRef.current = table;
    const rect = table.getBoundingClientRect();
    const eRect = editor.getBoundingClientRect();
    setPos({ top: rect.top - eRect.top - 36, left: rect.left - eRect.left });
    setCellInfo(getCellPosition(table, editor));
  }, [editorRef]);

  useEffect(() => {
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, [update]);

  const exec = useCallback((fn: (t: HTMLTableElement) => void) => {
    if (tableRef.current) fn(tableRef.current);
    editorRef.current?.dispatchEvent(new InputEvent('input', { bubbles: true }));
  }, [editorRef]);

  const addRowBelow = () => exec(t => {
    const info = cellInfo;
    if (!info) return;
    const newRow = t.insertRow(info.row + 1);
    for (let c = 0; c < info.colCount; c++) {
      const cell = newRow.insertCell(c);
      cell.innerHTML = '&nbsp;';
      cell.style.cssText = 'border:1px solid #e2e8f0;padding:6px 10px;';
    }
  });

  const addRowAbove = () => exec(t => {
    const info = cellInfo;
    if (!info) return;
    const newRow = t.insertRow(info.row);
    for (let c = 0; c < info.colCount; c++) {
      const cell = newRow.insertCell(c);
      cell.innerHTML = '&nbsp;';
      cell.style.cssText = 'border:1px solid #e2e8f0;padding:6px 10px;';
    }
  });

  const deleteRow = () => exec(t => {
    const info = cellInfo;
    if (!info || info.rowCount <= 1) return;
    t.deleteRow(info.row);
  });

  const addColRight = () => exec(t => {
    const info = cellInfo;
    if (!info) return;
    Array.from(t.rows).forEach((row, ri) => {
      const cell = ri === 0 ? document.createElement('th') : document.createElement('td');
      cell.innerHTML = '&nbsp;';
      cell.style.cssText = `border:1px solid #e2e8f0;padding:6px 10px;${ri === 0 ? 'background:#f1f5f9;font-weight:700;' : ''}`;
      row.insertBefore(cell, row.cells[info.col + 1] ?? null);
    });
  });

  const addColLeft = () => exec(t => {
    const info = cellInfo;
    if (!info) return;
    Array.from(t.rows).forEach((row, ri) => {
      const cell = ri === 0 ? document.createElement('th') : document.createElement('td');
      cell.innerHTML = '&nbsp;';
      cell.style.cssText = `border:1px solid #e2e8f0;padding:6px 10px;${ri === 0 ? 'background:#f1f5f9;font-weight:700;' : ''}`;
      row.insertBefore(cell, row.cells[info.col]);
    });
  });

  const deleteCol = () => exec(t => {
    const info = cellInfo;
    if (!info || info.colCount <= 1) return;
    Array.from(t.rows).forEach(row => row.deleteCell(info.col));
  });

  if (!pos) return null;

  const btn = (label: string, title: string, fn: () => void, danger = false) => (
    <button
      key={title}
      title={title}
      onMouseDown={e => { e.preventDefault(); fn(); }}
      style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, border: `1px solid ${danger ? '#fca5a5' : '#e0e7ff'}`, borderRadius: 5, background: danger ? '#fef2f2' : '#eef2ff', color: danger ? '#dc2626' : '#4f46e5', cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 100, display: 'flex', gap: 4, flexWrap: 'wrap', background: '#fff', border: '1.5px solid #e0e7ff', borderRadius: 8, padding: '5px 8px', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}>
      {btn('↑ Row', 'Insert row above', addRowAbove)}
      {btn('↓ Row', 'Insert row below', addRowBelow)}
      {btn('✕ Row', 'Delete row', deleteRow, true)}
      <div style={{ width: 1, background: '#e2e8f0', margin: '0 2px' }} />
      {btn('← Col', 'Insert column left', addColLeft)}
      {btn('→ Col', 'Insert column right', addColRight)}
      {btn('✕ Col', 'Delete column', deleteCol, true)}
    </div>
  );
}
