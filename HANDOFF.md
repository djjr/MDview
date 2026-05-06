# MDview — Developer Handoff

This document gives a complete picture of the project for any new Claude session or developer picking it up. It covers what the project does, how the code works, what was changed from the original, and what the known limitations are.

---

## What this project is

MDview is a zero-server static site generator that turns a folder of Markdown files into an interconnected HTML website suitable for publishing on GitHub Pages. The design is deliberately minimal: one build script, two npm dependencies, and no framework. The output is plain HTML/CSS/JS that works anywhere.

The target use case is a personal "digital garden" or course notes site — documents that link to each other, share tags, and display mathematical notation.

---

## Repository layout

```
MDview/
├── content/               ← Your Markdown files go here (subdirectories OK)
│   ├── index.md           ← Becomes the site home page
│   └── notes/
│       ├── second-note.md
│       └── tagged-note.md
├── dist/                  ← Generated output (git-ignored; rebuilt each run)
├── src/
│   ├── styles/site.css    ← All site CSS (copied to dist/assets/ at build)
│   └── client/
│       └── hover-previews.js  ← Hover card JS (copied to dist/assets/)
├── public/
│   └── favicon.svg        ← Copied to dist/ at build
├── scripts/
│   └── build.mjs          ← The entire build pipeline (~400 lines, no magic)
├── .github/workflows/
│   └── pages.yml          ← GitHub Actions: builds and deploys on push to main
├── package.json           ← Two dependencies: marked, katex
├── MDview Build.command   ← Double-click on Mac to rebuild (opens Terminal)
└── HANDOFF.md             ← This file
```

---

## How to run

**Build:**
```bash
npm install        # first time only
npm run build
```

