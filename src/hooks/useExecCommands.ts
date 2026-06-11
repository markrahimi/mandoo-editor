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

  const code = useCallback(() => {
    focusEditor();
    restoreRange();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    // Find if cursor/selection is already inside <code> or <pre>
    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    let inCode: Element | null = null;
    let inPre = false;
    let cur: Node | null = node;
    while (cur && cur !== editorRef.current) {
      const tag = (cur as Element).tagName;
      if (tag === 'CODE') { inCode = cur as Element; break; }
      if (tag === 'PRE')  { inPre = true; break; }
      cur = cur.parentNode;
    }

    const hasSelection = !range.collapsed;

    if (inCode) {
      // Unwrap <code> — replace with its text content
      const text = inCode.textContent || '';
      inCode.replaceWith(document.createTextNode(text));
    } else if (inPre) {
      // Toggle pre block back to paragraph
      document.execCommand('formatBlock', false, 'p');
    } else if (hasSelection) {
      // Wrap selection in inline <code>
      document.execCommand('insertHTML', false, `<code>${sel.toString()}</code>`);
    } else {
      // No selection — insert a pre block
      document.execCommand('formatBlock', false, 'pre');
    }

    onChange?.(editorRef.current?.innerHTML || '');
    onStateUpdate?.();
  }, [focusEditor, restoreRange, onChange, onStateUpdate, editorRef]);

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

  const setDirection = useCallback((dir: 'rtl' | 'ltr') => {
    if (!editorRef.current) return;
    focusEditor();
    restoreRange();

    // Find the target node — from selection or fallback to first child
    let targetNode: Node | null = null;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      targetNode = range.commonAncestorContainer;
      if (targetNode.nodeType === Node.TEXT_NODE) targetNode = targetNode.parentNode;
    }
    if (!targetNode || targetNode === editorRef.current) {
      targetNode = editorRef.current.firstChild;
    }
    if (!targetNode) return;

    // Walk up to find the direct child of the editor (the block element)
    let block: Element | null = null;
    let cur: Node | null = targetNode;
    while (cur && cur !== editorRef.current) {
      if ((cur as Element).parentElement === editorRef.current) {
        block = cur as Element;
        break;
      }
      cur = cur.parentNode;
    }

    // Fallback: if cursor is directly in the editor with no block wrapper
    if (!block && editorRef.current.firstChild) {
      block = editorRef.current.firstChild as Element;
    }

    if (!block) return;

    // Toggle: same dir → remove; different → set
    if (block.getAttribute('dir') === dir) {
      block.removeAttribute('dir');
      (block as HTMLElement).style.removeProperty('direction');
      (block as HTMLElement).style.removeProperty('text-align');
    } else {
      block.setAttribute('dir', dir);
      (block as HTMLElement).style.direction = dir;
      (block as HTMLElement).style.textAlign = dir === 'rtl' ? 'right' : 'left';
    }

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
    code,
    setDirection,
  };
}
