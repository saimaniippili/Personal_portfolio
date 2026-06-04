import React, { useState, useEffect, useRef } from 'react';
import { navLinks, personalInfo } from '../constants';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeRect, setActiveRect] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const linksRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 200) {
        setHidden(true); // scrolling down
      } else {
        setHidden(false); // scrolling up
      }
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (e) => {
    const { offsetLeft, offsetWidth } = e.currentTarget;
    setActiveRect({ left: offsetLeft, width: offsetWidth });
  };

  const handleMouseLeave = () => {
    setActiveRect(null);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${hidden ? 'hidden' : ''}`}>
      <div className="nav-content">
        <a href="#hero" className="logo torn-logo" data-text={personalInfo.name.toUpperCase()}>
          {personalInfo.name.toUpperCase()}
        </a>
        
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`} ref={linksRef} onMouseLeave={handleMouseLeave}>
          <div 
            className="nav-highlight" 
            style={{ 
              left: activeRect ? activeRect.left : 0, 
              width: activeRect ? activeRect.width : 0,
              opacity: activeRect ? 1 : 0
            }} 
          />
          {navLinks.map((link) => (
            <li key={link.id} onMouseEnter={handleMouseEnter} className="nav-item">
              <a href={`#${link.id}`} onClick={() => setMobileMenuOpen(false)}>{link.title.toUpperCase()}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
