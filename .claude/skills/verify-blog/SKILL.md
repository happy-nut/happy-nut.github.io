---
name: verify-blog
description: Launch this Jekyll (Chirpy theme) blog locally and drive it in a real browser to prove a change works — new/edited posts, layouts, includes, categories/tags, search, PWA. Use after /new-post, /refine, layout or _config.yml edits, or whenever asked to run, preview, or screenshot the blog.
---

# verify-blog

Surface: a static web site (GitHub Pages, Chirpy theme). Users read posts, browse categories/tags/archives, and search. Everything they see is HTML that `jekyll serve` builds from `_posts/`, `_tabs/`, `_layouts/`, `_includes/` and the `jekyll-theme-chirpy` gem.

## Launch

Needs Ruby 3.x. Chirpy requires `~> 3.1`; Homebrew's default Ruby is 4.x and fails `bundle install`. CI uses 3.3, so install that keg-only (leaves the default Ruby alone):

```bash
brew install ruby@3.3
```

Then:

```bash
.claude/skills/verify-blog/serve.sh start     # PORT=4100 by default; PORT=4200 serve.sh start for a second checkout
```

`start` puts `/opt/homebrew/opt/ruby@3.3/bin` first on PATH, runs `bundle install` if needed, serves this checkout on `127.0.0.1:$PORT` with the built site and log in `$TMPDIR/verify-blog-$PORT/`, waits for `Server running...` (about 7s), then runs Doctor. Ready = Doctor prints all `ok` and `ready: http://127.0.0.1:4100`.

Each worktree/checkout gets its own PORT. Two checkouts must not share one: `start` refuses a port it did not open. Livereload is off on purpose (its fixed port 35729 would collide).

`Gemfile.lock` is gitignored, so `~> 7.2` resolves to the newest Chirpy 7.x (7.6.0 as of 2026-11). CI does the same.

## Doctor

```bash
.claude/skills/verify-blog/serve.sh doctor
```

Read-only. Checks: Ruby 3.x, our PID alive, our PID owns the port, the log says it serves *this* checkout's path, `GET /` is 200, `/assets/js/data/search.json` has entries. Prints `warn` if the log has errors. Run it before the first drive and after any drive that failed.

Jekyll auto-regenerates on file change. After editing a post, wait for `...done in` to appear again in `$TMPDIR/verify-blog-$PORT/log` before reloading.

## Drive

Primary: `drive.mjs`, which runs the installed Google Chrome headless over CDP with no npm packages (Node 22's built-in WebSocket). Each call uses a fresh Chrome profile, so no stale service worker. Steps run in order; `--eval` prints what the page shows, `--shot` saves a mid-journey screen, the second positional arg is the final screen.

```bash
D=.claude/skills/verify-blog/drive.mjs; U=$(.claude/skills/verify-blog/serve.sh url); E=.verify-evidence/$(date +%Y%m%d-%H%M); mkdir -p $E
$D $U/ $E/SEARCH-open.png \
  --type '#search-input' '손절' \
  --eval "[...document.querySelectorAll('#search-results a')].map(a=>a.textContent.trim())" \
  --shot $E/SEARCH.png \
  --click '#search-results a' \
  --eval "document.querySelector('h1').textContent"
```

Flags: `--width <px>` (default 1280; under 768 emulates mobile), `--click <css>`, `--type <css> <text>` (real key events, so `keyup` handlers fire), `--wait <ms>`, `--eval <js>`, `--shot <png>`, `--full` (full-page capture), `--scheme light|dark` (otherwise Chrome follows the macOS appearance), `--hover <css>` (moves the mouse to the element's center and waits 700ms for hover transitions). Exit 1 and `no element: <css>` when a selector is missing. Set `CHROME=` for a non-default Chrome path.

Secondary: the built-in browser (`mcp__Claude_Browser__*`) or Claude in Chrome, when you want to look around interactively. Its screenshots are not saved to disk, so take the evidence shots with `drive.mjs`.

Stable handles (Chirpy 7.x markup):

| What | Selector / route |
|---|---|
| Home post cards | `#post-list article`, title `h1.card-title`, pager `.pagination .page-item` |
| Sidebar nav | `#sidebar nav a` → `/`, `/categories/`, `/tags/`, `/archives/`, `/about/` |
| Post page | `/posts/<slug>/` (slug = `title` part of the filename, see `permalink: /posts/:title/`), `h1`, `#toc-wrapper`, `.post-tags a.post-tag`, `.post-navigation a` |
| Categories | `/categories/`, cards `.card.categories`, one page per category `/categories/<lowercase>/` |
| Tags | `/tags/`, `#tags a.tag` |
| Archives | `/archives/`, `#archives .year`, `#archives li a` |
| Search | `#search-input` (desktop width), results `#search-results a`, wrapper `#search-result-wrapper` (has `d-none` when closed); narrow width needs `#search-trigger` first |
| PWA toast | `#notification`, button `[aria-label="Update"]` (`_includes/notification.html`) |

Feature-by-feature journeys: [features/README.md](features/README.md).

## Evidence

Save to `.verify-evidence/<YYYYMMDD-HHMM>/` at the repo root (gitignored, and Jekyll skips dot-folders so it never lands in the site). One screenshot per feature driven, named `<feature-id>.png`, plus a `notes.md` with the exact `drive.mjs` command and its `--eval` output.

What counts as proof:
- Reach the page through the UI (sidebar link, search result, post card), not only by typing the URL.
- Read the value the user sees (title text, result list, count badge), not just HTTP 200.
- For a content change, prove the new text is on the rendered page *and* in the build output: `grep -l '<text>' $TMPDIR/verify-blog-$PORT/site/posts/<slug>/index.html`.
- For production-only behavior (compressed HTML, analytics, SEO tags) also run `bash tools/test.sh` (JEKYLL_ENV=production build + htmlproofer, same as CI). It writes `_site/` in the repo, which is gitignored.

## Cleanup

```bash
.claude/skills/verify-blog/serve.sh stop
```

Kills only the PID recorded at `start` (the jekyll process itself) and deletes `$TMPDIR/verify-blog-$PORT/`. It never touches `.verify-evidence/`. `drive.mjs` cleans up its own Chrome and profile on every exit. Close any built-in browser tab you opened; its service worker for `127.0.0.1:$PORT` stays in that profile (see the PWA gotcha).

## Helpers

- `serve.sh start|doctor|stop|url` — above. `PORT` env picks the instance.
- `drive.mjs <url> <out.png> [steps...]` — above. Needs Node 22+ and Google Chrome.
- `bash tools/test.sh` — production build + link check (repo's own, mirrors `.github/workflows/pages-deploy.yml`).

## Known site-wide gotchas

- The PWA service worker (`pwa.cache.enabled: true`) is registered on localhost too. After editing a page, a reload can serve the cached copy. Hard-reload, or in the page run `(await navigator.serviceWorker.getRegistrations()).forEach(r=>r.unregister())` and reload.
- Build warns `Conflict: ... categories/life/index.html` and `categories/parenting/index.html`. `_posts/2025-12-27-부모가 될 준비.md` uses `[Life, Parenting]` while others use `[life, parenting]`; jekyll-archives writes both to one URL, and `/categories/` shows two cards. That is a content bug, not a harness bug.

## Deeper layers (only if a need shows up)

- Web UI property testing with Bombadil (search results always match the query, pager count matches post count) if search or pagination gets custom code.
- Formal methods do not fit here; the site has no concurrency or algorithms of its own beyond the PWA update flow.
