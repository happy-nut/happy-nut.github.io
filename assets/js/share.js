// Share at the end of the post, where a reader decides to pass it on.
// Phones get one button that opens the OS share sheet (KakaoTalk, messages, ...);
// desktops get "copy link" plus the social links the theme renders from _data/share.yml.
(() => {
  const header = document.querySelector('article header');
  if (!header) return;

  const url = document.querySelector('link[rel="canonical"]')?.href || location.href.split('#')[0];
  const title = header.querySelector('h1')?.textContent.trim() || document.title;
  const native = !!navigator.share && matchMedia('(hover: none), (pointer: coarse)').matches;
  const socials = [...document.querySelectorAll('.share-wrapper .share-icons a[href]')];

  const share = () => navigator.share({ title, url }).catch(() => {});

  const copy = async (btn) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // older browsers, or clipboard permission refused: copy through a hidden field
      const t = Object.assign(document.createElement('textarea'), { value: url });
      t.style.cssText = 'position:fixed;opacity:0';
      document.body.append(t);
      t.select();
      const ok = document.execCommand('copy');
      t.remove();
      if (!ok) return;
    }
    const label = btn.querySelector('span');
    const was = label.textContent;
    btn.classList.add('done');
    label.textContent = '복사했어요';
    setTimeout(() => {
      btn.classList.remove('done');
      label.textContent = was;
    }, 1600);
  };

  const bar = (where) => {
    const el = document.createElement('div');
    el.className = `share-bar share-bar--${where}`;
    if (native) {
      el.innerHTML = '<button type="button" class="share-native"><i class="fa-solid fa-arrow-up-from-bracket"></i><span>공유하기</span></button>';
      el.querySelector('button').onclick = share;
    } else {
      el.innerHTML = `<button type="button" class="share-copy"><i class="fas fa-link"></i><span>링크 복사</span></button>${socials
        .map((a) => `<a href="${a.href}" target="_blank" rel="noopener" aria-label="${a.getAttribute('aria-label') || ''}">${a.innerHTML}</a>`)
        .join('')}`;
      el.querySelector('.share-copy').onclick = (e) => copy(e.currentTarget);
    }
    return el;
  };

  // replace the theme's small icon row
  const tail = document.querySelector('.post-tail-bottom .share-wrapper');
  if (tail) tail.replaceWith(bar('end'));
})();
