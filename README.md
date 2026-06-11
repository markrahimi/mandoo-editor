# MandooEditor

<p align="center">
  <a href="https://mandooeditor.markrahimi.com">
    <img src="./logo.svg" width="80" alt="MandooEditor logo" />
  </a>
</p>

<p align="center">
  <strong>A modern, lightweight WYSIWYG rich text editor for React & Next.js</strong><br/>
  Feature-flagged · Fully typed · Zero runtime dependencies · &lt;400KB
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/mandoo-editor"><img src="https://img.shields.io/npm/v/mandoo-editor?color=6366f1&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/mandoo-editor"><img src="https://img.shields.io/npm/dm/mandoo-editor?color=0ea5e9" alt="downloads" /></a>
  <img src="https://img.shields.io/badge/TypeScript-100%25-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18%2B-0ea5e9" alt="React" />
  <img src="https://img.shields.io/badge/Next.js-15%2B-000" alt="Next.js" />
  <img src="https://img.shields.io/badge/license-MIT-22c55e" alt="license" />
</p>

---

## Features

| Feature              | Description                                                                       |
| -------------------- | --------------------------------------------------------------------------------- |
| **Visual editor**    | `contenteditable` WYSIWYG — no iframe, no Flash                                   |
| **Block mode**       | Drag-and-drop block editor with per-block type selector                           |
| **Text / HTML mode** | Raw HTML editing with syntax highlighting                                         |
| **HTML & Markdown**  | `onChange` fires in whichever format you choose                                   |
| **Feature flags**    | Enable or disable every toolbar button individually                               |
| **Media upload**     | Wire any S3 / MinIO / custom API — just pass callbacks                            |
| **Plugins**          | Link checker, tables, image editor, history, YouTube embed, subscript/superscript |
| **Fully typed**      | End-to-end TypeScript with imperative ref handle                                  |
| **Zero deps**        | No runtime dependencies beyond React                                              |

---

## Installation

```bash
npm install mandoo-editor
# or
yarn add mandoo-editor
# or
pnpm add mandoo-editor
```

> **⚠️ Required — add this import wherever you use the editor:**

```tsx
import 'mandoo-editor/styles';
```

Add it in your layout, page, or component — wherever `MandooEditor` is rendered. Without it the editor has no styling.

---

## Quick Start

```tsx
"use client";

import MandooEditor from "mandoo-editor";

export default function MyPage() {
  return (
    <MandooEditor
      defaultValue="<p>Start writing...</p>"
      onChange={(html) => console.log(html)}
      height={400}
    />
  );
}
```

---

## API Reference

### Props

| Prop           | Type                      | Default                     | Description                              |
| -------------- | ------------------------- | --------------------------- | ---------------------------------------- |
| `value`        | `string`                  | —                           | Controlled HTML value                    |
| `defaultValue` | `string`                  | `''`                        | Uncontrolled initial HTML value          |
| `onChange`     | `(value: string) => void` | —                           | Fires on every change with current value |
| `outputFormat` | `'html' \| 'markdown'`    | `'html'`                    | Format for `onChange` and `getValue()`   |
| `placeholder`  | `string`                  | `'Start writing…'`          | Placeholder shown when empty             |
| `tabs`         | `TabId[]`                 | `['visual','text','block']` | Which tabs to display                    |
| `defaultTab`   | `TabId`                   | `'visual'`                  | Initially active tab                     |
| `features`     | `Features`                | all enabled                 | Granular toolbar feature flags           |
| `plugins`      | `Plugins`                 | none                        | Optional plugin flags                    |
| `media`        | `MediaConfig`             | —                           | File upload / library config             |
| `theme`        | `'classic' \| 'modern'`   | `'classic'`                 | Visual theme                             |
| `colorScheme`  | `'light' \| 'dark'`       | `'light'`                   | Color scheme                             |
| `defaultDir`   | `'rtl' \| 'ltr'`          | —                           | Default text direction for the editor    |
| `height`       | `number`                  | `400`                       | Min height of editor content area (px)   |
| `className`    | `string`                  | —                           | Extra CSS class on root element          |
| `apiToken`     | `string`                  | —                           | Token for future paid pro features       |

### Imperative Handle (ref)

```tsx
import { useRef } from "react";
import MandooEditor, { MandooEditorHandle } from "mandoo-editor";

const ref = useRef<MandooEditorHandle>(null);

// Methods:
ref.current?.getValue(); // → string (respects outputFormat)
ref.current?.getHTML(); // → raw HTML string
ref.current?.getMarkdown(); // → Markdown string
ref.current?.setValue(html); // set content programmatically
ref.current?.focus(); // focus the editor
ref.current?.clear(); // clear content
```

---

## Form Integration

MandooEditor outputs HTML or Markdown. There are two ways to use it in a form:

### Option 1 — `name` prop (native forms, FormData, Server Actions)

Add a `name` prop and a hidden `<input>` is automatically rendered. Works with any form library or native HTML form submission.

