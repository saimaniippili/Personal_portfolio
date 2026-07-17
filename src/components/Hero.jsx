import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FaFileDownload } from 'react-icons/fa';
import { Smartphone, Terminal } from 'lucide-react';
import ScrambleText from './ScrambleText';
import './Hero.css';



const Hero = () => {
  const [resumeUrl, setResumeUrl] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hasTilted, setHasTilted] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('portfolio_profile').select('resume_url').limit(1).single();
      if (data && data.resume_url) {
        setResumeUrl(data.resume_url);
      }
    };
    fetchProfile();

    const handleGyroscope = (e) => {
      if (e.gamma !== null && e.beta !== null && window.innerWidth <= 768) {
        const { innerWidth, innerHeight } = window;
        
        const gamma = Math.min(Math.max(e.gamma, -45), 45); 
        const xPos = ((gamma + 45) / 90) * innerWidth;
        
        const beta = Math.min(Math.max(e.beta - 45, -45), 45);
        const yPos = ((beta + 45) / 90) * innerHeight;

        if (sectionRef.current) {
          sectionRef.current.style.setProperty('--mouse-x', `${xPos}px`);
          sectionRef.current.style.setProperty('--mouse-y', `${yPos}px`);
        }
        
        const x = (xPos / innerWidth - 0.5) * 2;
        const y = (yPos / innerHeight - 0.5) * 2;
        setMousePos({ x, y });
        
        if (Math.abs(e.gamma) > 15 || Math.abs(e.beta - 45) > 15) {
          setHasTilted(true);
        }
      }
    };

    window.addEventListener('deviceorientation', handleGyroscope);
    return () => window.removeEventListener('deviceorientation', handleGyroscope);
  }, []);

  const handlePointerMove = (e) => {
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const xPos = clientX - rect.left;
      const yPos = clientY - rect.top;
      sectionRef.current.style.setProperty('--mouse-x', `${xPos}px`);
      sectionRef.current.style.setProperty('--mouse-y', `${yPos}px`);
    }
    
    const x = (clientX / window.innerWidth - 0.5) * 2;
    const y = (clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  return (
    <section 
      id="hero" 
      className="hero-section sleek-theme" 
      onMouseMove={handlePointerMove}
      ref={sectionRef}
    >
      
      {/* Interactive Neural Grid Background */}
      <div className="neural-grid-bg"></div>
      <div className="hero-data-spotlight"></div>
      


      <div className="hero-container" style={{ transform: `perspective(1000px) rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg)` }}>
        
        {/* Terminal Subtitle */}
        <div className="terminal-subtitle-wrapper" style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}>
          <div className="terminal-header">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <div className="terminal-body">
            <Terminal size={14} className="terminal-icon" />
            <span className="terminal-text">
              <ScrambleText text="DATA SCIENTIST | ML ENGINEER" />
            </span>
            <span className="cursor-blink">_</span>
          </div>
        </div>
        
        <div className="hero-title-container">
          <h1 className="hero-title glass-text">
            SAIMANI <br/> IPPILI
          </h1>
          {/* Glitch Overlay for hover effect */}
          <h1 className="hero-title glitch-overlay" aria-hidden="true">
            SAIMANI <br/> IPPILI
          </h1>
        </div>
        
      </div>

      {resumeUrl && (
        <a href={resumeUrl} target="_blank" rel="noreferrer" className="hud-resume-btn" title="View / Download Resume">
          <div className="hud-resume-content">
            <span className="hud-dot"></span>
            <span className="hud-text">SYS.RESUME</span>
            <FaFileDownload size={14} className="hud-icon" />
          </div>
          <div className="hud-scanner"></div>
        </a>
      )}

      <div className={`mobile-tilt-hint ${hasTilted ? 'hidden' : ''}`}>
        <Smartphone size={32} className="phone-icon-animated" />
        <span>TILT TO EXPLORE</span>
      </div>



      {/* Smooth Geometric Transition to About Section */}
      <svg className="sleek-curve-bottom" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z" fill="var(--bg-light)" />
      </svg>
    </section>
  );
};

export default Hero;
