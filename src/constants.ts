'use client';

import type React from 'react';
import { Features, OutputFormat, TabId, Theme, ColorScheme } from './types';

export const DEFAULT_HEIGHT = 400;
export const DEFAULT_PLACEHOLDER = 'Start writing…';
export const DEFAULT_TABS: TabId[] = ['visual', 'text', 'block'];
export const DEFAULT_OUTPUT_FORMAT: OutputFormat = 'html';

export const ALL_FEATURES_ON: Required<Features> = {
  bold: true,
  italic: true,
  strikethrough: true,
  lists: true,
  blockquote: true,
  hr: true,
  align: true,
  link: true,
  fullscreen: true,
  kitchenSink: true,
  underline: true,
  justify: true,
  foreColor: true,
  pasteAsText: true,
  removeFormat: true,
  charMap: true,
  indent: true,
  undo: true,
  help: true,
  media: true,
  subscript: true,
  superscript: true,
  code: true,
  direction: true,
};

/** Merge partial feature flags with all-enabled defaults */
export function resolveFeatures(partial?: Features): Required<Features> {
  if (!partial) return ALL_FEATURES_ON;
  return { ...ALL_FEATURES_ON, ...partial };
}

export const DEFAULT_THEME: Theme = 'classic';
export const DEFAULT_COLOR_SCHEME: ColorScheme = 'light';

type ThemeVars = Record<string, string>;

const THEME_VARS: Record<Theme, Record<ColorScheme, ThemeVars>> = {
  classic: {
    light: {
      '--me-bg':               '#ffffff',
      '--me-border':           '#e5e7eb',
      '--me-color':            '#374151',
      '--me-color-strong':     '#111827',
      '--me-toolbar-bg':       '#f8fafc',
      '--me-tools-bg':         '#f1f5f9',
      '--me-btn-hover':        '#e2e8f0',
      '--me-btn-hover-border': '#cbd5e1',
      '--me-btn-active':       '#dbeafe',
      '--me-btn-active-border':'#93c5fd',
      '--me-btn-bg':           '#f8fafc',
      '--me-statusbar-bg':     '#f8fafc',
      '--me-textarea-bg':      '#f9fafb',
      '--me-modal-bg':         '#ffffff',
      '--me-modal-header-bg':  '#f8fafc',
      '--me-accent':           '#6366f1',
      '--me-muted':            '#9ca3af',
      '--me-sep':              '#e5e7eb',
      '--me-content-color':    '#1f2937',
      '--me-content-font':     'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
      '--me-btn-size':         '28px',
      '--me-btn-radius':       '6px',
      '--me-container-radius': '12px',
    },
    dark: {
      '--me-bg':               '#0f172a',
      '--me-border':           '#1e293b',
      '--me-color':            '#94a3b8',
      '--me-color-strong':     '#e2e8f0',
      '--me-toolbar-bg':       '#1e293b',
      '--me-tools-bg':         '#0f172a',
      '--me-btn-hover':        '#334155',
      '--me-btn-hover-border': '#475569',
      '--me-btn-active':       '#1e3a5f',
      '--me-btn-active-border':'#3b82f6',
      '--me-btn-bg':           '#1e293b',
      '--me-statusbar-bg':     '#1e293b',
      '--me-textarea-bg':      '#0f172a',
      '--me-modal-bg':         '#1e293b',
      '--me-modal-header-bg':  '#0f172a',
      '--me-accent':           '#818cf8',
      '--me-muted':            '#64748b',
      '--me-sep':              '#334155',
      '--me-content-color':    '#e2e8f0',
      '--me-content-font':     'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
      '--me-btn-size':         '28px',
      '--me-btn-radius':       '6px',
      '--me-container-radius': '12px',
    },
  },
  modern: {
    light: {
      '--me-bg':               '#ffffff',
      '--me-border':           '#e5e7eb',
      '--me-color':            '#374151',
      '--me-color-strong':     '#111827',
      '--me-toolbar-bg':       '#ffffff',
      '--me-tools-bg':         '#ffffff',
      '--me-btn-hover':        '#f1f5f9',
      '--me-btn-hover-border': '#e2e8f0',
      '--me-btn-active':       '#ede9fe',
      '--me-btn-active-border':'#a5b4fc',
      '--me-btn-bg':           '#ffffff',
      '--me-statusbar-bg':     '#ffffff',
      '--me-textarea-bg':      '#fafafa',
      '--me-modal-bg':         '#ffffff',
      '--me-modal-header-bg':  '#fafafa',
      '--me-accent':           '#6366f1',
      '--me-muted':            '#9ca3af',
      '--me-sep':              '#e5e7eb',
      '--me-content-color':    '#1f2937',
      '--me-content-font':     'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
      '--me-btn-size':         '32px',
      '--me-btn-radius':       '8px',
      '--me-container-radius': '14px',
    },
    dark: {
      '--me-bg':               '#18181b',
      '--me-border':           '#27272a',
      '--me-color':            '#a1a1aa',
      '--me-color-strong':     '#f4f4f5',
      '--me-toolbar-bg':       '#18181b',
      '--me-tools-bg':         '#18181b',
      '--me-btn-hover':        '#27272a',
      '--me-btn-hover-border': '#3f3f46',
      '--me-btn-active':       '#312e81',
      '--me-btn-active-border':'#6366f1',
      '--me-btn-bg':           '#18181b',
      '--me-statusbar-bg':     '#18181b',
      '--me-textarea-bg':      '#09090b',
      '--me-modal-bg':         '#27272a',
      '--me-modal-header-bg':  '#18181b',
      '--me-accent':           '#818cf8',
      '--me-muted':            '#71717a',
      '--me-sep':              '#3f3f46',
      '--me-content-color':    '#e4e4e7',
      '--me-content-font':     'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
      '--me-btn-size':         '32px',
      '--me-btn-radius':       '8px',
      '--me-container-radius': '14px',
    },
  },
};

export function getThemeVars(
  theme: Theme = DEFAULT_THEME,
  colorScheme: ColorScheme = DEFAULT_COLOR_SCHEME,
): React.CSSProperties {
  return THEME_VARS[theme][colorScheme] as React.CSSProperties;
}
