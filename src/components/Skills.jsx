import React, { useState, useEffect, useRef } from 'react';
import { skills } from '../constants';
import { FaPython, FaDatabase, FaAws, FaReact, FaNodeJs, FaGitAlt, FaLinux, FaBrain, FaRobot } from 'react-icons/fa';
import './Skills.css';
import ScrollReveal from './ScrollReveal';

const initialTools = [
  { name: 'Python', icon: <FaPython />, color: '#3776AB' },
  { name: 'SQL', icon: <FaDatabase />, color: '#00758F' },
  { name: 'AWS', icon: <FaAws />, color: '#FF9900' },
  { name: 'React', icon: <FaReact />, color: '#61DAFB' },
  { name: 'Node.js', icon: <FaNodeJs />, color: '#339933' },
  { name: 'Git', icon: <FaGitAlt />, color: '#F05032' },
  { name: 'Linux', icon: <FaLinux />, color: '#FCC624' },
  { name: 'Machine Learning', icon: <FaBrain />, color: '#FF4B4B' },
  { name: 'Gen AI', icon: <FaRobot />, color: '#10A37F' },
];

const MagneticToolCard = ({ tool, index }) => {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024 || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    const pullX = (distanceX / rect.width) * 15;
    const pullY = (distanceY / rect.height) * 15;
    
    const rotateX = (distanceY / rect.height) * -20;
    const rotateY = (distanceX / rect.width) * 20;

    setPosition({ x: pullX, y: pullY });
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div className="magnetic-wrapper" style={{ animationDelay: `${index * 0.1}s` }}>
      <div
        ref={cardRef}
        className={`premium-tool-box ${isHovered ? 'hovered' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.05 : 1})`,
          '--brand-color': tool.color,
          transition: isHovered ? 'none' : 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        <div className="tool-glow"></div>
        <div className="tool-icon">{tool.icon}</div>
        <div className="tool-name-fade">{tool.name}</div>
      </div>
    </div>
  );
};

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Shake to shuffle states
  const [currentTools, setCurrentTools] = useState(initialTools);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasShaken, setHasShaken] = useState(false);
  const isShufflingRef = useRef(false);

  useEffect(() => {
    let lastX, lastY, lastZ;
    const SHAKE_THRESHOLD = 15;

    const handleMotion = (e) => {
      if (window.innerWidth > 768) return; // Only on mobile
      
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      
      if (lastX !== undefined) {
        const deltaX = Math.abs(lastX - acc.x);
        const deltaY = Math.abs(lastY - acc.y);
        const deltaZ = Math.abs(lastZ - acc.z);
        
        if (deltaX > SHAKE_THRESHOLD || deltaY > SHAKE_THRESHOLD || deltaZ > SHAKE_THRESHOLD) {
          if (!isShufflingRef.current) {
            isShufflingRef.current = true;
            setHasShaken(true);
            setIsShuffling(true);
            
            setCurrentTools(prev => [...prev].sort(() => Math.random() - 0.5));

            setTimeout(() => {
              isShufflingRef.current = false;
              setIsShuffling(false);
            }, 800);
          }
        }
      }
      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
    };

    // Need permission on iOS 13+ but we'll attach normally and it will work on Android & older iOS
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

    const gridRef = useRef(null);

    const handleGridMouseMove = (e) => {
      if (window.innerWidth < 1024 || !gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gridRef.current.style.setProperty('--mouse-x', `${x}px`);
      gridRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
      <section id="skills" className="skills-section">
        <svg className="torn-top" viewBox="0 0 1000 20" preserveAspectRatio="none">
          <path d="M0,20 L0,10 L50,15 L100,5 L150,12 L200,2 L250,18 L300,8 L350,16 L400,4 L450,14 L500,6 L550,18 L600,3 L650,15 L700,7 L750,19 L800,2 L850,12 L900,5 L950,17 L1000,9 L1000,20 Z" fill="var(--accent-red)" />
        </svg>

        <div className="skills-wrapper">
          
          <ScrollReveal className="skills-column approach-column" delay={0.1}>
            <h2 className="skills-heading torn-text" data-text="APPROACH">APPROACH</h2>
            <div className="approach-timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <h3>01. DATA PIPELINES</h3>
                <p>Designing robust ETL/ELT pipelines, ensuring data is clean, transformed, and ready for modeling.</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <h3>02. MODEL TRAINING</h3>
                <p>Applying state-of-the-art ML algorithms and fine-tuning models for high accuracy and scalability.</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <h3>03. GEN-AI INTEGRATION</h3>
                <p>Leveraging RAG and local LLMs (Ollama) to build conversational agents and smart applications.</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="skills-column expertise-column" delay={0.3}>
            <h2 className="skills-heading torn-text" data-text="EXPERTISE">EXPERTISE</h2>
            <div className="expertise-accordion">
              {skills.map((skillGroup, idx) => (
                <div 
                  key={idx} 
                  className={`expertise-card ${activeCategory === idx ? 'active' : ''}`}
                  onMouseEnter={() => setActiveCategory(idx)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <div className="expertise-card-header">
                    <h3>{skillGroup.category}</h3>
                    <span className="expertise-icon">{activeCategory === idx ? '−' : '+'}</span>
                  </div>
                  <div className="expertise-tags-container">
                    {skillGroup.items.map(item => (
                      <span className="expertise-tag" key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
          
          <ScrollReveal className="skills-column tools-column" delay={0.5}>
            <h2 className="skills-heading torn-text" data-text="TOOLS">TOOLS</h2>
            {!hasShaken && (
              <div className="mobile-shake-hint">
                📱 SHAKE TO SHUFFLE
              </div>
            )}
            <div 
              className={`premium-tools-grid ${isShuffling ? 'shuffling' : ''}`}
              ref={gridRef}
              onMouseMove={handleGridMouseMove}
            >
              {/* Ambient Particles */}
              <div className="ambient-particles">
                <div className="particle p1"></div>
                <div className="particle p2"></div>
                <div className="particle p3"></div>
              </div>

              {currentTools.map((tool, idx) => (
                <MagneticToolCard key={tool.name} tool={tool} index={idx} />
              ))}
            </div>
          </ScrollReveal>

        </div>
      </section>
  );
};

export default Skills;
