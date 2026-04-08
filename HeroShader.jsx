'use client';

import { useEffect, useRef } from 'react';

const BG = '#0a1628';
const COLOR_A = '#1D9E75';
const COLOR_B = '#185FA5';
const COLOR_C = '#5DCAA5';

export default function HeroShader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let particles = [];
    let W, H;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.width = canvas.offsetWidth * dpr;
      H = canvas.height = canvas.offsetHeight * dpr;
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
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

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

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ex = p.x - q.x;
          const ey = p.y - q.y;
          const dist = Math.sqrt(ex * ex + ey * ey);
          if (dist < CONNECT) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = COLOR_A;
            ctx.globalAlpha = (1 - dist / CONNECT) * 0.35;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
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
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Canvas shader background */}
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

      {/* Hero content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '2rem 1.5rem',
          maxWidth: '680px',
          margin: '0 auto',
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: '1rem',
          }}
        >
          AI-Powered
        </span>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'inherit',
            fontSize: 'clamp(36px, 6vw, 58px)',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            margin: '0 0 1.25rem',
          }}
        >
          Your dream job,{' '}
          <span style={{ color: COLOR_C }}>on WhatsApp.</span>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontFamily: 'inherit',
            fontSize: '17px',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.65,
            margin: '0 0 2.25rem',
            maxWidth: '420px',
          }}
        >
          Upload your CV and receive curated job matches delivered
          directly to WhatsApp — automatically.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="/login"
            style={{
              background: COLOR_C,
              color: '#04342C',
              fontFamily: 'inherit',
              fontSize: '15px',
              fontWeight: 700,
              padding: '14px 32px',
              borderRadius: '50px',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Get Started Free
          </a>
          <a
            href="#how-it-works"
            style={{
              border: '1.5px solid rgba(255,255,255,0.22)',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'inherit',
              fontSize: '15px',
              fontWeight: 500,
              padding: '14px 32px',
              borderRadius: '50px',
              textDecoration: 'none',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
          >
            See How It Works
          </a>
        </div>

        {/* Social proof */}
        <p
          style={{
            fontFamily: 'inherit',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.35)',
            marginTop: '1.75rem',
          }}
        >
          Joined by 12,000+ job seekers
        </p>
      </div>
    </section>
  );
}
