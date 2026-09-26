import React, { useEffect, useState } from 'react';

export const CursorSpotlight: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only enable on desktop devices with hover support
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setMounted(true);

    const spotlight = document.getElementById('cursor-spotlight-el');
    if (!spotlight) return;

    let targetX = -999;
    let targetY = -999;
    let currentX = -999;
    let currentY = -999;
    let isMoving = false;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isMoving) {
        currentX = targetX;
        currentY = targetY;
        isMoving = true;
      }
    };

    const render = () => {
      if (isMoving && spotlight) {
        currentX += (targetX - currentX) * 0.14;
        currentY += (targetY - currentY) * 0.14;
        spotlight.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animId = requestAnimationFrame(render);

    const handleMouseLeave = () => {
      if (spotlight) spotlight.style.opacity = '0';
    };
    const handleMouseEnter = () => {
      if (spotlight) spotlight.style.opacity = '1';
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      id="cursor-spotlight-el"
      aria-hidden="true"
      className="fixed top-0 left-0 w-[500px] h-[500px] -ml-[250px] -mt-[250px] rounded-full pointer-events-none z-30 transition-opacity duration-500 ease-out"
      style={{
        background: 'radial-gradient(circle, rgba(0, 0, 0, 0.035) 0%, rgba(136, 136, 136, 0.015) 45%, transparent 70%)',
        transform: 'translate3d(-999px, -999px, 0)',
        willChange: 'transform'
      }}
    />
  );
};
