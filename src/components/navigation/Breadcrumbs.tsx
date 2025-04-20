import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Link, useLocation } from 'react-router-dom';
import { useDirectTheme, DirectThemeContextType } from '../../core/theme/DirectThemeProvider';
import { Theme as DirectTheme } from '../../core/theme/types';
import { filterTransientProps } from '../../core/styled-components/transient-props';

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
  /** Whether to enable responsive collapsing on small screens */
  responsiveCollapse?: boolean;
  /** Custom collapse text for responsive mode */
  collapseText?: string;
}

// Define theme style interface
interface ThemeStyles {
  colors: {
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    primary: {
      main: string;
      light: string;
      dark: string;
    };
    icon: {
      primary: string;
      secondary: string;
    };
    separator: {
      main: string;
    };
  };
  typography: {
    family: string;
    size: {
      small: string;
      base: string;
      large: string;
    };
    weight: {
      normal: number;
      medium: number;
      bold: number;
    };
    lineHeight: {
      normal: number;
    };
  };
  spacing: {
    item: string;
    icon: string;
    container: {
      vertical: string;
      horizontal: string;
    };
    element: {
      height: string;
      padding: string;
    };
  };
  borders: {
    radius: {
      small: string;
      medium: string;
    };
    focus: {
      width: string;
      color: string;
    };
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
    };
    easing: {
      easeInOut: string;
    };
    hover: {
      scale: string;
    };
  };
}

// Function to create ThemeStyles from DirectThemeProvider
const createThemeStyles = (theme: DirectThemeContextType): ThemeStyles => ({
  colors: {
    text: {
      primary: theme.getColor('text.primary', '#333333'),
      secondary: theme.getColor('text.secondary', '#666666'),
      disabled: theme.getColor('text.disabled', '#999999'),
    },
    primary: {
      main: theme.getColor('primary.main', '#1976d2'),
      light: theme.getColor('primary.light', '#42a5f5'),
      dark: theme.getColor('primary.dark', '#1565c0'),
    },
    icon: {
      primary: theme.getColor('text.primary', '#333333'),
      secondary: theme.getColor('text.secondary', '#666666'),
    },
    separator: {
      main: theme.getColor('text.secondary', '#666666'),
    },
  },
  typography: {
    family: String(theme.getTypography('family.base', 'inherit')),
    size: {
      small: String(theme.getTypography('scale.sm', '12px')),
      base: String(theme.getTypography('scale.base', '14px')),
      large: String(theme.getTypography('scale.lg', '16px')),
    },
    weight: {
      normal: Number(theme.getTypography('weights.normal', 400)),
      medium: Number(theme.getTypography('weights.medium', 500)),
      bold: Number(theme.getTypography('weights.bold', 700)),
    },
    lineHeight: {
      normal: 1.5,
    },
  },
  spacing: {
    item: theme.getSpacing('2', '8px'),
    icon: theme.getSpacing('1', '4px'),
    container: {
      vertical: theme.getSpacing('2', '8px'),
      horizontal: theme.getSpacing('3', '12px'),
    },
    element: {
      height: theme.getSpacing('8', '32px'),
      padding: theme.getSpacing('2', '8px'),
    },
  },
  borders: {
    radius: {
      small: theme.getBorderRadius('sm', '4px'),
      medium: theme.getBorderRadius('md', '6px'),
    },
    focus: {
      width: '2px',
      color: theme.getColor('primary.main', '#1976d2') + '33',
    },
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    hover: {
      scale: '1.05',
    },
  },
});

// Create filtered base components
const FilteredSpan = filterTransientProps(styled.span``);
const FilteredLi = filterTransientProps(styled.li``);
const FilteredButton = filterTransientProps(styled.button``);
const FilteredNav = filterTransientProps(styled.nav``);
const FilteredLink = filterTransientProps(styled(Link)``);

// Styled components
const BreadcrumbsContainer = styled(FilteredNav)<{ $themeStyles: ThemeStyles }>`
  padding: ${({ $themeStyles }) => `${$themeStyles.spacing.container.vertical} ${$themeStyles.spacing.container.horizontal}`};
  font-family: ${({ $themeStyles }) => $themeStyles.typography.family};
`;

const BreadcrumbList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const BreadcrumbItem = styled(FilteredLi)<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  margin-right: ${({ $themeStyles }) => $themeStyles.spacing.item};
  white-space: nowrap;
`;

const IconContainer = styled.span<{ $themeStyles: ThemeStyles }>`
  display: inline-flex;
  align-items: center;
  margin-right: ${({ $themeStyles }) => $themeStyles.spacing.icon};
  color: ${({ $themeStyles }) => $themeStyles.colors.icon.secondary};
