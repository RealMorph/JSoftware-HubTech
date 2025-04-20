import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { useAnimation } from '../AnimationProvider';
import { DurationType, EasingType } from '../types';

export interface SequenceItem {
  key: string;
  component: ReactNode;
  delay?: number; // Delay in ms before this animation starts
  duration?: DurationType; // Duration of this animation
  easing?: EasingType; // Easing function for this animation
  onComplete?: () => void; // Callback when this animation completes
}

export interface AnimationSequenceProps {
  /**
   * Array of items to animate in sequence
   */
  items: SequenceItem[];
  
  /**
   * Whether to auto-start the sequence on mount
   * @default true
   */
  autoStart?: boolean;
  
  /**
   * Base delay between animations in ms 
   * @default 100
   */
  baseDelay?: number;
  
  /**
   * Whether to stagger animations when playing
   * @default true
   */
  staggered?: boolean;
  
  /**
   * Optional callback when all animations complete
   */
  onComplete?: () => void;
  
  /**
   * Whether to replay the sequence when it completes
   * @default false
   */
  loop?: boolean;
  
  /**
   * Animation container className
   */
  className?: string;
  
  /**
   * Animation container style
   */
  style?: React.CSSProperties;
  
  /**
   * Whether to preserve opacity for hidden items
   * By default hidden items have opacity 0
   * @default false
   */
  preserveOpacity?: boolean;
}

/**
 * A component that orchestrates multiple animations in sequence
 */
const AnimationSequence: React.FC<AnimationSequenceProps> = ({
  items,
  autoStart = true,
  baseDelay = 100,
  staggered = true,
  onComplete,
  loop = false,
  className,
  style,
  preserveOpacity = false,
}) => {
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(autoStart);
  const animation = useAnimation();
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
      
      if (animationCompleteTimeoutRef.current) {
        clearTimeout(animationCompleteTimeoutRef.current);
      }
    };
  }, []);
  
  // Play the sequence when isPlaying becomes true
  useEffect(() => {
    if (isPlaying) {
      playSequence();
    }
  }, [isPlaying, items]);
  
  // Reset and play from the beginning
  const resetAndPlay = () => {
    setActiveIndices([]);
    setIsPlaying(true);
  };
  
  // Stop the sequence
  const stop = () => {
    setIsPlaying(false);
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
    }
  };
  
  // Play the sequence from current position
  const playSequence = () => {
    if (!items.length) return;
    
    let currentIndex = activeIndices.length;
    
    const playNextAnimation = () => {
      if (currentIndex >= items.length) {
        // All animations complete
        if (loop) {
          // If looping, reset and start again after a delay
          animationCompleteTimeoutRef.current = setTimeout(() => {
            resetAndPlay();
          }, baseDelay * 2);
        } else {
          setIsPlaying(false);
          if (onComplete) {
            onComplete();
          }
        }
        return;
      }
      
      // Add the current index to active indices
      setActiveIndices(prev => [...prev, currentIndex]);
      
      // Get current item
      const currentItem = items[currentIndex];
      
      // Calculate delay for next animation
      const delay = staggered 
        ? (currentItem.delay ?? baseDelay)
        : 0;
      
      // Calculate duration based on theme
      const durationMs = animation.durations[currentItem.duration || 'standard'] 
        ? parseInt(animation.durations[currentItem.duration || 'standard']) 
        : 300;
      
      // Item completion callback
      if (currentItem.onComplete) {
        setTimeout(() => {
          currentItem.onComplete?.();
        }, durationMs);
      }
      
      // Increment index for next animation
      currentIndex++;
      
      // Schedule next animation
      sequenceTimeoutRef.current = setTimeout(playNextAnimation, delay);
    };
    
    // Start the sequence
    playNextAnimation();
  };
  
  return (
    <div className={className} style={style}>
      {items.map((item, index) => {
        const isActive = activeIndices.includes(index);
        
        return (
          <div 
            key={item.key}
            style={{
              opacity: isActive || preserveOpacity ? 1 : 0,
              transition: `opacity ${animation.durations[item.duration || 'standard']} ${animation.easings[item.easing || 'easeOut']}`,
            }}
          >
            {item.component}
          </div>
        );
      })}
    </div>
  );
};

export default AnimationSequence; 