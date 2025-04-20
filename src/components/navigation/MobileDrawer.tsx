import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { createPortal } from 'react-dom';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: string;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const DrawerContainer = styled.div<{
  isOpen: boolean;
  position: 'left' | 'right';
  width: string;
  $themeStyles: any;
}>`
  position: fixed;
  top: 0;
  ${props => props.position}: 0;
  height: 100%;
  width: ${props => props.width};
  background-color: ${props => props.$themeStyles.colors.background};
  box-shadow: ${props => props.$themeStyles.shadows.lg};
  z-index: 1100;
  transform: translateX(${props => (props.isOpen ? '0' : props.position === 'left' ? '-100%' : '100%')});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const DrawerHeader = styled.div<{ $themeStyles: any }>`
  display: flex;
  justify-content: flex-end;
  padding: ${props => props.$themeStyles.spacing.md};
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border};
`;

const CloseButton = styled.button<{ $themeStyles: any }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: ${props => props.$themeStyles.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$themeStyles.colors.backgroundHover};
  }
`;

const DrawerContent = styled.div<{ $themeStyles: any }>`
  padding: ${props => props.$themeStyles.spacing.md};
  flex: 1;
`;

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'left',
  width = '300px',
}) => {
  const themeContext = useDirectTheme();
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  // Close on ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Create theme styles
  const $themeStyles = {
    colors: {
      background: themeContext.getColor('background.paper', '#ffffff'),
      border: themeContext.getColor('border.main', '#e0e0e0'),
      text: {
        primary: themeContext.getColor('text.primary', '#333333'),
      },
      backgroundHover: themeContext.getColor('action.hover', '#f5f5f5')
    },
    shadows: {
      lg: themeContext.getShadow('lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1)')
    },
    spacing: {
      md: themeContext.getSpacing('4', '16px'),
    }
  };
  
  return createPortal(
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <DrawerContainer 
        ref={drawerRef}
        isOpen={isOpen} 
        position={position} 
        width={width}
        $themeStyles={$themeStyles}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        <DrawerHeader $themeStyles={$themeStyles}>
          <CloseButton 
            onClick={onClose} 
            $themeStyles={$themeStyles}
            aria-label="Close menu"
          >
            ✕
          </CloseButton>
        </DrawerHeader>
        <DrawerContent $themeStyles={$themeStyles}>
          {children}
        </DrawerContent>
      </DrawerContainer>
    </>,
    document.body
  );
};

export default MobileDrawer; 