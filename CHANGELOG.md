# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-06-11

### Added
- **Code formatting** — new `code` feature flag and toolbar button with two modes:
  - Text selected → wraps in inline `<code>`
  - No selection / cursor in a block → converts to `<pre>` code block
  - Clicking again inside `<code>` or `<pre>` removes the formatting (toggle)
  - Both `<code>` and `<pre>` share the same visual style (monospace font, subtle background, accent border-left)
- **RTL / LTR direction** — new `direction` feature flag adds two toolbar buttons:
  - Sets `dir` attribute and matching inline `style` (`direction` + `text-align`) directly on the current block element
  - Per-block direction — each paragraph or heading can have its own direction
  - Toggle behavior — clicking the active direction button removes the direction
  - One button is always highlighted: current block dir → `defaultDir` → `'ltr'`
  - Direction is written as inline style so output renders correctly without the editor stylesheet
- **`defaultDir` prop** — sets the default text direction (`'rtl'` | `'ltr'`) for the entire editor content area; useful for Persian / Arabic editors
- New SVG icons: `IconDirectionRTL`, `IconDirectionLTR`, `IconCode`

### Fixed
- Typing after clearing the editor produced bare text nodes not wrapped in `<p>` — `handleFocus` now inserts a `<p><br></p>` and positions the cursor inside when the editor is empty; `handleInput` also catches any remaining bare text nodes and wraps them
- Direction buttons previously used a `<div>` wrapper approach which broke block detection when no saved range was present; rewritten to set `dir` directly on the block element and handle missing selection gracefully

## [1.1.0] - 2026-06-08

### Added
- **Theme system** — new `theme` prop (`'classic'` | `'modern'`) and `colorScheme` prop (`'light'` | `'dark'`) with full CSS variable support
- **Dark mode** — all editor surfaces (toolbar, content area, modals, block editor, watermark footer) now respond to `colorScheme="dark"`
- **Modern theme** — dramatically distinct visual style: seamless white/zinc surfaces, pill-shaped tabs, larger hit targets, elevated modals
- `getThemeVars()` utility exported from `constants` for building custom theme maps
- `Theme` and `ColorScheme` types exported from the package root

### Fixed
- Strikethrough toolbar icon appeared black in dark mode — SVG now uses `fill="currentColor"`
- Block editor outer wrapper and footer kept a hardcoded white background in dark mode — now inherits `var(--me-bg)`
- Watermark footer used hardcoded hex colors — replaced with themed CSS variables (`var(--me-statusbar-bg)`, `var(--me-muted)`, `var(--me-sep)`)
- Pressing Enter in the visual editor created `<div>` elements instead of `<p>` — fixed by calling `defaultParagraphSeparator` on mount
- Table deletion: removing the last row or column now removes the entire `<table>` element instead of leaving an empty structure
- Text editor (`html` tab) horizontal scroll — content now wraps within the editor bounds (`white-space: pre-wrap`, `word-break: break-word`)
- Text editor styles were loaded via CSS Modules (hashed class names) — switched to plain class names so styles apply correctly in the published package

### Chore
- `package.json` `./styles` export now includes a `types` field — resolves `ts(2882)` for side-effect import of `mandoo-editor/styles`

## [1.0.1] - 2026-06-04
### Fixed
- Resolve CSS class names for npm consumers ([#2](https://github.com/markrahimi/mandoo-editor/pull/2))

### Chore
- Update Node.js version to 24 in CI workflow

## [1.0.0] - 2026-06-04
### Added
- Initial release
