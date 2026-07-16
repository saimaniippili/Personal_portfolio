import React, { useEffect, useRef } from 'react';
import './PhysicsIDCard.css';

const PhysicsIDCard = ({ imageSrc }) => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const lanyardStrapLeftRef = useRef(null);
  const lanyardStrapRightRef = useRef(null);
  const shineRef = useRef(null);
  const shadowRef = useRef(null);
  
  // Physics State variables
  const state = useRef({
    x: 0,
    y: 200, // Resting y position
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
    lanyardLength: 220,
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
      const pivotY = -150; // Pivot is high above the container to allow a long lanyard
      
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
      // We apply friction based on delta time
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
        // The card is positioned centered on s.x, s.y
        cardRef.current.style.transform = `
          translate3d(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px), 0)
          rotateZ(${angleZ}rad)
          rotateY(${rY}deg)
          rotateX(${rX}deg)
        `;
      }

      // Update SVG Lanyard path
      if (lanyardStrapLeftRef.current && lanyardStrapRightRef.current) {
        // Draw two straps coming from a single neck loop down to the clip
        // Adding a slight curve based on velocity (bowing effect)
        const bowX = s.vx * 0.5;
        const bowY = s.vy * 0.5;
        
        // Offset left and right straps at the neck and clip
        const neckWidth = 60;
        const clipWidth = 15;
        
        // Math to orient the clip width based on angleZ
        const cosZ = Math.cos(angleZ);
        const sinZ = Math.sin(angleZ);
        
        const clipLeftX = s.x - clipWidth * cosZ;
        const clipLeftY = s.y - clipWidth * sinZ;
        const clipRightX = s.x + clipWidth * cosZ;
        const clipRightY = s.y + clipWidth * sinZ;
        
        // Left Strap
        lanyardStrapLeftRef.current.setAttribute('d', 
          `M ${pivotX - neckWidth} ${pivotY} 
           Q ${s.x * 0.5 - bowX} ${s.y * 0.5 - bowY} 
           ${clipLeftX} ${clipLeftY}`
        );
        
        // Right Strap
        lanyardStrapRightRef.current.setAttribute('d', 
          `M ${pivotX + neckWidth} ${pivotY} 
           Q ${s.x * 0.5 - bowX} ${s.y * 0.5 - bowY} 
           ${clipRightX} ${clipRightY}`
        );
      }

      // Dynamic Shine (Physical Reflection)
      if (shineRef.current) {
        // Shine moves across the card naturally as it rotates in 3D
        // Map rotations to background position
        const shineX = 50 + rY * 2;
        const shineY = 50 + rX * 2;
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
        // Shadow is cast behind the card and moves opposite to light
        const shadowX = -s.vx * 1.5;
        const shadowY = Math.max(10, 40 - s.vy * 1.5); // Drops lower when swinging forward
        const shadowBlur = Math.max(15, 30 + Math.abs(s.vx) + Math.abs(s.vy)); // Blurs more when moving faster
        
        shadowRef.current.style.transform = `
          translate3d(calc(-50% + ${s.x + shadowX}px), calc(-50% + ${s.y + shadowY}px), -50px)
          rotateZ(${angleZ}rad)
          rotateY(${rY * 0.5}deg)
          rotateX(${rX * 0.5}deg)
          scale(${1 - Math.max(0, s.vy * 0.005)}) 
        `; // Scale down slightly when it swings away
        
        shadowRef.current.style.filter = `blur(${shadowBlur}px)`;
        // Darken shadow when card comes closer
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
      // Enhance shine and lift slightly when grabbed to simulate pulling it closer
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
    // Calculate mouse position relative to the center of the container
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
      <svg className="lanyard-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        <defs>
          {/* Fabric texture pattern for the lanyard */}
          <pattern id="fabric" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke="#222" strokeWidth="1" />
          </pattern>
        </defs>
        
        {/* We use SVG group centered at the middle of the container so coordinates match the physics Engine (where 0,0 is center of container) */}
        <g transform="translate(50%, 50%)">
          {/* Left Strap Base & Texture */}
          <path ref={lanyardStrapLeftRef} stroke="#1a1a1a" strokeWidth="14" fill="none" strokeLinecap="round" />
          
          {/* Right Strap Base & Texture */}
          <path ref={lanyardStrapRightRef} stroke="#1a1a1a" strokeWidth="14" fill="none" strokeLinecap="round" />
        </g>
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

          {/* Realistic PVC Surface & Lighting Overlays */}
          <div className="physics-card-texture"></div>
          <div className="physics-card-shine" ref={shineRef}></div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsIDCard;
