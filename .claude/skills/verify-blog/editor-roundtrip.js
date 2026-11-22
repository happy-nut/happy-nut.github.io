// Paste into drive.mjs --eval on /admin/ after fake-github.sh: loads every post into the editor and back,
// and lists the ones whose rendered HTML changes. Those open in raw markdown mode in the app.
(async () => {
  await new Promise((r) => { const s = document.createElement('script'); s.src = '/admin/lib/editor.js'; s.onload = r; document.head.append(s); });
  const files = await (await fetch('/__fixture.json')).json();
  const div = document.createElement('div'); document.body.append(div);
  const ed = WriteEditor.create(div, '');
  const norm = (md) => { const d = document.createElement('div'); d.innerHTML = marked.parse(md || ''); return d.innerHTML.replace(/(<img[^>]*>)\s+(<em>)/g, '$1$2').replace(/\s+/g, ' ').replace(/\s*(<\/?(p|li|ul|ol|h\d|blockquote|tr|td|th|thead|tbody|table)\b[^>]*>)\s*/g, '$1').trim(); };
  const out = [];
  for (const [p, t] of Object.entries(files)) {
    const body = t.replace(/^---[\s\S]*?\n---\n?/, '');
    const rt = ed.roundtrip(body).replace(/(!\[[^\]\n]*\]\([^)\s]*\))[ \t]*(\*[^*\n]+\*|_[^_\n]+_)/g, '$1\n$2');
    const a = norm(body), b = norm(rt);
    if (a !== b) { let i = 0; while (a[i] === b[i]) i++; out.push(`${p}\n  - ${a.slice(Math.max(0, i - 60), i + 80)}\n  + ${b.slice(Math.max(0, i - 60), i + 80)}`); }
  }
  return `${Object.keys(files).length - out.length}/${Object.keys(files).length} same\n` + out.join('\n');
})()
