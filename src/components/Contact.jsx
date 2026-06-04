import React, { useState, useRef, useEffect } from 'react';
import { FaLinkedin, FaGithub, FaKaggle, FaEnvelope, FaPhone } from 'react-icons/fa';
import { personalInfo } from '../constants';
import './Contact.css';

import ScrollReveal from './ScrollReveal';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(''); // '', 'submitting', 'success', 'error'
  const [focusedField, setFocusedField] = useState(null);
  
  // Interactive states
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringForm, setIsHoveringForm] = useState(false);
  const sectionRef = useRef(null);

  const handleMouseMove = (e) => {
    if (window.innerWidth <= 768) return; // Prevent conflict with gyro
    if (!sectionRef.current) return;
    const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - top) / height - 0.5; // -0.5 to 0.5
    setMousePos({ x: x * 2, y: y * 2 });
  };

  useEffect(() => {
    const handleGyroscope = (e) => {
      if (e.gamma !== null && e.beta !== null && window.innerWidth <= 768) {
        const { innerWidth, innerHeight } = window;
        const gamma = Math.min(Math.max(e.gamma, -45), 45); 
        const xPos = ((gamma + 45) / 90) * innerWidth;
        const beta = Math.min(Math.max(e.beta - 45, -45), 45);
        const yPos = ((beta + 45) / 90) * innerHeight;

        const x = (xPos / innerWidth - 0.5) * 2;
        const y = (yPos / innerHeight - 0.5) * 2;
        setMousePos({ x, y });
        setIsHoveringForm(true); // Force 3D tilt on mobile
      }
    };

    window.addEventListener('deviceorientation', handleGyroscope);
    return () => window.removeEventListener('deviceorientation', handleGyroscope);
  }, []);

  const calculateProgress = () => {
    let progress = 0;
    if (formData.name.trim().length > 2) progress += 33.33;
    if (formData.email.trim().includes('@') && formData.email.trim().includes('.')) progress += 33.33;
    if (formData.message.trim().length > 10) progress += 33.34;
    return progress;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: 'daaeb9b0-94c5-49cd-8a67-ae1ee276f13b',
          ...formData
        })
      });

      const result = await response.json();
      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus(''), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Submission error', error);
      setStatus('error');
    }
  };

  return (
    <section 
      id="contact" 
      className="contact-section" 
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
    >
      <svg className="torn-top" viewBox="0 0 1000 20" preserveAspectRatio="none">
        <path d="M0,20 L0,10 L50,15 L100,5 L150,12 L200,2 L250,18 L300,8 L350,16 L400,4 L450,14 L500,6 L550,18 L600,3 L650,15 L700,7 L750,19 L800,2 L850,12 L900,5 L950,17 L1000,9 L1000,20 Z" fill="var(--bg-dark)" />
      </svg>
      
      {/* Interactive Background Orbs */}
      <div 
        className="contact-orb" 
        style={{ transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)` }}
      ></div>
      <div 
        className="contact-orb orb-2" 
        style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
      ></div>

      <div className="contact-container">
        <ScrollReveal className="contact-info" delay={0.1}>
          <h2 className="contact-heading torn-text" data-text="LET'S CONNECT">LET'S CONNECT</h2>
          <div className="contact-divider"></div>
          <p className="contact-text">
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision. 
            Drop me a line below!
          </p>
          
          <div className="contact-details">
            <a href={`mailto:${personalInfo.email}`} className="contact-item magnetic">
              <div className="contact-icon-wrapper"><FaEnvelope /></div>
              <span>{personalInfo.email}</span>
            </a>
            <a href={`tel:${personalInfo.phone}`} className="contact-item magnetic">
              <div className="contact-icon-wrapper"><FaPhone /></div>
              <span>{personalInfo.phone}</span>
            </a>
          </div>
          
          <div className="social-links">
            <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="social-icon">
              <FaLinkedin />
            </a>
            <a href={personalInfo.github} target="_blank" rel="noreferrer" className="social-icon">
              <FaGithub />
            </a>
            <a href={personalInfo.kaggle} target="_blank" rel="noreferrer" className="social-icon">
              <FaKaggle />
            </a>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={0.3} style={{ flex: 1.2, minWidth: '300px' }}>
          <div 
            className="contact-form-3d-wrapper"
            onMouseEnter={() => setIsHoveringForm(true)}
            onMouseLeave={() => setIsHoveringForm(false)}
            style={{
              transform: isHoveringForm 
                ? `perspective(1000px) rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg) scale3d(1.02, 1.02, 1.02)` 
                : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
            }}
          >
            <div className="contact-form-wrapper">
              <div className="form-progress-container">
                <div className="form-progress-bar" style={{ width: `${calculateProgress()}%` }}></div>
              </div>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className={`input-group ${focusedField === 'name' ? 'focused' : ''} ${formData.name ? 'has-value' : ''}`}>
                  <label>YOUR NAME</label>
                  <input 
                    type="text" 
                    name="name"
                    className="form-input" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <div className="input-highlight"></div>
                </div>
                
                <div className={`input-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}>
                  <label>YOUR EMAIL</label>
                  <input 
                    type="email" 
                    name="email"
                    className="form-input" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <div className="input-highlight"></div>
                </div>
                
                <div className={`input-group ${focusedField === 'message' ? 'focused' : ''} ${formData.message ? 'has-value' : ''}`}>
                  <label>YOUR MESSAGE</label>
                  <textarea 
                    name="message"
                    rows="4" 
                    className="form-textarea"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                  ></textarea>
                  <div className="input-highlight"></div>
                </div>
                
                <button 
                  type="submit" 
                  className={`submit-btn ${status}`} 
                  disabled={status === 'submitting'}
                >
                  <span className="btn-text">
                    {status === 'submitting' ? 'SENDING...' : status === 'success' ? 'MESSAGE SENT!' : status === 'error' ? 'ERROR. TRY AGAIN' : 'SEND MESSAGE'}
                  </span>
                  <div className="btn-hover-effect"></div>
                </button>
              </form>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Contact;
