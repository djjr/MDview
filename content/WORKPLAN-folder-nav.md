# Workplan: Folder-Based Navigation, Breadcrumbs, and Hierarchical Sidebar

## Context

This document is a complete implementation spec for adding folder-aware navigation to MDview. It is written to be handed off to a fresh Claude Code session with no prior context. Read `HANDOFF.md` first to understand the overall architecture, then implement the three features below in order.

**Three features, in implementation order:**

1. **Fix index.md slug generation** (prerequisite, ~5 lines)
2. **Auto-generated folder index pages** (~60 lines new code in `build.mjs`)
3. **Breadcrumbs in page header** (~25 lines new code in `build.mjs` + CSS)
4. **Hierarchical sidebar nav** (~60 lines replacing `nav()` in `build.mjs` + CSS + JS)

Each feature is independently testable. Do them in order — each one builds on the previous.

---

## Design Decisions (already made, do not re-litigate)

- **Folder index pages are auto-generated** as virtual docs when no `index.md` exists for that folder. If an authored `index.md` exists, it takes precedence and is used as-is.
- **Tags section is preserved** in the sidebar as a separate second-axis navigation. It stays at the bottom of the sidebar, below the document tree.
- **Breadcrumbs replace the raw `doc.rel` path** in the `doc-meta` area at the top of each article. Tags pills remain below as before.
- **Auto-index pages** show: (a) direct child documents, (b) direct subfolders, each linking to their own index. They do NOT show deep descendants.

---

## Feature 1: Fix `index.md` Slug Generation

**File:** `scripts/build.mjs`

**Problem:** Currently `content/notes/index.md` produces slug `notes/index` (URL `/notes/index/`). We want it to produce slug `notes` (URL `/notes/`), so authored index files and auto-generated folder indexes live at the same clean URL.

**Two small changes:**

### 1a. Add trailing-slash strip to `slugify()`

The current `slugify` function (line ~26) strips `.md`, lowercases, collapses hyphens, but does not strip trailing slashes. Add one line at the end:

```javascript
function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\.md$/i, '')
    .replace(/[^a-z0-9/ -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+$/, '');   // ← ADD THIS LINE
}
```

### 1b. Change `makeDoc` slug line

Current (line ~107):
```javascript
const slug = slugify(rel.replace(/(^|\/)index\.md$/i, '$1index')) || 'index';
```

Replace with:
```javascript
const slug = slugify(rel.replace(/\/?index\.md$/i, '')) || 'index';
```

**How this works:**
- `index.md` → `''` → slugify → `''` → fallback `|| 'index'` → `'index'` (root, unchanged)
- `notes/index.md` → `notes` → slugify → `'notes'` ✓
- `notes/ai/index.md` → `notes/ai` → slugify → `'notes/ai'` ✓
- `notes/Linear Probe.md` → `notes/Linear Probe` → slugify → `'notes/linear-probe'` (unchanged)

**Test:** Run `npm run build` and verify `/notes/index/` no longer appears in `dist/`; if a `notes/index.md` exists it should now write to `dist/notes/index.html`.

---

## Feature 2: Auto-Generated Folder Index Pages

**File:** `scripts/build.mjs`

### New helper: `prettifyFolder()`

Add this small helper near the other utility functions:

```javascript
// Convert a folder path segment into a display title.
// e.g. 'ai-concepts' → 'Ai Concepts', 'notes' → 'Notes'
function prettifyFolder(segment) {
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
```

### New function: `buildFolderIndexDocs()`

Add this function before `main()`:

```javascript
// Given the full list of authored docs, produce virtual doc objects for every
// folder path that does not already have an authored index doc.
//
// A "folder path" is derived from each doc's rel — e.g. a doc at
// 'notes/ai/linear-probe.md' implies folders 'notes' and 'notes/ai'.
//
// Virtual docs have the same shape as authored docs so they can flow through
// the existing page-writing pipeline unchanged. They are flagged with
// isAutoIndex: true so the render loop knows to generate their content
// programmatically rather than by parsing Markdown.
function buildFolderIndexDocs(authoredDocs) {
  // Collect all unique folder paths implied by authored docs.
  const allFolderPaths = new Set();
  for (const doc of authoredDocs) {
    const parts = doc.rel.split('/');
    for (let depth = 1; depth < parts.length; depth++) {
      allFolderPaths.add(parts.slice(0, depth).join('/'));
    }
  }

  // Build a set of slugs already covered by authored docs.
  const authoredSlugs = new Set(authoredDocs.map((d) => d.slug));

  const virtual = [];
  for (const folderPath of allFolderPaths) {
    const folderSlug = slugify(folderPath);
    if (authoredSlugs.has(folderSlug)) continue; // authored index.md takes precedence

    const segments = folderPath.split('/');
    const title = prettifyFolder(segments[segments.length - 1]);

    virtual.push({
      aliases: [title, folderSlug],
      body: '',               // content generated programmatically at render time
      data: {},
      excerpt: `Contents of the ${title} folder.`,
      isDeck: false,
      isAutoIndex: true,      // flag: generate listing HTML, not rendered Markdown
      rel: `${folderPath}/`,  // trailing slash signals it's a folder, not a file
      slug: folderSlug,
      tags: [],
      title,
      outgoingLinks: new Set(),
    });
  }

  return virtual;
}
```

