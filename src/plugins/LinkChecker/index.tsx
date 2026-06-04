'use client';

import React, { useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LinkState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'valid';   protocol: string; displayUrl: string }
  | { status: 'warning'; message: string }
  | { status: 'invalid'; message: string };

// ─── Core validator (no deps) ─────────────────────────────────────────────────

export async function checkLink(raw: string): Promise<LinkState> {
  if (!raw.trim()) return { status: 'idle' };

  // mailto / tel — validate inline, no fetch needed
  if (raw.startsWith('mailto:')) {
    const addr = raw.slice(7);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)
      ? { status: 'valid', protocol: 'mailto', displayUrl: raw }
      : { status: 'invalid', message: 'Invalid email address' };
  }
  if (raw.startsWith('tel:')) {
    return /^tel:[+\d\s\-().]+$/.test(raw)
      ? { status: 'valid', protocol: 'tel', displayUrl: raw }
      : { status: 'invalid', message: 'Invalid phone number' };
  }
  if (raw.startsWith('#')) {
    return { status: 'valid', protocol: 'anchor', displayUrl: raw };
  }

  // Parse URL — prepend https:// if no scheme given
  let url: URL;
  try {
    url = new URL(raw.includes('://') ? raw : `https://${raw}`);
  } catch {
    return { status: 'invalid', message: 'Not a valid URL' };
  }

  if (!['http:', 'https:', 'ftp:'].includes(url.protocol)) {
    return { status: 'warning', message: `Unusual protocol: ${url.protocol}` };
  }

  // Warn on internal / local hosts
  const h = url.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(h)) {
    return { status: 'warning', message: 'Local / internal URL — may not work for visitors' };
  }

  // Probe reachability with a no-cors HEAD request
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5_000);
    await fetch(url.href, { method: 'HEAD', mode: 'no-cors', signal: ctrl.signal });
    clearTimeout(t);
    return { status: 'valid', protocol: url.protocol.replace(':', ''), displayUrl: url.href };
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      return { status: 'warning', message: 'Timed out — URL may be slow or unreachable' };
    }
    // TypeError → domain not resolved
    return { status: 'invalid', message: `Cannot reach "${url.hostname}"` };
  }
}

// ─── UI widget (used inside LinkModal) ────────────────────────────────────────

const ICONS: Record<LinkState['status'], string> = {
  idle:     '🔗',
  checking: '⏳',
  valid:    '✅',
  warning:  '⚠️',
  invalid:  '❌',
};

const COLORS: Record<LinkState['status'], string> = {
  idle:     '#94a3b8',
  checking: '#6366f1',
  valid:    '#16a34a',
  warning:  '#d97706',
  invalid:  '#dc2626',
};

const BG: Record<LinkState['status'], string> = {
  idle:     'transparent',
  checking: '#eef2ff',
  valid:    '#f0fdf4',
  warning:  '#fffbeb',
  invalid:  '#fef2f2',
};

interface LinkCheckerWidgetProps {
  url: string;
}

export function LinkCheckerWidget({ url }: LinkCheckerWidgetProps) {
  const [result, setResult] = useState<LinkState>({ status: 'idle' });
  const [running, setRunning] = useState(false);

  const run = useCallback(async () => {
    if (!url.trim() || running) return;
    setRunning(true);
    setResult({ status: 'checking' });
    const r = await checkLink(url);
    setResult(r);
    setRunning(false);
  }, [url, running]);

  if (!url.trim()) return null;

  const msg =
    result.status === 'idle'     ? 'Click to verify this link' :
    result.status === 'checking' ? 'Checking…' :
    result.status === 'valid'    ? `Looks good — ${result.displayUrl}` :
    result.message;

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', borderRadius: 8, marginTop: 6,
        background: BG[result.status],
        border: `1px solid ${COLORS[result.status]}30`,
        cursor: result.status !== 'checking' ? 'pointer' : 'default',
        transition: 'all .15s',
      }}
      onClick={run}
      title={result.status === 'idle' ? 'Click to verify this URL' : undefined}
    >
      <span style={{ fontSize: 14 }}>{ICONS[result.status]}</span>
      <span style={{ fontSize: 12, color: COLORS[result.status], flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {msg}
      </span>
      {result.status !== 'checking' && (
        <button
          onClick={e => { e.stopPropagation(); run(); }}
          style={{ fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600, flexShrink: 0 }}
        >
          {result.status === 'idle' ? 'Check' : 'Re-check'}
        </button>
      )}
    </div>
  );
}
