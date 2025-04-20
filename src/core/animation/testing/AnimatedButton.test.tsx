import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeProvider } from '../../theme/ThemeContext';
import { AnimatedButton } from '../examples/AnimatedButton';
import { 
  createCompleteMockTheme,
  mockReducedMotionMediaQuery,
  resetMockedMediaQuery,
  waitForAnimation
} from './animationTestUtils';

// Mock component for testing
jest.mock('../../hooks/useAnimation', () => ({
  useAnimationPreset: () => ({
    getAnimationCSS: () => ({
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'scale(1)'
    }),
  }),
  useMotionPreference: () => ({
    isMotionSafe: true,
    prefersReducedMotion: false,
    shouldReduceIntensity: false,
  }),
}));

describe('AnimatedButton', () => {
  afterEach(() => {
    resetMockedMediaQuery();
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <ThemeProvider initialTheme={{ name: 'default', config: createCompleteMockTheme() }}>
        <AnimatedButton>Test Button</AnimatedButton>
      </ThemeProvider>
    );
    
    expect(getByText('Test Button')).toBeInTheDocument();
  });

  it('applies hover animation on mouse enter', async () => {
    const { getByText } = render(
      <ThemeProvider initialTheme={{ name: 'default', config: createCompleteMockTheme() }}>
        <AnimatedButton>Test Button</AnimatedButton>
      </ThemeProvider>
    );
    
    const button = getByText('Test Button');
    
    // Initial state - no transform
    expect(button.style.transform).toBe('');
    
    // Trigger hover
    fireEvent.mouseEnter(button);
    
    // Wait for animation to apply
    await waitForAnimation(50);
    
    // Check that transform is applied
    expect(button.style.transform).toBe('scale(1)');
    
    // Trigger mouse leave
    fireEvent.mouseLeave(button);
    
    // Wait for animation to revert
    await waitForAnimation(50);
    
    // Check that transform is removed
    expect(button.style.transform).toBe('');
  });

  it('respects reduced motion preferences', async () => {
    // Mock reduced motion preference
    mockReducedMotionMediaQuery(true);
    
    // Override the mock to respect reduced motion
    jest.mock('../../hooks/useAnimation', () => ({
      useAnimationPreset: () => ({
        getAnimationCSS: () => ({
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'scale(1)'
        }),
      }),
      useMotionPreference: () => ({
        isMotionSafe: false,
        prefersReducedMotion: true,
        shouldReduceIntensity: false,
      }),
    }));
    
    const { getByText } = render(
      <ThemeProvider initialTheme={{ name: 'default', config: createCompleteMockTheme(true, true) }}>
        <AnimatedButton>Test Button</AnimatedButton>
      </ThemeProvider>
    );
    
    const button = getByText('Test Button');
    
    // Trigger hover
    fireEvent.mouseEnter(button);
    
    // Wait for animation to apply
    await waitForAnimation(50);
    
    // Animation should not be applied due to reduced motion preference
    expect(button.style.transform).toBe('');
  });

  it('applies different animation types based on props', async () => {
    const { getByText } = render(
      <ThemeProvider initialTheme={{ name: 'default', config: createCompleteMockTheme() }}>
        <AnimatedButton animationType="fade">Fade Button</AnimatedButton>
      </ThemeProvider>
    );
    
    const button = getByText('Fade Button');
    
    // Trigger hover
    fireEvent.mouseEnter(button);
    
    // Wait for animation to apply
    await waitForAnimation(50);
    
    // Opacity should be affected for fade animation
    expect(button.style.opacity).toBe('0.9');
  });

  it('handles click events correctly', () => {
    const handleClick = jest.fn();
    
    const { getByText } = render(
      <ThemeProvider initialTheme={{ name: 'default', config: createCompleteMockTheme() }}>
        <AnimatedButton onClick={handleClick}>Click Me</AnimatedButton>
      </ThemeProvider>
    );
    
    const button = getByText('Click Me');
    
    // Click the button
    fireEvent.click(button);
    
    // Check that click handler was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
}); 