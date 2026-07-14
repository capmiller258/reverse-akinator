import React, { useEffect, useRef } from 'react';

export const BackgroundEffects: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse tracking spotlight
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating stadium dust particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string }[] = [];
    const particleCount = 120;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 1, // larger particles
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4 - 0.15, // slightly faster drift upwards
        opacity: Math.random() * 0.6 + 0.2, // higher opacity
        color: Math.random() > 0.4 ? '6, 182, 212' : '250, 204, 21' // Cyan (60%), Gold (40%)
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${p.color}, ${p.opacity})`;
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        
        ctx.fill();

        // Reset shadow to avoid affecting other draws unintentionally
        ctx.shadowBlur = 0;

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around screen
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-slate-950"
    >
      {/* Ambient Mouse Spotlight */}
      <div 
        className="absolute inset-0 opacity-50 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(600px circle at calc(var(--mouse-x, 0) * 1px) calc(var(--mouse-y, 0) * 1px), rgba(6, 182, 212, 0.15), transparent 80%)'
        }}
      />
      
      {/* Canvas for Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-100"
      />
    </div>
  );
};