### New function: `renderFolderIndex()`

Add this function near `renderMarkdown`:

```javascript
// Generate HTML content for an auto-index page.
// Lists direct child documents and direct child subfolders,
// each linked to their own page.
function renderFolderIndex(doc, allDocs) {
  const folderPrefix = doc.slug + '/';

  // Direct child documents: slug starts with folderPrefix and has no further '/'
  const childDocs = allDocs.filter((d) => {
    if (d.slug === doc.slug) return false;
    if (!d.slug.startsWith(folderPrefix)) return false;
    const remainder = d.slug.slice(folderPrefix.length);
    return remainder.length > 0 && !remainder.includes('/');
  });

  // Direct child subfolders: docs whose slug IS a direct subfolder path
  // (i.e., auto-index or authored index one level deeper)
  const childFolders = allDocs.filter((d) => {
    if (d.slug === doc.slug) return false;
    if (!d.slug.startsWith(folderPrefix)) return false;
    const remainder = d.slug.slice(folderPrefix.length);
    // A direct child folder index has no '/' in the remainder and is either
    // isAutoIndex or an authored index (rel ends with '/')
    return remainder.length > 0 && !remainder.includes('/') &&
           (d.isAutoIndex || d.rel.endsWith('/'));
  });

  // Docs to show: exclude subfolder indexes from the general doc list
  // (they appear in the Subfolders section instead)
  const folderSlugs = new Set(childFolders.map((d) => d.slug));
  const plainDocs = childDocs.filter((d) => !folderSlugs.has(d.slug));

  const foldersHtml = childFolders.length
    ? `<section class="generated-list"><h2>Subfolders</h2><ul>` +
      childFolders.map((d) =>
        `<li><a href="${base}${d.slug}/" data-preview-slug="${d.slug}">📁 ${escapeHtml(d.title)}</a></li>`
      ).join('') +
      `</ul></section>`
    : '';

  const docsHtml = plainDocs.length
    ? `<section class="generated-list"><h2>Documents</h2><ul>` +
      plainDocs.map((d) =>
        `<li><a href="${base}${d.slug}/" data-preview-slug="${d.slug}">${escapeHtml(d.title)}</a></li>`
      ).join('') +
      `</ul></section>`
    : '';

  return `<h1>${escapeHtml(doc.title)}</h1>\n${foldersHtml}\n${docsHtml}`;
}
```

### Changes to `main()`

In `main()`, after building `resolvedDocs` (the sorted array of authored docs) and **before** the render loop, inject virtual folder index docs:

```javascript
// After this line:
const resolvedDocs = (await Promise.all(docs)).sort((a, b) => a.title.localeCompare(b.title));
for (const doc of resolvedDocs) doc.outgoingLinks = new Set();

// ADD: inject auto-generated folder index docs
const folderIndexDocs = buildFolderIndexDocs(resolvedDocs);
for (const doc of folderIndexDocs) doc.outgoingLinks = new Set();
const allDocs = [...resolvedDocs, ...folderIndexDocs].sort((a, b) => a.title.localeCompare(b.title));
// From here, use `allDocs` instead of `resolvedDocs` wherever all pages should be included.
```

> **Important:** After this change, replace `resolvedDocs` with `allDocs` in all downstream calls EXCEPT:
> - `buildFolderIndexDocs(resolvedDocs)` — intentionally only passes authored docs
> - The `documents.json` write — include `allDocs` so hover previews work on folder pages too

In the render loop, handle `isAutoIndex` docs:

```javascript
for (const doc of allDocs) {
  rendered.set(
    doc.slug,
    doc.isDeck      ? renderDeck(doc, allDocs) :
    doc.isAutoIndex ? renderFolderIndex(doc, allDocs) :
                      renderMarkdown(doc, allDocs)
  );
}
```