```tsx
// Native HTML form
<form action="/api/save" method="POST">
  <MandooEditor name="content" outputFormat="html" />
  <button type="submit">Save</button>
</form>

// Next.js Server Action
async function save(formData: FormData) {
  'use server';
  const content = formData.get('content'); // ← HTML or Markdown
}

<form action={save}>
  <MandooEditor name="content" outputFormat="markdown" />
  <button type="submit">Save</button>
</form>
```

### Option 2 — `onChange` (controlled state, react-hook-form, Zustand…)

```tsx
// useState
const [content, setContent] = useState('');
<MandooEditor onChange={setContent} outputFormat="html" />

// react-hook-form
const { setValue } = useForm();
<MandooEditor onChange={(v) => setValue('content', v)} outputFormat="markdown" />

// Zustand / Redux
<MandooEditor onChange={(v) => dispatch(setContent(v))} />
```

---

## Feature Flags

Disable any toolbar button by setting its flag to `false`:

```tsx
<MandooEditor
  features={{
    // Disable specific buttons
    strikethrough: false,
    align: false,
    charMap: false,
    help: false,
    // All others remain enabled
  }}
/>
```

Full list of flags: `bold`, `italic`, `strikethrough`, `lists`, `blockquote`, `hr`, `align`, `link`, `code`, `direction`, `fullscreen`, `kitchenSink`, `underline`, `justify`, `foreColor`, `pasteAsText`, `removeFormat`, `charMap`, `indent`, `undo`, `help`, `media`, `subscript`, `superscript`

---

## Code Formatting

The `code` feature adds a **Code** button to the toolbar. It has two modes depending on the selection:

| Context | Result |
|---|---|
| Text selected | Wraps in inline `<code>` |
| No selection / cursor in a block | Converts block to `<pre>` (code block) |
| Click again inside `<code>` or `<pre>` | Removes the formatting |

Both `<code>` and `<pre>` share the same visual style — monospace font, subtle background from `--me-textarea-bg`, and a matching border — so inline and block code look like a family.

```tsx
// Disable the code button
<MandooEditor features={{ code: false }} />
```

---

## RTL / LTR Direction

The `direction` feature adds **RTL** and **LTR** toggle buttons to the toolbar. Direction is applied per block — each paragraph or heading can have its own direction independently.

| Action | Result |
|---|---|
| Click RTL | Sets `dir="rtl" style="direction:rtl; text-align:right"` on the current block |
| Click LTR | Sets `dir="ltr" style="direction:ltr; text-align:left"` on the current block |
| Click the active button again | Removes direction from the block (toggle off) |

One button is always highlighted: the active block's direction, or `defaultDir` if set, or LTR by default.

```tsx
// RTL-first editor (e.g. Persian / Arabic content)
<MandooEditor defaultDir="rtl" />

// Disable the direction buttons entirely
<MandooEditor features={{ direction: false }} />
```

Direction is stored inline in the HTML output so it renders correctly anywhere, without requiring the editor's stylesheet:

```html
<p dir="rtl" style="direction: rtl; text-align: right;">متن فارسی</p>
<p dir="ltr" style="direction: ltr; text-align: left;">English paragraph</p>
```

---

## Plugins

```tsx
<MandooEditor
  plugins={{
    linkChecker: true, // Validate URLs when inserting links
    spellChecker: true, // Browser-native spell check
    tables: true, // Insert & edit tables
    imageEditor: true, // Crop/resize images before upload
    history: true, // Edit history with restore
    youtube: true, // Embed YouTube videos by URL
  }}
/>
```

---

## Media Upload

Wire any storage backend — S3, MinIO, Cloudflare R2, or your own API:

```tsx
<MandooEditor
  media={{
    accept: "image/*,video/*",
    maxSize: 10 * 1024 * 1024, // 10 MB

    async onUpload(file) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      return res.json(); // { url: string, name?: string, alt?: string }
    },

    async onListFiles() {
      const res = await fetch("/api/media");
      return res.json(); // MediaFile[]
    },
  }}
/>
```

### MinIO / S3 Server Route (Next.js App Router)

```ts
// app/api/upload/route.ts
import { Client } from "minio"; // npm install minio
import { NextRequest, NextResponse } from "next/server";

const minio = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  const buf = Buffer.from(await file.arrayBuffer());
  const name = `uploads/${Date.now()}-${file.name}`;
  await minio.putObject(process.env.MINIO_BUCKET!, name, buf, buf.length, {
    "Content-Type": file.type,
  });
  const url = await minio.presignedGetObject(
    process.env.MINIO_BUCKET!,
    name,
    604800
  );
  return NextResponse.json({ url, name: file.name });
}
```

---

## Output Formats

```tsx
// HTML output (default)
<MandooEditor
  outputFormat="html"
  onChange={(html) => {
    // "<p>Hello <strong>world</strong></p>"
    console.log(html);
  }}
/>

// Markdown output
<MandooEditor
  outputFormat="markdown"
  onChange={(md) => {
    // "Hello **world**"
    console.log(md);
  }}
/>
```

---

## Tabs Configuration

```tsx
// Only show Visual and Text tabs (no Block editor)
<MandooEditor tabs={['visual', 'text']} />

// Start on Block tab
<MandooEditor defaultTab="block" />

// Only Block editor
<MandooEditor tabs={['block']} />
```

