const STORAGE_KEY = 'mandoo-editor-emoji-recent';
const MAX_RECENT = 24;

export function getRecentEmojis(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string').slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function addRecentEmoji(emoji: string): string[] {
  const current = getRecentEmojis().filter((e) => e !== emoji);
  const next = [emoji, ...current].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode errors
  }
  return next;
}
