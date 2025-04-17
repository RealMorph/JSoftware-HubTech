import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { List, ListItem } from './List';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from './Table';
import { Button } from './Button';

/**
 * Theme styles interface for the DataDisplayDemo component
 * Defines styling properties sourced from the theme
 */
interface ThemeStyles {
  colors: {
    background: string;
    text: string;
    subtext: string;
    border: string;
    tableStripedBg: string;
    cardOutlinedBorder: string;
    cardFlatBackground: string;
  };
  spacing: {
    page: string;
    section: string;
    component: string;
    item: string;
    sm: string;
    md: string;
    lg: string;
  };
  typography: {
    title: {
      fontSize: string;
      fontWeight: string;
      marginBottom: string;
    };
    sectionTitle: {
      fontSize: string;
      fontWeight: string;
      marginBottom: string;
    };
    componentTitle: {
      fontSize: string;
      fontWeight: string;
      marginBottom: string;
    };
  };
  borderRadius: string;
  shadows: {
    card: string;
  };
}

// Theme-based styled components
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacing.page};
`;

const DemoTitle = styled.h1<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  font-size: ${props => props.$themeStyles.typography.title.fontSize};
  font-weight: ${props => props.$themeStyles.typography.title.fontWeight};
  color: ${props => props.$themeStyles.colors.text};
`;

const CardGrid = styled.div<{ $themeStyles: ThemeStyles }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${props => props.$themeStyles.spacing.component};
  margin-bottom: ${props => props.$themeStyles.spacing.section};
`;

const ActionButtonsContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.$themeStyles.spacing.item};
`;

const TableSection = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
`;

const TableDescription = styled.p<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.component};
  color: ${props => props.$themeStyles.colors.text};
`;

const TableTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  font-size: ${props => props.$themeStyles.typography.sectionTitle.fontSize};
  font-weight: ${props => props.$themeStyles.typography.sectionTitle.fontWeight};
  color: ${props => props.$themeStyles.colors.text};
`;

const TableSubtitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin: ${props => `${props.$themeStyles.spacing.section} 0 ${props.$themeStyles.spacing.item}`};
  font-size: ${props => props.$themeStyles.typography.sectionTitle.fontSize};
  font-weight: ${props => props.$themeStyles.typography.sectionTitle.fontWeight};
  color: ${props => props.$themeStyles.colors.text};
`;

const ActionButtons = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  gap: ${props => props.$themeStyles.spacing.item};
`;

const CardVariantsContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacing.item};
  margin-top: ${props => props.$themeStyles.spacing.item};
`;

const ComponentTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.item};
  font-size: ${props => props.$themeStyles.typography.componentTitle.fontSize};
  font-weight: ${props => props.$themeStyles.typography.componentTitle.fontWeight};
  color: ${props => props.$themeStyles.colors.text};
`;

const PropertyItem = styled.p<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text};
`;

const ComponentSection = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.md};
`;

const OutlinedCard = styled(Card)<{ $themeStyles: ThemeStyles }>`
  width: 100%;
  border: 1px solid ${props => props.$themeStyles.colors.cardOutlinedBorder};
  border-radius: ${props => props.$themeStyles.borderRadius};
`;

const FlatCard = styled(Card)<{ $themeStyles: ThemeStyles }>`
  width: 100%;
  background-color: ${props => props.$themeStyles.colors.cardFlatBackground};
  border-radius: ${props => props.$themeStyles.borderRadius};
`;

const StyledCard = styled(Card)<{ $themeStyles: ThemeStyles }>`
  margin-bottom: 0;