**Preview locally** (required for hover previews — file:// blocks fetch()):
```bash
python3 -m http.server --directory dist/ 8080
# then open http://localhost:8080
```

**Double-click shortcut:** `MDview Build.command` — opens a Terminal window and runs the build. First time only, macOS Gatekeeper requires right-click → Open to approve it.

**Deploy:** Push to `main`. The GitHub Actions workflow in `.github/workflows/pages.yml` builds and publishes `dist/` to GitHub Pages automatically. If the repo is served from a subpath (e.g. `username.github.io/MDview/`), set `MDVIEW_BASE=/MDview/` in the workflow environment — the build script handles all URL prefixing from there.

---

## Content authoring

Every `.md` file in `content/` becomes a page. Subdirectory structure becomes the URL structure: `content/notes/my-note.md` → `/notes/my-note/`.

**Frontmatter** (YAML at the top of the file):
```markdown
---
title: My Page Title
tags: [tag-one, tag-two]
---
```

Tags can also be written in YAML block list style:
```markdown
tags:
  - tag-one
  - tag-two
```

**Inline tags** are also collected: writing `#tag-name` anywhere in the body (preceded by whitespace) adds that tag automatically, in addition to frontmatter tags.

**Wikilinks** (Obsidian-style):
```markdown
[[Note Title]]              ← links by title, slug, or filename
[[Note Title|display text]] ← custom link label
```

Unresolved wikilinks render as `<span class="missing-link">` rather than crashing the build.

**LIST directive** — auto-generates a document list filtered by tags:
```
LIST tags=example,notes
LIST tags=example limit=5
```

All tags must match (AND logic, not OR). The current page is excluded automatically.

**Footnotes as sidenotes** (Tufte style — float right on wide screens, collapse inline on mobile):
```markdown
This sentence has a margin note.[^myid]

[^myid]: This text appears beside the paragraph on wide screens.
```

**Math** — inline and display, via KaTeX:
```markdown
Inline: $f(x) = y$

Display:
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

Math is rendered to static HTML at **build time** by KaTeX running in Node. No client-side JavaScript is needed for math; the browser only needs the KaTeX font CSS (loaded from CDN).

**Images** — use standard Markdown image syntax with absolute URLs:
```markdown
![Caption text](https://innoeduvation.org/images/photo.jpg)
![](https://innoeduvation.org/images/diagram.jpg)
```
Images are wrapped in `<figure>`. If alt text is present it renders as a `<figcaption>` below the image, centered. If alt text is empty, the figure renders with no caption. Relative image paths are **not** supported — images must be hosted externally (the current convention is `https://innoeduvation.org/images/`). There is no local asset copying step.

**Standard Markdown** is handled by the `marked` library (GFM mode), so ordered and unordered lists, nested lists, tables, blockquotes, fenced code blocks, bold, italic, strikethrough, and inline code all work.

---

## How the build pipeline works

The entire pipeline lives in `scripts/build.mjs`. It runs in Node and has no compile step. Here is the sequence:

1. **Walk** `content/` recursively, collecting all `.md` file paths.
2. **Parse** each file into a `doc` object: frontmatter data, body text, slug, title, tags, excerpt, and an `aliases` array (used for wikilink resolution).
3. **Sort** all docs alphabetically by title.
4. **Render** each doc to HTML using a per-document `Marked` instance with custom extensions (detail below). During rendering, each wikilink renderer records its target in `doc.outgoingLinks`.
5. **Compute backlinks**: invert the `outgoingLinks` sets — for every doc A that links to doc B, add A to B's backlinks list.
6. **Write pages**: for each doc, wrap the rendered HTML in the page template and write to `dist/<slug>/index.html`. The `index` slug also gets a copy at `dist/index.html`.
7. **Write tag pages**: for each unique tag, write a `dist/tags/<tag>/index.html` listing all tagged docs.
8. **Write `documents.json`**: a flat index of all docs (title, excerpt, tags, URL), used by the hover preview JavaScript.
9. **Copy assets**: `src/styles/site.css`, `src/client/hover-previews.js`, and `public/favicon.svg` into `dist/assets/` and `dist/`.

---

## The marked extension system

This is the heart of the build. Rather than a hand-rolled Markdown parser (which was the original Codex implementation — see History below), the build uses `marked` with five custom extensions. Each extension is an object with four methods:

- `start(src)` — scans the remaining source and returns the index of the first potential match, or `undefined` if none. This tells marked where to pause its own rules and try yours.
- `tokenizer(src)` — called with source starting at the index `start` returned. Returns a token object, or `undefined` to decline and let marked continue.
- `renderer(token)` — converts a token to an HTML string. This output is treated as raw HTML and not further parsed.
- `level` — either `'block'` or `'inline'`.

The five extensions, in the order they are declared (order matters for priority):

**`listDirective`** (block) — Matches `LIST tags=a,b` on its own line. The renderer filters `docs` at build time and emits a `<section class="generated-list">`.

**`wikilink`** (inline) — Matches `[[Target]]` and `[[Target|label]]`. Resolution goes through `resolveLink()`, which slugifies the target and checks it against each doc's `aliases` array (which includes title, relative path, and slug). Records the resolved slug in `doc.outgoingLinks` for later backlink computation.

**`displayMath`** (block) — Matches `$$...$$`. Must be declared before `inlineMath` so `$$` is consumed at the block level first. Calls `katex.renderToString(math, { displayMode: true })`.

**`inlineMath`** (inline) — Matches `$...$`. Explicitly returns `undefined` if the source starts with `$$`. Calls `katex.renderToString(math, { displayMode: false })`. The reason this extension is necessary at all is that `marked` would otherwise parse underscores and asterisks inside math as Markdown emphasis, mangling the LaTeX.

**`sidenoteRef`** (inline) — Matches `[^id]` footnote references. The footnote *definitions* (`[^id]: text`) are extracted from the body by `extractFootnotes()` before `marked` sees it, so marked never renders them as loose text. The sidenoteRef renderer looks up the definition text, increments a per-document counter, and emits a `<sup class="footnote-ref">` + `<aside class="sidenote">` pair inline — placing the note beside the text, not at the bottom of the page.

A new `Marked` instance is created per document (`buildMarkedInstance(doc, docs, footnotes)`), because the extension renderers close over `doc` (needed for outgoingLinks mutation) and `footnotes` (the Map for the current document).

In addition to the five extensions, `buildMarkedInstance` passes a **`renderer`** object to override `marked`'s built-in image rendering. The image renderer wraps every image in `<figure>/<figcaption>`: if alt text is present it becomes the caption; if absent, only `<figure><img></figure>` is emitted. This is separate from the extension system — it uses marked's `renderer` option rather than the `extensions` array.

---

## CSS and layout

`src/styles/site.css` uses CSS custom properties (variables) throughout, defined on `:root`. The palette is warm paper tones. The layout is a CSS grid: a sticky sidebar nav on the left, main content area on the right. On screens narrower than 900px, the layout collapses to a single column.

Sidenotes use `float: right` with a large negative right margin (`margin: 0.25rem -24rem 1rem 2rem; width: 18rem`). This works because the `document-layout` grid gives the article column a fixed max-width, leaving space to the right. On narrow screens the float is cancelled and sidenotes collapse inline.

Typography is Tufte-inspired: body text in Georgia/serif, UI elements in Inter/sans-serif, generous line height (1.72), and large heading sizes using `clamp()` for fluid scaling.

**Images** render inside `<figure>` elements. `article figure` is centered with `text-align: center`; `article figure img` is responsive (`max-width: 100%`, `height: auto`) with a `0.5rem` border radius; `article figcaption` is muted small text below the image.

**Collapsible nav** — the Documents and Tags sections in the sidebar are `<details>/<summary>` elements with class `nav-group`. Documents defaults to open; Tags defaults to closed. A CSS `::after` arrow on `summary` rotates 90° when open. The active page link receives class `active` (terracotta left border + bold) added at runtime by `hover-previews.js`. Open/closed state persists in `localStorage` under the key `mdview-nav`.

---

## Hover previews and nav behaviour

`src/client/hover-previews.js` is a vanilla JS module with two responsibilities:

**Hover cards** — attaches `mouseenter`/`mouseleave` listeners to every `<a data-preview-slug="...">` element. On hover it fetches `documents.json` (once, cached in a promise), looks up the hovered slug, and positions a floating `<aside class="hover-card">` near the cursor showing the document title and excerpt. Because this uses `fetch()`, it only works when served over HTTP — opening `dist/index.html` via `file://` silently skips hover functionality.

**Nav state** — on load, an IIFE reads `localStorage` key `mdview-nav` (a `{id: boolean}` map) and sets each `details.nav-group` element's `open` property accordingly. It then attaches `toggle` listeners to persist changes. Finally it compares `window.location.pathname` against every nav link and adds class `active` to the matching link, also force-opening its parent `<details>` regardless of saved state.

---

## Known limitations and areas for improvement

**Frontmatter parser is hand-rolled and limited.** It handles simple `key: value` pairs and YAML block lists (`- item`), but not multi-line string values, quoted strings containing colons, nested objects, or other YAML features. If you need complex frontmatter, replace `parseFrontmatter()` with the `js-yaml` package.

**Slugify allows some unexpected characters.** The regex `[^a-z0-9/ -]` preserves forward slash, space, and dash. Unusual filenames with characters like `(`, `)`, or `,` would survive into slugs. In practice this only matters if your file names are unusual.

**Inline math regex (`^\$([^$\n]+?)\$`) does not handle multi-line math.** Dollar-delimited inline math must be on a single line. Display math (`$$...$$`) handles multi-line content correctly.

**Local/relative image paths are not supported.** The image renderer wraps all images in `<figure>/<figcaption>` and passes `src` through as-is. Relative paths will produce broken images in `dist/` because no asset-copying step exists. The current convention is to host all images externally at `https://innoeduvation.org/images/` and use absolute URLs. If local images are needed, add an asset-scanning pass to `main()` and a copy step alongside `copyAssets()`.

**No syntax highlighting.** Fenced code blocks render with `<pre><code>` wrapping but no language-specific coloring. Adding [highlight.js](https://highlightjs.org/) or [Prism](https://prismjs.com/) would be straightforward — either as a build-time pass over rendered HTML, or as a client-side script.

**KaTeX fonts require CDN at view time.** The KaTeX math CSS is loaded from `cdn.jsdelivr.net`. The math HTML structure itself is fully static (rendered at build time), but the font files that make it look correct come from the CDN. For a fully offline setup, copy the KaTeX `fonts/` directory into `dist/assets/` and serve the CSS locally instead.

**The `wikilink` and `sidenoteRef` `start()` functions return `indexOf()` directly**, which returns `-1` when not found. Marked treats `-1` as position -1 (last character), causing the tokenizer to be called unnecessarily on the final character before returning `undefined`. This is harmless but slightly inefficient — fixing it is a matter of returning `undefined` when `indexOf` returns `-1`.

---

## History — what was changed from the original Codex code

The project was scaffolded by Codex (OpenAI). The following changes were made in a subsequent Claude Cowork session:

**Replaced the hand-rolled Markdown parser.** The original `renderMarkdown` function was a ~120-line line-by-line parser loop. It had no support for ordered lists, nested lists, images, tables, or strikethrough, and had a fragile inline renderer that processed bold/italic/wikilinks by regex-on-already-escaped-HTML in a fixed order, causing breakage on combinations like bold wrapping a wikilink. This was entirely replaced with `marked` (GFM mode) plus the five custom extensions described above. The external API of `renderMarkdown(doc, docs)` is unchanged.

**Added `marked` and `katex` as dependencies.** `package.json` previously had no `dependencies` field. `marked@^14` and `katex@^0.16` were added.

**Added math support.** The original had no math. MathJax was initially added as a client-side renderer but was replaced with KaTeX (server-side, build-time) after MathJax produced garbled output in certain contexts. KaTeX renders LaTeX to static HTML during `npm run build`; no browser-side script is needed.

**Fixed `stripMarkdown` for excerpt generation.** The original function used `'$2$1'` in the wikilink replacement (concatenating both target and label when a label was present), and stripped brackets/parens individually as regex metacharacters (which turned `[link](url)` into `linkurl`). Fixed to use a replacement function that returns label if present or target otherwise, and a proper link-stripping regex.

**Added `MDview Build.command`.** A double-clickable Mac shell script that opens Terminal and runs the build.

---

## Session 2 changes (Claude Code, May 2026)

**Added image support.** `buildMarkedInstance` now passes a custom `renderer.image` to marked. Images render as `<figure><img><figcaption></figure>` — caption present when alt text is non-empty, omitted otherwise. Both `article figure` and `article figcaption` CSS rules were added. Only absolute URLs are supported; the intended convention is `https://innoeduvation.org/images/`.

**Collapsible sidebar nav.** `nav()` in `build.mjs` was changed from `<section>/<h2>` to `<details>/<summary>` elements with class `nav-group`. Documents defaults open, Tags defaults closed. A CSS `::after` triangle rotates on open. `hover-previews.js` gained a nav-state IIFE that restores localStorage, persists toggles, and marks the active page link.

---

## Possible next features

- **Search** — `documents.json` already exists with titles and excerpts; a client-side search UI using it would be straightforward.
- **Syntax highlighting** — add highlight.js as either a build-time HTML post-processor or a lazy-loaded client script.
- **RSS feed** — generate a `dist/feed.xml` in `main()` by iterating `resolvedDocs`.
- **Custom page templates** — allow per-document or per-folder layout overrides via a frontmatter `template` key.
- **Watch mode** — `npm run watch` using Node's `fs.watch` to rebuild on content changes, paired with a live-reload server.
- **Local image asset copying** — scan rendered HTML for `<img src>` attributes pointing to relative paths and copy those files into `dist/assets/`.
