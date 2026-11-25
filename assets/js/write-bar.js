// When this browser is signed in to the writing app (/admin, same origin), the existing pen
// links (sidebar icon, footer) open the editor for the post being read, and a "고치기" button
// sits in the top bar, level with the breadcrumb. Visitors see the plain links only.
(() => {
  let signedIn = false;
  try {
    signedIn = !!(localStorage.getItem('gh-token') || localStorage.getItem('gh-refresh'));
  } catch {}
  if (!signedIn) return;

  const path = document.querySelector('meta[name="post-path"]')?.content || '';
  if (!path.startsWith('_posts/')) return;
  const edit = `/admin/#/edit/posts/${encodeURIComponent(path.slice('_posts/'.length))}`;

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href="/admin/"]').forEach((a) => {
      a.href = edit;
      a.setAttribute('aria-label', '이 글 고치기');
      a.title = '이 글 고치기';
      const label = a.querySelector('.footer-write-label');
      if (label) label.textContent = '이 글 고치기';
    });

    document.getElementById('search-trigger')?.insertAdjacentHTML('beforebegin',
      `<a class="topbar-edit" href="${edit}" aria-label="이 글 고치기"><i class="fas fa-pen"></i><span>고치기</span></a>`);
  });
})();