`;

const BreadcrumbLink = styled(FilteredLink)<{ $themeStyles: ThemeStyles }>`
  color: ${({ $themeStyles }) => $themeStyles.colors.text.primary};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.size.base};
  font-weight: ${({ $themeStyles }) => $themeStyles.typography.weight.normal};
  line-height: ${({ $themeStyles }) => $themeStyles.typography.lineHeight.normal};
  text-decoration: none;
  display: flex;
  align-items: center;
  height: ${({ $themeStyles }) => $themeStyles.spacing.element.height};
  padding: 0 ${({ $themeStyles }) => $themeStyles.spacing.element.padding};
  border-radius: ${({ $themeStyles }) => $themeStyles.borders.radius.small};
  transition: all ${({ $themeStyles }) => $themeStyles.animation.duration.normal} ${({ $themeStyles }) => $themeStyles.animation.easing.easeInOut};

  &:hover {
    color: ${({ $themeStyles }) => $themeStyles.colors.primary.light};
    transform: scale(${({ $themeStyles }) => $themeStyles.animation.hover.scale});
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 ${({ $themeStyles }) => $themeStyles.borders.focus.width} ${({ $themeStyles }) => $themeStyles.borders.focus.color};
  }
`;

const BreadcrumbText = styled(FilteredSpan)<{ $themeStyles: ThemeStyles; $active: boolean }>`
  color: ${({ $themeStyles, $active }) => $active ? $themeStyles.colors.primary.main : $themeStyles.colors.text.primary};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.size.base};
  font-weight: ${({ $themeStyles, $active }) => $active ? $themeStyles.typography.weight.medium : $themeStyles.typography.weight.normal};
  line-height: ${({ $themeStyles }) => $themeStyles.typography.lineHeight.normal};
  display: flex;
  align-items: center;
  height: ${({ $themeStyles }) => $themeStyles.spacing.element.height};
  padding: 0 ${({ $themeStyles }) => $themeStyles.spacing.element.padding};
`;

const Separator = styled.span<{ $themeStyles: ThemeStyles }>`
  color: ${({ $themeStyles }) => $themeStyles.colors.separator.main};
  margin: 0 ${({ $themeStyles }) => $themeStyles.spacing.item};
  user-select: none;
`;

const EllipsisItem = styled(FilteredLi)<{ $themeStyles: ThemeStyles; $visible: boolean }>`
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: center;
  margin: 0 ${({ $themeStyles }) => $themeStyles.spacing.item};
`;

const EllipsisButton = styled(FilteredButton)<{ $themeStyles: ThemeStyles }>`
  background: none;
  border: none;
  color: ${({ $themeStyles }) => $themeStyles.colors.primary.main};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${({ $themeStyles }) => $themeStyles.spacing.element.padding};
  height: ${({ $themeStyles }) => $themeStyles.spacing.element.height};
  border-radius: ${({ $themeStyles }) => $themeStyles.borders.radius.small};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.size.base};
  
  &:hover {
    background-color: ${({ $themeStyles }) => $themeStyles.colors.primary.light + '10'};
    transform: scale(${({ $themeStyles }) => $themeStyles.animation.hover.scale});
  }
  
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 ${({ $themeStyles }) => $themeStyles.borders.focus.width} ${({ $themeStyles }) => $themeStyles.borders.focus.color};
  }
`;

const CollapsibleContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  @media (max-width: 768px) {
    position: relative;
    overflow: hidden;
  }
`;

