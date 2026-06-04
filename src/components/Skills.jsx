import React, { useState, useEffect, useRef } from 'react';
import { skills } from '../constants';
import { FaPython, FaDatabase, FaAws, FaReact, FaNodeJs, FaGitAlt, FaLinux, FaBrain, FaRobot } from 'react-icons/fa';
import './Skills.css';
import ScrollReveal from './ScrollReveal';

const initialTools = [
  { name: 'Python', icon: <FaPython /> },
  { name: 'SQL', icon: <FaDatabase /> },
  { name: 'AWS', icon: <FaAws /> },
  { name: 'React', icon: <FaReact /> },
  { name: 'Node.js', icon: <FaNodeJs /> },
  { name: 'Git', icon: <FaGitAlt /> },
  { name: 'Linux', icon: <FaLinux /> },
  { name: 'Machine Learning', icon: <FaBrain /> },
  { name: 'Gen AI', icon: <FaRobot /> },
];

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
          <div className={`premium-tools-grid ${isShuffling ? 'shuffling' : ''}`}>
            {currentTools.map((tool, idx) => (
              <div key={tool.name} className="premium-tool-box">
                {tool.icon}
                <div className="tool-tooltip">{tool.name}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default Skills;
