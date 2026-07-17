import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { personalInfo } from '../constants';
import profileImgFallback from '../assets/profile.png';
import './About.css';
import PhysicsIDCard from './PhysicsIDCard';

import ScrollReveal from './ScrollReveal';

const About = () => {
  const [profile, setProfile] = useState(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
          
          <div className="about-image-column">
            <PhysicsIDCard imageSrc={imageSrc} mousePos={mousePos} />
          </div>

        </div>
    </section>
  );
};

export default About;
