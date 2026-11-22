// GitHub 로그인 중계 (AWS Lambda, Function URL). 글쓰기 앱(/admin)의 「GitHub로 계속하기」가 여기로 온다.
// GitHub 은 브라우저에서 로그인 코드를 토큰으로 바꿔 주지 않으므로(CORS 막힘, client secret 필요) 이 함수가 대신 바꾼다.
//   /setup        GitHub App manifest 를 GitHub 에 보낸다 (앱이 이미 있으면 거절)
//   /setup/done   GitHub 이 돌려준 코드로 앱 키를 받아 SSM 에 보관한다. 키는 사람 눈을 거치지 않는다.
//   /login        GitHub 로그인 화면으로 보낸다
//   /callback     코드를 토큰으로 바꿔 글쓰기 앱으로 돌려보낸다 (#gh=<token>)
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { SSMClient, GetParameterCommand, PutParameterCommand } from '@aws-sdk/client-ssm';

const PARAM = '/blog-auth/github-app';
const RETURN_ORIGINS = ['https://happy-nut.github.io', 'http://127.0.0.1:4100', 'http://localhost:4000'];
const ssm = new SSMClient({});
let cached = null;

const html = (status, body) => ({ statusCode: status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }, body: `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:16px/1.6 system-ui;max-width:32rem;margin:15vh auto;padding:0 20px">${body}</body>` });
const redirect = (to) => ({ statusCode: 302, headers: { Location: to, 'Cache-Control': 'no-store' } });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

async function app() {
  if (cached) return cached;
  try {
    const r = await ssm.send(new GetParameterCommand({ Name: PARAM, WithDecryption: true }));
    return (cached = JSON.parse(r.Parameter.Value));
  } catch (e) {
    if (e.name === 'ParameterNotFound') return null;
    throw e;
  }
}

const sign = (key, data) => createHmac('sha256', key).update(data).digest('base64url');
const pack = (key, obj) => { const d = Buffer.from(JSON.stringify(obj)).toString('base64url'); return `${d}.${sign(key, d)}`; };
const unpack = (key, s) => {
  const [d, mac] = String(s || '').split('.');
  if (!d || !mac) return null;
  const a = Buffer.from(sign(key, d)), b = Buffer.from(mac);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const obj = JSON.parse(Buffer.from(d, 'base64url').toString());
  return obj.exp > Date.now() ? obj : null;
};
const safeReturn = (r) => {
  try { const u = new URL(r); return RETURN_ORIGINS.includes(u.origin) && u.pathname.startsWith('/admin') ? `${u.origin}${u.pathname}` : null; } catch { return null; }
};

export const handler = async (event) => {
  const self = `https://${event.requestContext.domainName}`;
  const path = event.rawPath;
  const q = event.queryStringParameters || {};

  if (path === '/setup') {
    if (await app()) return html(409, '이미 설정돼 있어요.');
    const manifest = {
      name: 'happynut-blog-writer',
      url: 'https://happy-nut.github.io/admin/',
      redirect_url: `${self}/setup/done`,
      callback_urls: [`${self}/callback`],
      public: false,
      request_oauth_on_install: false,
      hook_attributes: { url: `${self}/hook`, active: false },
      default_permissions: { contents: 'write', actions: 'read', metadata: 'read' },
    };
    return html(200, `<p>GitHub 앱을 만드는 중…</p><form id="f" method="post" action="https://github.com/settings/apps/new"><input type="hidden" name="manifest" value="${esc(JSON.stringify(manifest))}"><button>GitHub 앱 만들기</button></form><script>document.getElementById('f').submit()</script>`);
  }

  if (path === '/setup/done') {
    if (await app()) return html(409, '이미 설정돼 있어요.');
    const r = await fetch(`https://api.github.com/app-manifests/${encodeURIComponent(q.code || '')}/conversions`, { method: 'POST', headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) return html(400, `GitHub 앱 키를 받지 못했어요 (${r.status}).`);
    const a = await r.json();
    const value = { id: a.id, slug: a.slug, client_id: a.client_id, client_secret: a.client_secret, state_key: randomBytes(32).toString('base64url') };
    await ssm.send(new PutParameterCommand({ Name: PARAM, Type: 'SecureString', Value: JSON.stringify(value), Overwrite: false }));
    cached = value;
    return html(200, `<p>GitHub 앱 <b>${esc(a.slug)}</b> 을 만들었어요. 키는 서버에만 보관했어요.</p><p><a href="https://github.com/apps/${esc(a.slug)}/installations/new">이제 블로그 저장소에 설치하기 →</a></p>`);
  }

  if (path === '/login') {
    const a = await app();
    const ret = safeReturn(q.return);
    if (!a || !ret) return html(400, '로그인을 시작할 수 없어요.');
    const state = pack(a.state_key, { ret, exp: Date.now() + 10 * 60 * 1000, n: randomBytes(8).toString('hex') });
    return redirect(`https://github.com/login/oauth/authorize?client_id=${a.client_id}&redirect_uri=${encodeURIComponent(`${self}/callback`)}&state=${encodeURIComponent(state)}`);
  }

  if (path === '/callback') {
    const a = await app();
    const st = a && unpack(a.state_key, q.state);
    if (!st) return html(400, '로그인 요청이 만료됐어요. 글쓰기 화면에서 다시 시도해 주세요.');
    if (q.error) return redirect(`${st.ret}#gh_error=${encodeURIComponent(q.error_description || q.error)}`);
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: a.client_id, client_secret: a.client_secret, code: q.code, redirect_uri: `${self}/callback` }),
    });
    const t = await r.json();
    if (!t.access_token) return redirect(`${st.ret}#gh_error=${encodeURIComponent(t.error_description || 'token exchange failed')}`);
    const frag = new URLSearchParams({ gh: t.access_token, ...(t.refresh_token ? { rt: t.refresh_token, exp: String(Date.now() + (t.expires_in || 0) * 1000) } : {}) });
    return redirect(`${st.ret}#${frag}`);
  }

  if (path === '/refresh' && event.requestContext.http.method === 'POST') {
    const a = await app();
    const cors = { 'Content-Type': 'application/json' }; // CORS 머리는 Function URL 설정이 붙인다 (deploy.sh)
    const { refresh_token } = JSON.parse(event.body || '{}');
    if (!a || !refresh_token) return { statusCode: 400, headers: cors, body: '{}' };
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: a.client_id, client_secret: a.client_secret, grant_type: 'refresh_token', refresh_token }),
    });
    const t = await r.json();
    if (!t.access_token) return { statusCode: 401, headers: cors, body: JSON.stringify({ error: t.error || 'refresh failed' }) };
    return { statusCode: 200, headers: cors, body: JSON.stringify({ gh: t.access_token, rt: t.refresh_token, exp: Date.now() + (t.expires_in || 0) * 1000 }) };
  }

  return html(404, '없는 주소예요.');
};
