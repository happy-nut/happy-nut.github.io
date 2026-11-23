// When this browser is signed in to the writing app (/admin, same origin), show a small shortcut
// back to it: "이 글 고치기" on a post, "글쓰기" everywhere else. Visitors never see it.
(() => {
  let signedIn = false;
  try {
    signedIn = !!(localStorage.getItem('gh-token') || localStorage.getItem('gh-refresh'));
  } catch {}
  if (!signedIn) return;

  const path = document.querySelector('meta[name="post-path"]')?.content || '';
  const onPost = path.startsWith('_posts/');
  const a = document.createElement('a');
  a.className = 'write-bar';
  a.href = onPost ? `/admin/#/edit/posts/${encodeURIComponent(path.slice('_posts/'.length))}` : '/admin/';
  a.innerHTML = `<i class="fas ${onPost ? 'fa-pen' : 'fa-pen-nib'}" aria-hidden="true"></i><span>${onPost ? '이 글 고치기' : '글쓰기'}</span>`;
  document.body.append(a);
})();
