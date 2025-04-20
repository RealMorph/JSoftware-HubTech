import React from 'react';
import styled from '@emotion/styled';

// Helper type to strip out props starting with $
export type StripTransientProps<P> = {
  [K in keyof P as K extends `$${string}` ? never : K]: P[K];
};

/**
 * Filter component that strips out any props starting with $ before passing them to the DOM
 * This is the most reliable approach for handling transient props across different versions
 * of styled-components and emotion.
 * 
 * Usage:
 * const FilteredButton = filterTransientProps(styled.button``);
 * const StyledButton = styled(FilteredButton)<{ $active: boolean }>`
 *   color: ${props => props.$active ? 'blue' : 'black'};
 * `;
 */
export function filterTransientProps<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  return (props: P) => {
    const filteredProps = Object.entries(props).reduce(
      (acc, [key, value]) => {
        if (!key.startsWith('$')) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    return <Component {...(filteredProps as P)} />;
  };
}

// HOC for class components
export function withFilteredProps<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WithFilteredProps = (props: P) => {
    const filteredProps = Object.entries(props).reduce(
      (acc, [key, value]) => {
        if (!key.startsWith('$')) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    return <Component {...(filteredProps as P)} />;
  };

  return WithFilteredProps;
}

/**
 * Function to check if a prop should be forwarded to the DOM.
 * Filters out props that start with $.
 */
export const shouldForwardProp = (prop: string): boolean => {
  return !prop.startsWith('$');
};

// Pre-created filtered versions of common elements using Emotion's shouldForwardProp
export const FilteredDiv = styled('div', { shouldForwardProp });
export const FilteredButton = styled('button', { shouldForwardProp });
export const FilteredSpan = styled('span', { shouldForwardProp });
export const FilteredA = styled('a', { shouldForwardProp });
export const FilteredUl = styled('ul', { shouldForwardProp });
export const FilteredLi = styled('li', { shouldForwardProp });
export const FilteredInput = styled('input', { shouldForwardProp });
export const FilteredLabel = styled('label', { shouldForwardProp });
export const FilteredNav = styled('nav', { shouldForwardProp }); 