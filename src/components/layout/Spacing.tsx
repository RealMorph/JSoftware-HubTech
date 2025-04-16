import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { getSpacingValue } from './spacing-utils';

// === Types ===
type SpacerProps = {
  size?: number | string;
  axis?: 'horizontal' | 'vertical' | 'both';
  inline?: boolean;
  className?: string;
  testId?: string;
  'data-testid'?: string;
};

type BoxProps = {
  children: ReactNode;
  className?: string;
  m?: number | string;
  mt?: number | string;
  mr?: number | string;
  mb?: number | string;
  ml?: number | string;
  mx?: number | string;
  my?: number | string;
  p?: number | string;
  pt?: number | string;
  pr?: number | string;
  pb?: number | string;
  pl?: number | string;
  px?: number | string;
  py?: number | string;
  style?: React.CSSProperties;
  testId?: string;
  'data-testid'?: string;
};

type DividerProps = {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: number | string;
  color?: string;
  testId?: string;
  'data-testid'?: string;
};

// Convert a spacing value (number or string) to a CSS value
const toSpacingValue = (value: number | string | undefined): string => {
  if (value === undefined) return '0';
  if (typeof value === 'number') return `${value}px`;
  return value;
};

// === Components ===
export const Spacer = ({
  size,
  axis = 'vertical',
  inline,
  className,
  testId,
  'data-testid': dataTestId,
  ...rest
}: SpacerProps) => {
  const theme = useDirectTheme();
  
  const spacingValue = getSpacingValue(size, theme.getSpacing, '4px');
  
  const spacerStyle = {
    display: inline ? 'inline-block' : 'block',
    width: (axis === 'horizontal' || axis === 'both') ? spacingValue : undefined,
    height: (axis === 'vertical' || axis === 'both') ? spacingValue : undefined,
  };
  
  return (
    <div 
      className={className}
      style={spacerStyle}
      data-testid={dataTestId || testId}
      {...rest}
    />
  );
};

export const Box = ({
  children,
  className,
  m, mt, mr, mb, ml, mx, my,
  p, pt, pr, pb, pl, px, py,
  style,
  testId,
  'data-testid': dataTestId,
  ...rest
}: BoxProps) => {
  const theme = useDirectTheme();

  // Simplified direct handling of spacing values
  // Handle margin values
  const margin = typeof m === 'number' ? `${m}px` : m !== undefined ? theme.getSpacing(String(m), String(m)) : undefined;
  const marginX = typeof mx === 'number' ? `${mx}px` : mx !== undefined ? theme.getSpacing(String(mx), String(mx)) : undefined;
  const marginY = typeof my === 'number' ? `${my}px` : my !== undefined ? theme.getSpacing(String(my), String(my)) : undefined;
  
  const marginTop = typeof mt === 'number' ? `${mt}px` : 
                    mt !== undefined ? theme.getSpacing(String(mt), String(mt)) : 
                    marginY || margin;
                    
  const marginRight = typeof mr === 'number' ? `${mr}px` : 
                      mr !== undefined ? theme.getSpacing(String(mr), String(mr)) : 
                      marginX || margin;
                      
  const marginBottom = typeof mb === 'number' ? `${mb}px` : 
                       mb !== undefined ? theme.getSpacing(String(mb), String(mb)) : 
                       marginY || margin;
                       
  const marginLeft = typeof ml === 'number' ? `${ml}px` : 
                     ml !== undefined ? theme.getSpacing(String(ml), String(ml)) : 
                     marginX || margin;

  // Handle padding values
  const padding = typeof p === 'number' ? `${p}px` : p !== undefined ? theme.getSpacing(String(p), String(p)) : undefined;
  const paddingX = typeof px === 'number' ? `${px}px` : px !== undefined ? theme.getSpacing(String(px), String(px)) : undefined;
  const paddingY = typeof py === 'number' ? `${py}px` : py !== undefined ? theme.getSpacing(String(py), String(py)) : undefined;
  
  const paddingTop = typeof pt === 'number' ? `${pt}px` : 
                     pt !== undefined ? theme.getSpacing(String(pt), String(pt)) : 
                     paddingY || padding;
                     
  const paddingRight = typeof pr === 'number' ? `${pr}px` : 
                       pr !== undefined ? theme.getSpacing(String(pr), String(pr)) : 
                       paddingX || padding;
                       
  const paddingBottom = typeof pb === 'number' ? `${pb}px` : 
                        pb !== undefined ? theme.getSpacing(String(pb), String(pb)) : 
                        paddingY || padding;
                        
  const paddingLeft = typeof pl === 'number' ? `${pl}px` : 
                      pl !== undefined ? theme.getSpacing(String(pl), String(pl)) : 
                      paddingX || padding;
  
  const boxStyle = {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    ...style
  };

  // For testing purposes - add data attributes with the computed values
  const testDataAttributes = {
    'data-margin-top': marginTop,
    'data-margin-right': marginRight,
    'data-margin-bottom': marginBottom, 
    'data-margin-left': marginLeft,
    'data-padding-top': paddingTop,
    'data-padding-right': paddingRight,
    'data-padding-bottom': paddingBottom,
    'data-padding-left': paddingLeft
  };

  return (
    <div
      className={className}
      style={boxStyle}
      data-testid={dataTestId || testId}
      {...testDataAttributes}
      {...rest}
    >
      {children}
    </div>
  );
};

export const Divider = ({
  className,
  orientation = 'horizontal',
  size = '1px',
  color,
  testId,
  'data-testid': dataTestId,
  ...rest
}: DividerProps) => {
  const theme = useDirectTheme();
  
  const borderColor = color ? 
    theme.getColor(`${color}`, color) : 
    theme.getColor('border', '#e5e7eb');
  
  const dividerStyle = {
    display: 'block',
    backgroundColor: borderColor,
    height: orientation === 'horizontal' ? getSpacingValue(size, theme.getSpacing, '1px') : 'auto',
    width: orientation === 'vertical' ? getSpacingValue(size, theme.getSpacing, '1px') : 'auto',
    margin: orientation === 'horizontal' ? `${theme.getSpacing('4', '16px')} 0` : `0 ${theme.getSpacing('4', '16px')}`,
    alignSelf: 'stretch',
  };
  
  return (
    <div
      className={className}
      style={dividerStyle}
      data-testid={dataTestId || testId}
      {...rest}
    />
  );
}; 