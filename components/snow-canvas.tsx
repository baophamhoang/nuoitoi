'use client';

import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 100;

interface Particle {
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  opacity: number;
}

export function SnowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1.5 + Math.random() * 3,
      dx: (Math.random() - 0.5) * 0.8,
      dy: 0.5 + Math.random() * 1.5,
      opacity: 0.4 + Math.random() * 0.6,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles.current) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();

        p.x += p.dx + Math.sin(p.y * 0.01) * 0.3;
        p.y += p.dy;

        if (p.y > canvas.height + 5) {
          p.y = -5;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
      }
      rafId.current = requestAnimationFrame(draw);
    };

    rafId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}
