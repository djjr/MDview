import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import katex from 'katex';

const root = process.cwd();
const contentDir = path.join(root, 'content');
const distDir = path.join(root, 'dist');
const siteTitle = process.env.MDVIEW_TITLE || 'MDview';
const base = normalizeBase(process.env.MDVIEW_BASE || '/');
const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version || '';

function normalizeBase(value) {
  if (!value || value === '/') return '/';
  return `/${value.replace(/^\/+|\/+$/g, '')}/`;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\.md$/i, '')
    .replace(/[^a-z0-9/ -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+$/, '');
}

function prettifyFolder(segment) {
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    const isDir = entry.isDirectory() || (entry.isSymbolicLink() && (await fs.stat(absolute)).isDirectory());
    const isFile = entry.isFile() || (entry.isSymbolicLink() && (await fs.stat(absolute)).isFile());
    if (isDir) files.push(...await walk(absolute));
    else if (isFile && entry.name.endsWith('.md')) files.push(absolute);
  }
  return files;
}

function parseValue(raw) {
  const value = raw.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value !== '' && !isNaN(Number(value))) return Number(value);
  return value.replace(/^['"]|['"]$/g, '');
}

function parseFrontmatter(source) {
  if (!source.startsWith('---\n')) return { data: {}, body: source };
  const end = source.indexOf('\n---', 4);
  if (end === -1) return { data: {}, body: source };
  const raw = source.slice(4, end).split('\n');
  const data = {};
  let currentKey = null;
  for (const line of raw) {
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      data[currentKey] = keyMatch[2] ? parseValue(keyMatch[2]) : [];
    } else if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(parseValue(listMatch[1]));
    }
  }
  return { data, body: source.slice(end + 5).replace(/^\n/, '') };
}

