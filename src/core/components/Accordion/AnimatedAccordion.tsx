import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useMotionPreference, useEntranceAnimation, useExitAnimation } from '../../animation';
import { AnimationType, DurationType } from '../../animation/types';

// Accordion item props
export interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  animationType?: AnimationType;
  animationDuration?: DurationType;
}

// Accordion props
export interface AccordionProps {
  items?: AccordionItemProps[];
  children?: React.ReactNode;
  allowMultiple?: boolean;
  defaultOpenIndexes?: number[];
  onChange?: (openIndexes: number[]) => void;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  variant?: 'default' | 'bordered' | 'filled';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  animationType?: AnimationType;
  animationDuration?: DurationType;
}

/**
 * AccordionItem - Individual item in the accordion
 */
export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen = false,
  onToggle,
  disabled = false,
  className = '',
  id,
  animationType = 'fade',
  animationDuration = 'standard',
}) => {
  const theme = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0);
  const { shouldUseMotion, getReducedMotionDuration } = useMotionPreference();
  
  const useMotion = shouldUseMotion();
  const duration = getReducedMotionDuration(
    parseInt(theme.animation?.duration?.[animationDuration] || '300')
  );
  const durationMs = `${duration}ms`;
  
  // Get animation presets
  const entranceAnimation = useEntranceAnimation(animationType, 'in', animationDuration);
  const exitAnimation = useExitAnimation(animationType, 'out', animationDuration);
  
  // Update height when isOpen changes
  useEffect(() => {
    if (!contentRef.current) return;
    
    if (isOpen) {
      // Get the scrollHeight to allow the content to expand
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
      
      // After animation is complete, set to undefined to allow natural height changes
      if (useMotion) {
        const timer = setTimeout(() => {
          setHeight(undefined);
        }, duration);
        return () => clearTimeout(timer);
      } else {
        setHeight(undefined);
      }
    } else {
      // First set the current height to enable transition
      setHeight(contentRef.current.scrollHeight);
      
      // Force a reflow to enable the transition
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      contentRef.current.scrollHeight;
      
      // Then animate to 0
      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [isOpen, duration, useMotion]);
  
  // Handle click on accordion header
  const handleToggle = () => {
    if (!disabled && onToggle) {
      onToggle(!isOpen);
    }
  };
  
  // Generate unique IDs for accessibility
  const headerId = `accordion-header-${id || Math.random().toString(36).substr(2, 9)}`;
  const panelId = `accordion-panel-${id || Math.random().toString(36).substr(2, 9)}`;
  
  // Get animation properties for the content
  const getContentStyle = () => {
    const baseStyle: React.CSSProperties = {
      height: height,
      overflow: 'hidden',
    };
    
    if (useMotion) {
      const easing = theme.animation?.easing?.easeInOut || 'cubic-bezier(0.4, 0, 0.2, 1)';
      baseStyle.transition = `height ${durationMs} ${easing}`;
    }
    
    return baseStyle;
  };
  
  // Get animation properties for the icon
  const getIconStyle = () => {
    const baseStyle: React.CSSProperties = {
      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    };
    
    if (useMotion) {
      const easing = theme.animation?.easing?.easeOut || 'cubic-bezier(0, 0, 0.2, 1)';
      baseStyle.transition = `transform ${
        theme.animation?.duration?.shorter || '150ms'
      } ${easing}`;
    }
    
    return baseStyle;
  };
  
  return (
    <div 
      className={`accordion-item ${className} ${isOpen ? 'accordion-item-open' : ''} ${disabled ? 'accordion-item-disabled' : ''}`}
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        overflow: 'hidden'
      }}
    >
      <button
        className="accordion-header"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-disabled={disabled}
        onClick={handleToggle}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: theme.spacing.md,
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: 'none',
          background: 'transparent',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
          opacity: disabled ? 0.6 : 1,
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.medium,
          transition: useMotion 
            ? `background-color ${theme.animation?.duration?.shorter || '150ms'} ${theme.animation?.easing?.easeInOut || 'cubic-bezier(0.4, 0, 0.2, 1)'}`
            : 'none'
        }}
      >
        <span>{title}</span>
        <span style={getIconStyle()}>
          ▼
        </span>
      </button>
      
      <div
        ref={contentRef}
        id={panelId}
        className="accordion-content"
        aria-labelledby={headerId}
        role="region"
        hidden={!isOpen && height === 0}
        style={getContentStyle()}
      >
        <div 
          className="accordion-content-inner" 
          style={{ 
            padding: theme.spacing.md,
            opacity: isOpen ? 1 : 0,
            transition: useMotion 
              ? `opacity ${durationMs} ${theme.animation?.easing?.easeInOut || 'cubic-bezier(0.4, 0, 0.2, 1)'}`
              : 'none'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// Define interface for combined component with Item property
interface AnimatedAccordionComponent extends React.FC<AccordionProps> {
  Item: React.FC<AccordionItemProps>;
}

/**
 * AnimatedAccordion - Main component that houses accordion items
 */
export const AnimatedAccordion: AnimatedAccordionComponent = ({
  items = [],
  children,
  allowMultiple = false,
  defaultOpenIndexes = [],
  onChange,
  expandIcon,
  collapseIcon,
  variant = 'default',
  size = 'medium',
  className = '',
  animationType = 'fade',
  animationDuration = 'standard',
}) => {
  const theme = useTheme();
  const [openIndexes, setOpenIndexes] = useState<number[]>(defaultOpenIndexes);
  
  // Handle toggling of accordion items
  const handleToggle = (index: number, isOpen: boolean) => {
    let newOpenIndexes: number[];
    
    if (isOpen) {
      newOpenIndexes = allowMultiple ? [...openIndexes, index] : [index];
    } else {
      newOpenIndexes = openIndexes.filter(i => i !== index);
    }
    
    setOpenIndexes(newOpenIndexes);
    if (onChange) {
      onChange(newOpenIndexes);
    }
  };
  
  // Get styles based on variant prop
  const getContainerStyles = () => {
    switch (variant) {
      case 'bordered':
        return {
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius.md,
          overflow: 'hidden'
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.md,
          overflow: 'hidden',
          boxShadow: theme.shadows.sm
        };
      default:
        return {};
    }
  };
  
  // Get padding based on size prop
  const getSizePadding = () => {
    switch (size) {
      case 'small': return theme.spacing.sm;
      case 'large': return theme.spacing.lg;
      default: return theme.spacing.md;
    }
  };
  
  return (
    <div 
      className={`accordion ${className}`}
      style={getContainerStyles()}
    >
      {/* Render provided items */}
      {items.map((item, index) => (
        <AccordionItem 
          key={index}
          {...item}
          isOpen={openIndexes.includes(index)}
          onToggle={(isOpen) => handleToggle(index, isOpen)}
          animationType={item.animationType || animationType}
          animationDuration={item.animationDuration || animationDuration}
        />
      ))}
      
      {/* Allow for nested AccordionItem components */}
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<AccordionItemProps>, {
            isOpen: openIndexes.includes(index),
            onToggle: (isOpen) => handleToggle(index, isOpen),
            animationType: (child.props as AccordionItemProps).animationType || animationType,
            animationDuration: (child.props as AccordionItemProps).animationDuration || animationDuration,
          });
        }
        return child;
      })}
    </div>
  );
};

// Attach Item to the AnimatedAccordion component
AnimatedAccordion.Item = AccordionItem;

export default AnimatedAccordion; 