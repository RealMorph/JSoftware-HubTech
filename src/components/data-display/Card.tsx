import React from 'react';
import styled from '@emotion/styled';
import { getThemeValue } from '../../core/theme/styled';
import { ThemeConfig } from '../../core/theme/theme-persistence';

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

const getElevationShadow = (elevation: number, theme: ThemeConfig) => {
  switch (elevation) {
    case 0:
      return 'none';
    case 1:
      return getThemeValue(theme, 'shadows.sm');
    case 2:
      return getThemeValue(theme, 'shadows.base');
    case 3:
      return getThemeValue(theme, 'shadows.lg');
    default:
      return getThemeValue(theme, 'shadows.base');
  }
};

const getVariantColors = (variant: string, theme: ThemeConfig) => {
  switch (variant) {
    case 'primary':
      return {
        bg: getThemeValue(theme, 'colors.primary'),
        text: '#fff'
      };
    case 'secondary':
      return {
        bg: getThemeValue(theme, 'colors.secondary'),
        text: '#fff'
      };
    case 'accent':
      return {
        bg: getThemeValue(theme, 'colors.accent') || getThemeValue(theme, 'colors.primary'),
        text: '#fff'
      };
    default:
      return {
        bg: getThemeValue(theme, 'colors.background.primary'),
        text: getThemeValue(theme, 'colors.text.primary')
      };
  }
};

const StyledCard = styled.div<Omit<CardProps, 'children' | 'title' | 'subtitle' | 'header' | 'footer' | 'coverImage' | 'coverImageAlt'>>`
  display: flex;
  flex-direction: column;
  border-radius: ${props => getThemeValue(props.theme as ThemeConfig, 'borderRadius.base')};
  overflow: hidden;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  box-shadow: ${props => getElevationShadow(props.elevation || 1, props.theme as ThemeConfig)};
  background-color: ${props => getVariantColors(props.variant || 'default', props.theme as ThemeConfig).bg};
  color: ${props => getVariantColors(props.variant || 'default', props.theme as ThemeConfig).text};
  font-family: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.family.primary')};
  transition: all 0.3s ease;
  
  ${props => props.clickable && `
    cursor: pointer;
    
    &:hover {
      box-shadow: ${getElevationShadow(Math.min((props.elevation || 1) + 1, 3), props.theme as ThemeConfig)};
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

const CardHeader = styled.div<{ variant?: string }>`
  padding: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.4')};
  border-bottom: 1px solid ${props => getThemeValue(props.theme as ThemeConfig, 'colors.border.primary')};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.scale.lg')};
  font-weight: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.weights.semibold')};
`;

const CardSubtitle = styled.div`
  font-size: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.scale.sm')};
  color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.text.secondary')};
  margin-top: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.1')};
`;

const CardContent = styled.div`
  padding: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.4')};
  flex: 1;
`;

const CardFooter = styled.div`
  padding: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.4')};
  border-top: 1px solid ${props => getThemeValue(props.theme as ThemeConfig, 'colors.border.primary')};
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
  
  return (
    <StyledCard
      elevation={elevation}
      variant={variant}
      fullWidth={fullWidth}
      clickable={isClickable}
      onClick={isClickable ? onClick : undefined}
      className={className}
      style={style}
    >
      {coverImage && (
        <CardImage src={coverImage} alt={coverImageAlt} />
      )}
      
      {header ? (
        <CardHeader variant={variant}>{header}</CardHeader>
      ) : (title || subtitle) && (
        <CardHeader variant={variant}>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardHeader>
      )}
      
      <CardContent>{children}</CardContent>
      
      {footer && <CardFooter>{footer}</CardFooter>}
    </StyledCard>
  );
}; 