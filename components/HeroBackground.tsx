'use client';

import { useEffect, useRef } from 'react';

const BG = '#0a1628';
const COLOR_A = '#1D9E75';
const COLOR_B = '#185FA5';
const COLOR_C = '#5DCAA5';

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: {
      x: number; y: number; vx: number; vy: number;
      r: number; color: string; alpha: number;
    }[] = [];
    let W: number, H: number;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = canvas!.width = canvas!.offsetWidth * dpr;
      H = canvas!.height = canvas!.offsetHeight * dpr;
      init();
    }

    function init() {
      const count = Math.floor((W * H) / 18000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        color: [COLOR_A, COLOR_B, COLOR_C][Math.floor(Math.random() * 3)],
        alpha: Math.random() * 0.5 + 0.4,
      }));
    }

    function draw() {
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, W, H);

      const CONNECT = W * 0.18;
      const MOUSE_ATTRACT = W * 0.12;
      const dpr = window.devicePixelRatio || 1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < MOUSE_ATTRACT && md > 0) {
          p.vx += (dx / md) * 0.015;
          p.vy += (dy / md) * 0.015;
        }

        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.alpha;
        ctx!.fill();
        ctx!.globalAlpha = 1;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ex = p.x - q.x;
          const ey = p.y - q.y;
          const dist = Math.sqrt(ex * ex + ey * ey);
          if (dist < CONNECT) {
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = COLOR_A;
            ctx!.globalAlpha = (1 - dist / CONNECT) * 0.35;
            ctx!.lineWidth = 0.8;
            ctx!.stroke();
            ctx!.globalAlpha = 1;
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (e.clientY - rect.top) * dpr;
    };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    resize();
    draw();

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
