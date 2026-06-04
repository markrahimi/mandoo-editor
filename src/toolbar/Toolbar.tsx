'use client';

import React, { useState, useCallback } from 'react';
import ToolbarButton from './ToolbarButton';
import FormatSelect from './FormatSelect';
import ColorPicker from './ColorPicker';
import LinkModal from './LinkModal';
import CharMapModal from './CharMapModal';
import {
  IconBold, IconItalic, IconUnderline, IconStrikethrough,
  IconBulList, IconNumList, IconBlockquote, IconHR,
  IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustify,
  IconLinkReal, IconUnlink,
  IconKitchenSink, IconFullscreen, IconFullscreenExit,
  IconPasteText, IconRemoveFormat, IconCharMap,
  IconOutdent, IconIndent, IconUndo, IconRedo,
  IconHelp, IconForeColor, IconSubscript, IconSuperscript,
} from '../icons';
import { BlockFormat, ExecCommands, Features } from '../types';

interface ToolbarProps {
  activeFormats: Set<string>;
  currentBlock: string;
  isFullscreen: boolean;
  showKitchenSink: boolean;
  pasteAsText: boolean;
  foreColor: string;
  features: Required<Features>;
  onSaveRange: () => void;
  exec: ExecCommands;
  onToggleKitchenSink: () => void;
  onToggleFullscreen: () => void;
  onTogglePasteAsText: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  /** Pass true when the linkChecker plugin is active */
  showLinkChecker?: boolean;
}

