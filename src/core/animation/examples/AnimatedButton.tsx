import React from 'react';
import { withInteractionAnimation } from '../withAnimationHOC';
import { useAnimationPreset } from '../../hooks/useAnimation';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * Base Button component without animations
 */
const BaseButton: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary' 
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <button 
      onClick={handleClick}
      className={`button button-${variant}`}
    >
      {children}
    </button>
  );
};

/**
 * Button with hover and active animations
 */
export const AnimatedButton = withInteractionAnimation(BaseButton);

/**
 * Example usage of animated button with custom animation settings
 */
export const AnimatedButtonExample: React.FC = () => {
  return (
    <div className="button-examples">
      <h3>Animation Examples</h3>
      
      <div className="example-row">
        <h4>Default Scale Animation</h4>
        <AnimatedButton onClick={() => console.log('Clicked!')}>
          Hover Me (Scale)
        </AnimatedButton>
      </div>
      
      <div className="example-row">
        <h4>Fade Animation</h4>
        <AnimatedButton 
          animationType="fade"
          animationDuration="fast"
          onClick={() => console.log('Fade button clicked')}
        >
          Hover Me (Fade)
        </AnimatedButton>
      </div>
      
      <div className="example-row">
        <h4>Rotate Animation</h4>
        <AnimatedButton 
          animationType="rotate"
          animationDuration="shortest"
          animationEasing="bounce"
          onClick={() => console.log('Rotate button clicked')}
        >
          Hover Me (Rotate)
        </AnimatedButton>
      </div>
      
      <div className="example-row">
        <h4>Animation Disabled</h4>
        <AnimatedButton 
          hoverAnimation={false}
          activeAnimation={false}
          onClick={() => console.log('No animation button clicked')}
        >
          No Animation
        </AnimatedButton>
      </div>
    </div>
  );
};

export default AnimatedButton; 