In the page-writing loop, auto-index pages go through `pageTemplate()` the same as regular docs:

```javascript
for (const doc of allDocs) {
  if (doc.isDeck) {
    // ... existing deck handling, unchanged
  } else {
    const html = pageTemplate(doc, rendered.get(doc.slug), allDocs, backlinks.get(doc.slug) || []);
    await writePage(doc.slug, html);
    if (doc.slug === 'index') await fs.writeFile(path.join(distDir, 'index.html'), html);
  }
}
```

---

## Feature 3: Breadcrumbs

**Files:** `scripts/build.mjs`, `src/styles/site.css`

### New helper: `breadcrumbsHtml()`

Add in `build.mjs` near the template functions:

```javascript
// Build breadcrumb navigation for a doc.
// Returns an empty string for root-level docs (no parent folder).
//
// For slug 'notes/ai/toy-transformer', produces:
//   Notes › AI › Toy Transformer   (where Notes and AI are links)
function breadcrumbsHtml(doc, allDocs) {
  const parts = doc.slug.split('/');
  if (parts.length <= 1) return ''; // top-level doc, no breadcrumb needed

  const crumbs = [];
  for (let i = 0; i < parts.length - 1; i++) {
    const ancestorSlug = parts.slice(0, i + 1).join('/');
    const ancestorDoc = allDocs.find((d) => d.slug === ancestorSlug);
    const label = ancestorDoc ? ancestorDoc.title : prettifyFolder(parts[i]);
    crumbs.push(
      `<a href="${base}${ancestorSlug}/">${escapeHtml(label)}</a>`
    );
  }

  const sep = `<span class="crumb-sep" aria-hidden="true">›</span>`;
  const all = [...crumbs, `<span class="crumb-current">${escapeHtml(doc.title)}</span>`];
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${all.join(` ${sep} `)}</nav>`;
}
```

### Change `pageTemplate()`

Current `pageTemplate` renders `doc.rel` as the first thing in `.doc-meta`. Replace that raw path with the breadcrumb nav:

```javascript
function pageTemplate(doc, content, allDocs, backlinks = []) {
  const tags = doc.tags.map(...).join('');
  const backlinksHtml = ...;
  const crumbs = breadcrumbsHtml(doc, allDocs);   // ← ADD
  return shell(
    `<article>` +
    `<div class="doc-meta">` +
    (crumbs || `<span class="doc-path">${escapeHtml(doc.rel)}</span>`) +  // breadcrumbs or fallback
    `<div class="tag-list">${tags}</div>` +
    `</div>` +
    `${content}${backlinksHtml}</article>`,
    allDocs,
    doc.title,
  );
}
```

The fallback (`doc.rel`) is for root-level docs like `index.md` where there is no parent to navigate up to.

### CSS additions to `src/styles/site.css`

Add after the `.doc-meta` rule:

```css
.breadcrumb {
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  font-family: Inter, sans-serif;
  font-size: 0.83rem;
  gap: 0.3rem;
  align-items: center;
  margin-bottom: 0.2rem;
}
.breadcrumb a {
  color: var(--muted);
  text-decoration: none;
}
.breadcrumb a:hover {
  color: var(--accent);
  text-decoration: underline;
}
.crumb-sep { color: var(--line); font-size: 0.75rem; }
.crumb-current { color: var(--ink); font-weight: 500; }
.doc-path { color: var(--muted); font-size: 0.83rem; }
```

---

## Feature 4: Hierarchical Sidebar Nav

**Files:** `scripts/build.mjs`, `src/styles/site.css`, `src/client/hover-previews.js`

This is the most involved feature. The existing flat `<ul>` in `nav()` is replaced with a recursive tree of `<details>/<summary>` elements.

### New function: `buildNavTree()`

Add in `build.mjs`:

```javascript
// Build a nested tree structure from the non-deck doc list.
// Returns a node: { slug, title, docAtThisLevel, children: { segment: node } }
// where docAtThisLevel is the doc whose slug == this folder path (could be
// an auto-index or an authored index.md), or null if no such doc exists.
//
// Example for docs [index, notes, notes/linear-probe, notes/ai, notes/ai/toy-transformer]:
// root: {
//   docAtThisLevel: index doc,
//   children: {
//     notes: {
//       docAtThisLevel: notes folder-index doc,
//       children: {
//         'linear-probe': { docAtThisLevel: linear-probe doc, children: {} },
//         ai: {
//           docAtThisLevel: ai folder-index doc,
//           children: {
//             'toy-transformer': { ... }
//           }
//         }
//       }
//     }
//   }
// }
function buildNavTree(docs) {
  const regularDocs = docs.filter((d) => !d.isDeck);

  // Build a map: slug → doc, for quick lookup
  const bySlug = new Map(regularDocs.map((d) => [d.slug, d]));

  function getOrCreate(node, slug, segment) {
    if (!node.children[segment]) {
      node.children[segment] = {
        slug,
        title: prettifyFolder(segment),
        docAtThisLevel: bySlug.get(slug) || null,
        children: {},
      };
    }
    return node.children[segment];
  }

  const root = {
    slug: '',
    title: '',
    docAtThisLevel: bySlug.get('index') || null,
    children: {},
  };

  for (const doc of regularDocs) {
    if (doc.slug === 'index') continue; // handled as root

    const parts = doc.slug.split('/');
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const slug = parts.slice(0, i + 1).join('/');
      node = getOrCreate(node, slug, parts[i]);
      if (i === parts.length - 1) {
        // Leaf: make sure docAtThisLevel is set to the real doc
        node.docAtThisLevel = doc;
        node.title = doc.title;
      }
    }
  }

  return root;
}
```

### New function: `renderNavTree()`

```javascript
// Recursively render a nav tree node as HTML.
// Folder nodes (nodes with children) become <details>/<summary>.
// Leaf nodes become plain <li><a> items.
// `depth` is used to generate unique, stable IDs for <details> elements.
function renderNavTree(node, depth = 0) {
  const childKeys = Object.keys(node.children).sort();
  if (childKeys.length === 0) {
    // Leaf node
    if (!node.docAtThisLevel) return '';
    return `<li><a href="${base}${node.slug}/" data-preview-slug="${node.slug}">${escapeHtml(node.docAtThisLevel.title)}</a></li>`;
  }

  // Branch node: render children recursively
  const childItems = childKeys
    .map((key) => renderNavTree(node.children[key], depth + 1))
    .filter(Boolean)
    .join('');

  // The folder label: link to the folder index if one exists, plain text otherwise
  const id = `nav-folder-${node.slug.replace(/\//g, '-')}`;
  const label = node.docAtThisLevel
    ? `<a href="${base}${node.slug}/">${escapeHtml(node.docAtThisLevel.title)}</a>`
    : escapeHtml(node.title);

  // Root-level folders open by default; deeper ones closed by default
  const openAttr = depth <= 1 ? ' open' : '';

  return `<li><details class="nav-group nav-folder" id="${id}"${openAttr}><summary>${label}</summary><ul>${childItems}</ul></details></li>`;
}
```

### Replace `nav()`

Replace the entire existing `nav()` function:

```javascript
function nav(docs) {
  const deckDocs = docs.filter((d) => d.isDeck);
  const allTags = Array.from(new Set(docs.flatMap((d) => d.tags))).sort();

  // Build and render the document tree
  const tree = buildNavTree(docs);
  const rootDocLink = tree.docAtThisLevel
    ? `<ul class="nav-root-items"><li><a href="${base}">${escapeHtml(tree.docAtThisLevel.title)}</a></li></ul>`
    : '';
  const topLevelChildren = Object.keys(tree.children)
    .sort()
    .map((key) => renderNavTree(tree.children[key], 1))
    .filter(Boolean)
    .join('');
  const docsSection =
    `<details class="nav-group" id="nav-docs" open>` +
    `<summary>Documents</summary>` +
    rootDocLink +
    `<ul class="nav-tree">${topLevelChildren}</ul>` +
    `</details>`;

  const decksSection = deckDocs.length
    ? `<details class="nav-group" id="nav-decks">` +
      `<summary>Decks</summary><ul>` +
      deckDocs.map((d) => `<li><a href="${base}${d.slug}/">${escapeHtml(d.title)}</a></li>`).join('') +
      `</ul></details>`
    : '';

  const tagsSection =
    `<details class="nav-group" id="nav-tags">` +
    `<summary>Tags</summary><ul>` +
    allTags.map((tag) => `<li><a href="${base}tags/${tag}/">#${escapeHtml(tag)}</a></li>`).join('') +
    `</ul></details>`;

  return (
    `<nav class="site-nav">` +
    `<a class="site-title" href="${base}">${escapeHtml(siteTitle)}</a>` +
    docsSection + decksSection + tagsSection +
    `</nav>`
  );
}
```

### CSS additions for nested nav

Add to `src/styles/site.css`:

```css
/* Folder nodes inside the tree — indent one level relative to their parent */
.nav-tree ul { margin: 0; padding: 0 0 0 0.85rem; list-style: none; }
.nav-folder { margin: 0.2rem 0; }
.nav-folder > summary {
  color: var(--ink);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  user-select: none;
  margin: 0.2rem 0;
}
.nav-folder > summary::-webkit-details-marker { display: none; }
.nav-folder > summary::before {
  color: var(--muted);
  content: '▸';
  font-size: 0.6rem;
  flex-shrink: 0;
  transition: transform 0.12s;
}
.nav-folder[open] > summary::before { transform: rotate(90deg); }
/* The link inside a folder summary should not underline on hover separately */
.nav-folder > summary a { text-decoration: none; }
.nav-folder > summary a:hover { color: var(--accent); }
.nav-root-items { list-style: none; margin: 0 0 0.25rem; padding: 0; }
```

Also remove or soften the generic `.nav-group a` rule's font-size if it conflicts with `.nav-folder summary` — folder summaries need to be styled separately from leaf `<a>` elements.

### `hover-previews.js` changes

The nav state persistence IIFE (near the bottom of the file) currently queries `details.nav-group[id]`. The new folder nodes use class `nav-folder` in addition to `nav-group`, so no change is needed — `details.nav-group[id]` already matches them. Verify the active-link detection still works:

```javascript
// This line in hover-previews.js should still work unchanged:
const details = a.closest('details.nav-group');
if (details) details.open = true;
```

Because `nav-folder` elements also have class `nav-group`, `closest('details.nav-group')` will find them and force them open when the active page is inside a folder. No change needed.

---

## Implementation Order and Testing Checkpoints

**Step 1 — Slug fix.** Run `npm run build`. Check `dist/` — no more `notes/index/` directories. If `content/notes/index.md` exists, verify it lands at `dist/notes/index.html`. Run the site locally and check that all existing links still work.

**Step 2 — Folder indexes.** Add `buildFolderIndexDocs` and `renderFolderIndex`, wire them into `main()`. Run build. Navigate to `/notes/` (or whatever top-level folder exists) — it should show the listing page. Verify that:
- Direct children are listed correctly
- Subfolders appear in a separate section from documents
- Clicking a subfolder link leads to that subfolder's index
- Hover previews work on the listed links

**Step 3 — Breadcrumbs.** Add `breadcrumbsHtml()`, update `pageTemplate()`, add CSS. Build. Open a note at `notes/ai/toy-transformer` — breadcrumbs should read "Notes › AI › Toy Transformer" with the first two as links. Verify root-level docs (`index`) have no breadcrumbs (shows raw path fallback instead).

**Step 4 — Hierarchical sidebar.** Replace `nav()`, add CSS, verify JS. Build. Check:
- Folder nodes render as collapsible `<details>` with folder name as summary
- Clicking a folder summary link navigates to the folder index page
- Active page is highlighted and its ancestor folders are forced open
- localStorage state persists open/close across reloads
- Tags section still appears below, unchanged
- Decks section still appears if any deck docs exist

---

## Edge Cases to Handle

- **Root `index.md`:** Slug is `'index'`, no parent folder, no breadcrumbs. The fallback in `pageTemplate` shows the raw rel path instead.
- **A doc at the top level (e.g. `content/about.md`):** No parent folder, no breadcrumbs. No auto-index generated (only subfolders get indexes).
- **An authored `notes/index.md`:** The auto-index generator checks `authoredSlugs` and skips `notes`. The authored doc is used as-is. Its content renders normally via `renderMarkdown`. The `renderFolderIndex` is NOT called for it.
- **Empty folders:** A folder containing only subfolders and no direct `.md` files will still get a folder index showing just the Subfolders section. This is correct.
- **Nav tree with only flat docs (no subfolders):** `buildNavTree` returns a root with only direct children and no nested `children` — `renderNavTree` returns plain `<li>` items, which is fine.
- **`data-preview-slug` on folder links:** Auto-index docs are included in `documents.json` (since we use `allDocs` for that write), so hover previews will work on folder links.

---

## Files Modified

| File | Change |
|------|--------|
| `scripts/build.mjs` | `slugify()` + `makeDoc()` fix; new `prettifyFolder()`, `buildFolderIndexDocs()`, `renderFolderIndex()`, `breadcrumbsHtml()`, `buildNavTree()`, `renderNavTree()`; replace `nav()`; update `main()`, `pageTemplate()` |
| `src/styles/site.css` | Add `.breadcrumb`, `.crumb-sep`, `.crumb-current`, `.nav-tree`, `.nav-folder` rules |
| `src/client/hover-previews.js` | No changes expected — verify only |
