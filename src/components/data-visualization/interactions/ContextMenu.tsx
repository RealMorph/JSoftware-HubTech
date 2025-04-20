import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useCrossChartInteraction } from './CrossChartInteraction';
import { useTheme } from '../../../core/theme/ThemeContext';
import { createThemeStyles } from '../../../core/theme/utils/themeUtils';

/**
 * ChartContextMenu Component
 * 
 * This component provides a customizable context menu for data visualization
 * components, enabling advanced interactions with data points.
 */

interface MenuOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface MenuGroup {
  title?: string;
  options: MenuOption[];
}

interface ContextMenuProps {
  menuGroups: MenuGroup[];
  chartId: string;
  position?: { x: number; y: number };
  data?: any;
  onClose?: () => void;
}

// Styled components
const MenuContainer = styled.div<{ $themeStyles: any }>`
  position: absolute;
  background-color: ${props => props.$themeStyles.colors.background.paper};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  box-shadow: ${props => props.$themeStyles.shadows.tooltip};
  min-width: 160px;
  max-width: 280px;
  z-index: 1000;
  overflow: hidden;
  border: 1px solid ${props => props.$themeStyles.colors.border.light};
`;

const MenuHeader = styled.div<{ $themeStyles: any }>`
  padding: 8px 12px;
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.semibold};
  color: ${props => props.$themeStyles.colors.text.secondary};
  background-color: ${props => props.$themeStyles.colors.background.subtle};
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border.light};
`;

const MenuGroup = styled.div<{ $themeStyles: any }>`
  padding: 4px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.$themeStyles.colors.border.light};
  }
`;

const GroupTitle = styled.div<{ $themeStyles: any }>`
  padding: 6px 12px;
  font-size: ${props => props.$themeStyles.typography.fontSize.xs};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  color: ${props => props.$themeStyles.colors.text.secondary};
  text-transform: uppercase;
`;

const MenuItem = styled.div<{ $themeStyles: any; $disabled?: boolean }>`
  padding: 8px 12px;
  display: flex;
  align-items: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  color: ${props => props.$themeStyles.colors.text.primary};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  
  &:hover {
    background-color: ${props => props.$disabled ? 'transparent' : props.$themeStyles.colors.hover.light};
  }
  
  &:active {
    background-color: ${props => props.$disabled ? 'transparent' : props.$themeStyles.colors.hover.medium};
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-right: 8px;
  font-size: 16px;
`;

const Divider = styled.div<{ $themeStyles: any }>`
  height: 1px;
  background-color: ${props => props.$themeStyles.colors.border.light};
  margin: 4px 0;
`;

export const ChartContextMenu: React.FC<ContextMenuProps> = ({
  menuGroups,
  chartId,
  position,
  data,
  onClose,
}) => {
  const { state, hideContextMenu } = useCrossChartInteraction();
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Use position from props or from global state
  const menuPosition = position || 
    (state.contextMenu && state.contextMenu.chartId === chartId 
      ? state.contextMenu.position 
      : { x: 0, y: 0 });
  
  // Check if menu should be visible
  const isVisible = position !== undefined || 
    (state.contextMenu !== null && state.contextMenu.chartId === chartId);
  
  // Handle click outside to close menu
  useEffect(() => {
    if (!isVisible) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (onClose) {
          onClose();
        } else {
          hideContextMenu();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, hideContextMenu, onClose]);
  
  // Handle escape key to close menu
  useEffect(() => {
    if (!isVisible) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onClose) {
          onClose();
        } else {
          hideContextMenu();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, hideContextMenu, onClose]);
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  
  // Calculate position to ensure menu stays within viewport
  const calculatePosition = () => {
    if (!menuRef.current) {
      return { top: menuPosition.y, left: menuPosition.x };
    }
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = menuRef.current.offsetWidth;
    const menuHeight = menuRef.current.offsetHeight;
    
    let left = menuPosition.x;
    let top = menuPosition.y;
    
    // Adjust horizontal position if needed
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - 10;
    }
    
    // Adjust vertical position if needed
    if (top + menuHeight > viewportHeight) {
      top = viewportHeight - menuHeight - 10;
    }
    
    return { top, left };
  };
  
  const position2D = calculatePosition();
  
  // Handle menu item click
  const handleMenuItemClick = (option: MenuOption) => {
    if (option.disabled) return;
    
    // Execute the action
    option.action();
    
    // Close the menu unless the action explicitly keeps it open
    if (onClose) {
      onClose();
    } else {
      hideContextMenu();
    }
  };
  
  return (
    <MenuContainer
      ref={menuRef}
      style={{ top: position2D.top, left: position2D.left }}
      $themeStyles={themeStyles}
    >
      {menuGroups.map((group, groupIndex) => (
        <MenuGroup key={`group-${groupIndex}`} $themeStyles={themeStyles}>
          {group.title && (
            <GroupTitle $themeStyles={themeStyles}>{group.title}</GroupTitle>
          )}
          
          {group.options.map((option, optionIndex) => (
            <React.Fragment key={option.id || `option-${groupIndex}-${optionIndex}`}>
              <MenuItem
                $themeStyles={themeStyles}
                $disabled={option.disabled}
                onClick={() => handleMenuItemClick(option)}
              >
                {option.icon && <IconWrapper>{option.icon}</IconWrapper>}
                {option.label}
              </MenuItem>
              
              {option.divider && <Divider $themeStyles={themeStyles} />}
            </React.Fragment>
          ))}
        </MenuGroup>
      ))}
    </MenuContainer>
  );
}; 