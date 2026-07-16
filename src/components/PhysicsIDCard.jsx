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
    y: 50, // Resting y position (center of the card)
    vx: 0,
    vy: 0,
    isDragging: false,
    mouseX: 0,
    mouseY: 0,
    time: 0
  });

  const constants = {
    gravity: 0.8,
    friction: 0.94, // Damping (air resistance)
    springTension: 0.12, // Stiffness of the lanyard
    mouseSpringTension: 0.08, // Strength of user's pull
    lanyardLength: 400, // Reduced to prevent bleeding into hero section
    windStrength: 0.015, // Micro-oscillations
    mass: 1.5 // Adds weight to the card
  };

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const updatePhysics = (time) => {
      const dt = Math.min((time - lastTime) / 16, 2); // Time delta, capped at 2 frames
      lastTime = time;
      
      const s = state.current;
      const c = constants;
      
      // 1. Ambient Wind (Micro-movements)
      s.time += 0.01 * dt;
      const windForceX = Math.sin(s.time * 2.5) * Math.cos(s.time * 1.5) * c.windStrength;
      const windForceY = Math.cos(s.time * 1.2) * c.windStrength;
      
      // Apply Gravity and Wind
      s.vy += (c.gravity + windForceY) * dt;
      s.vx += windForceX * dt;

      // 2. Lanyard Constraint (Spring toward pivot)
      const pivotX = 0;
      const pivotY = -350; // Lowered pivot to keep it within the About section
      
      const dx = pivotX - s.x;
      const dy = pivotY - s.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const stretch = distance - c.lanyardLength;
      // Force equals stretch times tension, divided by mass
      const tensionForce = (stretch * c.springTension) / c.mass;
      
      s.vx += (dx / distance) * tensionForce * dt;
      s.vy += (dy / distance) * tensionForce * dt;

      // 3. Mouse Drag Force (Virtual Spring)
      if (s.isDragging) {
        // Dragging is a spring force connecting cursor to the center of the card
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

      // 6. Calculate True 3D Rotations
      // Z-rotation perfectly aligns with the lanyard string direction
      const angleZ = Math.atan2(s.y - pivotY, s.x - pivotX) - (Math.PI / 2); 
      
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

      // Update SVG Lanyard path
      if (lanyardStrapLeftRef.current && lanyardStrapRightRef.current) {
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
        
        const leftPath = `M ${pivotX - neckWidth} ${pivotY} Q ${attachX * 0.5 - bowX} ${attachY * 0.5 - bowY} ${clipLeftX} ${clipLeftY}`;
        const rightPath = `M ${pivotX + neckWidth} ${pivotY} Q ${attachX * 0.5 - bowX} ${attachY * 0.5 - bowY} ${clipRightX} ${clipRightY}`;

        lanyardStrapLeftRef.current.setAttribute('d', leftPath);
        if (lanyardStrapLeftTextureRef.current) lanyardStrapLeftTextureRef.current.setAttribute('d', leftPath);
        
        lanyardStrapRightRef.current.setAttribute('d', rightPath);
        if (lanyardStrapRightTextureRef.current) lanyardStrapRightTextureRef.current.setAttribute('d', rightPath);
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

  const handlePointerUp = () => {
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
      
      {/* Pivot point visual (Pin) */}
      <div 
        className="lanyard-pin" 
        style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: `translate(calc(-50% + 0px), calc(-50% + -350px))`,
          zIndex: 15
        }}
      ></div>

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
          </div>

          <div className="physics-card-content">
            <div className="card-header">
              <span className="card-company">AI & ML PORTFOLIO</span>
            </div>
            <div className="card-photo-container">
              <img src={imageSrc} alt="Saimani" className="card-photo" draggable="false" />
            </div>
            <h3 className="card-name">Saimani</h3>
            <p className="card-role">Machine Learning Engineer</p>
            <div className="card-footer">
              <div className="card-barcode"></div>
              <div className="card-id">ID: 001-AI-ML</div>
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