export default function Toolbar({
  activeFormats,
  currentBlock,
  isFullscreen,
  showKitchenSink,
  pasteAsText,
  foreColor,
  features,
  onSaveRange,
  exec,
  onToggleKitchenSink,
  onToggleFullscreen,
  onTogglePasteAsText,
  editorRef,
  showLinkChecker = false,
}: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showCharMap, setShowCharMap] = useState(false);

  const saveOnly = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onSaveRange();
  }, [onSaveRange]);

  const getSelectedText = () => {
    if (!editorRef.current) return '';
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return '';
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return '';
    return sel.toString();
  };

  const Sep = () => <div className="mce-sep" aria-hidden="true" />;

  // Whether row 1 has any separator-requiring groups
  const hasRow1 = features.bold || features.italic || features.strikethrough ||
    features.lists || features.blockquote || features.hr || features.align ||
    features.link || features.fullscreen || features.kitchenSink;

  // Whether row 2 should render (always visible when showKitchenSink is true)
  const hasRow2 = features.kitchenSink;

  return (
    <div className="mce-toolbars">
      {/* Row 1 */}
      {hasRow1 && (
        <div className="mce-toolbar mce-toolbar-1" role="toolbar" aria-label="Editor toolbar row 1">
          {features.bold && (
            <ToolbarButton
              title="Bold (Ctrl+B)"
              active={activeFormats.has('bold')}
              onMouseDown={saveOnly}
              onClick={exec.bold}
            >
              <IconBold />
            </ToolbarButton>
          )}
          {features.italic && (
            <ToolbarButton
              title="Italic (Ctrl+I)"
              active={activeFormats.has('italic')}
              onMouseDown={saveOnly}
              onClick={exec.italic}
            >
              <IconItalic />
            </ToolbarButton>
          )}
          {features.strikethrough && (
            <ToolbarButton
              title="Strikethrough"
              active={activeFormats.has('strikethrough')}
              onMouseDown={saveOnly}
              onClick={exec.strikethrough}
            >
              <IconStrikethrough />
            </ToolbarButton>
          )}

          {(features.bold || features.italic || features.strikethrough) && features.lists && <Sep />}

          {features.lists && (
            <>
              <ToolbarButton
                title="Bulleted List"
                active={activeFormats.has('bullist')}
                onMouseDown={saveOnly}
                onClick={exec.bullist}
              >
                <IconBulList />
              </ToolbarButton>
              <ToolbarButton
                title="Numbered List"
                active={activeFormats.has('numlist')}
                onMouseDown={saveOnly}
                onClick={exec.numlist}
              >
                <IconNumList />
              </ToolbarButton>
            </>
          )}

          {features.lists && (features.blockquote || features.hr) && <Sep />}

          {features.blockquote && (
            <ToolbarButton
              title="Blockquote"
              active={currentBlock === 'blockquote'}
              onMouseDown={saveOnly}
              onClick={exec.blockquote}
            >
              <IconBlockquote />
            </ToolbarButton>
          )}
          {features.hr && (
            <ToolbarButton
              title="Horizontal Line"
              onMouseDown={saveOnly}
              onClick={exec.hr}
            >
              <IconHR />
            </ToolbarButton>
          )}

          {(features.blockquote || features.hr) && features.align && <Sep />}

          {features.align && (
            <>
              <ToolbarButton
                title="Align Left"
                active={activeFormats.has('alignleft')}
                onMouseDown={saveOnly}
                onClick={exec.alignLeft}
              >
                <IconAlignLeft />
              </ToolbarButton>
              <ToolbarButton
                title="Align Center"
                active={activeFormats.has('aligncenter')}
                onMouseDown={saveOnly}
                onClick={exec.alignCenter}
              >
                <IconAlignCenter />
              </ToolbarButton>
              <ToolbarButton
                title="Align Right"
                active={activeFormats.has('alignright')}
                onMouseDown={saveOnly}
                onClick={exec.alignRight}
              >
                <IconAlignRight />
              </ToolbarButton>
            </>
          )}

          {features.align && features.link && <Sep />}

          {features.link && (
            <>
              <ToolbarButton
                title="Insert/Edit Link"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSaveRange();
                  setShowLinkModal(true);
                }}
                onClick={() => setShowLinkModal(true)}
              >
                <IconLinkReal />
              </ToolbarButton>
              <ToolbarButton
                title="Remove Link"
                onMouseDown={saveOnly}
                onClick={exec.unlink}
              >
                <IconUnlink />
              </ToolbarButton>
            </>
          )}

          {features.link && (features.fullscreen || features.kitchenSink) && <Sep />}

          {features.fullscreen && (
            <ToolbarButton
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              active={isFullscreen}
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <IconFullscreenExit /> : <IconFullscreen />}
            </ToolbarButton>
          )}

          {features.kitchenSink && (
            <ToolbarButton
              title={showKitchenSink ? 'Hide Kitchen Sink' : 'Show Kitchen Sink (Toggle toolbar row 2)'}
              active={showKitchenSink}
              onClick={onToggleKitchenSink}
            >
              <IconKitchenSink />
            </ToolbarButton>
          )}
        </div>
      )}

      {/* Row 2 — Kitchen Sink */}
      {hasRow2 && showKitchenSink && (
        <div className="mce-toolbar mce-toolbar-2" role="toolbar" aria-label="Editor toolbar row 2">
          <FormatSelect
            value={currentBlock}
            onChange={exec.formatBlock}
            onMouseDown={(e) => { e.preventDefault(); onSaveRange(); }}
          />

          {(features.underline || features.justify) && <Sep />}

          {features.underline && (
            <ToolbarButton
              title="Underline (Ctrl+U)"
              active={activeFormats.has('underline')}
              onMouseDown={saveOnly}
              onClick={exec.underline}
            >
              <IconUnderline />
            </ToolbarButton>
          )}
          {features.justify && (
            <ToolbarButton
              title="Justify"
              active={activeFormats.has('alignjustify')}
              onMouseDown={saveOnly}
              onClick={exec.alignJustify}
            >
              <IconAlignJustify />
            </ToolbarButton>
          )}

          {features.foreColor && <Sep />}

          {features.foreColor && (
            <div className="mce-colorpicker-wrap">
              <ToolbarButton
                title="Text Color"
                active={showColorPicker}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSaveRange();
                  setShowColorPicker((v) => !v);
                }}
                onClick={() => {}}
              >
                <IconForeColor size={16} color={foreColor} />
              </ToolbarButton>
              {showColorPicker && (
                <ColorPicker
                  current={foreColor}
                  onSelect={exec.foreColor}
                  onClose={() => setShowColorPicker(false)}
                />
              )}
            </div>
          )}

          {(features.subscript || features.superscript) && <Sep />}

          {features.subscript && (
            <ToolbarButton
              title="Subscript"
              active={activeFormats.has('subscript')}
              onMouseDown={saveOnly}
              onClick={exec.subscript}
            >
              <IconSubscript />
            </ToolbarButton>
          )}
          {features.superscript && (
            <ToolbarButton
              title="Superscript"
              active={activeFormats.has('superscript')}
              onMouseDown={saveOnly}
              onClick={exec.superscript}
            >
              <IconSuperscript />
            </ToolbarButton>
          )}

          {(features.pasteAsText || features.removeFormat) && <Sep />}

          {features.pasteAsText && (
            <ToolbarButton
              title="Paste as Plain Text"
              active={pasteAsText}
              onClick={onTogglePasteAsText}
            >
              <IconPasteText />
            </ToolbarButton>
          )}
          {features.removeFormat && (
            <ToolbarButton
              title="Remove Formatting"
              onMouseDown={saveOnly}
              onClick={exec.removeFormat}
            >
              <IconRemoveFormat />
            </ToolbarButton>
          )}

          {features.charMap && <Sep />}

          {features.charMap && (
            <ToolbarButton
              title="Special Characters"
              onClick={() => setShowCharMap(true)}
            >
              <IconCharMap />
            </ToolbarButton>
          )}

          {features.indent && <Sep />}

          {features.indent && (
            <>
              <ToolbarButton
                title="Decrease Indent"
                onMouseDown={saveOnly}
                onClick={exec.outdent}
              >
                <IconOutdent />
              </ToolbarButton>
              <ToolbarButton
                title="Increase Indent"
                onMouseDown={saveOnly}
                onClick={exec.indent}
              >
                <IconIndent />
              </ToolbarButton>
            </>
          )}

          {features.undo && <Sep />}

          {features.undo && (
            <>
              <ToolbarButton
                title="Undo (Ctrl+Z)"
                onMouseDown={saveOnly}
                onClick={exec.undo}
              >
                <IconUndo />
              </ToolbarButton>
              <ToolbarButton
                title="Redo (Ctrl+Y)"
                onMouseDown={saveOnly}
                onClick={exec.redo}
              >
                <IconRedo />
              </ToolbarButton>
            </>
          )}

          {features.help && <Sep />}

          {features.help && (
            <ToolbarButton
              title="Help — keyboard shortcuts"
              onClick={() => {
                alert(
                  'Keyboard Shortcuts:\n\n' +
                  'Ctrl+B — Bold\n' +
                  'Ctrl+I — Italic\n' +
                  'Ctrl+U — Underline\n' +
                  'Ctrl+Z — Undo\n' +
                  'Ctrl+Y / Ctrl+Shift+Z — Redo\n' +
                  'Ctrl+K — Insert Link'
                );
              }}
            >
              <IconHelp />
            </ToolbarButton>
          )}
        </div>
      )}

      {/* Modals */}
      {showLinkModal && (
        <LinkModal
          selectedText={getSelectedText()}
          showChecker={showLinkChecker}
          onConfirm={(url, text, newTab) => {
            exec.link(url, text, newTab);
            setShowLinkModal(false);
          }}
          onClose={() => setShowLinkModal(false)}
        />
      )}
      {showCharMap && (
        <CharMapModal
          onSelect={exec.insertChar}
          onClose={() => setShowCharMap(false)}
        />
      )}
    </div>
  );
}
