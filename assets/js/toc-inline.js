// Below the width where the side panel shows the table of contents, list the sections inline
// at the top of the post instead of behind the theme's "Contents" popup.
(() => {
  const content = document.querySelector('article .content');
  const heads = content ? [...content.querySelectorAll('h2[id], h3[id]')] : [];
  if (heads.length < 2) return;

  const nav = document.createElement('nav');
  nav.className = 'toc-inline';
  nav.setAttribute('aria-label', '목차');
  nav.innerHTML = `<details open><summary><span>Contents</span><span class="n">${heads.length}</span></summary><ol>${heads
    .map((h) => `<li class="${h.tagName.toLowerCase()}"><a href="#${encodeURIComponent(h.id)}">${h.textContent.replace(/#\s*$/, '').trim()}</a></li>`)
    .join('')}</ol></details>`;
  content.before(nav);
})();
