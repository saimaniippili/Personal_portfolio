import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { personalInfo } from '../constants';
import profileImgFallback from '../assets/profile.png';
import './About.css';

import ScrollReveal from './ScrollReveal';

const About = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from('portfolio_profile').select('*').limit(1).single();
    if (data) setProfile(data);
  };

  const aboutText = profile?.about_text || personalInfo.objective || personalInfo.about;
  const imageSrc = profile?.profile_image_url || profileImgFallback;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
    const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
    setMousePos({ x, y });
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
          <div className="premium-image-wrapper">
            <div 
              className="dots-pattern"
              style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` }}
            ></div>
            <div 
              className="geometric-blob"
              style={{ transform: `translateX(calc(-50% + ${mousePos.x * 10}px)) translateY(${mousePos.y * 10}px)` }}
            ></div>
            <div className="image-glow"></div>
            <img 
              src={imageSrc} 
              alt="Saimani Ippili" 
              className="premium-profile-image" 
              style={{ transform: `translate(${mousePos.x * -5}px, ${mousePos.y * -5}px)` }}
            />
            
            <div 
              className="laptop-accent"
              style={{ transform: `rotate(-15deg) translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)` }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="80" height="80">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="2" y1="20" x2="22" y2="20"></line>
              </svg>
            </div>
            <div 
              className="side-text"
              style={{ transform: `translateY(calc(-50% + ${mousePos.y * -20}px)) rotate(-90deg) translateX(${mousePos.x * -20}px)` }}
            >
              AI & ML
            </div>
            <div 
              className="signature-accent"
              style={{ transform: `rotate(-10deg) translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
            >
              Saimani
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default About;
