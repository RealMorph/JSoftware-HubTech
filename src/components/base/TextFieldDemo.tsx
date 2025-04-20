import React, { useState } from 'react';
import TextField from './TextField';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

export const TextFieldDemo: React.FC = () => {
  const [values, setValues] = useState({
    standard: '',
    outlined: '',
    filled: '',
    withLabel: '',
    withPlaceholder: '',
    withHelper: '',
    withError: '',
    required: '',
    disabled: '',
    small: '',
    medium: '',
    large: '',
    fullWidth: '',
    email: '',
    password: '',
  });

  const handleChange = (field: keyof typeof values) => (value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  // Example of an icon (simple span for demo)
  const SearchIcon = <span style={{ fontSize: '16px' }}>🔍</span>;
  const PasswordIcon = <span style={{ fontSize: '16px', cursor: 'pointer' }}>👁️</span>;
  const EmailIcon = <span style={{ fontSize: '16px' }}>✉️</span>;

  const demoSectionStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const demoTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
  };

  const demoRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>TextField Component Demo</h1>

      {/* Variants */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Variants</h2>
        <div style={demoRowStyle}>
          <TextField
            label="Standard"
            variant="standard"
            value={values.standard}
            onChange={handleChange('standard')}
          />
          <TextField
            label="Outlined"
            variant="outlined"
            value={values.outlined}
            onChange={handleChange('outlined')}
          />
          <TextField
            label="Filled"
            variant="filled"
            value={values.filled}
            onChange={handleChange('filled')}
          />
        </div>
      </div>

      {/* Labels and Text */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Labels and Text</h2>
        <div style={demoRowStyle}>
          <TextField
            label="With Label"
            value={values.withLabel}
            onChange={handleChange('withLabel')}
          />
          <TextField
            placeholder="With Placeholder"
            value={values.withPlaceholder}
            onChange={handleChange('withPlaceholder')}
          />
          <TextField
            label="With Helper Text"
            helperText="This is a helper text"
            value={values.withHelper}
            onChange={handleChange('withHelper')}
          />
        </div>
      </div>

      {/* States */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>States</h2>
        <div style={demoRowStyle}>
          <TextField
            label="Error State"
            error
            helperText="This field has an error"
            value={values.withError}
            onChange={handleChange('withError')}
          />
          <TextField
            label="Required Field"
            required
            value={values.required}
            onChange={handleChange('required')}
          />
          <TextField
            label="Disabled Field"
            disabled
            value="Cannot edit this"
            onChange={handleChange('disabled')}
          />
        </div>
      </div>

      {/* Sizes */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Sizes</h2>
        <div style={demoRowStyle}>
          <TextField
            label="Small"
            size="small"
            value={values.small}
            onChange={handleChange('small')}
          />
          <TextField
            label="Medium"
            size="medium"
            value={values.medium}
            onChange={handleChange('medium')}
          />
          <TextField
            label="Large"
            size="large"
            value={values.large}
            onChange={handleChange('large')}
          />
        </div>
      </div>

      {/* Full Width */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Full Width</h2>
        <div style={demoRowStyle}>
          <TextField
            label="Full Width Field"
            fullWidth
            value={values.fullWidth}
            onChange={handleChange('fullWidth')}
          />
        </div>
      </div>

      {/* With Adornments */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>With Adornments</h2>
        <div style={demoRowStyle}>
          <TextField label="Search" startAdornment={SearchIcon} placeholder="Search..." />
          <TextField
            label="Email"
            type="email"
            endAdornment={EmailIcon}
            value={values.email}
            onChange={handleChange('email')}
          />
          <TextField
            label="Password"
            type="password"
            endAdornment={PasswordIcon}
            value={values.password}
            onChange={handleChange('password')}
          />
        </div>
      </div>
    </div>
  );
};

// Add default export for lazy loading
export default TextFieldDemo;
