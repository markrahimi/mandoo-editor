# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
