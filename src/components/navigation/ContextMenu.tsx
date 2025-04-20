import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { Menu, MenuProps, MenuItem } from './Menu';

interface ContextMenuProps {
  items: MenuItem[];
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const ContextMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ContextMenuWrapper = styled.div<{ x: number; y: number; $themeStyles: any }>`
  position: fixed;
  z-index: 1000;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  margin: 2px;
  min-width: 160px;
  box-shadow: ${props => props.$themeStyles.shadows || '0 2px 10px rgba(0,0,0,0.2)'};
  border-radius: ${props => props.$themeStyles.borderRadius || '4px'};
  background-color: ${props => props.$themeStyles.colors.background || '#fff'};
`;

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
  items, 
  children, 
  onClose,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeContext = useDirectTheme();
  
  // Create theme styles
  const $themeStyles = {
    colors: {
      background: themeContext.getColor('background.paper', '#ffffff'),
    },
    borderRadius: themeContext.getBorderRadius('md', '4px'),
    shadows: themeContext.getShadow('md', '0 4px 6px rgba(0, 0, 0, 0.1)')
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      // Only open context menu if click is within the container
      if (
        e.clientX >= containerRect.left &&
        e.clientX <= containerRect.right &&
        e.clientY >= containerRect.top &&
        e.clientY <= containerRect.bottom
      ) {
        setPosition({
          x: e.clientX,
          y: e.clientY
        });
        setIsOpen(true);
      }
    }
  };
  
  const handleDocumentClick = (e: MouseEvent) => {
    if (isOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsOpen(false);
      onClose?.();
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
      onClose?.();
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
  
  // Adjust menu position if it goes out of viewport
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      let { x, y } = position;
      
      // Check if menu exceeds right edge
      if (x + menuRect.width > windowWidth) {
        x = windowWidth - menuRect.width - 10;
      }
      
      // Check if menu exceeds bottom edge
      if (y + menuRect.height > windowHeight) {
        y = windowHeight - menuRect.height - 10;
      }
      
      if (x !== position.x || y !== position.y) {
        setPosition({ x, y });
      }
    }
  }, [isOpen, position]);
  
  // Handle item click
  const handleItemClick = (item: MenuItem) => {
    item.onClick?.();
    setIsOpen(false);
    onClose?.();
  };
  
  // Process items to add click handler
  const processedItems = items.map(item => ({
    ...item,
    onClick: () => handleItemClick(item)
  }));
  
  return (
    <ContextMenuContainer ref={containerRef} onContextMenu={handleContextMenu} className={className}>
      {children}
      
      {isOpen && createPortal(
        <ContextMenuWrapper 
          x={position.x} 
          y={position.y} 
          ref={menuRef}
          $themeStyles={$themeStyles}
        >
          <Menu 
            items={processedItems} 
            variant="dropdown" 
            bordered={false}
            dividers
            closeOnClick
          />
        </ContextMenuWrapper>,
        document.body
      )}
    </ContextMenuContainer>
  );
};

export default ContextMenu; 