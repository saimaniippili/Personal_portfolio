import React from 'react';
import { motion } from 'framer-motion';

/**
 * ScrollReveal wrapper component.
 * Uses Framer Motion to smoothly fade and slide elements up as they scroll into view.
 */
const ScrollReveal = ({ 
  children, 
  className = '', 
  delay = 0, 
  yOffset = 60,
  duration = 0.8,
  once = true,
  style = {}
}) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: once, margin: "-50px" }}
      transition={{ 
        duration: duration, 
        delay: delay, 
        ease: [0.175, 0.885, 0.32, 1.1] // Premium cubic bezier ease (slight overshoot)
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
