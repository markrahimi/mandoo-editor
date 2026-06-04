'use client';

/** Free plugins — all opt-in, all zero-dependency. */
export interface Plugins {
  /** Validates URL format + reachability when inserting links. */
  linkChecker?: boolean;
  /** Enables browser-native spellcheck with word count of errors. */
  spellChecker?: boolean;
  /** Insert tables and add/remove rows & columns. */
  tables?: boolean;
  /** Crop / resize images inside the media upload flow. */
  imageEditor?: boolean;
  /** Keeps last 20 content snapshots and lets you restore any of them. */
  history?: boolean;
  /** Embed YouTube videos via iframe by pasting a URL. */
  youtube?: boolean;
}

/**
 * Pro plugins (reserved for future paid tier).
 * Requires a valid `apiToken` in MandooEditorProps.
 * Each field documents the planned capability — NOT yet implemented.
 */
export interface ProPlugins {
  /** Export the current document to PDF via the Mandoo cloud API. */
  exportPdf?: boolean;
  /** Import a .docx file and convert it to the editor's HTML. */
  importWord?: boolean;
  /** Export the current document as a .docx file. */
  exportWord?: boolean;
  /**
   * Opens an AI chat modal powered by the Mandoo AI API.
   * The user can ask the AI to rewrite, summarise, or extend their text.
   * The final result is sent back to the editor.
   */
  aiAssist?: boolean;
}
