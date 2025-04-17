import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './core/theme/theme-context';
import { inMemoryThemeService } from './core/theme/theme-persistence';
import { Card, CardContent, CardHeader } from './components/base/Card';
import { Form, FormValues, ValidationErrors, TouchedFields, useForm } from './components/base/Form';
import { TextField } from './components/base/TextField';
import { Button } from './components/base/Button';
import { List, ListItem } from './components/base/List';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from './components/base/Table';

// Use Record<string, any> to match Form's onSubmit parameter type
type FormData = Record<string, any>;

// Define the form render props type for clarity
interface FormRenderProps {
  values: FormValues;
  errors: ValidationErrors;
  touched: TouchedFields;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const TestComponents = () => {
  const [showForm, setShowForm] = useState(true);
  const [showDataDisplay, setShowDataDisplay] = useState(false);

  const [formValues, setFormValues] = useState<FormData>({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted with values:', values);
    alert(JSON.stringify(values, null, 2));
  };

  const validationRules = {
    username: [{ validator: (value: string) => !!value, message: 'Username is required' }],
    email: [
      { validator: (value: string) => !!value, message: 'Email is required' },
      { validator: (value: string) => /\S+@\S+\.\S+/.test(value), message: 'Email is invalid' },
    ],
    password: [
      {
        validator: (value: string) => value.length >= 6,
        message: 'Password must be at least 6 characters',
      },
    ],
  };

  return (
    <ThemeProvider themeService={inMemoryThemeService}>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <Button
            onClick={() => {
              setShowForm(true);
              setShowDataDisplay(false);
            }}
            variant={showForm ? 'primary' : 'secondary'}
            style={{ marginRight: '10px' }}
          >
            Form Components
          </Button>
          <Button
            onClick={() => {
              setShowForm(false);
              setShowDataDisplay(true);
            }}
            variant={showDataDisplay ? 'primary' : 'secondary'}
          >
            Data Display Components
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>Form Demo</CardHeader>
            <CardContent>
              <Form defaultValues={formValues} onSubmit={handleSubmit}>
                <FormContent />
              </Form>
            </CardContent>
          </Card>
        )}

        {showDataDisplay && (
          <div>
            <Card style={{ marginBottom: '20px' }}>
              <CardHeader>Card Component</CardHeader>
              <CardContent>This is a simple card component with header and content</CardContent>
            </Card>

            <Card style={{ marginBottom: '20px' }}>
              <CardHeader>List Component</CardHeader>
              <CardContent>
                <List>
                  <ListItem>Item 1</ListItem>
                  <ListItem>Item 2</ListItem>
                  <ListItem>Item 3</ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>Table Component</CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Role</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>John Doe</TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>Admin</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Jane Doe</TableCell>
                      <TableCell>jane@example.com</TableCell>
                      <TableCell>User</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

// Create a separate component for the form content to avoid the render props pattern issue
const FormContent = () => {
  // Use the form context hook to access form state and methods
  const {
    values,
    errors,
    touched,
    handleChange: setFieldValue,
    handleBlur: setFieldTouched,
  } = useForm();

  // Create adapter functions to work with TextField and Button components
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(e.target.name, e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFieldTouched(e.target.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The form will handle submission via onSubmit prop
  };

  return (
    <div>
      <div style={{ marginBottom: '15px' }}>
        <TextField
          label="Username"
          name="username"
          value={values.username || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!(touched.username && errors.username)}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <TextField
          label="Email"
          name="email"
          value={values.email || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!(touched.email && errors.email)}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <TextField
          label="Password"
          name="password"
          type="password"
          value={values.password || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!(touched.password && errors.password)}
        />
      </div>
      <Button type="submit" onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestComponents />
  </React.StrictMode>
);
