// 휴대폰 글쓰기 앱. GitHub 토큰으로 저장소의 글을 읽고, 저장하면 main 에 커밋해 Pages 배포를 일으킨다.
(() => {
  const OWNER = 'happy-nut';
  const REPO = 'happy-nut.github.io';
  const SITE = location.origin;
  const RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main`;
  const IMG_DIR = 'assets/img/posts';
  const COLLS = {
    posts: { dir: '_posts', label: '글', unit: '글', public: true },
    diary: { dir: 'koongya', label: '일기', unit: '일기', public: false },
  };
  const ORDER = ['title', 'date', 'categories', 'tags', 'description', 'image', 'mermaid', 'math', 'published'];

  const $app = document.getElementById('app');
  const $toast = document.getElementById('toast');
  const store = {
    get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del: (k) => { try { localStorage.removeItem(k); } catch {} },
    keys: () => { try { return Object.keys(localStorage); } catch { return []; } },
  };

  let token = store.get('gh-token');
  let coll = store.get('coll') || 'posts';
  let files = null; // { posts: [...], diary: [...] }
  let doc = null;
  let query = '';

  // ---------- small helpers ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = (d = new Date()) => {
    const o = -d.getTimezoneOffset(), a = Math.abs(o);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${o >= 0 ? '+' : '-'}${pad((a / 60) | 0)}${pad(a % 60)}`;
  };
  const dotDate = (s) => String(s || '').slice(0, 10).replaceAll('-', '.');
  const toLocalInput = (s) => String(s || '').slice(0, 16).replace(' ', 'T');
  const fromLocalInput = (v) => stamp(new Date(v));
  const slugify = (s) => s.trim().replace(/[\\/?%*:|"<>#[\]{}^~`'!.,()]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'untitled';
  const kebab = (s) => s.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const urlTitle = (name) => name.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
  const postUrl = (name) => `${SITE}/posts/${encodeURIComponent(urlTitle(name))}/`;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{
    back: '<path d="M15 18l-6-6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    heading: '<path d="M6 4v16M18 4v16M6 12h12"/>',
    bold: '<path d="M7 4h6a4 4 0 010 8H7zM7 12h7a4 4 0 010 8H7z"/>',
    quote: '<path d="M7 7h4v6H5V9a2 2 0 012-2zM15 7h4v6h-6V9a2 2 0 012-2zM5 13c0 2 1 4 3 4M13 13c0 2 1 4 3 4"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    out: '<path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
    refresh: '<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/>',
  }[name]}</svg>`;

  let toastTimer;
  const toast = (msg, ms = 2400) => {
    $toast.textContent = msg;
    $toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $toast.classList.remove('show'), ms);
  };

  // ---------- GitHub ----------
  class GhError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
  const gh = async (path, opts = {}) => {
    const res = await fetch(path.startsWith('http') ? path : `https://api.github.com${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) },
    });
    if (!res.ok) throw new GhError(res.status, (await res.json().catch(() => ({}))).message || res.statusText);
    return res.status === 204 ? null : res.json();
  };
  const contentPath = (p) => `/repos/${OWNER}/${REPO}/contents/${p.split('/').map(encodeURIComponent).join('/')}`;
  const b64 = (bytes) => {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const putFile = (path, bytes, message, sha) =>
    gh(contentPath(path), { method: 'PUT', body: JSON.stringify({ message, content: b64(bytes), branch: 'main', ...(sha ? { sha } : {}) }) });

  const loadFiles = async () => {
    const tree = (dir) => `${dir.replace(/\W/g, '')}: object(expression: "main:${dir}") { ... on Tree { entries { name oid object { ... on Blob { text } } } } }`;
    const q = `{ repository(owner: "${OWNER}", name: "${REPO}") { ${Object.values(COLLS).map((c) => tree(c.dir)).join(' ')} } }`;
    const r = await gh('/graphql', { method: 'POST', body: JSON.stringify({ query: q }) });
    if (r.errors) throw new GhError(400, r.errors[0].message);
    const out = {};
    for (const [key, c] of Object.entries(COLLS)) {
      const entries = r.data.repository[c.dir.replace(/\W/g, '')]?.entries || [];
      out[key] = entries
        .filter((e) => e.name.endsWith('.md'))
        .map((e) => ({ name: e.name, path: `${c.dir}/${e.name}`, sha: e.oid, ...parse(e.object?.text || '') }))
        .sort((a, b) => String(b.fm.date || b.name).localeCompare(String(a.fm.date || a.name)));
    }
    files = out;
  };

  // ---------- front matter ----------
  function parse(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) return { fm: {}, body: text };
    let fm = {};
    try { fm = jsyaml.load(m[1], { schema: jsyaml.CORE_SCHEMA }) || {}; } catch {}
    return { fm, body: text.slice(m[0].length).replace(/^\r?\n/, '') };
  }
  const scalar = (v) => {
    if (typeof v === 'boolean' || typeof v === 'number') return String(v);
    const s = String(v);
    const plain = /^[\p{L}\p{N} ./+_-]+$/u.test(s) && !/^[\d.+-]|^\s|\s$|^(true|false|null|yes|no|on|off|~)$/i.test(s);
    return plain ? s : JSON.stringify(s);
  };
  function serialize(fm, body) {
    const lines = [];
    const keys = [...ORDER, ...Object.keys(fm).filter((k) => !ORDER.includes(k))];
    for (const k of keys) {
      const v = fm[k];
      if (v === undefined || v === null || v === '') continue;
      if (k === 'published' && v !== false) continue;
      if (Array.isArray(v) && !v.length && k !== 'categories') continue;
      if (k === 'date') lines.push(`date: ${v}`);
      else if (Array.isArray(v) && v.every((x) => typeof x !== 'object')) lines.push(`${k}: [${v.map(scalar).join(', ')}]`);
      else if (typeof v === 'object') lines.push(jsyaml.dump({ [k]: v }, { schema: jsyaml.CORE_SCHEMA, lineWidth: -1 }).trimEnd());
      else lines.push(`${k}: ${scalar(v)}`);
    }
    return `---\n${lines.join('\n')}\n---\n\n${body.trim()}\n`;
  }

  // ---------- local drafts ----------
  const draftKey = (d) => `draft:${d.coll}:${d.name || d.id}`;
  const saveLocal = () => {
    if (!doc) return;
    store.set(draftKey(doc), { coll: doc.coll, name: doc.name, id: doc.id, base: doc.sha, title: doc.title, body: doc.body, fm: doc.fm, slug: doc.slug, at: Date.now() });
  };
  const localDrafts = (c) => store.keys().filter((k) => k.startsWith(`draft:${c}:`)).map((k) => store.get(k)).filter(Boolean);

  // ---------- routing ----------
  const go = (hash) => { if (location.hash !== hash) location.hash = hash; else route(); };
  addEventListener('hashchange', () => route());

  async function route() {
    window.scrollTo(0, 0);
    if (!token) return renderLogin();
    const [, view, c, name] = location.hash.match(/^#\/(edit|new)\/(\w+)\/(.+)$/) || [];
    if (!view) { doc = null; return renderList(); }
    if (!files) { renderLoading(); await refresh(); }
    if (!doc || doc.coll !== c || (doc.name || doc.id) !== decodeURIComponent(name)) openDoc(view, c, decodeURIComponent(name));
    renderEditor();
  }

  const refresh = async () => {
    try { await loadFiles(); } catch (e) {
      if (e.status === 401) { logout('토큰이 만료됐거나 맞지 않아요'); throw e; }
      toast(`글 목록을 못 불러왔어요: ${e.message}`, 4000);
      files = files || { posts: [], diary: [] };
    }
  };

  function openDoc(view, c, name) {
    const local = store.get(`draft:${c}:${name}`);
    if (view === 'new') {
      doc = local
        ? { coll: c, id: name, isNew: true, sha: null, title: local.title, body: local.body, fm: local.fm, slug: local.slug, restored: true }
        : { coll: c, id: name, isNew: true, sha: null, title: '', body: '', fm: { date: stamp(), categories: [], tags: c === 'diary' ? ['쿵야'] : [], mermaid: false, math: false }, slug: '' };
      return;
    }
    const f = files[c]?.find((x) => x.name === name);
    if (!f) { doc = null; toast('글을 찾지 못했어요'); return go('#/'); }
    const base = { coll: c, name, path: f.path, isNew: false, sha: f.sha, fm: { ...f.fm }, title: f.fm.title || urlTitle(name), body: f.body };
    if (local && local.at && (local.title !== base.title || local.body !== base.body || JSON.stringify(local.fm) !== JSON.stringify(base.fm))) {
      doc = { ...base, title: local.title, body: local.body, fm: local.fm, restored: true, stale: local.base !== f.sha };
    } else doc = base;
  }

  // ---------- views ----------
  function renderLoading() {
    $app.innerHTML = `<section class="screen"><div class="home-head"><div><span class="label">불러오는 중</span><h1>${esc(COLLS[coll].label)}</h1></div></div>${'<div class="skeleton"></div>'.repeat(6)}</section>`;
  }

  function renderLogin(err = '') {
    $app.innerHTML = `
      <section class="screen login">
        <div>
          <span class="label">happy-nut.github.io</span>
          <h1>오늘은<br>무엇을 쓸까요</h1>
        </div>
        <p>GitHub 토큰으로 들어가면 여기서 쓴 글이 바로 블로그에 올라갑니다.</p>
        <form id="login" style="display:grid;gap:12px">
          <input class="field" id="tok" type="password" placeholder="github_pat_…" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="GitHub 토큰">
          <p class="error" id="err">${esc(err)}</p>
          <button class="btn btn-primary" type="submit">GitHub 토큰으로 시작하기</button>
        </form>
        <p class="hint">처음이면 <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub에서 토큰 만들기 ↗</a><br>
        저장소는 <b>${REPO}</b> 하나만, 권한은 <b>Contents</b> 읽기·쓰기와 <b>Actions</b> 읽기를 주세요. 토큰은 이 기기에만 저장됩니다.</p>
      </section>`;
    $app.querySelector('#login').onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      const $err = $app.querySelector('#err');
      token = $app.querySelector('#tok').value.trim();
      if (!token) return;
      btn.disabled = true; btn.textContent = '확인하는 중…'; $err.textContent = '';
      try {
        const repo = await gh(`/repos/${OWNER}/${REPO}`);
        if (!repo.permissions?.push) throw new GhError(403, '이 토큰은 저장소에 쓸 권한이 없어요. Contents 를 Read and write 로 주세요.');
        store.set('gh-token', token);
        go('#/');
      } catch (e2) {
        token = null;
        $err.textContent = e2.status === 401 ? '토큰이 맞지 않아요. 다시 확인해 주세요.' : e2.message;
        btn.disabled = false; btn.textContent = 'GitHub 토큰으로 시작하기';
      }
    };
  }

  function logout(msg) {
    store.del('gh-token'); token = null; files = null; doc = null;
    location.hash = '';
    renderLogin(msg || '');
  }

  async function renderList() {
    if (!files) { renderLoading(); await refresh(); if (!token) return; }
    const c = COLLS[coll];
    const q = query.trim().toLowerCase();
    const drafts = localDrafts(coll).filter((d) => d.id && !d.name);
    const rows = files[coll].filter((f) => !q || `${f.fm.title} ${f.name} ${(f.fm.categories || []).join(' ')} ${(f.fm.tags || []).join(' ')}`.toLowerCase().includes(q));
    const editedNames = new Set(localDrafts(coll).filter((d) => d.name).map((d) => d.name));
    let i = 0;
    $app.innerHTML = `
      <section class="screen">
        <div class="bar"><div class="tabs" role="tablist">${Object.entries(COLLS).map(([k, v]) => `<button role="tab" data-coll="${k}" aria-selected="${k === coll}">${v.label}</button>`).join('')}</div><span class="grow"></span>
          <button class="icon-btn" id="reload" aria-label="새로 불러오기">${icon('refresh')}</button>
          <button class="icon-btn" id="logout" aria-label="로그아웃">${icon('out')}</button></div>
        <div class="home-head"><div><span class="label">${c.public ? 'happy-nut.github.io' : '비공개 · 사이트에 올라가지 않음'}</span><h1>${c.label} ${files[coll].length}${c.public ? '편' : '개'}</h1></div></div>
        <label class="search">${icon('search')}<input class="field" id="q" type="search" placeholder="제목, 카테고리, 태그" value="${esc(query)}" aria-label="검색"></label>
        <ul class="list">
          ${q ? '' : drafts.map((d) => `<li style="--i:${i++}"><button class="row" data-new="${esc(d.id)}"><span class="t">${esc(d.title || '제목 없는 글')}</span><span class="d">${dotDate(d.fm?.date)}</span><span class="m"><span class="badge local">이 기기에만 있음</span></span></button></li>`).join('')}
          ${rows.map((f) => `<li style="--i:${Math.min(i++, 20)}"><button class="row" data-name="${esc(f.name)}"><span class="t">${esc(f.fm.title || urlTitle(f.name))}</span><span class="d">${dotDate(f.fm.date)}</span>
            <span class="m">${f.fm.published === false ? '<span class="badge draft">초안</span>' : ''}${editedNames.has(f.name) ? '<span class="badge local">고친 내용 있음</span>' : ''}${esc((f.fm.categories || []).join(' · '))}</span></button></li>`).join('')}
        </ul>
        ${rows.length || drafts.length ? '' : `<p class="empty">${q ? '찾는 글이 없어요' : '아직 쓴 글이 없어요'}</p>`}
        <button class="btn btn-primary fab" id="new">${icon('plus')} 새 ${c.unit}</button>
      </section>`;
    $app.querySelectorAll('[data-coll]').forEach((b) => (b.onclick = () => { coll = b.dataset.coll; store.set('coll', coll); query = ''; renderList(); }));
    $app.querySelectorAll('[data-name]').forEach((b) => (b.onclick = () => go(`#/edit/${coll}/${encodeURIComponent(b.dataset.name)}`)));
    $app.querySelectorAll('[data-new]').forEach((b) => (b.onclick = () => go(`#/new/${coll}/${encodeURIComponent(b.dataset.new)}`)));
    $app.querySelector('#new').onclick = () => go(`#/new/${coll}/${Date.now().toString(36)}`);
    $app.querySelector('#logout').onclick = () => { if (confirm('이 기기에서 로그아웃할까요? 저장 안 된 초안은 남아 있어요.')) logout(); };
    $app.querySelector('#reload').onclick = async () => { renderLoading(); await refresh(); renderList(); };
    const $q = $app.querySelector('#q');
    $q.oninput = () => { query = $q.value; const pos = $q.selectionStart; renderList().then(() => { const n = $app.querySelector('#q'); n.focus(); n.setSelectionRange(pos, pos); }); };
    const bar = $app.querySelector('.bar');
    onscroll = () => bar.classList.toggle('scrolled', scrollY > 4);
  }

  // ---------- editor ----------
  let saveTimer;
  function renderEditor() {
    if (!doc) return;
    const c = COLLS[doc.coll];
    $app.innerHTML = `
      <section class="screen editor">
        <div class="bar">
          <button class="icon-btn" id="back" aria-label="목록으로">${icon('back')}</button>
          <span class="grow status" id="status">${doc.restored ? '이 기기에 저장된 내용을 이어서 써요' : doc.isNew ? `새 ${c.unit}` : '고친 내용은 이 기기에 바로 저장돼요'}</span>
          <button class="icon-btn" id="settings" aria-label="글 설정">${icon('sliders')}</button>
          <button class="btn btn-primary" id="publish">${c.public ? (doc.isNew ? '발행' : '업데이트') : '저장'}</button>
        </div>
        <article class="doc" id="doc">
          <div class="meta-line" id="meta"></div>
          <textarea class="title" id="title" rows="1" placeholder="제목" aria-label="제목">${esc(doc.title)}</textarea>
          <textarea class="body" id="body" placeholder="여기에 이야기를 시작하세요.&#10;&#10;마크다운을 쓸 수 있어요." aria-label="본문">${esc(doc.body)}</textarea>
        </article>
        <div class="preview" id="preview" hidden></div>
        <nav class="toolbar" id="tools" aria-label="서식">
          <button class="icon-btn" data-act="image" aria-label="사진 넣기">${icon('image')}</button>
          <button class="icon-btn" data-act="heading" aria-label="소제목">${icon('heading')}</button>
          <button class="icon-btn" data-act="bold" aria-label="굵게">${icon('bold')}</button>
          <button class="icon-btn" data-act="quote" aria-label="인용">${icon('quote')}</button>
          <button class="icon-btn" data-act="list" aria-label="목록">${icon('list')}</button>
          <button class="icon-btn" data-act="link" aria-label="링크">${icon('link')}</button>
          <button class="icon-btn" data-act="code" aria-label="코드">${icon('code')}</button>
          <span class="sep"></span>
          <button class="icon-btn" data-act="preview" aria-label="미리보기" aria-pressed="false">${icon('eye')}</button>
          <span class="count" id="count"></span>
        </nav>
        <input type="file" id="file" accept="image/*" hidden>
      </section>`;
    const $title = $app.querySelector('#title');
    const $body = $app.querySelector('#body');
    const $status = $app.querySelector('#status');
    const grow = (el) => { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; };
    const count = () => { $app.querySelector('#count').textContent = `${$body.value.replace(/\s/g, '').length.toLocaleString()}자`; };
    const changed = () => {
      doc.title = $title.value.replace(/\n/g, ' ');
      doc.body = $body.value;
      doc.dirty = true;
      count();
      $status.className = 'grow status';
      $status.textContent = '쓰는 중…';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => { saveLocal(); $status.className = 'grow status saved'; $status.textContent = '이 기기에 저장됨'; }, 600);
    };
    $title.oninput = () => { grow($title); changed(); };
    $title.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); $body.focus(); $body.setSelectionRange(0, 0); } };
    $body.oninput = () => { grow($body); changed(); };
    requestAnimationFrame(() => { grow($title); grow($body); });
    count();
    renderMeta();
    if (doc.stale) toast('블로그 쪽 글이 그 사이 바뀌었어요. 발행하면 이 기기 내용으로 덮어써요.', 5000);
    if (doc.isNew && !doc.title) setTimeout(() => $title.focus(), 350);

    $app.querySelector('#back').onclick = () => { clearTimeout(saveTimer); if (doc.dirty) saveLocal(); go('#/'); };
    $app.querySelector('#settings').onclick = () => openSettings();
    $app.querySelector('#publish').onclick = () => publish();
    $app.querySelector('#file').onchange = async (e) => {
      const f = e.target.files[0]; e.target.value = '';
      if (!f) return;
      const path = await uploadImage(f);
      if (path) insert($body, `\n![사진 설명](/${path})\n`, '사진 설명');
    };
    $app.querySelectorAll('[data-act]').forEach((b) => (b.onmousedown = (e) => e.preventDefault()));
    $app.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => act(b.dataset.act, $body, b)));
    trackKeyboard();
  }

  function renderMeta() {
    const $m = $app.querySelector('#meta');
    if (!$m) return;
    const cats = doc.fm.categories || [];
    $m.innerHTML = `<button id="metaDate">${dotDate(doc.fm.date)}</button>${cats.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}
      ${doc.coll === 'posts' && !cats.length ? '<button id="metaCat">+ 카테고리</button>' : ''}${doc.fm.published === false ? '<span class="badge draft">초안</span>' : ''}`;
    $m.querySelectorAll('button').forEach((b) => (b.onclick = () => openSettings()));
  }

  function insert(ta, text, select) {
    ta.focus();
    const s = ta.selectionStart, e = ta.selectionEnd;
    ta.setRangeText(text, s, e, 'end');
    if (select) { const at = ta.value.lastIndexOf(select, s + text.length); if (at >= s) ta.setSelectionRange(at, at + select.length); }
    ta.dispatchEvent(new Event('input'));
  }
  function wrap(ta, before, after, placeholder) {
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.slice(s, e) || placeholder;
    ta.focus();
    ta.setRangeText(before + sel + after, s, e, 'end');
    ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    ta.dispatchEvent(new Event('input'));
  }
  function prefixLine(ta, prefix) {
    const s = ta.selectionStart;
    const ls = ta.value.lastIndexOf('\n', s - 1) + 1;
    ta.focus();
    if (ta.value.startsWith(prefix, ls)) ta.setRangeText('', ls, ls + prefix.length, 'end');
    else ta.setRangeText(prefix, ls, ls, 'end');
    ta.dispatchEvent(new Event('input'));
  }
  function act(name, ta, btn) {
    if (name === 'preview') return togglePreview(btn);
    if (name === 'image') return $app.querySelector('#file').click();
    if (name === 'heading') return prefixLine(ta, '## ');
    if (name === 'quote') return prefixLine(ta, '> ');
    if (name === 'list') return prefixLine(ta, '- ');
    if (name === 'bold') return wrap(ta, '**', '**', '굵은 글씨');
    if (name === 'link') return wrap(ta, '[', '](https://)', '링크 글자');
    if (name === 'code') return ta.selectionStart !== ta.selectionEnd && !ta.value.slice(ta.selectionStart, ta.selectionEnd).includes('\n') ? wrap(ta, '`', '`', '') : wrap(ta, '\n```\n', '\n```\n', '코드');
  }

  function togglePreview(btn) {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on);
    const $doc = $app.querySelector('#doc'), $p = $app.querySelector('#preview');
    $doc.hidden = on; $p.hidden = !on;
    $app.querySelectorAll('[data-act]:not([data-act=preview])').forEach((b) => (b.disabled = on));
    if (on) {
      const html = marked.parse(doc.body.replace(/\]\(\/(assets\/[^)\s]+)/g, `](${RAW}/$1`), { breaks: false });
      $p.innerHTML = `<p class="label" style="margin:20px 0 10px">${dotDate(doc.fm.date)} · 미리보기</p><h1 class="ptitle">${esc(doc.title || '제목 없음')}</h1>${html}`;
      $p.querySelectorAll('script').forEach((s) => s.remove());
    }
    window.scrollTo(0, 0);
  }

  function trackKeyboard() {
    const vv = window.visualViewport;
    const $t = $app.querySelector('#tools');
    if (!vv || !$t) return;
    const fit = () => { const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop); $t.style.setProperty('--kb', `${-kb}px`); };
    vv.onresize = fit; vv.onscroll = fit; fit();
  }

  // ---------- images ----------
  async function shrink(file) {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) return { bytes: new Uint8Array(await file.arrayBuffer()), ext: (file.name.split('.').pop() || 'png').toLowerCase() };
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas');
    cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    const cx = cv.getContext('2d');
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
    cx.drawImage(bmp, 0, 0, cv.width, cv.height);
    const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.85));
    return { bytes: new Uint8Array(await blob.arrayBuffer()), ext: 'jpg' };
  }
  async function uploadImage(file) {
    toast('사진을 올리는 중…', 20000);
    try {
      const { bytes, ext } = await shrink(file);
      const d = new Date();
      const name = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${IMG_DIR}/${name}`;
      await putFile(path, bytes, `upload ${name} [skip ci]`);
      toast(`사진을 올렸어요 (${Math.round(bytes.length / 1024)}KB)`);
      return path;
    } catch (e) {
      toast(`사진을 못 올렸어요: ${e.message}`, 4000);
      return null;
    }
  }

  // ---------- sheets ----------
  function sheet(html, onClose) {
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    const el = document.createElement('div');
    el.className = 'sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = `<div class="grip"></div>${html}`;
    const close = () => { scrim.remove(); el.remove(); onClose?.(); };
    scrim.onclick = close;
    document.body.append(scrim, el);
    return { el, close };
  }

  function suggestions(c, key) {
    const n = new Map();
    for (const f of files?.[c] || []) for (const x of f.fm[key] || []) n.set(x, (n.get(x) || 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([x]) => x);
  }

  function chipGroup(key, label, note) {
    const sel = doc.fm[key] || [];
    const all = [...new Set([...sel, ...suggestions(doc.coll, key)])];
    const limit = key === 'tags' ? 14 : 12;
    return `<div class="group"><span class="label">${label}</span><div class="chips" data-key="${key}">
      ${all.map((x, i) => `<button type="button" data-v="${esc(x)}" aria-pressed="${sel.includes(x)}" ${i >= limit && !sel.includes(x) ? 'hidden data-extra' : ''}>${esc(x)}</button>`).join('')}
      ${all.length > limit ? '<button type="button" class="more" data-more>더 보기</button>' : ''}
      <input type="text" placeholder="+ 새로 추가" enterkeyhint="done" autocapitalize="off" aria-label="${label} 추가"></div>${note ? `<p class="note">${note}</p>` : ''}</div>`;
  }

  function openSettings(hint) {
    const posts = doc.coll === 'posts';
    const fm = doc.fm;
    const { el, close } = sheet(`
      <h2>${posts ? '글 설정' : '일기 설정'}</h2>
      ${hint ? `<p class="sub" style="color:var(--warn)">${esc(hint)}</p>` : '<p class="sub">발행할 때 함께 저장돼요.</p>'}
      ${chipGroup('categories', '카테고리', posts ? '영문 소문자로 저장돼요. 첫 번째가 대분류예요.' : '')}
      ${chipGroup('tags', '태그')}
      ${posts ? `<div class="group"><span class="label">요약</span><textarea class="field" id="desc" placeholder="검색 결과와 공유 카드에 보일 한두 문장. 비우면 본문 앞부분을 씁니다.">${esc(fm.description || '')}</textarea></div>
      <div class="group"><span class="label">대표 이미지</span><button class="cover" id="cover" type="button">${fm.image ? `<img src="${esc(RAW + '/' + String(fm.image.path || fm.image).replace(/^\//, ''))}" alt="">` : '사진 고르기'}</button>
        ${fm.image ? '<button class="danger" id="coverDel" type="button" style="color:var(--muted)">대표 이미지 빼기</button>' : ''}<input type="file" id="coverFile" accept="image/*" hidden></div>` : ''}
      ${posts && doc.isNew ? `<div class="group"><span class="label">주소</span><label class="slug"><span>/posts/</span><input id="slug" value="${esc(doc.slug)}" placeholder="${esc(slugify(doc.title || '제목'))}" autocapitalize="off" spellcheck="false"></label><p class="note">비우면 제목으로 만들어요. 발행 뒤에는 바꿀 수 없어요.</p></div>` : ''}
      <div class="group"><span class="label">날짜</span><input class="field" id="date" type="datetime-local" value="${esc(toLocalInput(fm.date))}"></div>
      <div class="group">
        ${posts ? `<div class="switch-row"><div><b>블로그에 공개</b><span>끄면 초안으로 저장만 하고 보이지 않아요</span></div><button class="switch" type="button" role="switch" data-sw="published" aria-checked="${fm.published !== false}"></button></div>` : ''}
        <div class="switch-row"><div><b>수식</b><span>$…$ 로 쓴 수식을 그려요</span></div><button class="switch" type="button" role="switch" data-sw="math" aria-checked="${!!fm.math}"></button></div>
        <div class="switch-row"><div><b>다이어그램</b><span>mermaid 코드 블록을 그림으로</span></div><button class="switch" type="button" role="switch" data-sw="mermaid" aria-checked="${!!fm.mermaid}"></button></div>
      </div>
      ${doc.isNew ? '' : `<div class="group"><button class="danger" id="del" type="button">이 ${COLLS[doc.coll].unit} 삭제</button></div>`}
      <div class="sheet-actions"><button class="btn btn-primary" id="done" type="button">완료</button></div>`, () => { saveLocal(); renderMeta(); });

    const touch = () => { doc.dirty = true; };
    el.querySelectorAll('.chips').forEach(($c) => {
      const key = $c.dataset.key;
      const norm = (v) => (posts ? kebab(v) : v.trim());
      const toggle = (v) => {
        const cur = doc.fm[key] || [];
        doc.fm[key] = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
        touch();
      };
      $c.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.hasAttribute('data-more')) { $c.querySelectorAll('[data-extra]').forEach((x) => (x.hidden = false)); b.remove(); return; }
        toggle(b.dataset.v);
        b.setAttribute('aria-pressed', (doc.fm[key] || []).includes(b.dataset.v));
      };
      const $in = $c.querySelector('input');
      const add = () => {
        const v = norm($in.value);
        $in.value = '';
        if (!v) { if (posts) toast('영문 소문자, 숫자, - 만 쓸 수 있어요'); return; }
        if (!(doc.fm[key] || []).includes(v)) toggle(v);
        let b = [...$c.querySelectorAll('button[data-v]')].find((x) => x.dataset.v === v);
        if (!b) { b = document.createElement('button'); b.type = 'button'; b.dataset.v = v; b.textContent = v; $c.insertBefore(b, $c.querySelector('[data-more]') || $in); }
        b.hidden = false; b.setAttribute('aria-pressed', 'true');
      };
      $in.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } };
      $in.onblur = () => $in.value.trim() && add();
    });
    el.querySelectorAll('[data-sw]').forEach((s) => (s.onclick = () => {
      const k = s.dataset.sw, on = s.getAttribute('aria-checked') !== 'true';
      s.setAttribute('aria-checked', on);
      if (k === 'published') { if (on) delete doc.fm.published; else doc.fm.published = false; } else doc.fm[k] = on;
      touch();
    }));
    const $desc = el.querySelector('#desc');
    if ($desc) $desc.oninput = () => { doc.fm.description = $desc.value.trim(); touch(); };
    const $slug = el.querySelector('#slug');
    if ($slug) $slug.oninput = () => { doc.slug = $slug.value; touch(); };
    el.querySelector('#date').onchange = (e) => { if (e.target.value) { doc.fm.date = fromLocalInput(e.target.value); touch(); } };
    const $cover = el.querySelector('#cover');
    if ($cover) {
      const $cf = el.querySelector('#coverFile');
      $cover.onclick = () => $cf.click();
      $cf.onchange = async () => {
        const f = $cf.files[0]; if (!f) return;
        $cover.textContent = '올리는 중…';
        const path = await uploadImage(f);
        if (path) { doc.fm.image = `/${path}`; touch(); $cover.innerHTML = `<img src="${URL.createObjectURL(f)}" alt="">`; } else $cover.textContent = '사진 고르기';
      };
      const $cd = el.querySelector('#coverDel');
      if ($cd) $cd.onclick = () => { delete doc.fm.image; touch(); $cover.textContent = '사진 고르기'; $cd.remove(); };
    }
    const $del = el.querySelector('#del');
    if ($del) $del.onclick = async () => {
      if (!confirm(`「${doc.title}」을(를) 삭제할까요? 블로그에서도 사라져요.`)) return;
      try {
        await gh(contentPath(doc.path), { method: 'DELETE', body: JSON.stringify({ message: `delete ${doc.name}`, sha: doc.sha, branch: 'main' }) });
        store.del(draftKey(doc));
        files[doc.coll] = files[doc.coll].filter((f) => f.name !== doc.name);
        doc = null; close(); toast('삭제했어요'); go('#/');
      } catch (e) { toast(`삭제하지 못했어요: ${e.message}`, 4000); }
    };
    el.querySelector('#done').onclick = close;
  }

  // ---------- publish ----------
  async function publish() {
    clearTimeout(saveTimer);
    const c = COLLS[doc.coll];
    if (!doc.title.trim()) { toast('제목을 먼저 써 주세요'); return $app.querySelector('#title').focus(); }
    if (!doc.body.trim()) { toast('본문이 비어 있어요'); return $app.querySelector('#body').focus(); }
    if (doc.coll === 'posts' && !(doc.fm.categories || []).length) return openSettings('카테고리를 하나 이상 골라 주세요.');
    saveLocal();
    doc.fm.title = doc.title.trim();
    let name = doc.name;
    if (doc.isNew) {
      const base = `${String(doc.fm.date).slice(0, 10)}-${doc.coll === 'posts' && doc.slug.trim() ? slugify(doc.slug) : slugify(doc.title).replace(/^untitled$/, 'post')}`;
      const taken = new Set(files[doc.coll].map((f) => f.name));
      name = `${base}.md`;
      for (let n = 2; taken.has(name); n++) name = `${base}-${n}.md`;
    }
    const path = `${c.dir}/${name}`;
    const draft = doc.fm.published === false;
    const steps = c.public ? ['GitHub에 저장', '블로그 빌드·배포', draft ? '초안으로 보관됨' : '블로그에 올라감'] : ['GitHub에 저장'];
    const { el, close } = sheet(`<h2>${c.public ? (draft ? '초안 저장' : doc.isNew ? '발행하는 중' : '업데이트하는 중') : '일기 저장'}</h2>
      <p class="sub">${esc(doc.title)}</p><ol class="steps">${steps.map((s) => `<li><span class="dot"></span>${s}</li>`).join('')}</ol>
      <p class="sub" id="pmsg"></p><div class="sheet-actions" id="pact" hidden></div>`);
    const $li = el.querySelectorAll('.steps li');
    const mark = (i, state) => { $li[i].className = state; $li[i].querySelector('.dot').innerHTML = state === 'done' ? icon('check') : ''; };
    const finish = (msg, actions) => {
      el.querySelector('#pmsg').textContent = msg;
      const $a = el.querySelector('#pact');
      $a.hidden = false;
      $a.innerHTML = actions.map((a, i) => (a.href ? `<a class="btn ${i ? 'btn-ghost' : 'btn-primary'}" href="${a.href}" target="_blank" rel="noopener">${a.label}</a>` : `<button class="btn ${i ? 'btn-ghost' : 'btn-primary'}" data-i="${i}">${a.label}</button>`)).join('');
      $a.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => actions[b.dataset.i].run()));
    };

    mark(0, 'active');
    let commit;
    try {
      const text = serialize(doc.fm, doc.body);
      const r = await putFile(path, new TextEncoder().encode(text), doc.isNew ? `new ${doc.coll === 'posts' ? 'post' : 'diary'}` : `update ${name}`, doc.isNew ? undefined : doc.sha);
      commit = r.commit.sha;
      store.del(draftKey(doc));
      const entry = { name, path, sha: r.content.sha, ...parse(text) };
      files[doc.coll] = [entry, ...files[doc.coll].filter((f) => f.name !== name)].sort((a, b) => String(b.fm.date).localeCompare(String(a.fm.date)));
      Object.assign(doc, { isNew: false, name, path, sha: r.content.sha, dirty: false, restored: false, stale: false });
      history.replaceState(null, '', `#/edit/${doc.coll}/${encodeURIComponent(name)}`);
      mark(0, 'done');
    } catch (e) {
      mark(0, 'fail');
      const msg = e.status === 409 || e.status === 422 ? '블로그 쪽 글이 그 사이 바뀌었어요. 목록을 새로 불러온 뒤 다시 해 주세요. 쓴 내용은 이 기기에 남아 있어요.' : `저장하지 못했어요: ${e.message}. 쓴 내용은 이 기기에 남아 있어요.`;
      return finish(msg, [{ label: '닫기', run: close }]);
    }
    renderEditor();
    if (!c.public) return finish('사이트에는 올라가지 않아요.', [{ label: '목록으로', run: () => { close(); go('#/'); } }, { label: '계속 쓰기', run: close }]);

    mark(1, 'active');
    const until = Date.now() + 8 * 60 * 1000;
    let run = null;
    while (Date.now() < until) {
      await sleep(run ? 5000 : 3000);
      try {
        const r = await gh(`/repos/${OWNER}/${REPO}/actions/runs?head_sha=${commit}&per_page=5`);
        run = r.workflow_runs.find((w) => /pages|deploy/i.test(`${w.name} ${w.path}`)) || r.workflow_runs[0] || null;
      } catch (e) {
        if (e.status === 403 || e.status === 404) { mark(1, 'done'); return finish('배포 상태를 볼 권한이 없어 확인은 못 했어요. 보통 1~2분 뒤 올라가요.', [{ label: '글 보기', href: postUrl(name) }, { label: '닫기', run: close }]); }
      }
      if (run?.status === 'completed') break;
    }
    if (run?.status !== 'completed') { mark(1, 'fail'); return finish('배포가 오래 걸려요. 잠시 뒤 블로그에서 확인해 주세요.', [{ label: '배포 보기', href: run?.html_url || `https://github.com/${OWNER}/${REPO}/actions` }, { label: '닫기', run: close }]); }
    if (run.conclusion !== 'success') { mark(1, 'fail'); return finish('배포가 실패했어요. 글은 저장돼 있어요.', [{ label: '실패 이유 보기', href: run.html_url }, { label: '닫기', run: close }]); }
    mark(1, 'done'); mark(2, 'done');
    el.querySelector('h2').textContent = draft ? '초안을 저장했어요' : '블로그에 올라갔어요';
    if (navigator.vibrate) navigator.vibrate(30);
    finish(draft ? '블로그에는 보이지 않아요. 공개로 바꾸고 다시 발행하면 올라가요.' : '1분쯤 지나면 모든 곳에서 새 글이 보여요.',
      draft ? [{ label: '목록으로', run: () => { close(); go('#/'); } }, { label: '닫기', run: close }] : [{ label: '글 보기', href: postUrl(name) }, { label: '목록으로', run: () => { close(); go('#/'); } }]);
  }

  route();
})();