const CollapseButton = styled(FilteredButton)<{ $themeStyles: ThemeStyles; $isCollapsed: boolean }>`
  display: none;
  background: none;
  border: none;
  color: ${({ $themeStyles }) => $themeStyles.colors.primary.main};
  cursor: pointer;
  padding: 0;
  font-size: ${({ $themeStyles }) => $themeStyles.typography.size.small};
  margin-left: ${({ $themeStyles }) => $themeStyles.spacing.item};
  
  @media (max-width: 768px) {
    display: ${({ $isCollapsed }) => ($isCollapsed ? 'inline-flex' : 'none')};
    align-items: center;
  }
  
  &:hover {
    text-decoration: underline;
  }
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
  responsiveCollapse = true,
  collapseText = 'Show path',
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  const [mobileCollapsed, setMobileCollapsed] = useState(responsiveCollapse);

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
    // Reset expanded state when items change
    setExpanded(false);
    // Reset mobile collapsed state when items change
    setMobileCollapsed(responsiveCollapse);
  }, [items, maxItems, responsiveCollapse]);

  // Toggle expanded state
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  // Toggle mobile collapsed state
  const handleToggleMobileCollapse = () => {
    setMobileCollapsed(!mobileCollapsed);
  };

  // Render custom separator
  const renderSeparator = () => {
    if (typeof separator === 'string') {
      return <Separator $themeStyles={themeStyles}>{separator}</Separator>;
    }
    return <>{separator}</>;
  };

  // Render items with collapsing if needed
  const renderItems = () => {
    // If fully expanded or within maxItems limit, show all items
    if (expanded || (items && items.length <= maxItems)) {
      return items.map((item, index) => (
        <BreadcrumbItem key={item.path} $themeStyles={themeStyles}>
          {index > 0 && renderSeparator()}
          {renderItem(item)}
        </BreadcrumbItem>
      ));
    }

    // Otherwise, show collapsed view
    const itemsToShow: React.ReactNode[] = [];

    // Add first {itemsBeforeCollapse} items
    for (let i = 0; i < Math.min(itemsBeforeCollapse, items.length); i++) {
      const item = items[i];
      itemsToShow.push(
        <BreadcrumbItem key={item.path} $themeStyles={themeStyles}>
          {i > 0 && renderSeparator()}
          {renderItem(item)}
        </BreadcrumbItem>
      );
    }

    // Add ellipsis if there are collapsed items
    if (items.length > itemsBeforeCollapse + itemsAfterCollapse) {
      itemsToShow.push(
        <EllipsisItem key="ellipsis" $themeStyles={themeStyles} $visible={true}>
          {renderSeparator()}
          <EllipsisButton onClick={handleToggleExpand} $themeStyles={themeStyles} aria-label="Show all breadcrumbs">
            •••
          </EllipsisButton>
        </EllipsisItem>
      );
    }

    // Add last {itemsAfterCollapse} items
    const startIndex = Math.max(itemsBeforeCollapse, items.length - itemsAfterCollapse);
    for (let i = startIndex; i < items.length; i++) {
      const item = items[i];
      itemsToShow.push(
        <BreadcrumbItem key={item.path} $themeStyles={themeStyles}>
          {renderSeparator()}
          {renderItem(item)}
        </BreadcrumbItem>
      );
    }

    return itemsToShow;
  };

  // Render individual item as link or text
  const renderItem = (item: BreadcrumbItem) => {
    const content = (
      <>
        {item.icon && <IconContainer $themeStyles={themeStyles}>{item.icon}</IconContainer>}
        {item.label}
      </>
    );

    if (item.active) {
      return (
        <BreadcrumbText $themeStyles={themeStyles} $active={true}>
          {content}
        </BreadcrumbText>
      );
    }

    return (
      <BreadcrumbLink
        $themeStyles={themeStyles}
        to={item.path}
      >
        {content}
      </BreadcrumbLink>
    );
  };

  // Render responsive collapsed view
  const renderResponsiveItems = () => {
    if (!mobileCollapsed || items.length <= 2) {
      return renderItems();
    }

    // In responsive collapsed mode, show only first and last items
    const firstItem = items[0];
    const lastItem = items[items.length - 1];

    return (
      <>
        <BreadcrumbItem key={firstItem.path} $themeStyles={themeStyles}>
          {renderItem(firstItem)}
        </BreadcrumbItem>
        <EllipsisItem key="ellipsis" $themeStyles={themeStyles} $visible={true}>
          {renderSeparator()}
          <EllipsisButton onClick={handleToggleMobileCollapse} $themeStyles={themeStyles} aria-label="Show all breadcrumbs">
            •••
          </EllipsisButton>
        </EllipsisItem>
        <BreadcrumbItem key={lastItem.path} $themeStyles={themeStyles}>
          {renderSeparator()}
          {renderItem(lastItem)}
        </BreadcrumbItem>
      </>
    );
  };

  return (
    <BreadcrumbsContainer $themeStyles={themeStyles} className={className} aria-label="Breadcrumb">
      <CollapsibleContainer $themeStyles={themeStyles}>
        <BreadcrumbList>
          {responsiveCollapse ? renderResponsiveItems() : renderItems()}
        </BreadcrumbList>
        <CollapseButton 
          onClick={handleToggleMobileCollapse} 
          $themeStyles={themeStyles} 
          $isCollapsed={mobileCollapsed && items.length > 2}
        >
          {collapseText}
        </CollapseButton>
      </CollapsibleContainer>
    </BreadcrumbsContainer>
  );
};

export default Breadcrumbs;