---

## Theming

### Built-in themes

MandooEditor ships with two visual themes and two color schemes — mix and match any combination:

```tsx
// Classic theme (default) — dense toolbar, serif content font
<MandooEditor theme="classic" colorScheme="light" />

// Classic dark
<MandooEditor theme="classic" colorScheme="dark" />

// Modern theme — minimal toolbar, rounded corners, sans-serif content font
<MandooEditor theme="modern" colorScheme="light" />

// Modern dark
<MandooEditor theme="modern" colorScheme="dark" />
```

### CSS customization

Every color, radius, and font in MandooEditor is driven by CSS custom properties set on the root container. You can override any of them from your own CSS:

```css
/* globals.css or any stylesheet loaded after mandoo-editor/styles */
.mandoo-editor-container {
  --me-accent: #e11d48;            /* links, active buttons, focus rings */
  --me-container-radius: 4px;      /* outer border radius */
  --me-content-font: 'Vazirmatn', sans-serif; /* content area font */
}
```

You can also scope overrides to a specific theme or color scheme:

```css
/* Only affect the modern theme */
.mandoo-editor-container[data-mandoo-theme="modern"] {
  --me-accent: #7c3aed;
  --me-toolbar-bg: #fafafa;
}

/* Only affect dark mode */
.mandoo-editor-container[data-mandoo-scheme="dark"] {
  --me-bg: #18181b;
  --me-border: #27272a;
}
```

### Full list of CSS variables

| Variable | Controls | Classic light default |
|---|---|---|
| `--me-bg` | Editor & modal background | `#ffffff` |
| `--me-border` | All borders | `#dddddd` |
| `--me-color` | UI text | `#444444` |
| `--me-color-strong` | Headings, modal titles | `#23282d` |
| `--me-toolbar-bg` | Toolbar row background | `#ebebeb` |
| `--me-tools-bg` | Media/tabs bar background | `#f1f1f1` |
| `--me-btn-hover` | Button hover background | `#d5d5d5` |
| `--me-btn-active` | Active/pressed button background | `#b8b8b8` |
| `--me-btn-bg` | Inactive button background | `#f3f5f6` |
| `--me-statusbar-bg` | Status bar background | `#ebebeb` |
| `--me-textarea-bg` | HTML textarea background | `#f9f9f9` |
| `--me-modal-bg` | Modal body background | `#ffffff` |
| `--me-modal-header-bg` | Modal header background | `#f1f1f1` |
| `--me-accent` | Links, focus rings, active state | `#0073aa` |
| `--me-muted` | Placeholder, counts, labels | `#888888` |
| `--me-sep` | Toolbar separators | `#cccccc` |
| `--me-content-color` | Content area text | `#333333` |
| `--me-content-font` | Content area font family | `Georgia, serif` |
| `--me-btn-size` | Toolbar button width & height | `26px` |
| `--me-btn-radius` | Toolbar button border radius | `2px` |
| `--me-container-radius` | Outer container border radius | `0px` |

---

## Pro Features (Coming Soon)

The following features require an `apiToken` and will be available in a future paid tier:

- **Export to PDF** — one-click export via Mandoo cloud API
- **Word Import/Export** — read and write `.docx` files
- **AI Assistant** — chat with AI to rewrite, summarise, or extend content

```tsx
// Reserve your token now — setting it has no effect until pro plugins are released
<MandooEditor apiToken="mk_live_..." />
```

---

## Token Infrastructure

```ts
import { mandooFetch, validateToken } from "mandoo-editor";

// Validate a token format
const valid = validateToken("mk_live_abc123...");

// Call Mandoo API (for pro features)
const result = await mandooFetch(
  "/export/pdf",
  { method: "POST", body: fd },
  {
    token: "mk_live_...",
    baseUrl: "https://api.mandooeditor.com/v1", // optional override
  }
);
```

---

## TypeScript Types

```ts
import type {
  MandooEditorProps,
  MandooEditorHandle,
  Features,
  Plugins,
  MediaConfig,
  MediaFile,
  MediaUploadResult,
  TabId,
  OutputFormat,
  TokenConfig,
} from "mandoo-editor";
```

---

## Links

|                |                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------ |
| 🌍 **Website** | [mandooeditor.markrahimi.com](https://mandooeditor.markrahimi.com)                               |
| 📦 **npm**     | [npmjs.com/package/mandoo-editor](https://www.npmjs.com/package/mandoo-editor)                   |
| 🐙 **GitHub**  | [github.com/markrahimi/mandoo-editor](https://github.com/markrahimi/mandoo-editor)               |
| 🐛 **Issues**  | [github.com/markrahimi/mandoo-editor/issues](https://github.com/markrahimi/mandoo-editor/issues) |
| ☕ **Support** | [ko-fi.com/markrahimi](https://ko-fi.com/E1E11W0EQP)                                             |
| 👤 **Author**  | [markrahimi.com](https://markrahimi.com)                                                         |

---

## License

MIT © [Mohammad Ali Rahimi](https://markrahimi.com)
