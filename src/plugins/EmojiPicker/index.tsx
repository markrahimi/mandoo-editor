'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EMOJI_CATEGORIES, searchEmojis, type EmojiEntry } from './emojiData';
import { addRecentEmoji, getRecentEmojis } from './recent';

interface EmojiPickerModalProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const RECENT_CATEGORY_ID = 'recent';

export default function EmojiPickerModal({ onSelect, onClose }: EmojiPickerModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(RECENT_CATEGORY_ID);
  const [recent, setRecent] = useState<string[]>(() => getRecentEmojis());
  const [hovered, setHovered] = useState('');

  useEffect(() => {
    searchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  const searchResults = useMemo(() => (query.trim() ? searchEmojis(query) : []), [query]);

  const visibleEmojis: EmojiEntry[] = useMemo(() => {
    if (query.trim()) return searchResults;
    if (activeCategory === RECENT_CATEGORY_ID) {
      return recent.map((emoji) => ({ emoji, keywords: [] }));
    }
    return EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.emojis ?? [];
  }, [activeCategory, query, recent, searchResults]);

  const handleSelect = (emoji: string) => {
    const next = addRecentEmoji(emoji);
    setRecent(next);
    onSelect(emoji);
    onClose();
  };

  return (
    <div className="mce-modal-overlay" onMouseDown={onClose}>
      <div
        ref={ref}
        className="mce-modal mce-emoji-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Emoji picker"
      >
        <div className="mce-modal-header">
          <span>Emoji</span>
          <button type="button" className="mce-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="mce-modal-body mce-emoji-body">
          <input
            ref={searchRef}
            type="search"
            className="mce-emoji-search"
            placeholder="Search emoji…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search emoji"
          />

          {!query.trim() && (
            <div className="mce-emoji-categories" role="tablist" aria-label="Emoji categories">
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === RECENT_CATEGORY_ID}
                className={`mce-emoji-category${activeCategory === RECENT_CATEGORY_ID ? ' mce-emoji-category-active' : ''}`}
                title="Recently used"
                onClick={() => setActiveCategory(RECENT_CATEGORY_ID)}
              >
                🕒
              </button>
              {EMOJI_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category.id}
                  className={`mce-emoji-category${activeCategory === category.id ? ' mce-emoji-category-active' : ''}`}
                  title={category.label}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.icon}
                </button>
              ))}
            </div>
          )}

          <div className="mce-emoji-preview" aria-live="polite">
            {hovered && <span className="mce-emoji-preview-char">{hovered}</span>}
          </div>

          {visibleEmojis.length === 0 ? (
            <p className="mce-emoji-empty">
              {query.trim() ? 'No emoji found.' : 'No recent emoji yet — pick one to get started.'}
            </p>
          ) : (
            <div className="mce-emoji-grid" role="grid">
              {visibleEmojis.map((entry, index) => (
                <button
                  key={`${entry.emoji}-${index}`}
                  type="button"
                  className="mce-emoji-cell"
                  title={entry.keywords[0] ?? entry.emoji}
                  onMouseEnter={() => setHovered(entry.emoji)}
                  onMouseLeave={() => setHovered('')}
                  onClick={() => handleSelect(entry.emoji)}
                >
                  {entry.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
