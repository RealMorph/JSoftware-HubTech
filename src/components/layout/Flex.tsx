import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// === Types ===
type FlexProps = {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
  gap?: string | number;
  fullWidth?: boolean;
  fullHeight?: boolean;
  inline?: boolean;
  testId?: string;
};

type FlexItemProps = {
  children: ReactNode;
  className?: string;
  flex?: string | number;
  grow?: number;
  shrink?: number;
  basis?: string | number;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  order?: number;
  testId?: string;
};

// === Components ===
export const Flex = ({
  children,
  className,
  direction = 'row',
  wrap = 'nowrap',
  justifyContent = 'flex-start',
  alignItems = 'stretch',
  alignContent,
  gap,
  fullWidth,
  fullHeight,
  inline,
  testId
}: FlexProps) => {
  const theme = useDirectTheme();

  const getGapValue = () => {
    if (gap === undefined) return theme.getSpacing('md', '1rem');
    if (typeof gap === 'number') return `${gap}px`;
    return gap;
  };

  return (
    <StyledFlex
      className={className}
      direction={direction}
      wrap={wrap}
      justifyContent={justifyContent}
      alignItems={alignItems}
      alignContent={alignContent}
      gap={getGapValue()}
      fullWidth={fullWidth}
      fullHeight={fullHeight}
      inline={inline}
      data-testid={testId}
    >
      {children}
    </StyledFlex>
  );
};

export const FlexItem = ({
  children,
  className,
  flex,
  grow,
  shrink,
  basis,
  alignSelf,
  order,
  testId
}: FlexItemProps) => {
  return (
    <StyledFlexItem
      className={className}
      flex={flex}
      grow={grow}
      shrink={shrink}
      basis={basis}
      alignSelf={alignSelf}
      order={order}
      data-testid={testId}
    >
      {children}
    </StyledFlexItem>
  );
};

// === Styled Components ===
const StyledFlex = styled.div<Omit<FlexProps, 'testId' | 'children' | 'className'> & { gap: string }>`
  display: ${({ inline }) => inline ? 'inline-flex' : 'flex'};
  flex-direction: ${({ direction }) => direction || 'row'};
  flex-wrap: ${({ wrap }) => wrap || 'nowrap'};
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  align-items: ${({ alignItems }) => alignItems || 'stretch'};
  align-content: ${({ alignContent }) => alignContent || undefined};
  gap: ${({ gap }) => gap};
  width: ${({ fullWidth }) => fullWidth ? '100%' : undefined};
  height: ${({ fullHeight }) => fullHeight ? '100%' : undefined};
`;

const StyledFlexItem = styled.div<Omit<FlexItemProps, 'testId' | 'children' | 'className'>>`
  flex: ${({ flex }) => flex || undefined};
  flex-grow: ${({ grow }) => grow || undefined};
  flex-shrink: ${({ shrink }) => shrink || undefined};
  flex-basis: ${({ basis }) => basis || undefined};
  align-self: ${({ alignSelf }) => alignSelf || undefined};
  order: ${({ order }) => order || undefined};
`; 