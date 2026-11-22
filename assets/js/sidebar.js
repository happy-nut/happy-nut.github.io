// Sidebar motion: a highlight that glides to the hovered nav item and settles back on the
// current page, a soft light that follows the pointer, and a small Seoul clock.
(() => {
  const sidebar = document.getElementById('sidebar');
  const list = sidebar?.querySelector('nav ul.nav');
  if (!list) return;

  // Play the entrance only on the first page of a visit; later pages keep the sidebar still.
  try {
    if (!sessionStorage.getItem('sb-seen')) {
      sidebar.classList.add('sb-enter');
      sessionStorage.setItem('sb-seen', '1');
    }
  } catch {}

  const glide = document.createElement('span');
  glide.className = 'nav-glide';
  glide.setAttribute('aria-hidden', 'true');
  list.prepend(glide);

  const active = () => list.querySelector('li.nav-item.active');
  const moveTo = (li) => {
    if (!li) {
      glide.style.opacity = '0';
      return;
    }
    glide.style.opacity = '1';
    glide.style.transform = `translateY(${li.offsetTop}px)`;
    glide.style.height = `${li.offsetHeight}px`;
  };

  const settle = () => moveTo(active());
  settle();
  requestAnimationFrame(() => sidebar.classList.add('glide-ready')); // no slide on first paint

  list.querySelectorAll('li.nav-item').forEach((li) => {
    li.addEventListener('pointerenter', () => moveTo(li));
    li.addEventListener('focusin', () => moveTo(li));
  });
  list.addEventListener('pointerleave', settle);
  list.addEventListener('focusout', (e) => {
    if (!list.contains(e.relatedTarget)) settle();
  });
  addEventListener('resize', settle);
  document.fonts?.ready.then(settle);

  if (matchMedia('(hover: hover)').matches) {
    sidebar.addEventListener('pointermove', (e) => {
      const r = sidebar.getBoundingClientRect();
      sidebar.style.setProperty('--mx', `${e.clientX - r.left}px`);
      sidebar.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  const bottom = sidebar.querySelector('.sidebar-bottom');
  if (bottom) {
    const now = document.createElement('p');
    now.className = 'sidebar-now';
    now.setAttribute('aria-label', '서울 현재 시각');
    bottom.before(now);
    const fmt = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const tick = () => {
      const [h, m] = fmt.format(new Date()).split(':');
      now.innerHTML = `<span class="now-dot"></span>Seoul <b>${h}<i>:</i>${m}</b>`;
    };
    tick();
    setInterval(tick, 15000);
  }
})();
