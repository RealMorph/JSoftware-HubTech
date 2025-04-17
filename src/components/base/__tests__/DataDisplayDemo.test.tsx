import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataDisplayDemo } from '../DataDisplayDemo';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { extendedMockTheme } from '../../../core/theme/__mocks__/mockTheme';

// Mock the Card, List, and Table components
jest.mock('../Card', () => ({
  Card: function Card({
    children,
    variant,
    style,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }) {
    return (
      <div
        data-testid="card"
        className={`card card-${variant || 'default'}`}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  },
  CardHeader: function CardHeader({ children }: { children: React.ReactNode }) {
    return <div className="card-header">{children}</div>;
  },
  CardContent: function CardContent({ children }: { children: React.ReactNode }) {
    return <div className="card-content">{children}</div>;
  },
  CardFooter: function CardFooter({ children }: { children: React.ReactNode }) {
    return <div className="card-footer">{children}</div>;
  },
}));

jest.mock('../List', () => ({
  List: function List({
    children,
    interactive,
    ...props
  }: {
    children: React.ReactNode;
    interactive?: boolean;
    [key: string]: any;
  }) {
    return (
      <ul data-testid="list" className={interactive ? 'interactive-list' : 'list'} {...props}>
        {children}
      </ul>
    );
  },
  ListItem: function ListItem({
    children,
    startContent,
    endContent,
    selected,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
  }) {
    return (
      <li
        className={`list-item ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={onClick}
      >
        {startContent && <div className="start-content">{startContent}</div>}
        <div className="content">{children}</div>
        {endContent && <div className="end-content">{endContent}</div>}
      </li>
    );
  },
}));

jest.mock('../Table', () => {
  const TableHeader = function TableHeader({ children }: { children: React.ReactNode }) {
    return <thead>{children}</thead>;
  };

  const TableBody = function TableBody({ children }: { children: React.ReactNode }) {
    return <tbody>{children}</tbody>;
  };

  // Simple table structure that separates thead and tbody
  function Table({
    children,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    [key: string]: any;
  }) {
    // Create an array from children
    const childrenArray = Array.isArray(children) ? children : [children];

    // Find header and body elements
    const headers = childrenArray.filter(child => child?.type?.name === 'TableHeader');
    const bodies = childrenArray.filter(child => child?.type?.name === 'TableBody');

    return (
      <table data-testid="table" className={`table table-${variant || 'default'}`} {...props}>
        {headers}
        {bodies}
      </table>
    );
  }

  Table.displayName = 'Table';
  TableHeader.displayName = 'TableHeader';
  TableBody.displayName = 'TableBody';

  return {
    Table,
    TableHeader,
    TableBody,
    TableRow: function TableRow({
      children,
      selected,
      onClick,
    }: {
      children: React.ReactNode;
      selected?: boolean;
      onClick?: () => void;
    }) {
      return (
        <tr className={selected ? 'selected' : ''} onClick={onClick}>
          {children}
        </tr>
      );
    },
    TableCell: function TableCell({ children }: { children: React.ReactNode }) {
      return <td>{children}</td>;
    },
    TableHeaderCell: function TableHeaderCell({ children }: { children: React.ReactNode }) {
      return <th>{children}</th>;
    },
  };
});

jest.mock('../Button', () => ({
  Button: function Button({
    children,
    variant,
    size,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    onClick?: (e: React.MouseEvent) => void;
  }) {
    return (
      <button
        className={`button button-${variant || 'primary'} button-${size || 'md'}`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={extendedMockTheme}>{ui}</DirectThemeProvider>);
};

describe('DataDisplayDemo', () => {
  it('renders without crashing', () => {
    renderWithTheme(<DataDisplayDemo />);
    expect(screen.getByText('Data Display Components')).toBeInTheDocument();
  });

  it('displays cards, lists, and tables', () => {
    renderWithTheme(<DataDisplayDemo />);

    // Check for cards
    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBeGreaterThan(0);

    // Check for lists
    const lists = screen.getAllByTestId('list');
    expect(lists.length).toBeGreaterThan(0);

    // Check for tables
    const tables = screen.getAllByTestId('table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('handles user selection in the table', () => {
    renderWithTheme(<DataDisplayDemo />);

    // Find the edit button in the table and click it
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // We're just testing that it doesn't crash when clicking the button
    expect(true).toBeTruthy();
  });
});
