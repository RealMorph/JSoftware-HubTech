import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Table, TableColumn } from './Table';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

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

// Create styled components with the appropriate props
interface ThemeStyles {
  container: {
    padding: string;
    backgroundColor: string;
  };
  section: {
    marginBottom: string;
  };
  title: {
    fontSize: string;
    fontWeight: number;
    marginBottom: string;
    color: string;
  };
  description: {
    marginBottom: string;
    color: string;
  };
}

const DemoContainer = styled.div<{ $themeStyles: ThemeStyles['container'] }>`
  padding: ${({ $themeStyles }) => $themeStyles.padding};
  background-color: ${({ $themeStyles }) => $themeStyles.backgroundColor};
`;

const DemoSection = styled.section<{ $themeStyles: ThemeStyles['section'] }>`
  margin-bottom: ${({ $themeStyles }) => $themeStyles.marginBottom};
`;

const DemoTitle = styled.h2<{ $themeStyles: ThemeStyles['title'] }>`
  font-size: ${({ $themeStyles }) => $themeStyles.fontSize};
  font-weight: ${({ $themeStyles }) => $themeStyles.fontWeight};
  margin-bottom: ${({ $themeStyles }) => $themeStyles.marginBottom};
  color: ${({ $themeStyles }) => $themeStyles.color};
`;

const DemoDescription = styled.p<{ $themeStyles: ThemeStyles['description'] }>`
  margin-bottom: ${({ $themeStyles }) => $themeStyles.marginBottom};
  color: ${({ $themeStyles }) => $themeStyles.color};
`;

/**
 * TableDemo component with different table variations
 */
export const TableDemo: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<User | null>(null);
  const { getColor, getTypography, getSpacing } = useDirectTheme();
  
  const themeStyles: ThemeStyles = {
    container: {
      padding: getSpacing('6', '1.5rem'),
      backgroundColor: getColor('background.primary', '#ffffff'),
    },
    section: {
      marginBottom: getSpacing('8', '2rem'),
    },
    title: {
      fontSize: getTypography('scale.xl', '1.5rem') as string,
      fontWeight: getTypography('weights.semibold', 600) as number,
      marginBottom: getSpacing('4', '1rem'),
      color: getColor('text.primary', '#333333'),
    },
    description: {
      marginBottom: getSpacing('4', '1rem'),
      color: getColor('text.secondary', '#666666'),
    },
  };

  const handleRowClick = (row: User) => {
    setSelectedRow(row);
    window.alert(`Selected user: ${row.name}`);
  };

  return (
    <DemoContainer $themeStyles={themeStyles.container}>
      <h1>Table Component</h1>
      
      <DemoSection $themeStyles={themeStyles.section}>
        <h2>Basic Table</h2>
        <DemoDescription $themeStyles={themeStyles.description}>
          A simple table with default styling.
        </DemoDescription>
        <Table<User> data={sampleUsers.slice(0, 3)} columns={userColumns} />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles.section}>
        <h2>Bordered Table</h2>
        <DemoDescription $themeStyles={themeStyles.description}>
          A table with borders around all cells.
        </DemoDescription>
        <Table<User> data={sampleUsers.slice(0, 3)} columns={userColumns} bordered />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles.section}>
        <h2>Large Table</h2>
        <DemoDescription $themeStyles={themeStyles.description}>
          A table with larger cell padding for better readability.
        </DemoDescription>
        <Table<User> data={sampleUsers.slice(0, 3)} columns={userColumns} size="large" />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles.section}>
        <h2>Interactive Table</h2>
        <DemoDescription $themeStyles={themeStyles.description}>
          A table with hover effects and clickable rows.
        </DemoDescription>
        <Table<User> data={sampleUsers} columns={userColumns} hover onRowClick={handleRowClick} />
      </DemoSection>

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

      <DemoSection $themeStyles={themeStyles.section}>
        <DemoTitle $themeStyles={themeStyles.title}>Striped Table</DemoTitle>
        <DemoDescription $themeStyles={themeStyles.description}>
          A table with alternating row colors for better readability.
        </DemoDescription>
        <Table<User> data={sampleUsers} columns={userColumns} striped />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles.section}>
        <DemoTitle $themeStyles={themeStyles.title}>Compact Table</DemoTitle>
        <DemoDescription $themeStyles={themeStyles.description}>
          A table with smaller cell padding for dense information display.
        </DemoDescription>
        <Table<User> data={sampleUsers} columns={userColumns} size="small" />
      </DemoSection>

      <DemoSection $themeStyles={themeStyles.section}>
        <DemoTitle $themeStyles={themeStyles.title}>Fully Featured Table</DemoTitle>
        <DemoDescription $themeStyles={themeStyles.description}>
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
