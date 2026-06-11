'use client';

import React, { useState, useCallback } from 'react';
import { EditorState, ExecCommands } from '../types';

const INITIAL_STATE: EditorState = {
  activeFormats: new Set(),
  currentBlock: 'p',
  currentDir: '',
  wordCount: 0,
  charCount: 0,
  pathElements: [],
  isFullscreen: false,
  showKitchenSink: false,
  pasteAsText: false,
  foreColor: '#000000',
};

export function useEditorState(editorRef: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<EditorState>(INITIAL_STATE);

  const updateState = useCallback(() => {
    const formats = new Set<string>();

    try {
      if (document.queryCommandState('bold')) formats.add('bold');
      if (document.queryCommandState('italic')) formats.add('italic');
      if (document.queryCommandState('underline')) formats.add('underline');
      if (document.queryCommandState('strikeThrough')) formats.add('strikethrough');
      if (document.queryCommandState('insertUnorderedList')) formats.add('bullist');
      if (document.queryCommandState('insertOrderedList')) formats.add('numlist');
      if (document.queryCommandState('justifyLeft')) formats.add('alignleft');
      if (document.queryCommandState('justifyCenter')) formats.add('aligncenter');
      if (document.queryCommandState('justifyRight')) formats.add('alignright');
      if (document.queryCommandState('justifyFull')) formats.add('alignjustify');
      if (document.queryCommandState('subscript')) formats.add('subscript');
      if (document.queryCommandState('superscript')) formats.add('superscript');
    } catch {
      // execCommand state queries can throw in some contexts
    }

    // Detect inline <code> around cursor
    try {
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        let n: Node | null = sel.anchorNode;
        if (n.nodeType === Node.TEXT_NODE) n = n.parentNode;
        while (n && n !== document.body) {
          if ((n as Element).tagName === 'CODE') { formats.add('code'); break; }
          n = n.parentNode;
        }
      }
    } catch { /* empty */ }

    let currentBlock = 'p';
    try {
      const val = document.queryCommandValue('formatBlock');
      currentBlock = val?.replace(/^<|>$/g, '') || 'p';
    } catch { /* empty */ }

    let currentDir: 'rtl' | 'ltr' | '' = '';
    try {
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        let n: Node | null = sel.anchorNode;
        if (n.nodeType === Node.TEXT_NODE) n = n.parentNode;
        while (n && n !== editorRef.current) {
          const dir = (n as Element).getAttribute?.('dir');
          if (dir === 'rtl' || dir === 'ltr') { currentDir = dir; break; }
          n = n.parentNode;
        }
      }
    } catch { /* empty */ }

    const text = editorRef.current?.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
    const charCount = text.replace(/\s/g, '').length;

    const path = getPathFromSelection(editorRef.current);

    setState(prev => ({
      ...prev,
      activeFormats: formats,
      currentBlock,
      currentDir,
      wordCount: words.length,
      charCount,
      pathElements: path,
    }));
  }, [editorRef]);

  const handleInput = useCallback((onChange?: (html: string) => void) => {
    onChange?.(editorRef.current?.innerHTML || '');
    updateState();
  }, [editorRef, updateState]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, exec: ExecCommands) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); exec.bold(); break;
        case 'i': e.preventDefault(); exec.italic(); break;
        case 'u': e.preventDefault(); exec.underline(); break;
        case 'z': e.preventDefault(); e.shiftKey ? exec.redo() : exec.undo(); break;
        case 'y': e.preventDefault(); exec.redo(); break;
      }
    }
  }, []);

  const handlePaste = useCallback((
    e: React.ClipboardEvent,
    pasteAsText: boolean,
    onChange?: (html: string) => void
  ) => {
    if (!pasteAsText) return;
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    onChange?.(editorRef.current?.innerHTML || '');
    updateState();
  }, [editorRef, updateState]);

  const handleSelectionChange = useCallback(() => {
    if (document.activeElement === editorRef.current) {
      updateState();
    }
  }, [editorRef, updateState]);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const toggleKitchenSink = useCallback(() => {
    setState(prev => ({ ...prev, showKitchenSink: !prev.showKitchenSink }));
  }, []);

  const togglePasteAsText = useCallback(() => {
    setState(prev => ({ ...prev, pasteAsText: !prev.pasteAsText }));
  }, []);

  const setForeColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, foreColor: color }));
  }, []);

  return {
    state,
    setState,
    updateState,
    handleInput,
    handleKeyDown,
    handlePaste,
    handleSelectionChange,
    toggleFullscreen,
    toggleKitchenSink,
    togglePasteAsText,
    setForeColor,
  };
}

function getPathFromSelection(editorEl: HTMLDivElement | null): string[] {
  if (!editorEl) return [];
  const sel = window.getSelection();
  if (!sel || !sel.anchorNode) return [];
  const path: string[] = [];
  let node: Node | null = sel.anchorNode;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
  while (node && node !== editorEl) {
    const tag = (node as Element).tagName?.toLowerCase();
    if (tag) path.unshift(tag);
    node = node.parentNode;
  }
  return path;
}
