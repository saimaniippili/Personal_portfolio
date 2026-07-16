import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import './Loading.css';

const Loading = ({ onComplete }) => {
  const containerRef = useRef(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const feTurbulence = containerRef.current.querySelector('feTurbulence');
    const feDisplacementMap = containerRef.current.querySelector('feDisplacementMap');
    const polygon = containerRef.current.querySelector('polygon');

    const anim1 = animate([feTurbulence, feDisplacementMap], {
      baseFrequency: .05,
      scale: 15,
      alternate: true,
      loop: true,
      duration: 1000,
    });

    const anim2 = animate(polygon, {
      points: '64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100',
      alternate: true,
      loop: true,
      duration: 1000,
      easing: 'easeInOutSine'
    });

    const finishTimer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); // 500ms fade out duration
    }, 2500); // Show loading for 2.5 seconds

    return () => {
      anim1.pause();
      anim2.pause();
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div className={`loading-screen ${isFading ? 'fade-out' : ''}`} ref={containerRef}>
      <svg viewBox="0 0 128 128" width="160" height="160">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0" numOctaves="1" result="turbulence" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <polygon 
          points="64 120 16 90 16 40 64 10 112 40 112 90" 
          filter="url(#noise)" 
          fill="var(--accent-red)" 
        />
      </svg>
      <div className="loading-text torn-text" data-text="LOADING">LOADING</div>
    </div>
  );
};

export default Loading;
