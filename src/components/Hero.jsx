import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FaFileDownload } from 'react-icons/fa';
import { Smartphone } from 'lucide-react';
import ScrambleText from './ScrambleText';
import './Hero.css';

const Hero = () => {
  const [resumeUrl, setResumeUrl] = useState('');
  const [offsetY, setOffsetY] = useState(0);
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
      // Only execute on mobile sizes if gyro data exists
      if (e.gamma !== null && e.beta !== null && window.innerWidth <= 768) {
        const { innerWidth, innerHeight } = window;
        
        // Map gamma [-45, 45] to [0, innerWidth]
        const gamma = Math.min(Math.max(e.gamma, -45), 45); 
        const xPos = ((gamma + 45) / 90) * innerWidth;
        
        // Map beta [-45, 45] to [0, innerHeight], assuming holding at 45deg
        const beta = Math.min(Math.max(e.beta - 45, -45), 45);
        const yPos = ((beta + 45) / 90) * innerHeight;

        if (sectionRef.current) {
          sectionRef.current.style.setProperty('--mouse-x', `${xPos}px`);
          sectionRef.current.style.setProperty('--mouse-y', `${yPos}px`);
        }

        const center = innerHeight / 2;
        const distance = yPos - center;
        setOffsetY((distance / center) * -40);
        
        const x = (xPos / innerWidth - 0.5) * 2;
        const y = (yPos / innerHeight - 0.5) * 2;
        setMousePos({ x, y });
        
        // Hide hint once they significantly tilt the device
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
    
    // Handle both mouse and touch events
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Spotlight variables
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const xPos = clientX - rect.left;
      const yPos = clientY - rect.top;
      sectionRef.current.style.setProperty('--mouse-x', `${xPos}px`);
      sectionRef.current.style.setProperty('--mouse-y', `${yPos}px`);
    }

    const center = window.innerHeight / 2;
    const distance = clientY - center;
    
    // Parallax effect: max 40px displacement
    setOffsetY((distance / center) * -40);
    
    // 3D Tilt effect
    const x = (clientX / window.innerWidth - 0.5) * 2;
    const y = (clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  return (
    <section 
      id="hero" 
      className="hero-section" 
      onMouseMove={handlePointerMove}
      ref={sectionRef}
    >
      
      {/* Interactive Data Spotlight Layer */}
      <div className="hero-data-spotlight"></div>
      


      {/* Floating Paper Scraps */}
      <div className="hero-paper-scraps" style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}>
        <div className="scrap s1"></div>
        <div className="scrap s2"></div>
        <div className="scrap s3"></div>
        <div className="scrap s4"></div>
        <div className="scrap s5"></div>
      </div>

      <div className="hero-container" style={{ transform: `perspective(1000px) rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg)` }}>
        
        {/* Subtitle */}
        <div className="subtitle-wrapper" style={{ position: 'absolute', top: '-100px', left: '15%', zIndex: 9999, transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}>
          <h2 className="hero-subtitle handwriting">
            <ScrambleText text="Building with Data, AI & Analytics" />
          </h2>
        </div>
        
        <div className="portfolio-text-container">
          {/* Top layer (White) */}
          <h1 className="portfolio-text white-layer">PORTFOLIO</h1>
          
          {/* Middle layer (Red ripped banner) */}
          <div 
            className="red-banner"
            style={{ transform: `translateY(${offsetY}px) rotate(-3deg)` }}
          >
            <svg className="rip-top" viewBox="0 0 1000 20" preserveAspectRatio="none">
              <path d="M0,20 L0,10 L50,15 L100,5 L150,12 L200,2 L250,18 L300,8 L350,16 L400,4 L450,14 L500,6 L550,18 L600,3 L650,15 L700,7 L750,19 L800,2 L850,12 L900,5 L950,17 L1000,9 L1000,20 Z" fill="var(--accent-red)" />
            </svg>
            <div className="red-banner-content">
              <h1 
                className="portfolio-text red-layer"
                style={{ transform: `translate(-50%, calc(-50% - ${offsetY}px)) rotate(3deg)` }}
              >
                PORTFOLIO
              </h1>
            </div>
            <svg className="rip-bottom" viewBox="0 0 1000 20" preserveAspectRatio="none">
              <path d="M0,0 L0,10 L50,5 L100,15 L150,8 L200,18 L250,2 L300,12 L350,4 L400,16 L450,6 L500,14 L550,2 L600,17 L650,5 L700,13 L750,1 L800,18 L850,8 L900,15 L950,3 L1000,11 L1000,0 Z" fill="var(--accent-red)" />
            </svg>
          </div>
        </div>
      </div>

      <div className={`mobile-tilt-hint ${hasTilted ? 'hidden' : ''}`}>
        <Smartphone size={32} className="phone-icon-animated" />
        <span>TILT TO EXPLORE</span>
      </div>

      {resumeUrl && (
        <a href={resumeUrl} target="_blank" rel="noreferrer" className="resume-download-btn" title="View / Download Resume">
          <FaFileDownload size={24} />
        </a>
      )}

      {/* Torn Paper Divider - Moved here to perfectly mask the lanyard string from the About section! */}
      <svg className="torn-top" viewBox="0 0 1000 20" preserveAspectRatio="none">
        <path d="M0,20 L0,0 L50,15 L100,5 L150,18 L200,2 L250,12 L300,4 L350,16 L400,6 L450,14 L500,2 L550,17 L600,5 L650,13 L700,1 L750,18 L800,8 L850,15 L900,3 L950,11 L1000,0 L1000,20 Z" fill="var(--bg-light)" />
      </svg>
    </section>
  );
};

export default Hero;
