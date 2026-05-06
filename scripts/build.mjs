import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import katex from 'katex';

const root = process.cwd();
const contentDir = path.join(root, 'content');
const distDir = path.join(root, 'dist');
const siteTitle = process.env.MDVIEW_TITLE || 'MDview';
const base = normalizeBase(process.env.MDVIEW_BASE || '/');

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
    .replace(/-+/g, '-');
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(absolute);
  }
  return files;
}

function parseValue(raw) {
  const value = raw.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  }
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
  const slug = slugify(rel.replace(/(^|\/)index\.md$/i, '$1index')) || 'index';
  const title = parsed.data.title || path.basename(rel, '.md').replace(/[-_]/g, ' ');
  const rawTags = parsed.data.tags ? (Array.isArray(parsed.data.tags) ? parsed.data.tags : [parsed.data.tags]) : [];
  const tags = Array.from(new Set([...rawTags, ...collectInlineTags(parsed.body)].map(String).filter(Boolean))).sort();
  return {
    aliases: [title, rel.replace(/\.md$/i, ''), slug],
    body: parsed.body,
    data: parsed.data,
    excerpt: stripMarkdown(parsed.body).slice(0, 220),
    rel,
    slug,
    tags,
    title,
  };
}

function resolveLink(target, docs) {
  const clean = slugify(target);
  return docs.find((doc) => doc.aliases.some((alias) => slugify(alias) === clean)) || null;
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

function pageTemplate(doc, content, docs, backlinks = []) {
  const tags = doc.tags.map((tag) => `<a class="tag-pill" href="${base}tags/${tag}/">#${escapeHtml(tag)}</a>`).join('');
  const backlinksHtml = backlinks.length
    ? `<section class="backlinks"><h2>Backlinks</h2><ul>${backlinks.map((link) => `<li><a href="${base}${link.slug}/" data-preview-slug="${link.slug}">${escapeHtml(link.title)}</a></li>`).join('')}</ul></section>`
    : '';
  return shell(
    `<article><div class="doc-meta">${doc.rel}<div class="tag-list">${tags}</div></div>${content}${backlinksHtml}</article>`,
    docs,
    doc.title,
  );
}

function nav(docs) {
  const topTags = Array.from(new Set(docs.flatMap((doc) => doc.tags))).sort();
  const docItems = docs.map((doc) => `<li><a href="${base}${doc.slug}/">${escapeHtml(doc.title)}</a></li>`).join('');
  const tagItems = topTags.map((tag) => `<li><a href="${base}tags/${tag}/">#${escapeHtml(tag)}</a></li>`).join('');
  return (
    `<nav class="site-nav">` +
    `<a class="site-title" href="${base}">${escapeHtml(siteTitle)}</a>` +
    `<details class="nav-group" id="nav-docs" open><summary>Documents</summary><ul>${docItems}</ul></details>` +
    `<details class="nav-group" id="nav-tags"><summary>Tags</summary><ul>${tagItems}</ul></details>` +
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
<div class="site-shell">${nav(docs)}<main class="document-layout">${main}</main></div>
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
  await fs.cp(path.join(root, 'src/client/hover-previews.js'), path.join(distDir, 'assets/hover-previews.js'));
  await fs.cp(path.join(root, 'public/favicon.svg'), path.join(distDir, 'favicon.svg'));
}

async function main() {
  await fs.rm(distDir, { recursive: true, force: true });
  const files = await walk(contentDir);
  const docs = files.map(async (file) => makeDoc(file, await fs.readFile(file, 'utf8')));
  const resolvedDocs = (await Promise.all(docs)).sort((a, b) => a.title.localeCompare(b.title));
  for (const doc of resolvedDocs) doc.outgoingLinks = new Set();

  const rendered = new Map();
  for (const doc of resolvedDocs) rendered.set(doc.slug, renderMarkdown(doc, resolvedDocs));

  const backlinks = new Map(resolvedDocs.map((doc) => [doc.slug, []]));
  for (const doc of resolvedDocs) {
    for (const linkedSlug of doc.outgoingLinks) backlinks.get(linkedSlug)?.push(doc);
  }

  await copyAssets();

  for (const doc of resolvedDocs) {
    const html = pageTemplate(doc, rendered.get(doc.slug), resolvedDocs, backlinks.get(doc.slug) || []);
    await writePage(doc.slug, html);
    if (doc.slug === 'index') await fs.writeFile(path.join(distDir, 'index.html'), html);
  }

  const allTags = Array.from(new Set(resolvedDocs.flatMap((doc) => doc.tags))).sort();
  for (const tag of allTags) {
    const tagged = resolvedDocs.filter((doc) => doc.tags.includes(tag));
    const body =
      `<article><h1>#${escapeHtml(tag)}</h1>` +
      `<section class="generated-list"><h2>Documents</h2><ul>` +
      tagged.map((doc) => `<li><a href="${base}${doc.slug}/" data-preview-slug="${doc.slug}">${escapeHtml(doc.title)}</a></li>`).join('') +
      `</ul></section></article>`;
    await writePage(`tags/${tag}`, shell(body, resolvedDocs, `#${tag}`));
  }

  const index = Object.fromEntries(
    resolvedDocs.map((doc) => [doc.slug, { title: doc.title, excerpt: doc.excerpt, tags: doc.tags, url: `${base}${doc.slug}/` }]),
  );
  await fs.writeFile(path.join(distDir, 'documents.json'), JSON.stringify(index, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
