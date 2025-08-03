import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export function GlassCard({ children, className = '', animated = true }: GlassCardProps) {
  const Component = animated ? motion.div : 'div';
  
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  } : {};

  return (
    <Component
      className={`
        backdrop-blur-lg bg-white/10 border border-white/20 
        rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300
        ${className}
      `}
      {...motionProps}
    >
      {children}
    </Component>
  );
}