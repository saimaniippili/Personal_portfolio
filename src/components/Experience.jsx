import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { education, achievements, certifications as localCertifications } from '../constants';
import { FaGraduationCap, FaTrophy, FaCertificate } from 'react-icons/fa';
import './Experience.css';

import ScrollReveal from './ScrollReveal';

const Experience = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [dbCertifications, setDbCertifications] = useState([]);

  useEffect(() => {
    const fetchCertifications = async () => {
      const { data, error } = await supabase.from('portfolio_certifications').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setDbCertifications(data);
      }
    };
    fetchCertifications();
  }, []);

  const handleMouseEnter = (id) => setHoveredCard(id);
  const handleMouseLeave = () => setHoveredCard(null);

  // Helper to determine if a card should be dimmed
  const getCardClass = (id) => {
    if (!hoveredCard) return 'exp-card';
    return hoveredCard === id ? 'exp-card focused' : 'exp-card dimmed';
  };

  const displayCerts = dbCertifications.length > 0 
    ? dbCertifications 
    : localCertifications.map((c, i) => ({ id: i, name: c, credential_url: null }));

  return (
    <section id="experience" className="experience-section">
      <svg className="torn-top" viewBox="0 0 1000 20" preserveAspectRatio="none">
        <path d="M0,20 L0,10 L50,15 L100,5 L150,12 L200,2 L250,18 L300,8 L350,16 L400,4 L450,14 L500,6 L550,18 L600,3 L650,15 L700,7 L750,19 L800,2 L850,12 L900,5 L950,17 L1000,9 L1000,20 Z" fill="var(--bg-light)" />
      </svg>
      
      <div className="section-padding" style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <ScrollReveal className="exp-header" delay={0.1}>
          <h2 className="exp-heading torn-text" data-text="JOURNEY & MILESTONES">JOURNEY & MILESTONES</h2>
          <p className="exp-subheading">A timeline of my academic background, professional certifications, and top achievements.</p>
        </ScrollReveal>
        
        <div className="exp-container">
          
          {/* Education Column */}
          <div className="exp-column">
            <div className="column-header">
              <div className="icon-wrapper"><FaGraduationCap /></div>
              <h3 className="column-title">EDUCATION</h3>
            </div>
            <div className="timeline-line"></div>
            {education.map((edu, idx) => {
              const id = `edu-${idx}`;
              return (
                <ScrollReveal key={idx} delay={0.2 + (idx * 0.1)}>
                  <div 
                    className={getCardClass(id)}
                    onMouseEnter={() => handleMouseEnter(id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="card-dot"></div>
                    <div className="exp-date">{edu.date}</div>
                    <h4 className="exp-degree">{edu.degree}</h4>
                    <div className="exp-inst">{edu.institution}</div>
                    {edu.location && <div className="exp-location">{edu.location}</div>}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Achievements Column */}
          <div className="exp-column">
            <div className="column-header">
              <div className="icon-wrapper"><FaTrophy /></div>
              <h3 className="column-title">ACHIEVEMENTS</h3>
            </div>
            <div className="timeline-line"></div>
            {achievements.map((ach, idx) => {
              const id = `ach-${idx}`;
              return (
                <ScrollReveal key={idx} delay={0.2 + (idx * 0.1)}>
                  <div 
                    className={getCardClass(id)}
                    onMouseEnter={() => handleMouseEnter(id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="card-dot"></div>
                    <h4 className="exp-degree">{ach.title}</h4>
                    <div className="exp-inst">{ach.description}</div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Certifications Column */}
          <div className="exp-column">
            <div className="column-header">
              <div className="icon-wrapper"><FaCertificate /></div>
              <h3 className="column-title">CERTIFICATIONS</h3>
            </div>
            <div className="timeline-line"></div>
            {displayCerts.map((cert, idx) => {
              const id = `cert-${idx}`;
              return (
                <ScrollReveal key={idx} delay={0.2 + (idx * 0.1)}>
                  <div 
                    className={getCardClass(id)}
                    onMouseEnter={() => handleMouseEnter(id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="card-dot"></div>
                    <h4 className="exp-degree">{cert.name}</h4>
                    {cert.credential_url ? (
                      <a href={cert.credential_url} target="_blank" rel="noreferrer" className="exp-inst" style={{ color: 'var(--accent-red)', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginTop: '5px' }}>
                        View Credential →
                      </a>
                    ) : (
                      <div className="exp-inst" style={{ color: 'var(--accent-red)', fontWeight: '600' }}>Verified Credential</div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </div>
      
      {/* Background Decor */}
      <div className="exp-bg-grid"></div>
    </section>
  );
};

export default Experience;
