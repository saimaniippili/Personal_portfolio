import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { personalInfo } from '../constants';
import profileImgFallback from '../assets/profile.png';
import './About.css';

import ScrollReveal from './ScrollReveal';

const About = () => {
  const [profile, setProfile] = useState(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Framer Motion Drag & Spring Physics
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(dragX, springConfig);
  const ySpring = useSpring(dragY, springConfig);

  // Map drag distance to rotation (tilt in direction of pull)
  const rotateX = useTransform(ySpring, [-200, 200], [20, -20]);
  const rotateY = useTransform(xSpring, [-200, 200], [-20, 20]);

  // Combine global mouse hover tilt with physical drag tilt
  const combinedRotateX = useTransform(() => rotateX.get() + (mousePos.y * -5));
  const combinedRotateY = useTransform(() => rotateY.get() + (mousePos.x * 5));

  useEffect(() => {
    fetchProfile();

    const handleGyroscope = (e) => {
      // Execute on mobile sizes if gyro data exists
      if (e.gamma !== null && e.beta !== null && window.innerWidth <= 768) {
        const { innerWidth, innerHeight } = window;
        const gamma = Math.min(Math.max(e.gamma, -45), 45); 
        const xPos = ((gamma + 45) / 90) * innerWidth;
        const beta = Math.min(Math.max(e.beta - 45, -45), 45);
        const yPos = ((beta + 45) / 90) * innerHeight;

        const x = (xPos / innerWidth - 0.5) * 2;
        const y = (yPos / innerHeight - 0.5) * 2;
        setMousePos({ x, y });
      }
    };

    window.addEventListener('deviceorientation', handleGyroscope);
    return () => window.removeEventListener('deviceorientation', handleGyroscope);
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from('portfolio_profile').select('*').limit(1).single();
    if (data) setProfile(data);
  };

  const aboutText = profile?.about_text || personalInfo.objective || personalInfo.about;
  const imageSrc = profile?.profile_image_url || profileImgFallback;

  const handleMouseMove = (e) => {
    // Desktop only mouse tracking
    if (window.innerWidth > 768) {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    }
  };

  return (
    <section id="about" className="about-section" onMouseMove={handleMouseMove}>
      <svg className="torn-top" viewBox="0 0 1000 20" preserveAspectRatio="none">
        <path d="M0,20 L0,0 L50,15 L100,5 L150,18 L200,2 L250,12 L300,4 L350,16 L400,6 L450,14 L500,2 L550,17 L600,5 L650,13 L700,1 L750,18 L800,8 L850,15 L900,3 L950,11 L1000,0 L1000,20 Z" fill="var(--bg-light)" />
      </svg>
      <div className="about-container">
        
        <ScrollReveal 
          className="about-text-column"
          style={{ transform: `perspective(1000px) rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg)` }}
          delay={0.1}
        >
          <h2 className="section-title torn-text" data-text="ABOUT ME">ABOUT ME</h2>
          <div className="title-underline"></div>
          <h3 className="section-subtitle">ASPIRING DATA SCIENTIST & ML ENGINEER</h3>
          <p className="about-description">
            {aboutText}
          </p>
        </ScrollReveal>
        
        <ScrollReveal className="about-image-column" delay={0.3}>
          <div className="id-card-container">
            {/* Hanging Lanyard String */}
            <div className="lanyard-string" style={{
              transform: `rotate(${mousePos.x * 10}deg)`
            }}></div>
            
            <motion.div
              className="id-badge"
              drag
              dragSnapToOrigin
              dragElastic={0.2}
              style={{
                x: dragX,
                y: dragY,
                rotateX: combinedRotateX,
                rotateY: combinedRotateY,
              }}
              whileHover={{ scale: 1.02 }}
              whileDrag={{ scale: 1.08, cursor: 'grabbing', zIndex: 50 }}
            >
              <div className="id-badge-hole">
                <div className="lanyard-clip"></div>
              </div>
              <div className="id-badge-content">
                <div className="id-badge-header">
                  <span className="company">AI & ML PORTFOLIO</span>
                </div>
                <img 
                  src={imageSrc} 
                  alt="Saimani Ippili" 
                  className="id-badge-photo" 
                />
                <h3 className="id-badge-name">Saimani</h3>
                <p className="id-badge-role">Machine Learning Engineer</p>
                <div className="id-badge-footer">
                  <div className="barcode"></div>
                  <div className="id-number">ID: 001-AI-ML</div>
                </div>
              </div>
              
              {/* Glassmorphism Shine Overlay */}
              <div className="id-badge-shine"></div>
            </motion.div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default About;
