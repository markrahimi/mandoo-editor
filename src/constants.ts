'use client';

import { Features, OutputFormat, TabId } from './types';

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
};

/** Merge partial feature flags with all-enabled defaults */
export function resolveFeatures(partial?: Features): Required<Features> {
  if (!partial) return ALL_FEATURES_ON;
  return { ...ALL_FEATURES_ON, ...partial };
}
