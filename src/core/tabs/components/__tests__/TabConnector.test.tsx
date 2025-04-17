import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabConnector } from '../TabConnector';

// Mock the hooks
jest.mock('../../hooks', () => ({
  useTabMessaging: jest.fn(() => ({
    messages: [],
    lastMessage: null,
    sendMessage: jest.fn(),
    sendEvent: jest.fn(),
    clearMessages: jest.fn(),
  })),
  useTabState: jest.fn(() => ({
    state: { test: 'initial state' },
    updateState: jest.fn(),
    dependencies: [],
    dependents: [],
    addDependency: jest.fn(),
    removeDependency: jest.fn(),
  })),
}));

describe('TabConnector', () => {
  const mockTabManager = {
    // Mock properties and methods
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TabConnector tabManager={mockTabManager as any} tabId="tab-1" />);

    // Check for basic elements
    expect(screen.getByText('Tab Connector')).toBeInTheDocument();
    expect(screen.getByText('Tab ID: tab-1')).toBeInTheDocument();
  });

  it('displays tab state correctly', () => {
    render(<TabConnector tabManager={mockTabManager as any} tabId="tab-1" />);

    // Check if the state is displayed
    expect(screen.getByText(/"test": "initial state"/)).toBeInTheDocument();
  });

  it('shows target tab UI when targetTabId is provided', () => {
    render(<TabConnector tabManager={mockTabManager as any} tabId="tab-1" targetTabId="tab-2" />);

    // Check for messaging UI
    expect(screen.getByPlaceholderText('Enter message')).toBeInTheDocument();
    expect(screen.getByText('Send to tab-2')).toBeInTheDocument();

    // Check for dependency controls
    expect(screen.getByText('Add Dependency to tab-2')).toBeInTheDocument();
  });

  it('does not show target-specific UI when no targetTabId is provided', () => {
    render(<TabConnector tabManager={mockTabManager as any} tabId="tab-1" />);

    // These elements should not be present
    expect(screen.queryByPlaceholderText('Enter message')).not.toBeInTheDocument();
    expect(screen.queryByText(/Send to/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Add Dependency to/)).not.toBeInTheDocument();
  });
});
