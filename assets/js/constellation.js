// Ambient "connecting the dots" background: drifting nodes, edges between near neighbours,
// and a few links to the pointer. Sits behind content; colors follow the site theme.
(() => {
  const LINK = 140; // px: nodes closer than this get an edge
  const REACH = 180; // px: pointer pulls and links nodes within this radius
  const SPEED = 0.18; // px per frame
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (matchMedia('(max-width: 767.98px), (hover: none)').matches) return; // phones: hidden in CSS, so skip the work too

  const canvas = document.createElement('canvas');
  canvas.id = 'constellation';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w = 0, h = 0, nodes = [], rgb = '25,25,24';
  const pointer = { x: -1e4, y: -1e4 };

  const readColor = () => {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--heading-color').trim();
    const probe = document.createElement('i');
    probe.style.color = c || '#191918';
    document.body.append(probe);
    rgb = getComputedStyle(probe).color.match(/\d+/g).slice(0, 3).join(',');
    probe.remove();
  };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.round((w * h) / 15000));
    while (nodes.length < count) {
      const a = Math.random() * Math.PI * 2;
      nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a) * SPEED, vy: Math.sin(a) * SPEED, r: 0.8 + Math.random() * 1.2 });
    }
    nodes.length = count;
  };

  const step = () => {
    for (const n of nodes) {
      const dx = pointer.x - n.x, dy = pointer.y - n.y, d = Math.hypot(dx, dy);
      if (d < REACH && d > 1) {
        n.x += (dx / d) * 0.25;
        n.y += (dy / d) * 0.25;
      }
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 0.8;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${rgb},${(1 - d / LINK) * 0.22})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
      if (pd < REACH) {
        ctx.strokeStyle = `rgba(${rgb},${(1 - pd / REACH) * 0.35})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(${rgb},0.45)`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const loop = () => {
    step();
    draw();
    requestAnimationFrame(loop);
  };

  readColor();
  resize();
  addEventListener('resize', resize);
  new MutationObserver(readColor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColor);

  if (reduce) {
    draw();
    return;
  }

  if (matchMedia('(hover: hover)').matches) {
    addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1e4; });
  }
  requestAnimationFrame(loop);
})();
