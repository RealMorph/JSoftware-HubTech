import React, { ReactNode } from 'react';
import styled from '@emotion/styled';

// === Types ===
type GridProps = {
  children: ReactNode;
  className?: string;
  gap?: string | number;
  columns?: number | string;
  rows?: number | string;
  autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  justifyContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  fullWidth?: boolean;
  fullHeight?: boolean;
  testId?: string;
};

type GridItemProps = {
  children: ReactNode;
  className?: string;
  colSpan?: number | { [key: string]: number };
  rowSpan?: number;
  colStart?: number;
  rowStart?: number;
  alignSelf?: 'start' | 'end' | 'center' | 'stretch';
  justifySelf?: 'start' | 'end' | 'center' | 'stretch';
  testId?: string;
};

type RowProps = {
  children: ReactNode;
  className?: string;
  gap?: string | number;
  alignItems?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  justifyContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  wrap?: boolean | 'nowrap' | 'wrap' | 'wrap-reverse';
  fullWidth?: boolean;
  testId?: string;
};

type ColProps = {
  children: ReactNode;
  className?: string;
  span?: number | { [key: string]: number };
  offset?: number | { [key: string]: number };
  alignSelf?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  order?: number;
  grow?: number;
  shrink?: number;
  basis?: string | number;
  testId?: string;
};

// Utility functions
/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
const processGap = (
  gapValue: string | number | undefined,
  /* eslint-disable-next-line no-unused-vars */
  getSpacing: (key: string, fallback?: string) => string
): string => {
  if (gapValue === undefined) {
    return getSpacing('md', '1rem');
  }

  if (typeof gapValue === 'number') {
    return `${gapValue}px`;
  }

  return gapValue;
};

const getResponsiveValue = (
  value: number | { [key: string]: number },
  defaultValue: number = 0
) => {
  if (typeof value === 'object') {
    // Base implementation - would need media queries for responsive
    return value.base || defaultValue;
  }
  return value || defaultValue;
};

// === Styled Components ===
const StyledGrid = styled.div<Omit<GridProps, 'testId' | 'children' | 'className'>>`
  display: grid;
  grid-template-columns: ${({ columns }) =>
    columns ? (typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns) : undefined};
  grid-template-rows: ${({ rows }) =>
    rows ? (typeof rows === 'number' ? `repeat(${rows}, auto)` : rows) : undefined};
  grid-auto-flow: ${({ autoFlow }) => autoFlow || undefined};
  gap: ${({ gap, theme }) => {
    // Handle both numeric and string gaps
    if (gap === undefined) return theme.spacing?.md || '1rem';
    if (typeof gap === 'number') return `${gap}px`;
    return gap;
  }};
  align-items: ${({ alignItems }) => alignItems || undefined};
  justify-items: ${({ justifyItems }) => justifyItems || undefined};
  align-content: ${({ alignContent }) => alignContent || undefined};
  justify-content: ${({ justifyContent }) => justifyContent || undefined};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : undefined)};
  height: ${({ fullHeight }) => (fullHeight ? '100%' : undefined)};
`;

const StyledGridItem = styled.div<Omit<GridItemProps, 'testId' | 'children' | 'className'>>`
  grid-column: ${({ colSpan, colStart }) => {
    if (!colSpan) return undefined;
    const span = getResponsiveValue(colSpan);
    return colStart ? `${colStart} / span ${span}` : `span ${span}`;
  }};
  grid-row: ${({ rowSpan, rowStart }) => {
    if (!rowSpan) return undefined;
    return rowStart ? `${rowStart} / span ${rowSpan}` : `span ${rowSpan}`;
  }};
  align-self: ${({ alignSelf }) => alignSelf || undefined};
  justify-self: ${({ justifySelf }) => justifySelf || undefined};
`;

const StyledRow = styled.div<Omit<RowProps, 'testId' | 'children' | 'className'>>`
  display: flex;
  flex-direction: row;
  flex-wrap: ${({ wrap }) => (wrap === true ? 'wrap' : typeof wrap === 'string' ? wrap : 'nowrap')};
  gap: ${({ gap, theme }) => {
    // Handle both numeric and string gaps
    if (gap === undefined) return theme.spacing?.md || '1rem';
    if (typeof gap === 'number') return `${gap}px`;
    return gap;
  }};
  align-items: ${({ alignItems }) => alignItems || undefined};
  justify-content: ${({ justifyContent }) => justifyContent || undefined};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : undefined)};
`;

const StyledCol = styled.div<Omit<ColProps, 'testId' | 'children' | 'className'>>`
  display: flex;
  flex-direction: column;
  flex-grow: ${({ grow }) => grow || undefined};
  flex-shrink: ${({ shrink }) => (shrink !== undefined ? shrink : 1)};
  flex-basis: ${({ basis }) => basis || undefined};
  align-self: ${({ alignSelf }) => alignSelf || undefined};
  order: ${({ order }) => order || undefined};
  width: ${({ span }) => {
    if (!span) return undefined;
    const spanValue = getResponsiveValue(span);
    return `${(spanValue / 12) * 100}%`;
  }};
  margin-left: ${({ offset }) => {
    if (!offset) return undefined;
    const offsetValue = getResponsiveValue(offset);
    return `${(offsetValue / 12) * 100}%`;
  }};
`;

// === Components ===
export const Grid = ({
  children,
  className,
  gap,
  columns,
  rows,
  autoFlow,
  alignItems,
  justifyItems,
  alignContent,
  justifyContent,
  fullWidth,
  fullHeight,
  testId,
}: GridProps) => {
  return (
    <StyledGrid
      className={className}
      gap={gap}
      columns={columns}
      rows={rows}
      autoFlow={autoFlow}
      alignItems={alignItems}
      justifyItems={justifyItems}
      alignContent={alignContent}
      justifyContent={justifyContent}
      fullWidth={fullWidth}
      fullHeight={fullHeight}
      data-testid={testId}
    >
      {children}
    </StyledGrid>
  );
};

export const GridItem = ({
  children,
  className,
  colSpan,
  rowSpan,
  colStart,
  rowStart,
  alignSelf,
  justifySelf,
  testId,
}: GridItemProps) => {
  return (
    <StyledGridItem
      className={className}
      colSpan={colSpan}
      rowSpan={rowSpan}
      colStart={colStart}
      rowStart={rowStart}
      alignSelf={alignSelf}
      justifySelf={justifySelf}
      data-testid={testId}
    >
      {children}
    </StyledGridItem>
  );
};

export const Row = ({
  children,
  className,
  gap,
  alignItems,
  justifyContent,
  wrap,
  fullWidth,
  testId,
}: RowProps) => {
  return (
    <StyledRow
      className={className}
      gap={gap}
      alignItems={alignItems}
      justifyContent={justifyContent}
      wrap={wrap}
      fullWidth={fullWidth}
      data-testid={testId}
    >
      {children}
    </StyledRow>
  );
};

export const Col = ({
  children,
  className,
  span,
  offset,
  alignSelf,
  order,
  grow,
  shrink,
  basis,
  testId,
}: ColProps) => {
  return (
    <StyledCol
      className={className}
      span={span}
      offset={offset}
      alignSelf={alignSelf}
      order={order}
      grow={grow}
      shrink={shrink}
      basis={basis}
      data-testid={testId}
    >
      {children}
    </StyledCol>
  );
};
