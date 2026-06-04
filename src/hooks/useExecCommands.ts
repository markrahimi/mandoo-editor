'use client';

import React, { useCallback } from 'react';
import { BlockFormat, ExecCommands } from '../types';

export function useExecCommands(
  editorRef: React.RefObject<HTMLDivElement | null>,
  savedRangeRef: React.MutableRefObject<Range | null>,
  onChange?: (html: string) => void,
  onStateUpdate?: () => void,
): ExecCommands {
  const focusEditor = useCallback(() => {
    editorRef.current?.focus();
  }, [editorRef]);

  const restoreRange = useCallback(() => {
    if (!savedRangeRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  }, [savedRangeRef]);

  const exec = useCallback((command: string, value?: string) => {
    if (savedRangeRef.current) {
      restoreRange();
    } else {
      focusEditor();
    }
    try {
      document.execCommand(command, false, value ?? undefined);
    } catch { /* empty */ }
    onChange?.(editorRef.current?.innerHTML || '');
    onStateUpdate?.();
  }, [savedRangeRef, restoreRange, focusEditor, onChange, onStateUpdate, editorRef]);

  const bold = useCallback(() => exec('bold'), [exec]);
  const italic = useCallback(() => exec('italic'), [exec]);
  const underline = useCallback(() => exec('underline'), [exec]);
  const strikethrough = useCallback(() => exec('strikeThrough'), [exec]);
  const bullist = useCallback(() => exec('insertUnorderedList'), [exec]);
  const numlist = useCallback(() => exec('insertOrderedList'), [exec]);
  const alignLeft = useCallback(() => exec('justifyLeft'), [exec]);
  const alignCenter = useCallback(() => exec('justifyCenter'), [exec]);
  const alignRight = useCallback(() => exec('justifyRight'), [exec]);
  const alignJustify = useCallback(() => exec('justifyFull'), [exec]);
  const unlink = useCallback(() => exec('unlink'), [exec]);
  const hr = useCallback(() => exec('insertHorizontalRule'), [exec]);
  const removeFormat = useCallback(() => exec('removeFormat'), [exec]);
  const indent = useCallback(() => exec('indent'), [exec]);
  const outdent = useCallback(() => exec('outdent'), [exec]);
  const undo        = useCallback(() => exec('undo'),        [exec]);
  const redo        = useCallback(() => exec('redo'),        [exec]);
  const subscript   = useCallback(() => exec('subscript'),   [exec]);
  const superscript = useCallback(() => exec('superscript'), [exec]);

  const formatBlock = useCallback((format: BlockFormat) => {
    focusEditor();
    restoreRange();
    document.execCommand('formatBlock', false, format);
    onChange?.(editorRef.current?.innerHTML || '');
    onStateUpdate?.();
  }, [focusEditor, restoreRange, onChange, onStateUpdate, editorRef]);

  const blockquote = useCallback(() => {
    focusEditor();
    restoreRange();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    let inBQ = false;
    let cur: Node | null = node;
    while (cur && cur !== editorRef.current) {
      if ((cur as Element).tagName === 'BLOCKQUOTE') { inBQ = true; break; }
      cur = cur.parentNode;
    }
    if (inBQ) {
      document.execCommand('outdent', false);
    } else {
      document.execCommand('formatBlock', false, 'blockquote');
    }
    onChange?.(editorRef.current?.innerHTML || '');
    onStateUpdate?.();
  }, [focusEditor, restoreRange, onChange, onStateUpdate, editorRef]);

  const foreColor = useCallback((color: string) => {
    focusEditor();
    restoreRange();
    document.execCommand('foreColor', false, color);
    onChange?.(editorRef.current?.innerHTML || '');
    onStateUpdate?.();
  }, [focusEditor, restoreRange, onChange, onStateUpdate, editorRef]);

  const link = useCallback((url: string, text: string, newTab: boolean) => {
    focusEditor();
    restoreRange();
    const sel = window.getSelection();
    const target = newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    if (sel && sel.toString().length === 0 && text) {
      document.execCommand('insertHTML', false, `<a href="${url}"${target}>${text}</a>`);
    } else {
      document.execCommand('createLink', false, url);
      if (newTab && sel && sel.anchorNode) {
        let node: Node | null = sel.anchorNode;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        const anchor = (node as Element)?.closest?.('a');
        if (anchor) {
          anchor.setAttribute('target', '_blank');
          anchor.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
    onChange?.(editorRef.current?.innerHTML || '');
    onStateUpdate?.();
  }, [focusEditor, restoreRange, onChange, onStateUpdate, editorRef]);


  const insertChar = useCallback((char: string) => {
    focusEditor();
    restoreRange();
    document.execCommand('insertText', false, char);
    onChange?.(editorRef.current?.innerHTML || '');
    onStateUpdate?.();
  }, [focusEditor, restoreRange, onChange, onStateUpdate, editorRef]);

  return {
    bold,
    italic,
    underline,
    strikethrough,
    bullist,
    numlist,
    blockquote,
    hr,
    alignLeft,
    alignCenter,
    alignRight,
    alignJustify,
    link,
    unlink,
    formatBlock,
    foreColor,
    removeFormat,
    indent,
    outdent,
    undo,
    redo,
    insertChar,
    subscript,
    superscript,
  };
}
