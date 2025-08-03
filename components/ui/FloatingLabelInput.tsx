import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface FloatingLabelInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FloatingLabelInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  className = ''
}: FloatingLabelInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const hasValue = value.length > 0;
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full px-4 pt-6 pb-2 bg-white/10 backdrop-blur-sm border rounded-xl
            text-white placeholder-transparent focus:outline-none focus:ring-2
            transition-all duration-200
            ${error 
              ? 'border-red-400 focus:ring-red-400/50' 
              : 'border-white/30 focus:border-white/50 focus:ring-white/20'
            }
            ${isPassword ? 'pr-12' : ''}
          `}
          placeholder={label}
          required={required}
        />
        
        <motion.label
          className={`
            absolute left-4 transition-all duration-200 pointer-events-none
            ${focused || hasValue 
              ? 'top-2 text-xs text-white/80' 
              : 'top-4 text-sm text-white/60'
            }
          `}
          animate={{
            y: focused || hasValue ? -8 : 0,
            scale: focused || hasValue ? 0.85 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {label} {required && '*'}
        </motion.label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-white/60 hover:text-white/80 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}