import React, { useEffect, useRef } from 'react';
import './PhysicsIDCard.css';

const PhysicsIDCard = ({ imageSrc }) => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const lanyardStrapLeftRef = useRef(null);
  const lanyardStrapLeftTextureRef = useRef(null);
  const lanyardStrapRightRef = useRef(null);
  const lanyardStrapRightTextureRef = useRef(null);
  const shineRef = useRef(null);
  const shadowRef = useRef(null);
  
  // Physics State variables
  const state = useRef({
    x: 0,
    y: -800, // Start well above the viewport
    vx: 0,
    vy: 0,
    isDragging: false,
    mouseX: 0,
    mouseY: 0,
    time: 0,
    hasDropped: false // Track if the initial drop has happened
  });

  const constants = {
    gravity: 0.8,
    friction: 0.94, // Damping (air resistance)
    springTension: 0.12, // Stiffness of the lanyard
    mouseSpringTension: 0.08, // Strength of user's pull
    lanyardLength: 1050, // Extended so the pivot can be way off screen
    windStrength: 0.015, // Micro-oscillations
    mass: 1.5 // Adds weight to the card
  };

  useEffect(() => {
    // 1. Set up Intersection Observer to trigger the drop
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !state.current.hasDropped) {
          state.current.hasDropped = true;
          // Give it a gentle chaotic toss when it drops!
          state.current.vx = (Math.random() - 0.5) * 15;
          state.current.vy = 8;
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the container is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const updatePhysics = (time) => {
      const dt = Math.min((time - lastTime) / 16, 2); // Time delta, capped at 2 frames
      lastTime = time;
      
      const s = state.current;
      const c = constants;
      
      // Pivot coordinates must be scoped to the whole function!
      const pivotX = 0;
      const pivotY = -1000; // Wall pin is way above the screen
      
      if (!s.hasDropped) {
        // Hold the card well above the viewport, waiting to drop
        s.y = -800;
        s.vy = 0;
        s.vx = 0;
      } else {
        // 1. Ambient Wind (Micro-movements)
        s.time += 0.01 * dt;
        const windForceX = Math.sin(s.time * 2.5) * Math.cos(s.time * 1.5) * c.windStrength;
        const windForceY = Math.cos(s.time * 1.2) * c.windStrength;
        
        // Apply Gravity and Wind
        s.vy += (c.gravity + windForceY) * dt;
        s.vx += windForceX * dt;

        // 2. Lanyard Constraint (Spring toward pivot)
        const dx = pivotX - s.x;
        const dy = pivotY - s.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Only apply tension if the string is stretched past its length
        if (distance > c.lanyardLength || s.y > pivotY) {
          const stretch = distance - c.lanyardLength;
          const tensionForce = (stretch * c.springTension) / c.mass;
          s.vx += (dx / distance) * tensionForce * dt;
          s.vy += (dy / distance) * tensionForce * dt;
        }

        // 3. Mouse Drag Force (Virtual Spring)
        if (s.isDragging) {
          const dragDx = s.mouseX - s.x;
          const dragDy = s.mouseY - s.y;
          s.vx += (dragDx * c.mouseSpringTension) / c.mass * dt;
          s.vy += (dragDy * c.mouseSpringTension) / c.mass * dt;
        }

        // 4. Apply Damping (Friction/Air resistance)
        const dampingFactor = Math.pow(c.friction, dt);
        s.vx *= dampingFactor;
        s.vy *= dampingFactor;

        // 5. Apply Velocity
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }

      // 6. Calculate True 3D Rotations
      // Prevent instant flip when dropping from exactly at the pivot
      let angleZ = 0;
      if (s.y > pivotY) {
        angleZ = Math.atan2(s.y - pivotY, s.x - pivotX) - (Math.PI / 2); 
      }
      
      // Y-rotation comes from X-velocity (air resistance twisting it)
      const rY = s.vx * 1.2;
      
      // X-rotation comes from Y-velocity and drag tension
      const rX = -s.vy * 1.5 + (s.y - (pivotY + c.lanyardLength)) * -0.15;

      // 7. Update DOM Elements using translate3d for GPU acceleration
      if (cardRef.current) {
        cardRef.current.style.transform = `
          translate3d(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px), 0)
          rotateZ(${angleZ}rad)
          rotateY(${rY}deg)
          rotateX(${rX}deg)
        `;
      }

      // Calculate exact attachment point of the clip on the rotated card
      // The card is 520px tall (center is 260px). The clip is 45px above the card.
      const clipDistance = 260 + 45 - 15; // Adjusted slightly for the clip hole center
      
      const attachX = s.x + clipDistance * Math.sin(angleZ);
      const attachY = s.y - clipDistance * Math.cos(angleZ);

      // Distance from pivot to clip (used for slack calculation)
      const clipDx = pivotX - attachX;
      const clipDy = pivotY - attachY;
      const clipDist = Math.sqrt(clipDx * clipDx + clipDy * clipDy) || 1;
      const slack = Math.max(0, c.lanyardLength - clipDist);

      // Update SVG Lanyard path
      if (lanyardStrapLeftRef.current && lanyardStrapRightRef.current) {
        // Hide string if the card is above the pivot (slack/bundled up)
        const stringVisible = attachY > pivotY;
        
        if (!stringVisible) {
          lanyardStrapLeftRef.current.style.opacity = '0';
          if (lanyardStrapLeftTextureRef.current) lanyardStrapLeftTextureRef.current.style.opacity = '0';
          lanyardStrapRightRef.current.style.opacity = '0';
          if (lanyardStrapRightTextureRef.current) lanyardStrapRightTextureRef.current.style.opacity = '0';
        } else {
          lanyardStrapLeftRef.current.style.opacity = '1';
          if (lanyardStrapLeftTextureRef.current) lanyardStrapLeftTextureRef.current.style.opacity = '0.5';
          lanyardStrapRightRef.current.style.opacity = '1';
          if (lanyardStrapRightTextureRef.current) lanyardStrapRightTextureRef.current.style.opacity = '0.5';
          
          // Bowing effect based on velocity
          const bowX = s.vx * 0.5;
          const bowY = s.vy * 0.5;
          
          const neckWidth = 60;
          const clipWidth = 12; // Distance between left and right straps at the clip
          
          const cosZ = Math.cos(angleZ);
          const sinZ = Math.sin(angleZ);
          
          const clipLeftX = attachX - clipWidth * cosZ;
          const clipLeftY = attachY - clipWidth * sinZ;
          const clipRightX = attachX + clipWidth * cosZ;
          const clipRightY = attachY + clipWidth * sinZ;

          // Calculate true midpoints for the bezier control points
          const sagY = slack * 0.8; // The string sags downwards due to gravity when slack
          
          const midLeftX = (pivotX - neckWidth + clipLeftX) / 2;
          const midLeftY = (pivotY + clipLeftY) / 2 + sagY;
          
          const midRightX = (pivotX + neckWidth + clipRightX) / 2;
          const midRightY = (pivotY + clipRightY) / 2 + sagY;
          
          const leftPath = `M ${pivotX - neckWidth} ${pivotY} Q ${midLeftX - bowX} ${midLeftY - bowY} ${clipLeftX} ${clipLeftY}`;
          const rightPath = `M ${pivotX + neckWidth} ${pivotY} Q ${midRightX - bowX} ${midRightY - bowY} ${clipRightX} ${clipRightY}`;

          lanyardStrapLeftRef.current.setAttribute('d', leftPath);
          if (lanyardStrapLeftTextureRef.current) lanyardStrapLeftTextureRef.current.setAttribute('d', leftPath);
          
          lanyardStrapRightRef.current.setAttribute('d', rightPath);
          if (lanyardStrapRightTextureRef.current) lanyardStrapRightTextureRef.current.setAttribute('d', rightPath);
        }
      }

      // Dynamic Shine (Physical Reflection)
      if (shineRef.current) {
        const shineX = 50 + rY * 2;
        const angle = angleZ * (180/Math.PI) + 135;
        
        shineRef.current.style.background = `linear-gradient(${angle}deg, 
          transparent 0%, 
          rgba(255, 255, 255, 0.05) ${shineX - 20}%, 
          rgba(255, 255, 255, 0.6) ${shineX}%, 
          rgba(255, 255, 255, 0.05) ${shineX + 20}%, 
          transparent 100%)`;
      }

      // Dynamic Soft Shadow
      if (shadowRef.current) {
        const shadowX = -s.vx * 1.5;
        const shadowY = Math.max(10, 40 - s.vy * 1.5);
        const shadowBlur = Math.max(15, 30 + Math.abs(s.vx) + Math.abs(s.vy));
        
        shadowRef.current.style.transform = `
          translate3d(calc(-50% + ${s.x + shadowX}px), calc(-50% + ${s.y + shadowY}px), -50px)
          rotateZ(${angleZ}rad)
          rotateY(${rY * 0.5}deg)
          rotateX(${rX * 0.5}deg)
          scale(${1 - Math.max(0, s.vy * 0.005)}) 
        `;
        
        shadowRef.current.style.filter = `blur(${shadowBlur}px)`;
        const opacity = Math.min(0.6, 0.3 + Math.abs(s.vx)*0.01 + Math.abs(s.vy)*0.01);
        shadowRef.current.style.opacity = opacity;
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handlePointerDown = (e) => {
    // Capture all pointer events to the card to prevent them falling through to the page
    if (e.target && e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
    
    state.current.isDragging = true;
    updateMousePosition(e);
    if (cardRef.current) {
      cardRef.current.style.cursor = 'grabbing';
      if (shineRef.current) shineRef.current.style.opacity = '1';
    }
    document.body.style.userSelect = 'none';
  };

  const handlePointerMove = (e) => {
    if (state.current.isDragging) {
      updateMousePosition(e);
    }
  };

  const handlePointerUp = (e) => {
    // Release pointer capture
    if (e.target && e.target.releasePointerCapture) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    
    state.current.isDragging = false;
    if (cardRef.current) {
      cardRef.current.style.cursor = 'grab';
      if (shineRef.current) shineRef.current.style.opacity = '0.5';
    }
    document.body.style.userSelect = '';
  };

  const updateMousePosition = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pivotX = rect.left + rect.width / 2;
    const pivotY = rect.top + rect.height / 2; 
    
    state.current.mouseX = e.clientX - pivotX;
    state.current.mouseY = e.clientY - pivotY;
  };

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <div className="physics-card-container" ref={containerRef}>
      
      {/* SVG Lanyard Straps */}
      <svg className="lanyard-svg" style={{ position: 'absolute', top: '50%', left: '50%', width: 1, height: 1, overflow: 'visible', pointerEvents: 'none' }}>
        <defs>
          <pattern id="fabric" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke="#222" strokeWidth="1" />
          </pattern>
        </defs>
        
        {/* Left Strap Base & Texture */}
        <path ref={lanyardStrapLeftRef} stroke="#1a1a1a" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path ref={lanyardStrapLeftTextureRef} stroke="url(#fabric)" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.5" />
        
        {/* Right Strap Base & Texture */}
        <path ref={lanyardStrapRightRef} stroke="#1a1a1a" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path ref={lanyardStrapRightTextureRef} stroke="url(#fabric)" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.5" />
      </svg>

      {/* Dynamic Detached Shadow for realistic depth */}
      <div className="physics-card-shadow" ref={shadowRef}></div>

      {/* The Physical Card */}
      <div 
        className="physics-card-wrapper" 
        ref={cardRef}
        onPointerDown={handlePointerDown}
        /* No opacity transition, perfectly sharp and solid from frame 1 */
      >
        <div className="physics-card-body">
          {/* Lanyard Hardware Assembly */}
          <div className="hardware-assembly">
            <div className="hardware-ring"></div>
            <div className="hardware-clip">
              <div className="hardware-clip-shine"></div>
            </div>
            <div className="hardware-hole">
              <div className="hardware-hole-inner"></div>
            </div>
            
            {/* Pill Cutouts in the plastic sleeve */}
            <div className="sleeve-cutout left"></div>
            <div className="sleeve-cutout right"></div>
          </div>

          <div className="physics-card-inner">
            <div className="inner-card-header">
              <svg className="header-icon" viewBox="0 0 24 24" fill="var(--accent-red)">
                <path d="M12 2L4.5 9h3v13h9V9h3L12 2zm0 3.8l3.7 3.5h-2.2V20h-3V9.3H8.3L12 5.8z"/>
              </svg>
              <span className="header-role">AI & ML ENGINEER</span>
            </div>
            
            <div className="inner-card-photo-area">
              <div className="geometric-bg"></div>
              <img src={imageSrc} alt="Saimani" className="inner-card-photo" draggable="false" />
            </div>
            
            <div className="inner-card-name-area">
              <h1 className="name-primary"><span className="red-text">SAI</span>MANI</h1>
              <h2 className="name-secondary">IPPILI</h2>
            </div>
            
            <div className="inner-role-banner">
              MACHINE LEARNING ENGINEER
            </div>
            
            <div className="inner-details-area">
              <div className="qr-code">
                {/* Simulated QR Code Pattern */}
                <div className="qr-pattern"></div>
              </div>
              <div className="details-text">
                <div className="detail-group">
                  <div className="detail-label">EMPLOYEE ID</div>
                  <div className="detail-value">AI-ML-001</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">JOIN DATE</div>
                  <div className="detail-value">JUN 2025</div>
                </div>
              </div>
            </div>
            
            <div className="inner-barcode-area">
              <div className="barcode-bars"></div>
              <div className="barcode-motto">BUILDING INTELLIGENCE, SHAPING FUTURE.</div>
            </div>
            
            <div className="inner-bottom-bar">
              www.saimani.dev
            </div>
          </div>

          <div className="physics-card-overlay">
            <div className="physics-card-texture"></div>
            <div className="physics-card-shine" ref={shineRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsIDCard;