`;

/**
 * User interface representing a user entity
 */
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

/**
 * Product interface representing a product entity
 */
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

/**
 * Creates theme styles using the DirectTheme context
 * @param themeContext - The DirectTheme context
 * @returns ThemeStyles object with theme values
 */
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getSpacing, getBorderRadius, getShadow } = themeContext;

  return {
    colors: {
      background: getColor('background', '#ffffff'),
      text: getColor('text.primary', '#333333'),
      subtext: getColor('text.secondary', '#666666'),
      border: getColor('border', '#e0e0e0'),
      tableStripedBg: getColor('gray.50', '#f9fafb'),
      cardOutlinedBorder: getColor('border', '#e0e0e0'),
      cardFlatBackground: getColor('gray.50', '#f5f5f5'),
    },
    spacing: {
      page: getSpacing('6', '24px'),
      section: getSpacing('12', '48px'),
      component: getSpacing('6', '24px'),
      item: getSpacing('4', '16px'),
      sm: getSpacing('2', '8px'),
      md: getSpacing('4', '16px'),
      lg: getSpacing('6', '24px'),
    },
    typography: {
      title: {
        fontSize: getTypography('fontSize.xl', '24px') as string,
        fontWeight: getTypography('fontWeight.bold', '700') as string,
        marginBottom: getSpacing('8', '32px'),
      },
      sectionTitle: {
        fontSize: getTypography('fontSize.lg', '18px') as string,
        fontWeight: getTypography('fontWeight.semibold', '600') as string,
        marginBottom: getSpacing('4', '16px'),
      },
      componentTitle: {
        fontSize: getTypography('fontSize.md', '16px') as string,
        fontWeight: getTypography('fontWeight.medium', '500') as string,
        marginBottom: getSpacing('2', '8px'),
      },
    },
    borderRadius: getBorderRadius('md', '8px'),
    shadows: {
      card: getShadow(
        'md',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      ),
    },
  };
}

/**
 * Demo component showcasing various data display components
 * Includes Card, List, and Table components with different configurations
 */
export const DataDisplayDemo: React.FC = () => {
  // Initialize theme context and styles
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

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

  // Handlers for actions without console.log
  // eslint-disable-next-line no-unused-vars
  const handleNotificationClick = (_index: number) => {
    // Handle notification click
  };

  // eslint-disable-next-line no-unused-vars
  const handleActionClick = (_actionName: string) => {
    // Handle action click
  };

  // eslint-disable-next-line no-unused-vars
  const handleEditUser = (_userId: number) => {
    // Handle edit user
  };

  // eslint-disable-next-line no-unused-vars
  const handleViewProduct = (_productId: number) => {
    // Handle view product
  };

  // eslint-disable-next-line no-unused-vars
  const handleEditProduct = (_productId: number) => {
    // Handle edit product
  };

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <DemoTitle $themeStyles={themeStyles}>Data Display Components</DemoTitle>

      <CardGrid $themeStyles={themeStyles}>
        {/* Card Demo */}
        <StyledCard variant="elevation" $themeStyles={themeStyles}>
          <CardHeader>
            <h2>Card Component</h2>
          </CardHeader>
          <CardContent>
            <p>
              Cards are versatile containers for displaying content and actions on a single topic.
            </p>
            <ComponentSection $themeStyles={themeStyles}>
              <ComponentTitle $themeStyles={themeStyles}>Card Variants</ComponentTitle>
              <CardVariantsContainer $themeStyles={themeStyles}>
                <OutlinedCard variant="outlined" $themeStyles={themeStyles}>
                  <CardContent>
                    <p>Outlined Card</p>
                  </CardContent>
                </OutlinedCard>
                <FlatCard variant="flat" $themeStyles={themeStyles}>
                  <CardContent>
                    <p>Flat Card</p>
                  </CardContent>
                </FlatCard>
              </CardVariantsContainer>
            </ComponentSection>
          </CardContent>
          <CardFooter>
            <ActionButtonsContainer $themeStyles={themeStyles}>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Save</Button>
            </ActionButtonsContainer>
          </CardFooter>
        </StyledCard>

        {/* List Demo */}
        <StyledCard variant="elevation" $themeStyles={themeStyles}>
          <CardHeader>
            <h2>List Component</h2>
          </CardHeader>
          <CardContent>
            <p>Lists are continuous vertical indexes of text or images.</p>

            <ComponentSection $themeStyles={themeStyles}>
              <ComponentTitle $themeStyles={themeStyles}>Notifications</ComponentTitle>
              <List>
                {notifications.map((notification, index) => (
                  <ListItem key={index} onClick={() => handleNotificationClick(index)}>
                    {notification}
                  </ListItem>
                ))}
              </List>
            </ComponentSection>

            <ComponentSection $themeStyles={themeStyles}>
              <ComponentTitle $themeStyles={themeStyles}>Quick Actions</ComponentTitle>
              <List interactive={true}>
                {quickActions.map((action, index) => (
                  <ListItem
                    key={index}
                    onClick={() => handleActionClick(action.name)}
                    startContent={<span>{action.icon}</span>}
                    endContent={
                      <Button size="sm" variant="secondary">
                        Select
                      </Button>
                    }
                  >
                    {action.name}
                  </ListItem>
                ))}
              </List>
            </ComponentSection>
          </CardContent>
        </StyledCard>
      </CardGrid>

      {/* Table Demos */}
      <TableSection $themeStyles={themeStyles}>
        <Card variant="elevation">
          <CardHeader>
            <h2>Table Component</h2>
          </CardHeader>
          <CardContent>
            <TableDescription $themeStyles={themeStyles}>
              Tables display information in a way that's easy to scan.
            </TableDescription>

            <TableTitle $themeStyles={themeStyles}>Users Table</TableTitle>
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
                {users.map(user => (
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
                        onClick={e => {
                          e.stopPropagation();
                          handleEditUser(user.id);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TableSubtitle $themeStyles={themeStyles}>Products Table</TableSubtitle>
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
                {products.map(product => (
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
                      <ActionButtons $themeStyles={themeStyles}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={e => {
                            e.stopPropagation();
                            handleViewProduct(product.id);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={e => {
                            e.stopPropagation();
                            handleEditProduct(product.id);
                          }}
                        >
                          Edit
                        </Button>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TableSection>

      {/* Selected Items Display */}
      <CardGrid $themeStyles={themeStyles}>
        {selectedUser && (
          <Card variant="outlined">
            <CardHeader>
              <h3>Selected User</h3>
            </CardHeader>
            <CardContent>
              <PropertyItem $themeStyles={themeStyles}>
                <strong>ID:</strong> {selectedUser.id}
              </PropertyItem>
              <PropertyItem $themeStyles={themeStyles}>
                <strong>Name:</strong> {selectedUser.name}
              </PropertyItem>
              <PropertyItem $themeStyles={themeStyles}>
                <strong>Email:</strong> {selectedUser.email}
              </PropertyItem>
              <PropertyItem $themeStyles={themeStyles}>
                <strong>Role:</strong> {selectedUser.role}
              </PropertyItem>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" onClick={() => setSelectedUser(null)}>
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
              <PropertyItem $themeStyles={themeStyles}>
                <strong>ID:</strong> {selectedProduct.id}
              </PropertyItem>
              <PropertyItem $themeStyles={themeStyles}>
                <strong>Name:</strong> {selectedProduct.name}
              </PropertyItem>
              <PropertyItem $themeStyles={themeStyles}>
                <strong>Price:</strong> ${selectedProduct.price.toFixed(2)}
              </PropertyItem>
              <PropertyItem $themeStyles={themeStyles}>
                <strong>Category:</strong> {selectedProduct.category}
              </PropertyItem>
              <PropertyItem $themeStyles={themeStyles}>
                <strong>Stock:</strong> {selectedProduct.stock}
              </PropertyItem>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" onClick={() => setSelectedProduct(null)}>
                Clear Selection
              </Button>
            </CardFooter>
          </Card>
        )}
      </CardGrid>
    </DemoContainer>
  );
};

export default DataDisplayDemo;
