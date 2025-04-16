import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { TabContainer } from '../TabContainer';
import { TabManager } from '../../tab-manager';

describe('TabContainer', () => {
  const mockTabs = [
    { id: '1', title: 'Tab 1', content: 'Content 1', order: 0, isActive: false },
    { id: '2', title: 'Tab 2', content: 'Content 2', order: 1, isActive: false },
  ];

  let mockTabManager: jest.Mocked<TabManager>;

  beforeEach(() => {
    mockTabManager = {
      getTabs: jest.fn().mockResolvedValue(mockTabs),
      getActiveTab: jest.fn().mockResolvedValue(mockTabs[0]),
      activateTab: jest.fn().mockResolvedValue(undefined),
      removeTab: jest.fn().mockResolvedValue(undefined),
      reorderTabs: jest.fn().mockResolvedValue(undefined),
    } as any;
  });

  it('should render tabs correctly', async () => {
    await act(async () => {
      render(<TabContainer tabManager={mockTabManager} />);
    });

    // Wait for tabs to load
    await waitFor(() => {
      expect(mockTabManager.getTabs).toHaveBeenCalled();
    });

    // Wait for the tabs to be rendered
    await waitFor(() => {
      // Check if tab list is rendered
      expect(screen.getByTestId('tab-list')).toBeInTheDocument();

      // Check if all tabs are rendered
      mockTabs.forEach(tab => {
        expect(screen.getByTestId(`tab-${tab.id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`tab-title-${tab.id}`)).toHaveTextContent(tab.title);
      });
    });
  });

  it('should render active tab content', async () => {
    await act(async () => {
      render(<TabContainer tabManager={mockTabManager} />);
    });

    // Wait for tabs to load
    await waitFor(() => {
      expect(mockTabManager.getTabs).toHaveBeenCalled();
    });

    // Wait for the active tab content to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('tab-panel-1')).toBeInTheDocument();
      expect(screen.getByTestId('tab-panel-1')).toHaveTextContent('Content 1');
    });
  });

  it('should handle tab click events', async () => {
    await act(async () => {
      render(<TabContainer tabManager={mockTabManager} />);
    });

    // Wait for tabs to load
    await waitFor(() => {
      expect(mockTabManager.getTabs).toHaveBeenCalled();
    });

    // Wait for the tabs to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('tab-2')).toBeInTheDocument();
    });

    // Click on second tab
    await act(async () => {
      screen.getByTestId('tab-2').click();
    });

    // Check if activateTab was called with correct tab id
    expect(mockTabManager.activateTab).toHaveBeenCalledWith('2');
  });

  it('should handle tab close events', async () => {
    await act(async () => {
      render(<TabContainer tabManager={mockTabManager} />);
    });

    // Wait for tabs to load
    await waitFor(() => {
      expect(mockTabManager.getTabs).toHaveBeenCalled();
    });

    // Wait for the tabs to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('tab-close-1')).toBeInTheDocument();
    });

    // Click close button on first tab
    await act(async () => {
      screen.getByTestId('tab-close-1').click();
    });

    // Check if removeTab was called with correct tab id
    expect(mockTabManager.removeTab).toHaveBeenCalledWith('1');
  });
});
