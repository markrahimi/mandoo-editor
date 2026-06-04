# MandooEditor

<p align="center">
  <a href="https://mandooeditor.markrahimi.com">
    <img src="./logo.svg" width="80" alt="MandooEditor logo" />
  </a>
</p>

<p align="center">
  <strong>A modern, lightweight WYSIWYG rich text editor for React & Next.js</strong><br/>
  Feature-flagged · Fully typed · Zero runtime dependencies · &lt;300KB
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

###rops

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
| `height`       | `number`                  | `400`                       | Min height of editor content area (px)   |
| `className`    | `string`                  | —                           | Extra CSS class on root element          |
| `apiToken`     | `string`                  | —                           | Token for future paid pro features       |

###mperative Handle (ref)

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

Full list of flags: `bold`, `italic`, `strikethrough`, `lists`, `blockquote`, `hr`, `align`, `link`, `fullscreen`, `kitchenSink`, `underline`, `justify`, `foreColor`, `pasteAsText`, `removeFormat`, `charMap`, `indent`, `undo`, `help`, `media`, `subscript`, `superscript`

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

###inIO / S3 Server Route (Next.js App Router)

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
