import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import DataGrid, { Column } from './DataGrid';
import { Card, CardHeader, CardContent } from '../base/Card';
import { Button } from '../base/Button';
import { Select } from '../base/Select';
import { FilterProps } from './DataGrid';

// Define our data type for demonstration
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  registeredDate: string;
}

// Demo container styling
const DemoContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DemoSection = styled.div`
  margin-bottom: 32px;
`;

const DemoTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const FeatureCard = styled(Card)`
  margin-top: 24px;
`;

const CodeBlock = styled.pre`
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  overflow: auto;
  margin: 12px 0;
`;

// Custom filter component for status
const StatusFilter: React.FC<FilterProps> = ({ value, onChange }) => {
  return (
    <Select
      value={value || ''}
      onChange={(value) => onChange(value)}
      options={[
        { value: '', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]}
    />
  );
};

// Custom cell renderer for status
const StatusCell = (value: string) => {
  let color = '';
  switch (value) {
    case 'active':
      color = '#4caf50';
      break;
    case 'inactive':
      color = '#f44336';
      break;
    case 'pending':
      color = '#ff9800';
      break;
    default:
      color = '#9e9e9e';
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block'
        }}
      />
      <span style={{ textTransform: 'capitalize' }}>{value}</span>
    </div>
  );
};

// Sample user data
const generateUsers = (count: number): User[] => {
  const roles = ['Admin', 'Editor', 'User', 'Viewer'];
  const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
  const users: User[] = [];

  for (let i = 1; i <= count; i++) {
    const registeredDate = new Date(Date.now() - Math.floor(Math.random() * 1000 * 3600 * 24 * 365));
    const lastLogin = new Date(registeredDate.getTime() + Math.floor(Math.random() * (Date.now() - registeredDate.getTime())));
    
    users.push({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastLogin: lastLogin.toISOString().split('T')[0],
      registeredDate: registeredDate.toISOString().split('T')[0]
    });
  }

  return users;
};

const DataGridDemo: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dense, setDense] = useState<boolean>(false);
  const [striped, setStriped] = useState<boolean>(true);
  
  // Simulate loading data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setUsers(generateUsers(50));
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Define columns
  const columns: Column<User>[] = [
    {
      id: 'id',
      header: 'ID',
      accessor: 'id',
      width: '80px',
      sortable: true
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      sortable: true,
      filterable: true
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      sortable: true,
      filterable: true
    },
    {
      id: 'role',
      header: 'Role',
      accessor: 'role',
      sortable: true,
      filterable: true
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      filterable: true,
      renderCell: StatusCell,
      filterComponent: StatusFilter
    },
    {
      id: 'lastLogin',
      header: 'Last Login',
      accessor: 'lastLogin',
      sortable: true
    },
    {
      id: 'registeredDate',
      header: 'Registered Date',
      accessor: 'registeredDate',
      sortable: true
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      renderCell: (_, row) => (
        <Button 
          size="sm" 
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            alert(`View user ${row.name}`);
          }}
        >
          View
        </Button>
      )
    }
  ];
  
  const handleRowClick = (row: User) => {
    console.log('Row clicked:', row);
  };
  
  return (
    <DemoContainer>
      <DemoTitle>Data Grid Component</DemoTitle>
      
      <DemoSection>
        <Controls>
          <Button 
            onClick={() => setDense(!dense)}
            variant={dense ? 'primary' : 'secondary'}
          >
            {dense ? 'Dense Mode' : 'Normal Mode'}
          </Button>
          
          <Button 
            onClick={() => setStriped(!striped)}
            variant={striped ? 'primary' : 'secondary'}
          >
            {striped ? 'Striped Rows' : 'Single Color'}
          </Button>
        </Controls>
        
        <DataGrid
          data={users}
          columns={columns}
          enableSorting={true}
          enableFiltering={true}
          loading={loading}
          striped={striped}
          dense={dense}
          onRowClick={handleRowClick}
          initialSort={{ key: 'id', direction: 'asc' }}
          height="600px"
        />
      </DemoSection>
      
      <FeatureCard>
        <CardHeader>DataGrid Features</CardHeader>
        <CardContent>
          <ul>
            <li>Sortable columns (click on column headers)</li>
            <li>Column filtering with customizable filter components</li>
            <li>Pagination with adjustable page size</li>
            <li>Custom cell renderers</li>
            <li>Row click handlers</li>
            <li>Configurable styling (striped rows, dense mode)</li>
            <li>Loading state with spinner</li>
          </ul>
          
          <DemoTitle>Example Usage</DemoTitle>
          <CodeBlock>
{`import DataGrid, { Column } from './DataGrid';

// Define columns
const columns: Column<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
    filterable: true
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email'
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    renderCell: StatusCell,
    filterComponent: StatusFilter
  }
];

// Render DataGrid
<DataGrid
  data={users}
  columns={columns}
  enableSorting={true}
  enableFiltering={true}
  striped={true}
  onRowClick={handleRowClick}
/>
`}
          </CodeBlock>
        </CardContent>
      </FeatureCard>
    </DemoContainer>
  );
};

export default DataGridDemo; 