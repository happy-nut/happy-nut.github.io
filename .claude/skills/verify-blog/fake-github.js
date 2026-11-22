// Paste into drive.mjs --eval on /admin/ before logging in. Replaces fetch to api.github.com with an
// in-memory repo seeded from /__fixture.json (see fake-github.sh). Writes land in window.__fake.files;
// window.__fake.log lists every call. Actions runs report in_progress once, then success.
(async () => {
  const seed = await (await fetch('/__fixture.json')).json();
  const files = new Map(Object.entries(seed));
  const log = [];
  let n = 0, polls = 0;
  const sha = () => `fake${(++n).toString(16).padStart(8, '0')}`;
  const shas = new Map([...files.keys()].map((p) => [p, sha()]));
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const real = window.fetch.bind(window);
  window.__fake = { files, log, shas };
  window.fetch = async (input, init = {}) => {
    const url = String(input?.url || input);
    if (!url.startsWith('https://api.github.com')) return real(input, init);
    const u = new URL(url), method = (init.method || 'GET').toUpperCase(), path = decodeURIComponent(u.pathname);
    log.push(`${method} ${path}${u.search}`);
    if (!/^Bearer \S+/.test(init.headers?.Authorization || '')) return json({ message: 'Bad credentials' }, 401);
    if (path === '/repos/happy-nut/happy-nut.github.io') return json({ permissions: { push: true } });
    if (path === '/graphql') {
      const repo = {};
      for (const dir of ['_posts', 'koongya']) repo[dir.replace(/\W/g, '')] = { entries: [...files].filter(([p]) => p.startsWith(dir + '/') && !p.slice(dir.length + 1).includes('/')).map(([p, text]) => ({ name: p.slice(dir.length + 1), oid: shas.get(p), object: { text } })) };
      return json({ data: { repository: repo } });
    }
    const m = path.match(/^\/repos\/happy-nut\/happy-nut\.github\.io\/contents\/(.+)$/);
    if (m) {
      const p = m[1], body = JSON.parse(init.body || '{}');
      if (method === 'PUT') {
        if (files.has(p) && body.sha !== shas.get(p)) return json({ message: 'sha mismatch' }, 409);
        const bytes = Uint8Array.from(atob(body.content), (c) => c.charCodeAt(0));
        files.set(p, /\.(md|ya?ml)$/.test(p) ? new TextDecoder().decode(bytes) : `<${bytes.length} bytes>`);
        shas.set(p, sha());
        log.push(`  message: ${body.message}`);
        return json({ commit: { sha: sha() }, content: { sha: shas.get(p) } }, 201);
      }
      if (method === 'DELETE') { files.delete(p); return json({ commit: { sha: sha() } }); }
    }
    if (path.endsWith('/actions/runs')) {
      polls++;
      return json({ workflow_runs: [{ name: 'Build and Deploy', path: '.github/workflows/pages-deploy.yml', status: polls > 1 ? 'completed' : 'in_progress', conclusion: polls > 1 ? 'success' : null, html_url: 'https://github.com/happy-nut/happy-nut.github.io/actions' }] });
    }
    return json({ message: `fake-github: no route for ${method} ${path}` }, 404);
  };
  return files.size;
})()
