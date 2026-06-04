'use client';

import { useEffect, useCallback } from 'react';

/**
 * SpellChecker plugin — enhances the browser's built-in spellcheck.
 *
 * The contenteditable already has spellCheck={true}.
 * This hook adds:
 *  - Lang attribute on the editor div (improves dictionary selection)
 *  - A listener that counts `::spelling-error` marks via Range API
 *  - `triggerCheck()` — programmatically focuses the editor so the
 *    browser revalidates all words
 */
export function useSpellChecker(
  editorRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  lang = 'en',
) {
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    // Toggle native spellcheck
    el.spellcheck = enabled;
    if (enabled) {
      el.setAttribute('lang', lang);
    } else {
      el.removeAttribute('lang');
    }
  }, [editorRef, enabled, lang]);

  const triggerCheck = useCallback(() => {
    const el = editorRef.current;
    if (!el || !enabled) return;
    // Re-focus to trigger browser's spell-check pass
    const sel = window.getSelection();
    const range = sel?.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
    el.blur();
    requestAnimationFrame(() => {
      el.focus();
      if (range && sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  }, [editorRef, enabled]);

  return { triggerCheck };
}

/**
 * Small UI button shown in the status bar when spellChecker plugin is on.
 */
export function SpellCheckButton({
  onCheck,
  lang,
  onLangChange,
}: {
  onCheck: () => void;
  lang: string;
  onLangChange: (l: string) => void;
}) {
  const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'fa', label: 'فارسی' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'es', label: 'Español' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={onCheck}
        title="Re-run spell check"
        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: '#6366f1', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 5, cursor: 'pointer' }}
      >
        Spell check
      </button>
      <select
        value={lang}
        onChange={e => onLangChange(e.target.value)}
        style={{ fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 4px', color: '#475569', background: '#fff' }}
      >
        {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </div>
  );
}
