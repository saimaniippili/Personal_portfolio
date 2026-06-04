import React, { useState, useEffect, useRef } from 'react';

const CHARS = '01#$@%&^*<>_~/[]{}';

const ScrambleText = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef(null);

  const handleMouseEnter = () => {
    if (isScrambling) return;
    setIsScrambling(true);
    let iteration = 0;
    
    clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setDisplayText(text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iteration) {
            return text[index];
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('')
      );
      
      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
        setIsScrambling(false);
      }
      
      iteration += 1 / 3; 
    }, 30);
  };

  return (
    <span 
      className={className} 
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter}
      style={{ cursor: 'crosshair', display: 'inline-block' }}
    >
      {displayText}
    </span>
  );
};

export default ScrambleText;
