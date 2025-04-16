import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import { TextField } from './TextField';
export const TextFieldDemo = () => {
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
  const handleChange = field => value => {
    setValues(prev => ({ ...prev, [field]: value }));
  };
  const SearchIcon = _jsx('span', { style: { fontSize: '16px' }, children: '\uD83D\uDD0D' });
  const PasswordIcon = _jsx('span', {
    style: { fontSize: '16px', cursor: 'pointer' },
    children: '\uD83D\uDC41\uFE0F',
  });
  const EmailIcon = _jsx('span', { style: { fontSize: '16px' }, children: '\u2709\uFE0F' });
  const demoSectionStyle = {
    marginBottom: '32px',
  };
  const demoTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
  };
  const demoRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px',
  };
  return _jsxs('div', {
    style: { maxWidth: '800px', margin: '0 auto', padding: '24px' },
    children: [
      _jsx('h1', { style: { marginBottom: '24px' }, children: 'TextField Component Demo' }),
      _jsxs('div', {
        style: demoSectionStyle,
        children: [
          _jsx('h2', { style: demoTitleStyle, children: 'Variants' }),
          _jsxs('div', {
            style: demoRowStyle,
            children: [
              _jsx(TextField, {
                label: 'Standard',
                variant: 'standard',
                value: values.standard,
                onChange: handleChange('standard'),
              }),
              _jsx(TextField, {
                label: 'Outlined',
                variant: 'outlined',
                value: values.outlined,
                onChange: handleChange('outlined'),
              }),
              _jsx(TextField, {
                label: 'Filled',
                variant: 'filled',
                value: values.filled,
                onChange: handleChange('filled'),
              }),
            ],
          }),
        ],
      }),
      _jsxs('div', {
        style: demoSectionStyle,
        children: [
          _jsx('h2', { style: demoTitleStyle, children: 'Labels and Text' }),
          _jsxs('div', {
            style: demoRowStyle,
            children: [
              _jsx(TextField, {
                label: 'With Label',
                value: values.withLabel,
                onChange: handleChange('withLabel'),
              }),
              _jsx(TextField, {
                placeholder: 'With Placeholder',
                value: values.withPlaceholder,
                onChange: handleChange('withPlaceholder'),
              }),
              _jsx(TextField, {
                label: 'With Helper Text',
                helperText: 'This is a helper text',
                value: values.withHelper,
                onChange: handleChange('withHelper'),
              }),
            ],
          }),
        ],
      }),
      _jsxs('div', {
        style: demoSectionStyle,
        children: [
          _jsx('h2', { style: demoTitleStyle, children: 'States' }),
          _jsxs('div', {
            style: demoRowStyle,
            children: [
              _jsx(TextField, {
                label: 'Error State',
                error: true,
                helperText: 'This field has an error',
                value: values.withError,
                onChange: handleChange('withError'),
              }),
              _jsx(TextField, {
                label: 'Required Field',
                required: true,
                value: values.required,
                onChange: handleChange('required'),
              }),
              _jsx(TextField, {
                label: 'Disabled Field',
                disabled: true,
                value: 'Cannot edit this',
                onChange: handleChange('disabled'),
              }),
            ],
          }),
        ],
      }),
      _jsxs('div', {
        style: demoSectionStyle,
        children: [
          _jsx('h2', { style: demoTitleStyle, children: 'Sizes' }),
          _jsxs('div', {
            style: demoRowStyle,
            children: [
              _jsx(TextField, {
                label: 'Small',
                size: 'small',
                value: values.small,
                onChange: handleChange('small'),
              }),
              _jsx(TextField, {
                label: 'Medium',
                size: 'medium',
                value: values.medium,
                onChange: handleChange('medium'),
              }),
              _jsx(TextField, {
                label: 'Large',
                size: 'large',
                value: values.large,
                onChange: handleChange('large'),
              }),
            ],
          }),
        ],
      }),
      _jsxs('div', {
        style: demoSectionStyle,
        children: [
          _jsx('h2', { style: demoTitleStyle, children: 'Full Width' }),
          _jsx('div', {
            style: demoRowStyle,
            children: _jsx(TextField, {
              label: 'Full Width Field',
              fullWidth: true,
              value: values.fullWidth,
              onChange: handleChange('fullWidth'),
            }),
          }),
        ],
      }),
      _jsxs('div', {
        style: demoSectionStyle,
        children: [
          _jsx('h2', { style: demoTitleStyle, children: 'With Adornments' }),
          _jsxs('div', {
            style: demoRowStyle,
            children: [
              _jsx(TextField, {
                label: 'Search',
                startAdornment: SearchIcon,
                placeholder: 'Search...',
              }),
              _jsx(TextField, {
                label: 'Email',
                type: 'email',
                endAdornment: EmailIcon,
                value: values.email,
                onChange: handleChange('email'),
              }),
              _jsx(TextField, {
                label: 'Password',
                type: 'password',
                endAdornment: PasswordIcon,
                value: values.password,
                onChange: handleChange('password'),
              }),
            ],
          }),
        ],
      }),
    ],
  });
};
