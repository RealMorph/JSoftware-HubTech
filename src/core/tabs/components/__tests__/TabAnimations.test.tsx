import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { TabAnimationCustomizer } from '../TabAnimationCustomizer';
import { TabAnimationsDemo } from '../../theme/AnimatedTab';

// Mock the useTheme hook
jest.mock('../../../theme', () => ({
  useTheme: () => ({
    currentTheme: {
      colors: {
        primary: {
          100: '#e6f7ff',
          500: '#1890ff',
          800: '#0050b3',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          800: '#333333',
        },
      },
    },
  }),
}));

describe('Tab Animations', () => {
  it('renders TabAnimationCustomizer with controls', () => {
    render(
      <ThemeProvider theme={{}}>
        <TabAnimationCustomizer />
      </ThemeProvider>
    );

    // Check for customizer elements
    expect(screen.getByText('Tab Animation Customizer')).toBeInTheDocument();
    expect(screen.getByText('Duration (ms)')).toBeInTheDocument();
    expect(screen.getByText('Easing Function')).toBeInTheDocument();
    expect(screen.getByText('Slide Distance')).toBeInTheDocument();

    // Check for feature toggles
    expect(screen.getByText('Enable Tab Switch Animation')).toBeInTheDocument();
    expect(screen.getByText('Enable Group Collapse Animation')).toBeInTheDocument();
    expect(screen.getByText('Enable Drag Preview Animation')).toBeInTheDocument();
  });

  it('renders TabAnimationsDemo with interactive elements', () => {
    render(
      <ThemeProvider theme={{}}>
        <TabAnimationsDemo />
      </ThemeProvider>
    );

    // Check for demo elements
    expect(screen.getByText('Tab Animation Demo')).toBeInTheDocument();
    expect(screen.getByText('Add New Tab')).toBeInTheDocument();
    expect(screen.getByText('Collapse Group')).toBeInTheDocument();

    // Check for initial tabs
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('allows adding and removing tabs with animations', async () => {
    render(
      <ThemeProvider theme={{}}>
        <TabAnimationsDemo />
      </ThemeProvider>
    );

    // Add a new tab
    fireEvent.click(screen.getByText('Add New Tab'));

    // Check that new tab was added
    expect(screen.getByText('New Tab 4')).toBeInTheDocument();

    // Wait for animation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    // Check content is displayed
    expect(screen.getByText('New Tab 4 Content')).toBeInTheDocument();

    // Remove a tab
    const closeButtons = screen.getAllByText('×');
    fireEvent.click(closeButtons[0]); // Close the first tab

    // Verify the tab is removed
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('toggles group collapse animation', async () => {
    render(
      <ThemeProvider theme={{}}>
        <TabAnimationsDemo />
      </ThemeProvider>
    );

    // Collapse the group
    fireEvent.click(screen.getByText('Collapse Group'));

    // Group toggle button should now say "Expand Group"
    expect(screen.getByText('Expand Group')).toBeInTheDocument();

    // Wait for animation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    // Expand the group
    fireEvent.click(screen.getByText('Expand Group'));

    // Group toggle button should now say "Collapse Group" again
    expect(screen.getByText('Collapse Group')).toBeInTheDocument();
  });
});