function collectInlineTags(markdown) {
  return Array.from(markdown.matchAll(/(^|\s)#([A-Za-z0-9][A-Za-z0-9/_-]*)/g), (match) => match[2]);
}

// Extract footnote definitions (e.g. [^1]: text) from the body,
// returning them as a Map and the body with those definition lines removed.
// The definitions are stripped out so marked never sees them as loose text.
function extractFootnotes(markdown) {
  const footnotes = new Map();
  const body = markdown.replace(/^\[\^([^\]]+)\]:\s*(.+(?:\n(?!\S).+)*)$/gm, (_full, id, text) => {
    footnotes.set(id, text.replace(/\n\s+/g, ' ').trim());
    return '';
  });
  return { body, footnotes };
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/^---[\s\S]*?---/, '')
    .replace(/\$\$[\s\S]+?\$\$/g, '[math]')
    .replace(/\$[^$\n]+?\$/g, '[math]')
    .replace(/^\[\^([^\]]+)\]:.*$/gm, '')   // remove footnote definitions
    .replace(/\[\^[^\]]+\]/g, '')            // remove inline footnote refs like [^id]
    .replace(/!?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => label || target)
    .replace(/[#>*_`~]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeDoc(file, source) {
  const rel = path.relative(contentDir, file).replace(/\\/g, '/');
  const parsed = parseFrontmatter(source);
  const slug = slugify(rel.replace(/\/?index\.md$/i, '')) || 'index';
  const title = parsed.data.title || path.basename(rel, '.md').replace(/[-_]/g, ' ');
  const shortTitle = parsed.data.short_title || null;
  const rawTags = parsed.data.tags ? (Array.isArray(parsed.data.tags) ? parsed.data.tags : [parsed.data.tags]) : [];
  const tags = Array.from(new Set([...rawTags, ...collectInlineTags(parsed.body)].map(String).filter(Boolean))).sort();
  return {
    aliases: [title, rel.replace(/\.md$/i, ''), slug],
    body: parsed.body,
    data: parsed.data,
    excerpt: stripMarkdown(parsed.body).slice(0, 220),
    isDeck: parsed.data.layout === 'deck',
    rel,
    shortTitle,
    slug,
    tags,
    title,
  };
}

function resolveLink(target, docs) {
  const clean = slugify(target);
  return docs.find((doc) => doc.aliases.some((alias) => slugify(alias) === clean)) || null;
}

// Marked instance for individual slide content: wikilinks + math + images.
// Footnote references render as <sup>N</sup> and are collected in the
// returned `collectedFootnotes` array so the caller can append a sub-slide.
function buildDeckSlideInstance(doc, docs, footnotes = new Map()) {
  let footnoteCount = 0;
  const collectedFootnotes = [];
  // Math extensions needed so footnote text renders $...$ correctly.
  const inlineMarked = new Marked({
    gfm: true,
    extensions: [
      {
        name: 'displayMath', level: 'block',
        start(src) { const idx = src.indexOf('$$'); return idx >= 0 ? idx : undefined; },
        tokenizer(src) {
          const match = src.match(/^\$\$([\s\S]+?)\$\$/);
          if (!match) return undefined;
          return { type: 'displayMath', raw: match[0], math: match[1].trim() };
        },
        renderer(token) {
          try { return katex.renderToString(token.math, { displayMode: true, throwOnError: true }) + '\n'; }
          catch (err) { return `<div class="math-error">${escapeHtml(token.math)}</div>\n`; }
        },
      },
      {
        name: 'inlineMath', level: 'inline',
        start(src) { const idx = src.indexOf('$'); return idx >= 0 ? idx : undefined; },
        tokenizer(src) {
          if (src.startsWith('$$')) return undefined;
          const match = src.match(/^\$([^$\n]+?)\$/);
          if (!match) return undefined;
          return { type: 'inlineMath', raw: match[0], math: match[1] };
        },
        renderer(token) {
          try { return katex.renderToString(token.math, { displayMode: false, throwOnError: true }); }
          catch (err) { return `<span class="math-error">${escapeHtml(token.math)}</span>`; }
        },
      },
    ],
  });

  const extensions = [
    {
      name: 'displayMath',
      level: 'block',
      start(src) { const idx = src.indexOf('$$'); return idx >= 0 ? idx : undefined; },
      tokenizer(src) {
        const match = src.match(/^\$\$([\s\S]+?)\$\$/);
        if (!match) return undefined;
        return { type: 'displayMath', raw: match[0], math: match[1].trim() };
      },
      renderer(token) {
        try {
          return katex.renderToString(token.math, { displayMode: true, throwOnError: true }) + '\n';
        } catch (err) {
          return `<div class="math-error">${escapeHtml(token.math)}<br><small>${escapeHtml(err.message)}</small></div>\n`;
        }
      },
    },
    {
      name: 'inlineMath',
      level: 'inline',
      start(src) { const idx = src.indexOf('$'); return idx >= 0 ? idx : undefined; },
      tokenizer(src) {
        if (src.startsWith('$$')) return undefined;
        const match = src.match(/^\$([^$\n]+?)\$/);
        if (!match) return undefined;
        return { type: 'inlineMath', raw: match[0], math: match[1] };
      },
      renderer(token) {
        try {
          return katex.renderToString(token.math, { displayMode: false, throwOnError: true });
        } catch (err) {
          return `<span class="math-error">${escapeHtml(token.math)}</span>`;
        }
      },
    },
    {
      name: 'wikilink',
      level: 'inline',
      start(src) { return src.indexOf('[['); },
      tokenizer(src) {
        const match = src.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
        if (!match) return undefined;
        return { type: 'wikilink', raw: match[0], target: match[1].trim(), label: match[2]?.trim() };
      },
      renderer(token) {
        const linked = resolveLink(token.target, docs);
        const label = token.label || token.target;
        if (!linked) return `<span class="missing-link">${escapeHtml(label)}</span>`;
        doc.outgoingLinks.add(linked.slug);
        return `<a href="${base}${linked.slug}/" data-preview-slug="${linked.slug}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
      },
    },
    // Footnote references render as superscript numbers.
    // Definitions are collected for the caller to build a footnote sub-slide.
    {
      name: 'deckFootnoteRef',
      level: 'inline',
      start(src) { return src.indexOf('[^'); },
      tokenizer(src) {
        const match = src.match(/^\[\^([^\]]+)\]/);
        if (!match) return undefined;
        return { type: 'deckFootnoteRef', raw: match[0], id: match[1] };
      },
      renderer(token) {
        const noteSource = footnotes.get(token.id);
        if (!noteSource) return '';
        const number = ++footnoteCount;
        collectedFootnotes.push({ number, html: inlineMarked.parseInline(noteSource) });
        return `<sup>${number}</sup>`;
      },
    },
  ];

  const renderer = {
    image({ href, title, text }) {
      const img = `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''}>`;
      return text
        ? `<figure>${img}<figcaption>${escapeHtml(text)}</figcaption></figure>\n`
        : `<figure>${img}</figure>\n`;
    },
  };

  const instance = new Marked({ gfm: true, extensions, renderer });
  return { instance, collectedFootnotes };
}

// Render a single slide chunk, returning one or two <section> strings.
// If the slide contains footnotes, a second <section class="deck-footnotes">
// is appended as a vertical sub-slide beneath the main slide.
function renderSlideChunk(source, doc, docs) {
  const { body, footnotes } = extractFootnotes(source);
  const { instance, collectedFootnotes } = buildDeckSlideInstance(doc, docs, footnotes);
  const sections = [`<section>${instance.parse(body)}</section>`];
  if (collectedFootnotes.length > 0) {
    const items = collectedFootnotes
      .map(({ number, html }) => `<li><sup>${number}</sup> ${html}</li>`)
      .join('');
    sections.push(`<section class="deck-footnotes"><ul>${items}</ul></section>`);
  }
  return sections;
}

// Split deck body into reveal.js <section> elements.
// Horizontal slides are separated by lines containing only ---.
// Vertical slides (within a horizontal section) are separated by lines containing only --.
// Footnotes on any slide produce an automatic vertical sub-slide beneath it.
function renderDeck(doc, docs) {
  const normalized = '\n' + doc.body.trim() + '\n';
  const hSections = normalized.split(/\n---\n/).map((s) => s.trim()).filter(Boolean);

  return hSections.map((hSection) => {
    const rawVSlides = ('\n' + hSection + '\n').split(/\n--\n/).map((s) => s.trim()).filter(Boolean);
    const vSections = rawVSlides.flatMap((slide) => renderSlideChunk(slide, doc, docs));
    if (vSections.length === 1) return vSections[0];
    return `<section>\n${vSections.join('\n')}\n</section>`;
  }).join('\n');
}

// Build a Marked instance with three custom extensions wired to this
// specific document render pass (doc, docs, footnotes are all closed over).
//
// How marked extensions work:
//   - Each extension declares a `level` ('block' or 'inline'), a `start`
//     function that tells marked where a potential match begins (so it can
//     split the source correctly), a `tokenizer` that converts raw source
//     into a typed token object, and a `renderer` that converts the token
//     back to an HTML string.
//   - Block extensions are tried before marked's own block rules; same for
//     inline extensions. Returning `undefined` from tokenizer means "not a
//     match here, keep trying other rules."
//
function buildMarkedInstance(doc, docs, footnotes) {
  // Closure variable: counts footnote refs in order of appearance.
  let footnoteCount = 0;

  // A lightweight bare Marked instance used only for rendering footnote
  // note text (so bold/code/links inside footnotes still work).
  const inlineMarked = new Marked({ gfm: true });

  const extensions = [
    // ── Block extension: LIST tags=a,b ───────────────────────────────────
    // Expands to a <section> listing every document that carries ALL the
    // requested tags, excluding the current page.
    {
      name: 'listDirective',
      level: 'block',
      start(src) {
        const idx = src.search(/^LIST\s/im);
        return idx >= 0 ? idx : undefined;
      },
      tokenizer(src) {
        const match = src.match(/^LIST\s+tags=([^\s\n]+)(?:\s+limit=(\d+))?(?:\n|$)/i);
        if (!match) return undefined;
        return {
          type: 'listDirective',
          raw: match[0],
          tags: match[1].split(',').map((t) => t.trim()).filter(Boolean),
          limit: match[2] ? Number(match[2]) : Infinity,
        };
      },
      renderer(token) {
        const cap = isFinite(token.limit) ? token.limit : undefined;
        const matches = docs
          .filter((c) => c.slug !== doc.slug && token.tags.every((tag) => c.tags.includes(tag)))
          .slice(0, cap);
        const items = matches
          .map((c) => `<li><a href="${base}${c.slug}/" data-preview-slug="${c.slug}">${escapeHtml(c.title)}</a></li>`)
          .join('');
        const heading = token.tags.map(escapeHtml).join(', ');
        return `<section class="generated-list"><h2>Tagged ${heading}</h2><ul>${items || '<li>No matching documents yet.</li>'}</ul></section>\n`;
      },
    },

    // ── Inline extension: [[Target]] and [[Target|label]] ────────────────
    // Obsidian-style wikilinks. Resolved against all docs via aliases;
    // unresolved links render as <span class="missing-link">.
    // Also records outgoing links on doc for backlink computation later.
    {
      name: 'wikilink',
      level: 'inline',
      start(src) { return src.indexOf('[['); },
      tokenizer(src) {
        const match = src.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
        if (!match) return undefined;
        return {
          type: 'wikilink',
          raw: match[0],
          target: match[1].trim(),
          label: match[2]?.trim(),
        };
      },
      renderer(token) {
        const linked = resolveLink(token.target, docs);
        const label = token.label || token.target;
        if (!linked) return `<span class="missing-link">${escapeHtml(label)}</span>`;
        doc.outgoingLinks.add(linked.slug);
        return `<a href="${base}${linked.slug}/" data-preview-slug="${linked.slug}">${escapeHtml(label)}</a>`;
      },
    },

    // ── Block extension: $$...$$ display math ────────────────────────────
    // Must be listed before inlineMath so that $$ is consumed as a block
    // token and never reaches the single-$ inline rule.
    // KaTeX renders the LaTeX to static HTML at build time — no client-side
    // script needed. displayMode: true centres the equation on its own line.
    {
      name: 'displayMath',
      level: 'block',
      start(src) {
        const idx = src.indexOf('$$');
        return idx >= 0 ? idx : undefined;
      },
      tokenizer(src) {
        const match = src.match(/^\$\$([\s\S]+?)\$\$/);
        if (!match) return undefined;
        return { type: 'displayMath', raw: match[0], math: match[1].trim() };
      },
      renderer(token) {
        try {
          return katex.renderToString(token.math, { displayMode: true, throwOnError: true }) + '\n';
        } catch (err) {
          return `<div class="math-error">${escapeHtml(token.math)}<br><small>${escapeHtml(err.message)}</small></div>\n`;
        }
      },
    },

    // ── Inline extension: $...$ inline math ──────────────────────────────
    // Intercepts $...$ before marked can mangle underscores or asterisks
    // inside the expression as Markdown emphasis. KaTeX renders to static
    // HTML spans at build time; no browser-side script or CDN JS needed.
    {
      name: 'inlineMath',
      level: 'inline',
      start(src) {
        const idx = src.indexOf('$');
        return idx >= 0 ? idx : undefined;
      },
      tokenizer(src) {
        // Skip $$ — that belongs to the block displayMath rule above.
        if (src.startsWith('$$')) return undefined;
        const match = src.match(/^\$([^$\n]+?)\$/);
        if (!match) return undefined;
        return { type: 'inlineMath', raw: match[0], math: match[1] };
      },
      renderer(token) {
        try {
          return katex.renderToString(token.math, { displayMode: false, throwOnError: true });
        } catch (err) {
          return `<span class="math-error">${escapeHtml(token.math)}</span>`;
        }
      },
    },

    // ── Inline extension: [^id] footnote references → sidenotes ─────────
    // The footnote *definitions* ([^id]: text) are stripped from the body
    // before marked sees it (see extractFootnotes above). References are
    // intercepted here and rendered as an inline <sup> + nearby <aside>
    // pair — the Tufte sidenote pattern — rather than as endnote links.
    {
      name: 'sidenoteRef',
      level: 'inline',
      start(src) { return src.indexOf('[^'); },
      tokenizer(src) {
        const match = src.match(/^\[\^([^\]]+)\]/);
        if (!match) return undefined;
        return { type: 'sidenoteRef', raw: match[0], id: match[1] };
      },
      renderer(token) {
        const number = ++footnoteCount;
        const noteSource = footnotes.get(token.id) || '';
        // parseInline renders bold, code, links, etc. in the note text.
        const noteHtml = inlineMarked.parseInline(noteSource);
        return (
          `<sup class="footnote-ref">${number}</sup>` +
          `<aside class="sidenote" id="fn-${escapeHtml(token.id)}">` +
          `<span class="footnote-ref">${number}</span> ${noteHtml}` +
          `</aside>`
        );
      },
    },
  ];

  const renderer = {
    image({ href, title, text }) {
      const img = `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''}>`;
      return text
        ? `<figure>${img}<figcaption>${escapeHtml(text)}</figcaption></figure>\n`
        : `<figure>${img}</figure>\n`;
    },
  };

  return new Marked({ gfm: true, extensions, renderer });
}

function renderMarkdown(doc, docs) {
  // Strip footnote definitions before handing the body to marked.
  // The sidenoteRef extension will look them up by id at render time.
  const { body, footnotes } = extractFootnotes(doc.body);
  const instance = buildMarkedInstance(doc, docs, footnotes);
  return instance.parse(body);
}

function breadcrumbsHtml(doc, allDocs) {
  const parts = doc.slug.split('/');
  if (parts.length <= 1) return '';

  const crumbs = [];
  for (let i = 0; i < parts.length - 1; i++) {
    const ancestorSlug = parts.slice(0, i + 1).join('/');
    const ancestorDoc = allDocs.find((d) => d.slug === ancestorSlug);
    const label = ancestorDoc ? ancestorDoc.title : prettifyFolder(parts[i]);
    crumbs.push(`<a href="${base}${ancestorSlug}/">${escapeHtml(label)}</a>`);
  }

  const sep = `<span class="crumb-sep" aria-hidden="true">›</span>`;
  const all = [...crumbs, `<span class="crumb-current">${escapeHtml(doc.title)}</span>`];
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${all.join(` ${sep} `)}</nav>`;
}

function pageTemplate(doc, content, docs, backlinks = []) {
  const tags = doc.tags.map((tag) => `<a class="tag-pill" href="${base}tags/${tag}/">#${escapeHtml(tag)}</a>`).join('');
  const backlinksHtml = backlinks.length
    ? `<section class="backlinks"><h2>Backlinks</h2><ul>${backlinks.map((link) => `<li><a href="${base}${link.slug}/" data-preview-slug="${link.slug}">${escapeHtml(link.title)}</a></li>`).join('')}</ul></section>`
    : '';
  const crumbs = breadcrumbsHtml(doc, docs);
  return shell(
    `<article>` +
    `<div class="doc-meta">` +
    (crumbs || `<span class="doc-path">${escapeHtml(doc.rel)}</span>`) +
    `<div class="tag-list">${tags}</div>` +
    `</div>` +
    `${content}${backlinksHtml}</article>`,
    docs,
    doc.title,
  );
}

function deckTemplate(doc, sectionsHtml) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(doc.title)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/simple.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600&display=swap">
<style>
  :root { --paper: #fbf8f0; --ink: #25221e; --accent: #8b3f2f; --muted: #6d655c; }
  body { background: var(--paper); }
  .reveal { font-family: Georgia, Cambria, "Times New Roman", serif; background: var(--paper); color: var(--ink); }
  .reveal h1, .reveal h2, .reveal h3, .reveal h4 { font-family: "EB Garamond", Georgia, serif; font-weight: 600; color: var(--ink); text-transform: none; letter-spacing: 0; }
  .reveal .slides { text-align: left; }
  .reveal a { color: var(--accent); }
  .reveal code { background: #efe6d8; border-radius: 0.25rem; font-size: 0.85em; padding: 0.1em 0.3em; }
  .reveal pre { background: #2b2722; color: #fff7e8; box-shadow: none; }
  .reveal pre code { background: transparent; padding: 0; }
  .reveal section img { max-height: 65vh; border-radius: 0.4rem; }
  .reveal figcaption { font-size: 0.65em; color: var(--muted); margin-top: 0.4em; }
  .reveal .progress { color: var(--accent); }
  .reveal .controls { color: var(--accent); }
  .missing-link { color: var(--muted); text-decoration: underline dotted; }
  .deck-footnotes { font-size: 0.7em; color: var(--muted); }
  .deck-footnotes ul { list-style: none; margin: 0; padding: 0; line-height: 1.8; }
  .deck-footnotes sup { font-size: 0.75em; font-weight: 700; margin-right: 0.25em; }
  .hover-card { background: #fffdf8; border: 1px solid #ded5c8; border-radius: 0.85rem; box-shadow: 0 18px 50px rgba(40,32,20,0.16); color: #25221e; display: none; font-family: Inter, ui-sans-serif, sans-serif; left: 0; max-width: 22rem; padding: 0.9rem 1rem; position: fixed; top: 0; z-index: 100; pointer-events: none; }
  .hover-card[data-visible="true"] { display: block; }
  .hover-card h3 { font-size: 1rem; margin: 0 0 0.4rem; }
  .hover-card p { color: #6d655c; font-size: 0.88rem; line-height: 1.45; margin: 0; }
</style>
<link rel="stylesheet" href="${base}assets/deck.css">
</head>
<body>
<div class="reveal">
  <div class="slides">
${sectionsHtml}
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
<script>
Reveal.initialize({ hash: false, slideNumber: true, controls: true, progress: true, center: false, scrollActivationWidth: null });
</script>
<script>
(function () {
  const card = document.createElement('aside');
  card.className = 'hover-card';
  card.setAttribute('role', 'tooltip');
  document.body.appendChild(card);

  let indexPromise;
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch('${base}documents.json').then((r) => r.json()).catch(() => ({}));
    }
    return indexPromise;
  }

  function positionCard(e) {
    const pad = 16, width = 352;
    const left = Math.min(e.clientX + pad, window.innerWidth - width - pad);
    const top = Math.min(e.clientY + pad, window.innerHeight - 180);
    card.style.transform = \`translate(\${Math.max(pad, left)}px, \${Math.max(pad, top)}px)\`;
  }

  async function show(e) {
    const slug = e.currentTarget.dataset.previewSlug;
    const index = await loadIndex();
    const doc = index[slug];
    if (!doc) return;
    card.innerHTML = \`<h3>\${doc.title}</h3><p>\${doc.excerpt || 'No preview available yet.'}</p>\`;
    positionCard(e);
    card.dataset.visible = 'true';
  }

  function hide() { card.dataset.visible = 'false'; }

  document.querySelectorAll('a[data-preview-slug]').forEach((link) => {
    link.addEventListener('mouseenter', show);
    link.addEventListener('mousemove', positionCard);
    link.addEventListener('mouseleave', hide);
    link.addEventListener('focus', show);
    link.addEventListener('blur', hide);
  });
}());
</script>
</body>
</html>`;
}

function deckWrapperTemplate(doc, docs) {
  const deckUrl = `${base}${doc.slug}/deck.html`;
  const content =
    `<div class="deck-titlebar">` +
    `<h1>${escapeHtml(doc.title)}</h1>` +
    `<a class="deck-fullscreen-link" href="${deckUrl}" target="_blank">Open fullscreen ↗</a>` +
    `</div>` +
    `<iframe class="deck-frame" src="${deckUrl}" allowfullscreen allow="fullscreen"></iframe>`;
  return pageTemplate(doc, content, docs);
}

function buildNavTree(docs) {
  // All authored docs (regular + decks) participate in the tree.
  // Auto-index docs are excluded from iteration — they're picked up
  // implicitly via bySlug when an intermediate folder node is created.
  const leafDocs = docs.filter((d) => !d.isAutoIndex);
  const bySlug = new Map(docs.map((d) => [d.slug, d]));

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

  for (const doc of leafDocs) {
    if (doc.slug === 'index') continue; // root handled above
    const parts = doc.slug.split('/');
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const slug = parts.slice(0, i + 1).join('/');
      node = getOrCreate(node, slug, parts[i]);
      if (i === parts.length - 1) {
        node.docAtThisLevel = doc;
        node.title = doc.title;
      }
    }
  }

  return root;
}

function renderNavTree(node, depth = 0) {
  const childKeys = Object.keys(node.children).sort();
  if (childKeys.length === 0) {
    if (!node.docAtThisLevel) return '';
    return `<li><a href="${base}${node.slug}/" data-preview-slug="${node.slug}">${escapeHtml(node.docAtThisLevel.shortTitle || node.docAtThisLevel.title)}</a></li>`;
  }

  const childItems = childKeys
    .map((key) => renderNavTree(node.children[key], depth + 1))
    .filter(Boolean)
    .join('');

  const id = `nav-folder-${node.slug.replace(/\//g, '-')}`;
  const label = node.docAtThisLevel
    ? `<a href="${base}${node.slug}/">${escapeHtml(node.docAtThisLevel.shortTitle || node.docAtThisLevel.title)}</a>`
    : escapeHtml(node.title);
  const openAttr = depth <= 1 ? ' open' : '';

  return `<li><details class="nav-group nav-folder" id="${id}"${openAttr}><summary>${label}</summary><ul>${childItems}</ul></details></li>`;
}

function nav(docs) {
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

  return (
    `<nav class="site-nav">` +
    `<a class="site-brand" href="${base}">` +
    `<span class="site-name">${escapeHtml(siteTitle)}</span>` +
    (version ? `<span class="site-version">v${escapeHtml(version)}</span>` : '') +
    `</a>` +
    docsSection +
    `</nav>`
  );
}

function shell(main, docs, title = siteTitle) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · ${escapeHtml(siteTitle)}</title>
<link rel="icon" href="${base}favicon.svg">
<link rel="stylesheet" href="${base}assets/site.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
</head>
<body>
<div class="site-shell">${nav(docs)}<div class="nav-resizer" aria-hidden="true"></div><main class="document-layout">${main}</main></div>
<script>window.MDVIEW_BASE=${JSON.stringify(base)}</script>
<script type="module" src="${base}assets/hover-previews.js"></script>
</body>
</html>`;
}

async function writePage(slug, html) {
  const out = path.join(distDir, slug, 'index.html');
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, html);
}

async function copyAssets() {
  await fs.mkdir(path.join(distDir, 'assets'), { recursive: true });
  await fs.cp(path.join(root, 'src/styles/site.css'), path.join(distDir, 'assets/site.css'));
  await fs.cp(path.join(root, 'src/styles/deck.css'), path.join(distDir, 'assets/deck.css'));
  await fs.cp(path.join(root, 'src/client/hover-previews.js'), path.join(distDir, 'assets/hover-previews.js'));
  await fs.cp(path.join(root, 'public/favicon.svg'), path.join(distDir, 'favicon.svg'));
}

function buildFolderIndexDocs(authoredDocs) {
  const allFolderPaths = new Set();
  for (const doc of authoredDocs) {
    const parts = doc.rel.split('/');
    for (let depth = 1; depth < parts.length; depth++) {
      allFolderPaths.add(parts.slice(0, depth).join('/'));
    }
  }

  const authoredSlugs = new Set(authoredDocs.map((d) => d.slug));

  const virtual = [];
  for (const folderPath of allFolderPaths) {
    const folderSlug = slugify(folderPath);
    if (authoredSlugs.has(folderSlug)) continue;

    const segments = folderPath.split('/');
    const title = prettifyFolder(segments[segments.length - 1]);

    virtual.push({
      aliases: [title, folderSlug],
      body: '',
      data: {},
      excerpt: `Contents of the ${title} folder.`,
      isDeck: false,
      isAutoIndex: true,
      rel: `${folderPath}/`,
      slug: folderSlug,
      tags: [],
      title,
      outgoingLinks: new Set(),
    });
  }

  return virtual;
}

function renderFolderIndex(doc, allDocs) {
  const folderPrefix = doc.slug + '/';

  const childDocs = allDocs.filter((d) => {
    if (d.slug === doc.slug) return false;
    if (!d.slug.startsWith(folderPrefix)) return false;
    const remainder = d.slug.slice(folderPrefix.length);
    return remainder.length > 0 && !remainder.includes('/');
  });

  const childFolders = allDocs.filter((d) => {
    if (d.slug === doc.slug) return false;
    if (!d.slug.startsWith(folderPrefix)) return false;
    const remainder = d.slug.slice(folderPrefix.length);
    return remainder.length > 0 && !remainder.includes('/') &&
           (d.isAutoIndex || d.rel.endsWith('/'));
  });

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

async function main() {
  await fs.rm(distDir, { recursive: true, force: true });
  const files = await walk(contentDir);
  const docs = files.map(async (file) => makeDoc(file, await fs.readFile(file, 'utf8')));
  const resolvedDocs = (await Promise.all(docs))
    .filter((doc) => doc.data.publish !== false && doc.data.publish !== 'false')
    .sort((a, b) => a.title.localeCompare(b.title));
  for (const doc of resolvedDocs) doc.outgoingLinks = new Set();

  const folderIndexDocs = buildFolderIndexDocs(resolvedDocs);
  const allDocs = [...resolvedDocs, ...folderIndexDocs].sort((a, b) => a.title.localeCompare(b.title));

  const rendered = new Map();
  for (const doc of allDocs) {
    rendered.set(
      doc.slug,
      doc.isDeck      ? renderDeck(doc, allDocs) :
      doc.isAutoIndex ? renderFolderIndex(doc, allDocs) :
                        renderMarkdown(doc, allDocs)
    );
  }

  const backlinks = new Map(allDocs.map((doc) => [doc.slug, []]));
  for (const doc of allDocs) {
    for (const linkedSlug of doc.outgoingLinks) backlinks.get(linkedSlug)?.push(doc);
  }

  await copyAssets();

  for (const doc of allDocs) {
    if (doc.isDeck) {
      await fs.mkdir(path.join(distDir, doc.slug), { recursive: true });
      await fs.writeFile(path.join(distDir, doc.slug, 'deck.html'), deckTemplate(doc, rendered.get(doc.slug)));
      await writePage(doc.slug, deckWrapperTemplate(doc, allDocs));
    } else {
      const html = pageTemplate(doc, rendered.get(doc.slug), allDocs, backlinks.get(doc.slug) || []);
      await writePage(doc.slug, html);
      if (doc.slug === 'index') await fs.writeFile(path.join(distDir, 'index.html'), html);
    }
  }

  const allTags = Array.from(new Set(allDocs.flatMap((doc) => doc.tags))).sort();
  for (const tag of allTags) {
    const tagged = allDocs.filter((doc) => doc.tags.includes(tag));
    const body =
      `<article><h1>#${escapeHtml(tag)}</h1>` +
      `<section class="generated-list"><h2>Documents</h2><ul>` +
      tagged.map((doc) => `<li><a href="${base}${doc.slug}/" data-preview-slug="${doc.slug}">${escapeHtml(doc.title)}</a></li>`).join('') +
      `</ul></section></article>`;
    await writePage(`tags/${tag}`, shell(body, allDocs, `#${tag}`));
  }

  const index = Object.fromEntries(
    allDocs.map((doc) => [doc.slug, { title: doc.title, excerpt: doc.excerpt, tags: doc.tags, url: `${base}${doc.slug}/` }]),
  );
  await fs.writeFile(path.join(distDir, 'documents.json'), JSON.stringify(index, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
