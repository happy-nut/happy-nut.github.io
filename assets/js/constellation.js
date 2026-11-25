// Ambient "connecting the dots" background: drifting nodes and edges between near neighbours.
// Nodes scatter away from the pointer and drift back to their own pace once it passes.
// Sits behind content; colors follow the site theme.
(() => {
  const LINK = 140; // px: nodes closer than this get an edge
  const REACH = 160; // px: nodes inside this radius flee the pointer
  const PUSH = 0.9; // px per frame of extra speed, at the pointer itself
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
      nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a) * SPEED, vy: Math.sin(a) * SPEED, bx: Math.cos(a) * SPEED, by: Math.sin(a) * SPEED, r: 0.8 + Math.random() * 1.2 });
    }
    nodes.length = count;
  };

  const step = () => {
    for (const n of nodes) {
      const dx = n.x - pointer.x, dy = n.y - pointer.y, d = Math.hypot(dx, dy);
      if (d < REACH && d > 1) {
        const f = PUSH * (1 - d / REACH) ** 2;
        n.vx += (dx / d) * f;
        n.vy += (dy / d) * f;
      }
      n.vx += (n.bx - n.vx) * 0.05; // ease back to its own drift
      n.vy += (n.by - n.vy) * 0.05;
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
