import { useRef, useEffect } from 'react';

interface MatchPitchCanvasProps {
  onKickoff: () => void;
}

export const MatchPitchCanvas = ({ onKickoff }: MatchPitchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    
    // Setup canvas resolution
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Physics state
    const ball = {
      x: canvas.width / 2,
      y: canvas.height - 150,
      radius: 40,
      vx: 0,
      vy: 0,
      baseY: canvas.height - 150,
      bounceAngle: 0,
      isKicked: false,
      kickedTime: 0
    };

    const mouse = { x: -1000, y: -1000 };

    // Interaction limits
    const REPULSION_RADIUS = 150;
    const FRICTION = 0.92;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    // We'll manage clicks manually instead of React state for performance and tight coupling
    const handleClick = (e: MouseEvent) => {
      if (ball.isKicked) return;
      
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const dx = clickX - ball.x;
      const dy = clickY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If clicked on ball, trigger kickoff
      if (distance < ball.radius * 2) { // Generous hitbox
        ball.isKicked = true;
        ball.kickedTime = performance.now();
        
        // Launch ball towards goal (top center)
        const targetX = canvas.width / 2;
        const targetY = 50; // top net
        const angle = Math.atan2(targetY - ball.y, targetX - ball.x);
        
        ball.vx = Math.cos(angle) * 30; // fast kick
        ball.vy = Math.sin(angle) * 30;
        
        // Notify React side after a short delay for animation
        setTimeout(() => {
          onKickoff();
        }, 600);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    const drawBall = (x: number, y: number, r: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      // Simple procedural football
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.stroke();

      // Draw a pentagon in center
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const px = Math.cos(angle) * (r * 0.4);
        const py = Math.sin(angle) * (r * 0.4);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = '#000';
      ctx.fill();

      // Lines outwards
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const px1 = Math.cos(angle) * (r * 0.4);
        const py1 = Math.sin(angle) * (r * 0.4);
        const px2 = Math.cos(angle) * r;
        const py2 = Math.sin(angle) * r;
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const drawNet = () => {
      const topY = 0;
      const width = 300;
      const height = 100;
      const startX = canvas.width / 2 - width / 2;
      
      ctx.save();
      // Draw posts
      ctx.fillStyle = '#fff';
      ctx.fillRect(startX - 5, topY, 10, height);
      ctx.fillRect(startX + width - 5, topY, 10, height);
      ctx.fillRect(startX - 5, topY, width + 10, 10); // crossbar
      
      // Draw net grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < width; i += 20) {
        ctx.moveTo(startX + i, topY + 10);
        ctx.lineTo(startX + i, topY + height);
      }
      for (let i = 10; i < height; i += 20) {
        ctx.moveTo(startX, topY + i);
        ctx.lineTo(startX + width, topY + i);
      }
      ctx.stroke();
      ctx.restore();
    };

    const renderLoop = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawNet();

      if (!ball.isKicked) {
        // Physics logic: Repulsion
        const dx = ball.x - mouse.x;
        const dy = ball.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < REPULSION_RADIUS) {
          const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS;
          ball.vx += (dx / dist) * force * 2;
          ball.vy += (dy / dist) * force * 2;
        }

        // Apply friction and bounds
        ball.vx *= FRICTION;
        ball.vy *= FRICTION;
        
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Return to center slowly
        const centerX = canvas.width / 2;
        const returnForceX = (centerX - ball.x) * 0.01;
        const returnForceY = (ball.baseY - ball.y) * 0.01;
        
        ball.vx += returnForceX;
        ball.vy += returnForceY;
        
        // Ambient bounce
        ball.bounceAngle += 0.05;
        const visualY = ball.y + Math.sin(ball.bounceAngle) * 5;
        
        drawBall(ball.x, visualY, ball.radius);
      } else {
        // Kicked animation
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // Shrink slightly to simulate z-depth
        ball.radius = Math.max(10, ball.radius * 0.95);
        
        drawBall(ball.x, ball.y, ball.radius);
        
        // Draw GOAL text if close to top
        if (time - ball.kickedTime > 200) {
          ctx.save();
          ctx.fillStyle = '#D4AF37';
          ctx.font = '900 80px Oswald, sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000';
          ctx.shadowBlur = 20;
          ctx.fillText('GOAL!', canvas.width / 2, 200);
          ctx.restore();
        }
      }
      
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [onKickoff]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-20 cursor-crosshair touch-none"
    />
  );
};
