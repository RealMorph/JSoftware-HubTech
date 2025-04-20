import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useEntranceAnimation, useExitAnimation } from '../../animation/hooks/useAnimationPreset';
import { useMotionPreference } from '../../animation/hooks/useMotionPreference';
import { AnimationType, DurationType } from '../../animation/types';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  animationType?: AnimationType;
  animationDuration?: DurationType;
}

/**
 * AnimatedModal - A modal component with built-in animations
 */
export const AnimatedModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  className = '',
  animationType = 'fade',
  animationDuration = 'standard',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Get animation presets
  const entranceAnimation = useEntranceAnimation(animationType, 'in', animationDuration);
  const exitAnimation = useExitAnimation(animationType, 'out', animationDuration);
  const { shouldUseMotion, getReducedMotionDuration } = useMotionPreference();
  
  const useMotion = shouldUseMotion();
  const duration = getReducedMotionDuration(300); // Standard duration in ms
  const durationMs = `${duration}ms`;
  
  // Handle visibility with animation timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);
  
  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  
  if (!isVisible) return null;
  
  // Size mapping
  const sizeStyles = {
    small: { width: '300px', maxWidth: '90%' },
    medium: { width: '500px', maxWidth: '90%' },
    large: { width: '800px', maxWidth: '95%' }
  };
  
  // Create animation styles
  const getModalAnimationStyle = () => {
    if (!useMotion) return {};
    
    return {
      opacity: isOpen ? 1 : 0,
      transform: isOpen ? 'scale(1)' : 'scale(0.95)',
      transition: `opacity ${durationMs} ${theme.animation.easing.easeInOut}, transform ${durationMs} ${theme.animation.easing.easeOut}`
    };
  };
  
  const backdropStyle = {
    opacity: isOpen ? 0.5 : 0,
    transition: useMotion ? `opacity ${durationMs} ${theme.animation.easing.easeInOut}` : 'none'
  };
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900" 
        style={backdropStyle}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden flex flex-col ${className}`}
        style={{
          ...sizeStyles[size],
          ...getModalAnimationStyle()
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title || 'Modal'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AnimatedModal; 