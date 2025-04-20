import React from 'react';
import { withEntranceAnimation, withInteractionAnimation, WithEntranceAnimationProps, WithInteractionAnimationProps } from '../';

interface CardProps {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
}

// Base Card component without animations
export const Card: React.FC<CardProps> = ({ title, children, onClick }) => {
  return (
    <div 
      className="card" 
      onClick={onClick}
      style={{
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        margin: '10px',
        background: 'white'
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
};

// Card with entrance animation
export const EntranceAnimatedCard = withEntranceAnimation(Card);

// Card with hover/interaction animation
export const InteractiveCard = withInteractionAnimation(Card);

// Card with both entrance and interaction animations
export const FullyAnimatedCard = withInteractionAnimation(
  withEntranceAnimation(Card)
);

// Usage example
export const AnimatedCardExample: React.FC = () => {
  return (
    <div>
      <h2>Animation Examples</h2>
      
      <EntranceAnimatedCard 
        title="Entrance Animation"
        animationDelay={300}
      >
        This card fades in when mounted
      </EntranceAnimatedCard>
      
      <InteractiveCard 
        title="Interactive Card"
        hoverAnimation={true}
      >
        Hover over me to see scale effect
      </InteractiveCard>
      
      <FullyAnimatedCard
        title="Fully Animated Card"
        animationDelay={300}
        hoverAnimation={true}
      >
        This card fades in on mount and responds to interactions
      </FullyAnimatedCard>
    </div>
  );
}; 