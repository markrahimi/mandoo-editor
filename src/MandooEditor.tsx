'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';

import Toolbar from './toolbar/Toolbar';
import VisualEditor from './editor/VisualEditor';
import TextEditor from './editor/TextEditor';
import BlockEditor from './editor/BlockEditor/BlockEditor';
import StatusBar from './statusbar/StatusBar';
import { IconMedia, IconYoutube } from './icons';
import MediaModal from './media/MediaModal';
import { TableContextBar, TableInsertModal, insertTable } from './plugins/TableEditor';
import YoutubeModal from './plugins/YoutubeEmbed';
import { useSpellChecker, SpellCheckButton } from './plugins/SpellChecker';
import { useHistory, HistoryPanel } from './plugins/History';
import { useSelection } from './hooks/useSelection';
import { useExecCommands } from './hooks/useExecCommands';
import { useEditorState } from './hooks/useEditorState';
import { htmlToMarkdown } from './utils/htmlToMarkdown';
import { resolveFeatures, DEFAULT_HEIGHT, DEFAULT_PLACEHOLDER, DEFAULT_TABS, DEFAULT_THEME, DEFAULT_COLOR_SCHEME, getThemeVars } from './constants';
import {
  MandooEditorProps,
  MandooEditorHandle,
  TabId,
} from './types';

