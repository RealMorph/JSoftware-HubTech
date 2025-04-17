import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { ThemeConfig } from '../../core/theme/theme-persistence';

// Theme styles interface
interface ThemeStyles {
  borderRadius: string;
  shadows: {
    none: string;
    sm: string;
    base: string;
    lg: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: {
      primary: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    border: {
      primary: string;
    };
  };
  typography: {
    family: {
      primary: string;
    };
    scale: {
      sm: string;
      lg: string;
    };
    weights: {
      semibold: string;
    };
  };
  spacing: {
    1: string;
    4: string;
  };
}

// Function to create theme styles from themeContext
const createThemeStyles = (themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles => ({
  borderRadius: themeContext.getBorderRadius('base'),
  shadows: {
    none: 'none',
    sm: themeContext.getShadow('sm'),
    base: themeContext.getShadow('base'),
    lg: themeContext.getShadow('lg'),
  },
  colors: {
    primary: themeContext.getColor('primary'),
    secondary: themeContext.getColor('secondary'),
    accent: themeContext.getColor('accent') || themeContext.getColor('primary'),
    background: {
      primary: themeContext.getColor('background.primary'),
    },
    text: {
      primary: themeContext.getColor('text.primary'),
      secondary: themeContext.getColor('text.secondary'),
    },
    border: {
      primary: themeContext.getColor('border.primary'),
    },
  },
  typography: {
    family: {
      primary: themeContext.getTypography('family.primary'),
    },
    scale: {
      sm: themeContext.getTypography('scale.sm'),
      lg: themeContext.getTypography('scale.lg'),
    },
    weights: {
      semibold: themeContext.getTypography('weights.semibold'),
    },
  },
  spacing: {
    1: themeContext.getSpacing('1'),
    4: themeContext.getSpacing('4'),
  },
});

export interface CardProps {
  /** Main content of the card */
  children: React.ReactNode;
  /** Optional title for the card */
  title?: React.ReactNode;
  /** Optional subtitle for the card */
  subtitle?: React.ReactNode;
  /** Optional content for the card header, replaces title and subtitle */
  header?: React.ReactNode;
  /** Optional footer content for the card */
  footer?: React.ReactNode;
  /** Optional image to display at the top of the card */
  coverImage?: string;
  /** Alt text for the cover image */
  coverImageAlt?: string;
  /** Optional elevation level (shadow depth) */
  elevation?: 0 | 1 | 2 | 3;
  /** Optional background color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  /** Whether the card should take up the full width of its container */
  fullWidth?: boolean;
  /** Whether the card is clickable */
  clickable?: boolean;
  /** Callback when the card is clicked */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Additional class name */
  className?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

const getElevationShadow = (elevation: number, themeStyles: ThemeStyles) => {
  switch (elevation) {
    case 0:
      return themeStyles.shadows.none;
    case 1:
      return themeStyles.shadows.sm;
    case 2:
      return themeStyles.shadows.base;
    case 3:
      return themeStyles.shadows.lg;
    default:
      return themeStyles.shadows.base;
  }
};

const getVariantColors = (variant: string, themeStyles: ThemeStyles) => {
  switch (variant) {
    case 'primary':
      return {
        bg: themeStyles.colors.primary,
        text: '#fff',
      };
    case 'secondary':
      return {
        bg: themeStyles.colors.secondary,
        text: '#fff',
      };
    case 'accent':
      return {
        bg: themeStyles.colors.accent,
        text: '#fff',
      };
    default:
      return {
        bg: themeStyles.colors.background.primary,
        text: themeStyles.colors.text.primary,
      };
  }
};

const StyledCard = styled.div<
  Omit<
    CardProps,
    'children' | 'title' | 'subtitle' | 'header' | 'footer' | 'coverImage' | 'coverImageAlt'
  > & { $themeStyles: ThemeStyles }
>`
  display: flex;
  flex-direction: column;
  border-radius: ${props => props.$themeStyles.borderRadius};
  overflow: hidden;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  box-shadow: ${props => getElevationShadow(props.elevation || 1, props.$themeStyles)};
  background-color: ${props => getVariantColors(props.variant || 'default', props.$themeStyles).bg};
  color: ${props => getVariantColors(props.variant || 'default', props.$themeStyles).text};
  font-family: ${props => props.$themeStyles.typography.family.primary};
  transition: all 0.3s ease;

  ${props =>
    props.clickable &&
    `
    cursor: pointer;
    
    &:hover {
      box-shadow: ${getElevationShadow(Math.min((props.elevation || 1) + 1, 3), props.$themeStyles)};
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

const CardHeader = styled.div<{ variant?: string; $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing[4]};
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border.primary};
`;

const CardTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin: 0;
  font-size: ${props => props.$themeStyles.typography.scale.lg};
  font-weight: ${props => props.$themeStyles.typography.weights.semibold};
`;

const CardSubtitle = styled.div<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.scale.sm};
  color: ${props => props.$themeStyles.colors.text.secondary};
  margin-top: ${props => props.$themeStyles.spacing[1]};
`;

const CardContent = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing[4]};
  flex: 1;
`;

const CardFooter = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing[4]};
  border-top: 1px solid ${props => props.$themeStyles.colors.border.primary};
`;

const CardImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
`;

/**
 * Card component for displaying content in a contained format
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  header,
  footer,
  coverImage,
  coverImageAlt = 'Card image',
  elevation = 1,
  variant = 'default',
  fullWidth = false,
  clickable = false,
  onClick,
  className,
  style,
}) => {
  const isClickable = clickable || !!onClick;
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  return (
    <StyledCard
      elevation={elevation}
      variant={variant}
      fullWidth={fullWidth}
      clickable={isClickable}
      onClick={isClickable ? onClick : undefined}
      className={className}
      style={style}
      $themeStyles={themeStyles}
    >
      {coverImage && <CardImage src={coverImage} alt={coverImageAlt} />}

      {header ? (
        <CardHeader variant={variant} $themeStyles={themeStyles}>
          {header}
        </CardHeader>
      ) : (
        (title || subtitle) && (
          <CardHeader variant={variant} $themeStyles={themeStyles}>
            {title && <CardTitle $themeStyles={themeStyles}>{title}</CardTitle>}
            {subtitle && <CardSubtitle $themeStyles={themeStyles}>{subtitle}</CardSubtitle>}
          </CardHeader>
        )
      )}

      <CardContent $themeStyles={themeStyles}>{children}</CardContent>

      {footer && <CardFooter $themeStyles={themeStyles}>{footer}</CardFooter>}
    </StyledCard>
  );
};

    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

const CardHeader = styled.div<{ variant?: string; $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing[4]};
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border.primary};
`;

const CardTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin: 0;
  font-size: ${props => props.$themeStyles.typography.scale.lg};
  font-weight: ${props => props.$themeStyles.typography.weights.semibold};
`;

const CardSubtitle = styled.div<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.scale.sm};
  color: ${props => props.$themeStyles.colors.text.secondary};
  margin-top: ${props => props.$themeStyles.spacing[1]};
`;

const CardContent = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing[4]};
  flex: 1;
`;

const CardFooter = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing[4]};
  border-top: 1px solid ${props => props.$themeStyles.colors.border.primary};
`;

const CardImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
`;

/**
 * Card component for displaying content in a contained format
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  header,
  footer,
  coverImage,
  coverImageAlt = 'Card image',
  elevation = 1,
  variant = 'default',
  fullWidth = false,
  clickable = false,
  onClick,
  className,
  style,
}) => {
  const isClickable = clickable || !!onClick;
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  return (
    <StyledCard
      elevation={elevation}
      variant={variant}
      fullWidth={fullWidth}
      clickable={isClickable}
      onClick={isClickable ? onClick : undefined}
      className={className}
      style={style}
      $themeStyles={themeStyles}
    >
      {coverImage && <CardImage src={coverImage} alt={coverImageAlt} />}

      {header ? (
        <CardHeader variant={variant} $themeStyles={themeStyles}>
          {header}
        </CardHeader>
      ) : (
        (title || subtitle) && (
          <CardHeader variant={variant} $themeStyles={themeStyles}>
            {title && <CardTitle $themeStyles={themeStyles}>{title}</CardTitle>}
            {subtitle && <CardSubtitle $themeStyles={themeStyles}>{subtitle}</CardSubtitle>}
          </CardHeader>
        )
      )}

      <CardContent $themeStyles={themeStyles}>{children}</CardContent>

      {footer && <CardFooter $themeStyles={themeStyles}>{footer}</CardFooter>}
    </StyledCard>
  );
};
