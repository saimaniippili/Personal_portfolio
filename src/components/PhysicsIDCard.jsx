import React, { useEffect, useRef } from 'react';
import './PhysicsIDCard.css';

const PhysicsIDCard = ({ imageSrc }) => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const hardwareRef = useRef(null);
  
  // Lanyard SVG Refs
  const lanyardStrapLeftRef = useRef(null);
  const lanyardStrapLeftStitchRef = useRef(null);
  const lanyardStrapLeftCoreRef = useRef(null);
  const lanyardStrapLeftTextureRef = useRef(null);
  
  const lanyardStrapRightRef = useRef(null);
  const lanyardStrapRightStitchRef = useRef(null);
  const lanyardStrapRightCoreRef = useRef(null);
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
      let angleZ = 0;
      if (s.y > pivotY) {
        angleZ = Math.atan2(s.y - pivotY, s.x - pivotX) - (Math.PI / 2); 
      }
      
      const rY = s.vx * 1.2;
      const rX = -s.vy * 1.5 + (s.y - (pivotY + c.lanyardLength)) * -0.15;

      // 7. Update DOM Elements
      if (cardRef.current) {
        cardRef.current.style.transform = `
          translate3d(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px), 0)
          rotateZ(${angleZ}rad)
          rotateY(${rY}deg)
          rotateX(${rX}deg)
        `;
      }

      // Calculate exact attachment point of the clip on the rotated card
      const clipDistance = 260 + 85; // Distance from center of card to the swivel hardware attachment point
      
      const attachX = s.x + clipDistance * Math.sin(angleZ);
      const attachY = s.y - clipDistance * Math.cos(angleZ);

      // Distance from pivot to clip (used for slack calculation)
      const clipDx = pivotX - attachX;
      const clipDy = pivotY - attachY;
      const clipDist = Math.sqrt(clipDx * clipDx + clipDy * clipDy) || 1;
      const slack = Math.max(0, c.lanyardLength - clipDist);

      // Update SVG Lanyard paths
      const stringVisible = attachY > pivotY;
      
      const updateSvgGroup = (refs, path, visible) => {
        if (!visible) {
          refs.forEach(ref => ref.current && (ref.current.style.opacity = '0'));
        } else {
          refs.forEach((ref, idx) => {
            if (ref.current) {
              ref.current.setAttribute('d', path);
              // Set texture opacity to 0.7, others to 1
              ref.current.style.opacity = idx === 3 ? '0.7' : '1';
            }
          });
        }
      };

      if (stringVisible) {
        const bowX = s.vx * 0.5;
        const bowY = s.vy * 0.5;
        
        const neckWidth = 60;
        const clipWidth = 10;
        
        // The swivel hardware rotation allows the strings to come straight in
        // So we calculate where the hardware is pointing based on the curve tangent
        
        const cosZ = Math.cos(angleZ);
        const sinZ = Math.sin(angleZ);
        
        // Determine bezier control points with sag
        const sagY = slack * 0.8;
        
        // These are world-space coordinates for the clip attachment points
        // But since the swivel clip rotates, we'll just connect them to a central point to avoid twisting
        const midLeftX = (pivotX - neckWidth + attachX) / 2;
        const midLeftY = (pivotY + attachY) / 2 + sagY;
        
        const midRightX = (pivotX + neckWidth + attachX) / 2;
        const midRightY = (pivotY + attachY) / 2 + sagY;
        
        // Calculate tangent vector at the clip to rotate the hardware naturally
        const midCenterX = (midLeftX + midRightX) / 2 - bowX;
        const midCenterY = (midLeftY + midRightY) / 2 - bowY;
        const vecX = attachX - midCenterX;
        const vecY = attachY - midCenterY;
        
        // Hardware world angle (atan2 points towards attach point)
        const hardwareWorldAngle = Math.atan2(vecY, vecX) - (Math.PI / 2);
        const hardwareLocalAngle = hardwareWorldAngle - angleZ; // Counteract card rotation
        
        if (hardwareRef.current) {
          hardwareRef.current.style.transform = `translateX(-50%) rotateZ(${hardwareLocalAngle}rad)`;
        }
        
        // Now calculate the actual clip attach points based on the hardware's world angle
        const hCos = Math.cos(hardwareWorldAngle);
        const hSin = Math.sin(hardwareWorldAngle);
        const clipLeftX = attachX - clipWidth * hCos;
        const clipLeftY = attachY - clipWidth * hSin;
        const clipRightX = attachX + clipWidth * hCos;
        const clipRightY = attachY + clipWidth * hSin;
        
        const leftPath = `M ${pivotX - neckWidth} ${pivotY} Q ${midLeftX - bowX} ${midLeftY - bowY} ${clipLeftX} ${clipLeftY}`;
        const rightPath = `M ${pivotX + neckWidth} ${pivotY} Q ${midRightX - bowX} ${midRightY - bowY} ${clipRightX} ${clipRightY}`;

        updateSvgGroup([lanyardStrapLeftRef, lanyardStrapLeftStitchRef, lanyardStrapLeftCoreRef, lanyardStrapLeftTextureRef], leftPath, true);
        updateSvgGroup([lanyardStrapRightRef, lanyardStrapRightStitchRef, lanyardStrapRightCoreRef, lanyardStrapRightTextureRef], rightPath, true);
      } else {
        updateSvgGroup([lanyardStrapLeftRef, lanyardStrapLeftStitchRef, lanyardStrapLeftCoreRef, lanyardStrapLeftTextureRef], '', false);
        updateSvgGroup([lanyardStrapRightRef, lanyardStrapRightStitchRef, lanyardStrapRightCoreRef, lanyardStrapRightTextureRef], '', false);
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
    if (e.target && e.target.releasePointerCapture) {
      try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
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
            <path d="M0 4L4 0M-1 1L1 -1M3 5L5 3" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
          </pattern>
        </defs>
        
        {/* LEFT STRAP */}
        <path id="left-strap-path" ref={lanyardStrapLeftRef} stroke="#bd2b31" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path ref={lanyardStrapLeftStitchRef} stroke="#111" strokeWidth="18" strokeDasharray="3 3" fill="none" strokeLinecap="round" />
        <path ref={lanyardStrapLeftCoreRef} stroke="#bd2b31" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path ref={lanyardStrapLeftTextureRef} stroke="url(#fabric)" strokeWidth="20" fill="none" strokeLinecap="round" />
        <text fontSize="9" fill="#111" fontWeight="800" letterSpacing="1.5">
           <textPath href="#left-strap-path" startOffset="50%" textAnchor="middle" dominantBaseline="central">AI ML ENGINEER</textPath>
        </text>

        {/* RIGHT STRAP */}
        <path id="right-strap-path" ref={lanyardStrapRightRef} stroke="#bd2b31" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path ref={lanyardStrapRightStitchRef} stroke="#111" strokeWidth="18" strokeDasharray="3 3" fill="none" strokeLinecap="round" />
        <path ref={lanyardStrapRightCoreRef} stroke="#bd2b31" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path ref={lanyardStrapRightTextureRef} stroke="url(#fabric)" strokeWidth="20" fill="none" strokeLinecap="round" />
        <text fontSize="9" fill="#111" fontWeight="800" letterSpacing="1.5">
           <textPath href="#right-strap-path" startOffset="50%" textAnchor="middle" dominantBaseline="central">BUILDING INTELLIGENCE</textPath>
        </text>
      </svg>

      {/* Dynamic Detached Shadow for realistic depth */}
      <div className="physics-card-shadow" ref={shadowRef}></div>

      {/* The Physical Card */}
      <div 
        className="physics-card-wrapper" 
        ref={cardRef}
        onPointerDown={handlePointerDown}
      >
        {/* Hardware Swivel Assembly (Rotates independently of card based on tangent) */}
        <div className="hardware-swivel-assembly" ref={hardwareRef}>
          <div className="hardware-o-ring"></div>
          <div className="hardware-lobster-clasp">
            <div className="clasp-body"></div>
            <div className="clasp-gate"></div>
            <div className="clasp-hinge"></div>
          </div>
        </div>

        <div className="physics-card-body">
          {/* PVC Plastic Connector */}
          <div className="pvc-connector">
            <div className="pvc-connector-hole"></div>
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

