import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Table, TableColumn } from './Table';
import { getThemeValue } from '../../core/theme/styled';
import { ThemeConfig } from '../../core/theme/theme-persistence';

// Sample data type
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  dateJoined: string;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    dateJoined: '2023-01-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Editor',
    status: 'active',
    dateJoined: '2023-02-20',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Viewer',
    status: 'inactive',
    dateJoined: '2023-03-10',
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    role: 'Editor',
    status: 'pending',
    dateJoined: '2023-04-05',
  },
];

// Columns configuration
const userColumns: TableColumn<User>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '50px',
  },
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'email',
    header: 'Email',
  },
  {
    key: 'role',
    header: 'Role',
  },
  {
    key: 'status',
    header: 'Status',
    render: value => {
      const statusColors = {
        active: '#4caf50',
        inactive: '#f44336',
        pending: '#ff9800',
      };

      return (
        <div
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: statusColors[value as 'active' | 'inactive' | 'pending'],
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.85em',
          }}
        >
          {value}
        </div>
      );
    },
  },
  {
    key: 'dateJoined',
    header: 'Date Joined',
    render: value => new Date(value as string).toLocaleDateString(),
  },
];

const DemoContainer = styled.div`
  padding: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.6')};
  background-color: ${props =>
    getThemeValue(props.theme as ThemeConfig, 'colors.background.primary')};
`;

const DemoSection = styled.section`
  margin-bottom: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.8')};
`;

const DemoTitle = styled.h2`
  font-size: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.scale.xl')};
  font-weight: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.weights.semibold')};
  margin-bottom: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.4')};
  color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.text.primary')};
`;

const DemoDescription = styled.p`
  margin-bottom: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.4')};
  color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.text.secondary')};
`;

/**
 * TableDemo component with different table variations
 */
export const TableDemo: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<User | null>(null);

  const handleRowClick = (row: User) => {
    setSelectedRow(row);
    window.alert(`Selected user: ${row.name}`);
  };

  return (
    <DemoContainer>
      <DemoTitle>Table Component</DemoTitle>
      <DemoDescription>
        The Table component provides a way to display data in a structured, tabular format. Below
        are various configurations of the Table component.
      </DemoDescription>

      {selectedRow && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#f0f8ff',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <strong>Selected User:</strong> {selectedRow.name} ({selectedRow.email}) -{' '}
          {selectedRow.role}
        </div>
      )}

      <DemoSection>
        <DemoTitle>Basic Table</DemoTitle>
        <DemoDescription>A simple table with default styling.</DemoDescription>
        <Table<User> data={sampleUsers} columns={userColumns} />
      </DemoSection>

      <DemoSection>
        <DemoTitle>Striped Table</DemoTitle>
        <DemoDescription>
          A table with alternating row colors for better readability.
        </DemoDescription>
        <Table<User> data={sampleUsers} columns={userColumns} striped />
      </DemoSection>

      <DemoSection>
        <DemoTitle>Bordered Table</DemoTitle>
        <DemoDescription>A table with borders around all cells.</DemoDescription>
        <Table<User> data={sampleUsers} columns={userColumns} bordered />
      </DemoSection>

      <DemoSection>
        <DemoTitle>Compact Table</DemoTitle>
        <DemoDescription>
          A table with smaller cell padding for dense information display.
        </DemoDescription>
        <Table<User> data={sampleUsers} columns={userColumns} size="small" />
      </DemoSection>

      <DemoSection>
        <DemoTitle>Large Table</DemoTitle>
        <DemoDescription>A table with larger cell padding for better readability.</DemoDescription>
        <Table<User> data={sampleUsers} columns={userColumns} size="large" />
      </DemoSection>

      <DemoSection>
        <DemoTitle>Interactive Table</DemoTitle>
        <DemoDescription>A table with hover effects and clickable rows.</DemoDescription>
        <Table<User>
          data={sampleUsers}
          columns={userColumns}
          hover
          onRowClick={handleRowClick}
          caption="Click on a row to select a user"
        />
      </DemoSection>

      <DemoSection>
        <DemoTitle>Fully Featured Table</DemoTitle>
        <DemoDescription>
          A table combining multiple features: striped, bordered, hover effects, and clickable rows.
        </DemoDescription>
        <Table<User>
          data={sampleUsers}
          columns={userColumns}
          striped
          bordered
          hover
          onRowClick={handleRowClick}
          caption="Users Table with all features enabled"
        />
      </DemoSection>
    </DemoContainer>
  );
};
