// Paste into drive.mjs --eval on /admin/: copies the repo fixture into OPFS and makes the
// "로컬 저장소로 작업" button open it, so Sveltia CMS runs headless without a GitHub token.
(async () => {
  const files = await (await fetch('/__fixture.json')).json();
  const root = await navigator.storage.getDirectory();
  try { await root.removeEntry('happy-nut.github.io', { recursive: true }); } catch {}
  const repo = await root.getDirectoryHandle('happy-nut.github.io', { create: true });
  for (const [p, text] of Object.entries(files)) {
    let dir = repo; const parts = p.split('/');
    for (const d of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(d, { create: true });
    const w = await (await dir.getFileHandle(parts.at(-1), { create: true })).createWritable();
    await w.write(text); await w.close();
  }
  const git = await repo.getDirectoryHandle('.git', { create: true });
  const w = await (await git.getFileHandle('config', { create: true })).createWritable();
  await w.write('[remote "origin"]\n\turl = https://github.com/happy-nut/happy-nut.github.io.git\n'); await w.close();
  window.showDirectoryPicker = async () => repo;
  return Object.keys(files).length;
})()
