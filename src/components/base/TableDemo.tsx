import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from './Table';
import { Button } from './Button';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

type SortField = 'name' | 'email' | 'role' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export const TableDemo: React.FC = () => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const demoSectionStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const demoTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
  };

  // Sample data
  const users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'inactive' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Editor', status: 'active' },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'User',
      status: 'inactive',
    },
  ];

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction or clear if already desc
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      // Start with ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort the data
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Table Component Demo</h1>

      {/* Table Variants */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Table Variants</h2>

        <h3 style={{ marginBottom: '8px' }}>Default</h3>
        <Table variant="default" style={{ marginBottom: '24px' }}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.slice(0, 3).map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h3 style={{ marginBottom: '8px' }}>Bordered</h3>
        <Table variant="bordered" style={{ marginBottom: '24px' }}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.slice(0, 3).map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h3 style={{ marginBottom: '8px' }}>Striped</h3>
        <Table variant="striped" style={{ marginBottom: '24px' }}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.slice(0, 3).map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Table Sizes */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Table Sizes</h2>

        <h3 style={{ marginBottom: '8px' }}>Small</h3>
        <Table variant="bordered" size="small" style={{ marginBottom: '24px' }}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.slice(0, 2).map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h3 style={{ marginBottom: '8px' }}>Medium (Default)</h3>
        <Table variant="bordered" size="medium" style={{ marginBottom: '24px' }}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.slice(0, 2).map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h3 style={{ marginBottom: '8px' }}>Large</h3>
        <Table variant="bordered" size="large" style={{ marginBottom: '24px' }}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.slice(0, 2).map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Hoverable and Selectable Rows */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Hoverable and Selectable Rows</h2>
        <Table variant="striped" hoverable style={{ marginBottom: '24px' }}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell align="center">Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow
                key={user.id}
                selected={user.id === selectedUserId}
                onClick={() => setSelectedUserId(user.id === selectedUserId ? null : user.id)}
              >
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: user.status === 'active' ? '#ecfdf5' : '#fef2f2',
                      color: user.status === 'active' ? '#065f46' : '#b91c1c',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <Button variant="primary" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Sortable Table */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Sortable Table</h2>
        <Table variant="bordered" stickyHeader>
          <TableHeader>
            <TableRow>
              <TableHeaderCell
                sortable
                sortDirection={sortField === 'name' ? sortDirection : null}
                onSort={() => handleSort('name')}
              >
                Name
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sortField === 'email' ? sortDirection : null}
                onSort={() => handleSort('email')}
              >
                Email
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sortField === 'role' ? sortDirection : null}
                onSort={() => handleSort('role')}
              >
                Role
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sortField === 'status' ? sortDirection : null}
                onSort={() => handleSort('status')}
              >
                Status
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: user.status === 'active' ? '#ecfdf5' : '#fef2f2',
                      color: user.status === 'active' ? '#065f46' : '#b91c1c',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {user.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          Click on column headers to sort the table (try multiple columns)
        </p>
      </div>
    </div>
  );
};

// Add default export for lazy loading
export default TableDemo;
