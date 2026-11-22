// Sidebar motion: a thin line that glides to the hovered nav item and settles back on the
// current page.
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
})();
