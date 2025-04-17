import React, { useState } from 'react';
import { Select, SelectOption } from './Select';
import { Card, CardHeader, CardContent } from './Card';

export const SelectDemo: React.FC = () => {
  // State to track selected values for different examples
  const [basicValue, setBasicValue] = useState<string>('');
  const [sizeValue, setSizeValue] = useState<string>('');
  const [variantValue, setVariantValue] = useState<string>('');
  const [validationValue, setValidationValue] = useState<string>('');
  const [fullWidthValue, setFullWidthValue] = useState<string>('');

  // Example options
  const countryOptions: SelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'jp', label: 'Japan' },
    { value: 'au', label: 'Australia' },
  ];

  const sizeOptions: SelectOption[] = [
    { value: 'xs', label: 'Extra Small' },
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
  ];

  const roleOptions: SelectOption[] = [
    { value: 'admin', label: 'Administrator' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
    { value: 'guest', label: 'Guest', disabled: true },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'suspended', label: 'Suspended' },
  ];

  // Custom select with an icon
  const iconOptions: SelectOption[] = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'profile', label: 'Profile' },
    { value: 'settings', label: 'Settings' },
    { value: 'logout', label: 'Logout' },
  ];

  // Error handling example
  const [hasError, setHasError] = useState(false);
  const handleValidationChange = (value: string) => {
    setValidationValue(value);
    setHasError(value === '');
  };

  // Section title style
  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    marginBottom: '12px',
    fontWeight: 'bold',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Select Component Demo</h1>

      {/* Basic Select */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Basic Select</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Basic usage with placeholder</p>
            <Select
              options={countryOptions}
              placeholder="Select a country"
              value={basicValue}
              onChange={value => setBasicValue(value)}
              label="Country"
              helperText="Select your country of residence"
            />
          </div>

          <div style={sectionStyle}>
            <p style={titleStyle}>Disabled state</p>
            <Select
              options={countryOptions}
              placeholder="Select a country"
              disabled
              label="Country (Disabled)"
            />
          </div>

          <div style={sectionStyle}>
            <p style={titleStyle}>With disabled options</p>
            <Select
              options={roleOptions}
              placeholder="Select a role"
              label="User Role"
              helperText="Some roles may be restricted"
            />
          </div>
        </CardContent>
      </Card>

      {/* Select Sizes */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Select Sizes</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Small size</p>
            <Select
              options={sizeOptions}
              size="small"
              placeholder="Small"
              value={sizeValue}
              onChange={value => setSizeValue(value)}
              label="Size"
            />
          </div>

          <div style={sectionStyle}>
            <p style={titleStyle}>Medium size (default)</p>
            <Select
              options={sizeOptions}
              size="medium"
              placeholder="Medium"
              value={sizeValue}
              onChange={value => setSizeValue(value)}
              label="Size"
            />
          </div>

          <div style={sectionStyle}>
            <p style={titleStyle}>Large size</p>
            <Select
              options={sizeOptions}
              size="large"
              placeholder="Large"
              value={sizeValue}
              onChange={value => setSizeValue(value)}
              label="Size"
            />
          </div>
        </CardContent>
      </Card>

      {/* Select Variants */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Select Variants</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Outlined variant (default)</p>
            <Select
              options={statusOptions}
              variant="outlined"
              placeholder="Outlined"
              value={variantValue}
              onChange={value => setVariantValue(value)}
              label="Status"
            />
          </div>

          <div style={sectionStyle}>
            <p style={titleStyle}>Filled variant</p>
            <Select
              options={statusOptions}
              variant="filled"
              placeholder="Filled"
              value={variantValue}
              onChange={value => setVariantValue(value)}
              label="Status"
            />
          </div>

          <div style={sectionStyle}>
            <p style={titleStyle}>Standard variant</p>
            <Select
              options={statusOptions}
              variant="standard"
              placeholder="Standard"
              value={variantValue}
              onChange={value => setVariantValue(value)}
              label="Status"
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Validation & Required Fields</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Required field</p>
            <Select
              options={countryOptions}
              placeholder="Select a country"
              required
              label="Country"
              helperText="This field is required"
            />
          </div>

          <div style={sectionStyle}>
            <p style={titleStyle}>With error state</p>
            <Select
              options={countryOptions}
              placeholder="Select a country"
              value={validationValue}
              onChange={value => handleValidationChange(value)}
              error={hasError}
              label="Country"
              helperText={hasError ? 'Please select a country' : ''}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout & Additional Features */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Layout & Additional Features</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Full Width</p>
            <Select
              options={countryOptions}
              placeholder="Full width select"
              fullWidth
              value={fullWidthValue}
              onChange={value => setFullWidthValue(value)}
              label="Country"
            />
          </div>

          <div style={sectionStyle}>
            <p style={titleStyle}>With icon</p>
            <Select
              options={iconOptions}
              placeholder="Select option"
              startAdornment={<span style={{ marginRight: '8px' }}>🔍</span>}
              label="Navigation"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectDemo;
