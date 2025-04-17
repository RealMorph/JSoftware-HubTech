import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Link, useLocation } from 'react-router-dom';
import { useDirectTheme, DirectThemeContextType } from '../../core/theme/DirectThemeProvider';
import { Theme as DirectTheme } from '../../core/theme/types';

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

// Styled components
const BreadcrumbsContainer = styled.nav<{ $themeStyles: ThemeStyles }>`
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

const BreadcrumbItem = styled.li<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  margin-right: ${({ $themeStyles }) => $themeStyles.spacing.item};
`;

const IconContainer = styled.span<{ $themeStyles: ThemeStyles }>`
  display: inline-flex;
  align-items: center;
  margin-right: ${({ $themeStyles }) => $themeStyles.spacing.icon};
  color: ${({ $themeStyles }) => $themeStyles.colors.icon.secondary};
`;

const BreadcrumbLink = styled(Link)<{ $themeStyles: ThemeStyles }>`
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

const BreadcrumbText = styled.span<{ $themeStyles: ThemeStyles; active: boolean }>`
  color: ${({ $themeStyles, active }) => active ? $themeStyles.colors.primary.main : $themeStyles.colors.text.primary};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.size.base};
  font-weight: ${({ $themeStyles, active }) => active ? $themeStyles.typography.weight.medium : $themeStyles.typography.weight.normal};
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

const CollapseButton = styled.button<{ $themeStyles: ThemeStyles }>`
  background: none;
  border: none;
  padding: 0 ${({ $themeStyles }) => $themeStyles.spacing.element.padding};
  margin: 0 ${({ $themeStyles }) => $themeStyles.spacing.icon};
  color: ${({ $themeStyles }) => $themeStyles.colors.primary.main};
  font-family: inherit;
  font-size: ${({ $themeStyles }) => $themeStyles.typography.size.base};
  line-height: ${({ $themeStyles }) => $themeStyles.typography.lineHeight.normal};
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all ${({ $themeStyles }) => $themeStyles.animation.duration.normal} ${({ $themeStyles }) => $themeStyles.animation.easing.easeInOut};

  &:hover {
    color: ${({ $themeStyles }) => $themeStyles.colors.primary.light};
    text-decoration: underline;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 ${({ $themeStyles }) => $themeStyles.borders.focus.width} ${({ $themeStyles }) => $themeStyles.borders.focus.color};
    border-radius: ${({ $themeStyles }) => $themeStyles.borders.radius.small};
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
    return items.map((item, index) => (
      <BreadcrumbItem key={item.path} $themeStyles={themeStyles}>
        {index > 0 && <Separator $themeStyles={themeStyles}>/</Separator>}
        {renderItem(item)}
      </BreadcrumbItem>
    ));
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
