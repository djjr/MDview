# MDview

MDview is a lightweight static Markdown viewer for GitHub Pages. Drop Markdown files into `content/`, run the build, and publish the generated `dist/` directory as an interconnected document site.

## Features

- Static HTML output that works on GitHub Pages without a server.
- Frontmatter tags plus inline Obsidian-style `#tags`.
- `LIST tags=a,b` directives that expand into generated document lists.
- Obsidian-style wikilinks such as `[[Note]]` and `[[Note|label]]`.
- Backlink data computed at build time.
- Tufte-like typography with Markdown footnotes rendered as nearby `<aside class="sidenote">` elements.
- Hover previews for internal links using a generated `documents.json` index.

## Content

Create Markdown files anywhere under `content/`:

```markdown
---
title: My Essay
tags: [essay, example]
---

# My Essay

See [[Another Note|this related note]].[^1]

LIST tags=essay,example

[^1]: Footnotes become sidenote asides on wide screens.
```

## Build locally

```bash
npm run build
```

The static website is written to `dist/`.

## GitHub Pages

The included workflow builds the site and deploys `dist/` to GitHub Pages whenever you push to `main`. If your repository is served from a subpath, set `MDVIEW_BASE` in the workflow environment, for example `/MDview/`.
