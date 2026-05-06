import { promises as fs } from 'node:fs';
import path from 'node:path';

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
    .replace(/^\[\^([^\]]+)\]:.*$/gm, '')
    .replace(/!?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, '$2$1')
    .replace(/[#>*_`\[\]()~-]/g, '')
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

function renderInline(text, doc, docs, footnotes, state) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_full, target, label) => {
    const linked = resolveLink(target, docs);
    const textLabel = label || target;
    if (!linked) return `<span class="missing-link">${escapeHtml(textLabel)}</span>`;
    doc.outgoingLinks.add(linked.slug);
    return `<a href="${base}${linked.slug}/" data-preview-slug="${linked.slug}">${escapeHtml(textLabel)}</a>`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/\[\^([^\]]+)\]/g, (_full, id) => {
    const number = ++state.footnoteCount;
    const note = footnotes.get(id) || '';
    return `<sup class="footnote-ref">${number}</sup><aside class="sidenote" id="fn-${escapeHtml(id)}"><span class="footnote-ref">${number}</span> ${renderInline(note, doc, docs, new Map(), { footnoteCount: 0 })}</aside>`;
  });
  return html;
}

function renderListDirective(line, doc, docs) {
  const match = line.match(/^LIST\s+tags=([^\s]+)(?:\s+limit=(\d+))?/i);
  if (!match) return null;
  const tags = match[1].split(',').map((tag) => tag.trim()).filter(Boolean);
  const limit = match[2] ? Number(match[2]) : Infinity;
  const matches = docs
    .filter((candidate) => candidate.slug !== doc.slug && tags.every((tag) => candidate.tags.includes(tag)))
    .slice(0, limit);
  const items = matches.map((candidate) => `<li><a href="${base}${candidate.slug}/" data-preview-slug="${candidate.slug}">${escapeHtml(candidate.title)}</a></li>`).join('');
  return `<section class="generated-list"><h2>Tagged ${tags.map(escapeHtml).join(', ')}</h2><ul>${items || '<li>No matching documents yet.</li>'}</ul></section>`;
}

function renderMarkdown(doc, docs) {
  const { body, footnotes } = extractFootnotes(doc.body);
  const lines = body.split('\n');
  const html = [];
  const state = { footnoteCount: 0 };
  let paragraph = [];
  let list = [];
  let inCode = false;
  let code = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${renderInline(paragraph.join(' '), doc, docs, footnotes, state)}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${renderInline(item, doc, docs, footnotes, state)}</li>`).join('')}</ul>`);
    list = [];
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        code = [];
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    const directive = renderListDirective(line.trim(), doc, docs);
    if (directive) {
      flushParagraph();
      flushList();
      html.push(directive);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2], doc, docs, footnotes, state)}</h${level}>`);
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    if (/^>\s+/.test(line)) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${renderInline(line.replace(/^>\s+/, ''), doc, docs, footnotes, state)}</blockquote>`);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  return html.join('\n');
}

function pageTemplate(doc, content, docs, backlinks = []) {
  const tags = doc.tags.map((tag) => `<a class="tag-pill" href="${base}tags/${tag}/">#${escapeHtml(tag)}</a>`).join('');
  const backlinksHtml = backlinks.length ? `<section class="backlinks"><h2>Backlinks</h2><ul>${backlinks.map((link) => `<li><a href="${base}${link.slug}/" data-preview-slug="${link.slug}">${escapeHtml(link.title)}</a></li>`).join('')}</ul></section>` : '';
  return shell(`<article><div class="doc-meta">${doc.rel}<div class="tag-list">${tags}</div></div>${content}${backlinksHtml}</article>`, docs, doc.title);
}

function nav(docs) {
  const topTags = Array.from(new Set(docs.flatMap((doc) => doc.tags))).sort();
  return `<nav class="site-nav"><a class="site-title" href="${base}">${escapeHtml(siteTitle)}</a><section class="nav-section"><h2>Documents</h2><ul>${docs.map((doc) => `<li><a href="${base}${doc.slug}/">${escapeHtml(doc.title)}</a></li>`).join('')}</ul></section><section class="nav-section"><h2>Tags</h2><ul>${topTags.map((tag) => `<li><a href="${base}tags/${tag}/">#${escapeHtml(tag)}</a></li>`).join('')}</ul></section></nav>`;
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
    const body = `<article><h1>#${escapeHtml(tag)}</h1><section class="generated-list"><h2>Documents</h2><ul>${tagged.map((doc) => `<li><a href="${base}${doc.slug}/" data-preview-slug="${doc.slug}">${escapeHtml(doc.title)}</a></li>`).join('')}</ul></section></article>`;
    await writePage(`tags/${tag}`, shell(body, resolvedDocs, `#${tag}`));
  }
  const index = Object.fromEntries(resolvedDocs.map((doc) => [doc.slug, { title: doc.title, excerpt: doc.excerpt, tags: doc.tags, url: `${base}${doc.slug}/` }]));
  await fs.writeFile(path.join(distDir, 'documents.json'), JSON.stringify(index, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
