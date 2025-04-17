import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Link, useLocation } from 'react-router-dom';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Types
export interface BreadcrumbItem {
  /** Text to display */
  label: string;
  /** Path/URL for the breadcrumb link */
  path: string;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
  /** Whether this item is the active/current page (usually the last item) */
  active?: boolean;
}

export interface BreadcrumbsProps {
  /** Items to display in the breadcrumbs */
  items?: BreadcrumbItem[];
  /** Custom separator between items */
  separator?: React.ReactNode;
  /** Maximum number of items to display before collapsing */
  maxItems?: number;
  /** Number of items to show at the beginning when collapsed */
  itemsBeforeCollapse?: number;
  /** Number of items to show at the end when collapsed */
  itemsAfterCollapse?: number;
  /** Whether to generate breadcrumbs automatically from the current route */
  autoGenerate?: boolean;
  /** Root label (for auto-generated breadcrumbs) */
  homeLabel?: string;
  /** Root path (for auto-generated breadcrumbs) */
  homePath?: string;
  /** Custom mapping of path segments to display names (for auto-generated breadcrumbs) */
  pathMap?: Record<string, string>;
  /** CSS class name */
  className?: string;
}

// Define theme style interface
interface ThemeStyles {
  fontFamily: string;
  fontSize: string;
  textSecondary: string;
  primaryMain: string;
  primaryDark: string;
  textDisabled: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography } = themeContext;

  return {
    fontFamily: getTypography('family.primary', 'system-ui') as string,
    fontSize: getTypography('scale.sm', '0.875rem') as string,
    textSecondary: getColor('text.secondary', '#666666'),
    primaryMain: getColor('primary.main', '#0066cc'),
    primaryDark: getColor('primary.dark', '#004c99'),
    textDisabled: getColor('text.disabled', '#999999'),
  };
}

// Styled components
const BreadcrumbsContainer = styled.nav<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  font-family: ${props => props.$themeStyles.fontFamily};
  font-size: ${props => props.$themeStyles.fontSize};
  color: ${props => props.$themeStyles.textSecondary};
  margin: 8px 0;
`;

const BreadcrumbList = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
`;

const BreadcrumbLink = styled(Link)<{ active?: boolean; $themeStyles: ThemeStyles }>`
  color: ${props =>
    props.active ? props.$themeStyles.primaryMain : props.$themeStyles.textSecondary};
  text-decoration: none;
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.$themeStyles.primaryDark};
    text-decoration: ${props => (props.active ? 'none' : 'underline')};
  }
`;

const BreadcrumbText = styled.span<{ active?: boolean; $themeStyles: ThemeStyles }>`
  color: ${props =>
    props.active ? props.$themeStyles.primaryMain : props.$themeStyles.textSecondary};
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
`;

const Separator = styled.div<{ $themeStyles: ThemeStyles }>`
  margin: 0 8px;
  color: ${props => props.$themeStyles.textDisabled};
  user-select: none;
`;

const CollapseButton = styled.button<{ $themeStyles: ThemeStyles }>`
  background: none;
  border: none;
  padding: 0 8px;
  margin: 0 4px;
  color: ${props => props.$themeStyles.primaryMain};
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.3);
    border-radius: 4px;
  }
`;

const IconContainer = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
  font-size: 1.2em;
`;

/**
 * Breadcrumbs component for displaying navigation hierarchy
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items: propItems,
  separator = '/',
  maxItems = 8,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
  autoGenerate = false,
  homeLabel = 'Home',
  homePath = '/',
  pathMap = {},
  className,
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [items, setItems] = useState<BreadcrumbItem[]>([]);

  // Generate breadcrumbs from the current route
  useEffect(() => {
    if (!autoGenerate || propItems) {
      setItems(propItems || []);
      return;
    }

    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');

    const generatedItems: BreadcrumbItem[] = [
      { label: homeLabel, path: homePath, active: pathSegments.length === 0 },
    ];

    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Use custom label from pathMap if available, otherwise format the segment
      const label =
        pathMap[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

      generatedItems.push({
        label,
        path: currentPath,
        active: isLast,
      });
    });

    setItems(generatedItems);
  }, [autoGenerate, propItems, location.pathname, homeLabel, homePath, pathMap]);

  // Check if we need to collapse items
  useEffect(() => {
    setCollapsed(items.length > maxItems);
  }, [items, maxItems]);

  // Handle rendering of collapsed items
  const renderItems = () => {
    if (!collapsed || maxItems >= items.length) {
      return items.map((item, index) => (
        <BreadcrumbItem key={item.path}>
          {index > 0 && (
            <Separator $themeStyles={themeStyles} aria-hidden="true">
              {separator}
            </Separator>
          )}
          {renderItem(item)}
        </BreadcrumbItem>
      ));
    }

    const itemsToRender: React.ReactElement[] = [];

    // Add the initial items
    items.slice(0, itemsBeforeCollapse).forEach((item, index) => {
      itemsToRender.push(
        <BreadcrumbItem key={item.path}>
          {index > 0 && (
            <Separator $themeStyles={themeStyles} aria-hidden="true">
              {separator}
            </Separator>
          )}
          {renderItem(item)}
        </BreadcrumbItem>
      );
    });

    // Add collapse indicator
    if (items.length > itemsBeforeCollapse + itemsAfterCollapse) {
      itemsToRender.push(
        <BreadcrumbItem key="ellipsis">
          <Separator $themeStyles={themeStyles} aria-hidden="true">
            {separator}
          </Separator>
          <CollapseButton
            $themeStyles={themeStyles}
            onClick={() => setCollapsed(false)}
            aria-label="Show all breadcrumbs"
          >
            ...
          </CollapseButton>
        </BreadcrumbItem>
      );
    }

    // Add the final items
    items.slice(items.length - itemsAfterCollapse).forEach(item => {
      itemsToRender.push(
        <BreadcrumbItem key={item.path}>
          <Separator $themeStyles={themeStyles} aria-hidden="true">
            {separator}
          </Separator>
          {renderItem(item)}
        </BreadcrumbItem>
      );
    });

    return itemsToRender;
  };

  // Render individual item as link or text
  const renderItem = (item: BreadcrumbItem) => {
    const content = (
      <>
        {item.icon && <IconContainer>{item.icon}</IconContainer>}
        {item.label}
      </>
    );

    if (item.active) {
      return (
        <BreadcrumbText $themeStyles={themeStyles} active={true}>
          {content}
        </BreadcrumbText>
      );
    }

    return (
      <BreadcrumbLink
        $themeStyles={themeStyles}
        to={item.path}
        aria-current={item.active ? 'page' : undefined}
      >
        {content}
      </BreadcrumbLink>
    );
  };

  return (
    <BreadcrumbsContainer $themeStyles={themeStyles} className={className} aria-label="Breadcrumb">
      <BreadcrumbList>{renderItems()}</BreadcrumbList>
    </BreadcrumbsContainer>
  );
};

export default Breadcrumbs;
