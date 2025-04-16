import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { List, ListItem } from './List';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from './Table';
import { Button } from './Button';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export const DataDisplayDemo: React.FC = () => {
  // Sample data for the demos
  const users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'Editor' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'User' },
  ];

  const products: Product[] = [
    { id: 101, name: 'Laptop', price: 1299.99, category: 'Electronics', stock: 45 },
    { id: 102, name: 'Smartphone', price: 899.99, category: 'Electronics', stock: 120 },
    { id: 103, name: 'Headphones', price: 199.99, category: 'Accessories', stock: 78 },
    { id: 104, name: 'Monitor', price: 349.99, category: 'Electronics', stock: 32 },
  ];

  const notifications = [
    'Your subscription will expire in 7 days',
    'New feature: Dark mode is now available',
    '3 users joined your team',
    'System maintenance scheduled for Sunday',
  ];

  const quickActions = [
    { name: 'Create User', icon: '👤' },
    { name: 'Add Product', icon: '📦' },
    { name: 'Generate Report', icon: '📊' },
    { name: 'Settings', icon: '⚙️' },
  ];

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '32px' }}>Data Display Components</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {/* Card Demo */}
        <Card variant="elevation">
          <CardHeader>
            <h2>Card Component</h2>
          </CardHeader>
          <CardContent>
            <p>Cards are versatile containers for displaying content and actions on a single topic.</p>
            <div style={{ marginTop: '16px' }}>
              <h3>Card Variants</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <Card variant="outlined" style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <CardContent>
                    <p>Outlined Card</p>
                  </CardContent>
                </Card>
                <Card variant="flat" style={{ width: '100%', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <CardContent>
                    <p>Flat Card</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Save</Button>
            </div>
          </CardFooter>
        </Card>

        {/* List Demo */}
        <Card variant="elevation">
          <CardHeader>
            <h2>List Component</h2>
          </CardHeader>
          <CardContent>
            <p>Lists are continuous vertical indexes of text or images.</p>
            
            <div style={{ marginTop: '16px' }}>
              <h3>Notifications</h3>
              <List>
                {notifications.map((notification, index) => (
                  <ListItem key={index} onClick={() => console.log(`Notification ${index} clicked`)}>
                    {notification}
                  </ListItem>
                ))}
              </List>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3>Quick Actions</h3>
              <List interactive={true}>
                {quickActions.map((action, index) => (
                  <ListItem 
                    key={index}
                    onClick={() => console.log(`Action ${action.name} clicked`)}
                    startContent={<span>{action.icon}</span>}
                    endContent={<Button size="sm" variant="secondary">Select</Button>}
                  >
                    {action.name}
                  </ListItem>
                ))}
              </List>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Demos */}
      <div style={{ marginBottom: '48px' }}>
        <Card variant="elevation">
          <CardHeader>
            <h2>Table Component</h2>
          </CardHeader>
          <CardContent>
            <p style={{ marginBottom: '24px' }}>Tables display information in a way that's easy to scan.</p>
            
            <h3 style={{ marginBottom: '16px' }}>Users Table</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    selected={selectedUser?.id === user.id}
                  >
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Edit user ${user.id}`);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <h3 style={{ margin: '32px 0 16px' }}>Products Table</h3>
            <Table variant="striped">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Price</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Stock</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow 
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    selected={selectedProduct?.id === product.id}
                  >
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`View product ${product.id}`);
                          }}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Edit product ${product.id}`);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Selected Items Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {selectedUser && (
          <Card variant="outlined">
            <CardHeader>
              <h3>Selected User</h3>
            </CardHeader>
            <CardContent>
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="secondary" 
                onClick={() => setSelectedUser(null)}
              >
                Clear Selection
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {selectedProduct && (
          <Card variant="outlined">
            <CardHeader>
              <h3>Selected Product</h3>
            </CardHeader>
            <CardContent>
              <p><strong>ID:</strong> {selectedProduct.id}</p>
              <p><strong>Name:</strong> {selectedProduct.name}</p>
              <p><strong>Price:</strong> ${selectedProduct.price.toFixed(2)}</p>
              <p><strong>Category:</strong> {selectedProduct.category}</p>
              <p><strong>Stock:</strong> {selectedProduct.stock}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="secondary" 
                onClick={() => setSelectedProduct(null)}
              >
                Clear Selection
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DataDisplayDemo; 