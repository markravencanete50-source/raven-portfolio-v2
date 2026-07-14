import { useEffect, useRef } from "react";

/**
 * Site-wide ambient "neural circuit" background:
 *  - canvas particle network (drifting nodes linked by faint lines, extra
 *    links form near the cursor)
 *  - faint blueprint grid + slow-drifting glow orbs (pure CSS, see index.css)
 *
 * Design constraints: GPU/canvas only, capped node count, paused while the
 * tab is hidden, and fully static under prefers-reduced-motion.
 */
export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Resolve theme colors, falling back if the browser can't parse oklch on canvas.
    const resolve = (color: string, fallback: string) => {
      ctx.fillStyle = "#000";
      ctx.fillStyle = color;
      return ctx.fillStyle === "#000000" ? fallback : color;
    };
    const PRIMARY = resolve("oklch(0.72 0.18 195)", "#2dd4bf");
    const GOLD = resolve("oklch(0.80 0.14 80)", "#e0b64d");

    const LINK = 130;
    const CURSOR_LINK = 190;
    let w = 0;
    let h = 0;
    let raf = 0;

    type Node = { x: number; y: number; vx: number; vy: number; r: number; gold: boolean };
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999 };

    const seed = () => {
      const count = Math.min(80, Math.max(20, Math.round((w * h) / 26000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1 + Math.random() * 1.4,
        gold: i % 7 === 0,
      }));
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length === 0) seed();
      else nodes.forEach((n) => { n.x = Math.min(n.x, w); n.y = Math.min(n.y, h); });
      draw(); // paint immediately — resizing clears the canvas, and rAF may lag (or never fire in hidden tabs)
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -24) n.x = w + 24; else if (n.x > w + 24) n.x = -24;
        if (n.y < -24) n.y = h + 24; else if (n.y > h + 24) n.y = -24;
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          ctx.globalAlpha = (1 - Math.sqrt(d2) / LINK) * 0.16;
          ctx.strokeStyle = PRIMARY;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        // Cursor becomes a temporary hub node.
        const dx = a.x - mouse.x;
        const dy = a.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CURSOR_LINK * CURSOR_LINK) {
          ctx.globalAlpha = (1 - Math.sqrt(d2) / CURSOR_LINK) * 0.3;
          ctx.strokeStyle = a.gold ? GOLD : PRIMARY;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        ctx.globalAlpha = n.gold ? 0.5 : 0.45;
        ctx.fillStyle = n.gold ? GOLD : PRIMARY;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      if (!document.hidden) draw();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    resize(); // also paints the first frame; under reduced motion it stays static
    window.addEventListener("resize", resize);
    if (!reduced) {
      window.addEventListener("mousemove", onMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="ambient-bg">
      <div className="ambient-grid" />
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
