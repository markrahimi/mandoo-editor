'use client';

export type OutputFormat = 'html' | 'markdown';

export type TabId = 'visual' | 'text' | 'block';

/** Visual theme — 'classic' for a traditional dense toolbar, 'modern' for a minimal floating style */
export type Theme = 'classic' | 'modern';

/** Color scheme — 'light' (default) or 'dark' */
export type ColorScheme = 'light' | 'dark';

export type BlockFormat =
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'pre'
  | 'address';

/**
 * Feature flags — all optional booleans.
 * Omit to use the default (true = enabled).
 */
export interface Features {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  lists?: boolean;
  blockquote?: boolean;
  hr?: boolean;
  align?: boolean;
  link?: boolean;
  fullscreen?: boolean;
  kitchenSink?: boolean;
  underline?: boolean;
  justify?: boolean;
  foreColor?: boolean;
  pasteAsText?: boolean;
  removeFormat?: boolean;
  charMap?: boolean;
  indent?: boolean;
  undo?: boolean;
  help?: boolean;
  media?: boolean;
  subscript?: boolean;
  superscript?: boolean;
}

/** Returned by media.onUpload */
export interface MediaUploadResult {
  url: string;
  alt?: string;
  name?: string;
}

/** A file entry from the media library */
export interface MediaFile {
  url: string;
  name: string;
  type: string;
  size?: number;
  thumbnail?: string;
}

/** Props for a custom media library modal */
export interface MediaLibraryProps {
  onSelect: (file: MediaFile) => void;
  onClose: () => void;
}

/**
 * Media integration configuration.
 *
 * @example — MinIO / S3 integration
 * ```tsx
 * <MandooEditor
 *   media={{
 *     accept: 'image/*,video/*',
 *     maxSize: 10 * 1024 * 1024, // 10 MB
 *     async onUpload(file) {
 *       const form = new FormData();
 *       form.append('file', file);
 *       const res = await fetch('/api/upload', { method: 'POST', body: form });
 *       const { url, name } = await res.json();
 *       return { url, name };
 *     },
 *     async onListFiles() {
 *       const res = await fetch('/api/media');
 *       return res.json(); // MediaFile[]
 *     },
 *   }}
 * />
 * ```
 */
export interface MediaConfig {
  /** Upload a file and return its public URL */
  onUpload?: (file: File) => Promise<MediaUploadResult>;
  /** List files already in the media library */
  onListFiles?: () => Promise<MediaFile[]>;
  /** Render a completely custom media library modal */
  renderMediaLibrary?: (props: MediaLibraryProps) => React.ReactNode;
  /** Max file size in bytes (default: unlimited) */
  maxSize?: number;
  /** Accepted MIME types (default: 'image/*') */
  accept?: string;
}

/** Props for the MandooEditor component */
export interface MandooEditorProps {
  /** Controlled HTML value */
  value?: string;
  /** Uncontrolled initial HTML value */
  defaultValue?: string;
  /** Fires on every change with the current value */
  onChange?: (value: string) => void;
  /** Placeholder text shown when the editor is empty */
  placeholder?: string;
  /** Output format for onChange and getValue() */
  outputFormat?: OutputFormat;
  /** Which tabs to show (default: ['visual', 'text', 'block']) */
  tabs?: TabId[];
  /** Which tab is active initially (default: 'visual') */
  defaultTab?: TabId;
  /** Feature flags — omit any to enable it */
  features?: Features;
  /** Media/upload integration */
  media?: MediaConfig;
  /** Free plugins (link checker, tables, image editor, history, …) */
  plugins?: import('./plugins/types').Plugins;
  /**
   * Mandoo API token for future **paid** pro plugins
   * (PDF export, Word import/export, AI assist).
   * Has no effect until a pro plugin is enabled — safe to set now.
   */
  apiToken?: string;
  /**
   * HTML form field name — renders a hidden `<input>` that syncs with editor content.
   * Makes the editor work with native forms, FormData, and server actions.
   * @example <MandooEditor name="content" /> → form.get('content')
   */
  name?: string;
  /** Visual theme — 'classic' (default) or 'modern' (Tiptap-inspired) */
  theme?: Theme;
  /** Color scheme — 'light' (default) or 'dark' */
  colorScheme?: ColorScheme;
  /** Minimum height of the editor content area in px */
  height?: number;
  /** Extra CSS class on the root element */
  className?: string;
}

/** Imperative handle exposed via ref */
export interface MandooEditorHandle {
  /** Get current value in the configured outputFormat */
  getValue(): string;
  /** Get raw HTML regardless of outputFormat */
  getHTML(): string;
  /** Get Markdown converted from the current HTML */
  getMarkdown(): string;
  /** Set the editor HTML content */
  setValue(html: string): void;
  /** Focus the visual editor */
  focus(): void;
  /** Clear the editor */
  clear(): void;
}

/** Internal editor state */
export interface EditorState {
  activeFormats: Set<string>;
  currentBlock: string;
  wordCount: number;
  charCount: number;
  pathElements: string[];
  isFullscreen: boolean;
  showKitchenSink: boolean;
  pasteAsText: boolean;
  foreColor: string;
}

/** All execCommand-based commands */
export interface ExecCommands {
  bold(): void;
  italic(): void;
  underline(): void;
  strikethrough(): void;
  bullist(): void;
  numlist(): void;
  blockquote(): void;
  hr(): void;
  alignLeft(): void;
  alignCenter(): void;
  alignRight(): void;
  alignJustify(): void;
  link(url: string, text: string, newTab: boolean): void;
  unlink(): void;
  formatBlock(format: BlockFormat): void;
  foreColor(color: string): void;
  removeFormat(): void;
  indent(): void;
  outdent(): void;
  undo(): void;
  redo(): void;
  insertChar(char: string): void;
  subscript(): void;
  superscript(): void;
}
