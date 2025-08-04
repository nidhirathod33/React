import React from 'react';
import { motion } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className = '' }: SegmentedControlProps) {
  return (
    <div className={`relative flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`
            relative z-10 flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200
            ${value === option.value ? 'text-white' : 'text-white/70 hover:text-white/90'}
          `}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {value === option.value && (
            <motion.div
              layoutId="activeSegment"
              className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}