const MandooEditor = forwardRef<MandooEditorHandle, MandooEditorProps>(function MandooEditor(
  {
    value,
    defaultValue = '',
    onChange,
    placeholder = DEFAULT_PLACEHOLDER,
    outputFormat = 'html',
    tabs = DEFAULT_TABS,
    defaultTab = 'visual',
    features: featuresProp,
    media,
    plugins = {},
    name,
    theme = DEFAULT_THEME,
    colorScheme = DEFAULT_COLOR_SCHEME,
    height = DEFAULT_HEIGHT,
    className,
  },
  ref
) {
  const features = resolveFeatures(featuresProp);

  // Determine initial tab — must be one of the allowed tabs
  const resolvedDefaultTab: TabId = tabs.includes(defaultTab) ? defaultTab : tabs[0] ?? 'visual';

  const [activeTab, setActiveTab] = useState<TabId>(resolvedDefaultTab);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [spellLang, setSpellLang] = useState('en');
  // htmlValue is the source of truth — synced from controlled `value` or internal changes
  const [htmlValue, setHtmlValue] = useState<string>(value ?? defaultValue);

  const editorRef = useRef<HTMLDivElement>(null);
  const { savedRangeRef, saveRange, restoreRange } = useSelection();
  const isControlled = value !== undefined;

  // ── Plugins ────────────────────────────────────────────────────────────────
  const { triggerCheck: triggerSpell } = useSpellChecker(editorRef, !!plugins.spellChecker, spellLang);
  const history = useHistory();

  // Keep htmlValue in sync with controlled value prop
  useEffect(() => {
    if (isControlled && value !== undefined) {
      setHtmlValue(value);
      // If visual tab is active, update the DOM
      if (activeTab === 'visual' && editorRef.current) {
        // Only update DOM if content actually changed to avoid cursor jumps
        if (editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value;
        }
      }
    }
  }, [value, isControlled, activeTab]);

  const insertMedia = useCallback((url: string, alt: string, format: string) => {
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
    const isVideo = /^(mp4|webm|ogg|mov|avi|mkv)$/.test(ext) || url.includes('video/');
    const isAudio = /^(mp3|wav|ogg|aac|flac|m4a)$/.test(ext) || url.includes('audio/');
    const isImage = /^(jpe?g|png|gif|webp|svg|avif|bmp)$/.test(ext) || url.includes('image/');
    const isFile  = !isVideo && !isAudio && !isImage;

    if (format === 'markdown') {
      if (isImage) {
        document.execCommand('insertText', false, `![${alt}](${url})`);
      } else {
        // video, audio, other files → link
        document.execCommand('insertText', false, `[${alt || url.split('/').pop() || 'file'}](${url})`);
      }
    } else {
      let html: string;
      if (isVideo) {
        html = `<video src="${url}" controls style="max-width:100%;display:block;margin:8px 0"></video>`;
      } else if (isAudio) {
        html = `<audio src="${url}" controls style="width:100%;display:block;margin:8px 0"></audio>`;
      } else if (isFile) {
        // documents, PDFs, zips → link opening in new tab
        const name = alt || url.split('/').pop() || 'file';
        html = `<a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`;
      } else {
        html = `<img src="${url}" alt="${alt}" style="max-width:100%" />`;
      }
      document.execCommand('insertHTML', false, html);
    }
  }, []);

  const handleChange = useCallback((html: string) => {
    if (!isControlled) setHtmlValue(html);
    if (outputFormat === 'markdown') {
      onChange?.(htmlToMarkdown(html));
    } else {
      onChange?.(html);
    }
    // Auto-save history snapshot
    if (plugins.history) history.save(html);
  }, [isControlled, onChange, outputFormat, plugins.history, history]);

  const {
    state,
    setState,
    updateState,
    handleInput: _handleInput,
    handleKeyDown: _handleKeyDown,
    handlePaste: _handlePaste,
    handleSelectionChange,
    toggleFullscreen,
    toggleKitchenSink,
    togglePasteAsText,
  } = useEditorState(editorRef);

  const exec = useExecCommands(
    editorRef,
    savedRangeRef,
    handleChange,
    updateState,
  );

  // Wrap foreColor to also update state
  const wrappedForeColor = useCallback((color: string) => {
    exec.foreColor(color);
    setState(prev => ({ ...prev, foreColor: color }));
  }, [exec, setState]);

  const execWithForeColor = { ...exec, foreColor: wrappedForeColor };

  // Wrap handleInput to pass onChange
  const handleInput = useCallback(() => {
    _handleInput(handleChange);
  }, [_handleInput, handleChange]);

  // Wrap handleKeyDown to pass exec
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    _handleKeyDown(e, execWithForeColor);
  }, [_handleKeyDown, execWithForeColor]);

  // Wrap handlePaste to pass pasteAsText and onChange
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    _handlePaste(e, state.pasteAsText, handleChange);
  }, [_handlePaste, state.pasteAsText, handleChange]);

  // Listen for selectionchange
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  const handleFocus = useCallback(() => {
    if (editorRef.current && editorRef.current.innerHTML === '') {
      document.execCommand('formatBlock', false, 'p');
    }
  }, []);

  // Tab switching helpers
  const getCurrentHtml = useCallback(() =>
    editorRef.current?.innerHTML ?? htmlValue
  , [editorRef, htmlValue]);

  const switchTo = useCallback((tab: TabId) => {
    if (tab === activeTab) return;

    // Capture current content before switching
    if (activeTab === 'visual') {
      const current = getCurrentHtml();
      setHtmlValue(current);
    }

    setActiveTab(tab);

    if (tab === 'visual') {
      // Restore to visual — need to set innerHTML after render
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = htmlValue;
        }
      }, 0);
    }
  }, [activeTab, getCurrentHtml, htmlValue]);

  // Imperative handle
  useImperativeHandle(ref, () => ({
    getValue() {
      const html = editorRef.current?.innerHTML ?? htmlValue;
      if (outputFormat === 'markdown') return htmlToMarkdown(html);
      return html;
    },
    getHTML() {
      return editorRef.current?.innerHTML ?? htmlValue;
    },
    getMarkdown() {
      return htmlToMarkdown(editorRef.current?.innerHTML ?? htmlValue);
    },
    setValue(html: string) {
      setHtmlValue(html);
      if (editorRef.current) {
        editorRef.current.innerHTML = html;
      }
    },
    focus() {
      editorRef.current?.focus();
    },
    clear() {
      setHtmlValue('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      handleChange('');
    },
  }), [htmlValue, outputFormat, handleChange]);

  return (
    <div
      className={[
        'mandoo-editor-container',
        state.isFullscreen ? 'mandoo-fullscreen' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      id="mandoo-editor-container"
      data-mandoo-theme={theme}
      data-mandoo-scheme={colorScheme}
      style={getThemeVars(theme, colorScheme)}
    >
      {/* Tools bar: Add Media + Tab buttons */}
      <div className={'mandoo-editor-tools'} id="mandoo-editor-tools">
        <div className={'mandoo-media-buttons'}>
          {features.media && (
            <button
              type="button"
              className={'btn-add-media'}
              title="Add Media"
              onClick={() => {
                if (!media) {
                  alert('MandooEditor: No `media` prop provided.\n\nExample:\n\n<MandooEditor\n  media={{\n    onUpload: async (file) => {\n      const fd = new FormData();\n      fd.append("file", file);\n      const res = await fetch("/api/upload", { method: "POST", body: fd });\n      return res.json(); // { url, name }\n    }\n  }}\n/>');
                  return;
                }
                if (!media.onUpload && !media.onListFiles && !media.renderMediaLibrary) {
                  alert('MandooEditor: `media` prop is missing `onUpload`.\n\nYou passed the `media` prop but it has no upload callback.\n\nAdd `onUpload: async (file) => { ... return { url } }` to your media config.');
                  return;
                }
                saveRange();
                setShowMediaModal(true);
              }}
            >
              <IconMedia size={14} />
              Add Media
            </button>
          )}
          {plugins.tables && (
            <button
              type="button"
              className={'btn-add-media'}
              title="Insert Table"
              onClick={() => { saveRange(); setShowTableModal(true); }}
            >
              Add Table
            </button>
          )}
          {plugins.youtube && (
            <button
              type="button"
              className={'btn-add-media'}
              title="Embed YouTube Video"
              onClick={() => { saveRange(); setShowYoutubeModal(true); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <IconYoutube size={14} />
              YouTube
            </button>
          )}
        </div>

        {/* Media modal — rendered in-place, portal-like via fixed positioning */}
        {showMediaModal && media && (
          media.renderMediaLibrary
            ? media.renderMediaLibrary({
                onSelect: (file) => {
                  restoreRange();
                  insertMedia(file.url, file.name, outputFormat);
                  handleChange(editorRef.current?.innerHTML || '');
                  setShowMediaModal(false);
                },
                onClose: () => setShowMediaModal(false),
              })
            : <MediaModal
                config={media}
                onInsert={(result) => {
                  restoreRange();
                  insertMedia(result.url, result.alt ?? result.name ?? '', outputFormat);
                  handleChange(editorRef.current?.innerHTML || '');
                  setShowMediaModal(false);
                }}
                onClose={() => setShowMediaModal(false)}
              />
        )}

        <div className={'mandoo-editor-tabs'} role="tablist">
          {tabs.map(tab => (
            <button key={tab} type="button" role="tab" aria-selected={activeTab === tab}
              className={`${'mandoo-tab-btn'} ${activeTab === tab ? 'mandoo-tab-active' : ''}`}
              onClick={() => switchTo(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Editor wrap */}
      <div className={'mandoo-editor-wrap'} id="mandoo-editor-wrap">
        {activeTab === 'block' ? (
          <BlockEditor
            html={htmlValue}
            height={height}
            onChange={(html) => {
              setHtmlValue(html);
              handleChange(html);
            }}
          />
        ) : activeTab === 'visual' ? (
          <>
            <Toolbar
              activeFormats={state.activeFormats}
              currentBlock={state.currentBlock}
              isFullscreen={state.isFullscreen}
              showKitchenSink={state.showKitchenSink}
              pasteAsText={state.pasteAsText}
              foreColor={state.foreColor}
              features={features}
              onSaveRange={saveRange}
              exec={execWithForeColor}
              onToggleKitchenSink={toggleKitchenSink}
              onToggleFullscreen={toggleFullscreen}
              onTogglePasteAsText={togglePasteAsText}
              editorRef={editorRef}
              showLinkChecker={!!plugins.linkChecker}
            />

            {/* Table context bar — visible when cursor is inside a table */}
            {plugins.tables && (
              <div style={{ position: 'relative' }}>
                <TableContextBar editorRef={editorRef} />
              </div>
            )}

            <VisualEditor
              editorRef={editorRef}
              initialValue={htmlValue}
              placeholder={placeholder}
              height={height}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={handleFocus}
            />

            <StatusBar
              wordCount={state.wordCount}
              charCount={state.charCount}
              pathElements={state.pathElements}
              onHistory={plugins.history ? () => setShowHistory(true) : undefined}
            />
            {plugins.spellChecker && (
              <div style={{ padding: '4px 8px', background: '#f8fafc', borderTop: '1px solid #eee' }}>
                <SpellCheckButton
                  onCheck={triggerSpell}
                  lang={spellLang}
                  onLangChange={setSpellLang}
                />
              </div>
            )}
          </>
        ) : (
          <TextEditor
            value={htmlValue}
            onChange={(html) => { setHtmlValue(html); handleChange(html); }}
            height={height}
          />
        )}
      </div>

      {/* Hidden input for native form / FormData / server actions integration */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={outputFormat === 'markdown' ? htmlToMarkdown(htmlValue) : htmlValue}
          readOnly
        />
      )}

      {/* ── Watermark ─────────────────────────────────────────────────────── */}
      <div className="mce-watermark">
        <a href="https://mandooeditor.markrahimi.com" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          <svg width="12" height="12" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ opacity: .6, flexShrink: 0 }}>
            <rect width="200" height="200" rx="44" fill="#13103A"/>
            <polyline points="30,75 56,100 30,125" fill="none" stroke="#7C3AED" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="78,132 78,68 118,100 158,68 158,132" fill="none" stroke="#C4B5FD" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="mce-watermark-name">MandooEditor</span>
        </a>
        <span className="mce-watermark-tagline">Advanced Rich Text Editor</span>
      </div>

      {/* ── Plugin modals ──────────────────────────────────────────────────── */}
      {showTableModal && (
        <TableInsertModal
          onInsert={(rows, cols, header) => {
            restoreRange();
            insertTable(rows, cols, header);
            handleChange(editorRef.current?.innerHTML || '');
            setShowTableModal(false);
          }}
          onClose={() => setShowTableModal(false)}
        />
      )}

      {showHistory && plugins.history && (
        <HistoryPanel
          snapshots={history.snapshots()}
          onRestore={(html) => {
            setHtmlValue(html);
            if (editorRef.current) editorRef.current.innerHTML = html;
            handleChange(html);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showYoutubeModal && plugins.youtube && (
        <YoutubeModal
          onInsert={(html) => {
            restoreRange();
            document.execCommand('insertHTML', false, html);
            handleChange(editorRef.current?.innerHTML || '');
            setShowYoutubeModal(false);
          }}
          onClose={() => setShowYoutubeModal(false)}
        />
      )}
    </div>
  );
});

export default MandooEditor;
