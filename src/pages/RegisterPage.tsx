import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useDirectTheme } from '../core/theme/DirectThemeProvider';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: ${props => props.theme.colors.background || '#f5f5f5'};
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: ${props => props.theme.colors.surface || '#ffffff'};
  border-radius: ${props => props.theme.borderRadius.md || '0.375rem'};
  box-shadow: ${props => props.theme.shadows.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
`;

const Title = styled.h1`
  margin-bottom: 24px;
  color: ${props => 
    props.theme.colors.text?.primary || '#323338'
  };
  font-size: ${props => props.theme.typography.fontSize['2xl'] || '1.5rem'};
  font-weight: ${props => props.theme.typography.fontWeight.bold || 700};
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.theme.colors.border || '#c3c6d4'};
  border-radius: ${props => props.theme.borderRadius.md || '0.375rem'};
  background: ${props => props.theme.colors.background || '#f6f7fb'};
  color: ${props => 
    props.theme.colors.text?.primary || '#323338'
  };
  font-size: ${props => props.theme.typography.fontSize.md || '1rem'};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary || '#0073ea'};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: ${props => props.theme.colors.primary || '#0073ea'};
  color: #ffffff;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md || '0.375rem'};
  font-size: ${props => props.theme.typography.fontSize.md || '1rem'};
  font-weight: ${props => props.theme.typography.fontWeight.semibold || 600};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.secondary || '#5034ff'};
  }

  &:disabled {
    background: ${props => 
      props.theme.colors.text?.disabled || '#999999'
    };
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error || '#e44258'};
  margin-bottom: 16px;
  font-size: ${props => props.theme.typography.fontSize.sm || '0.875rem'};
`;

const LinkText = styled(Link)`
  display: block;
  margin-top: 16px;
  color: ${props => props.theme.colors.primary || '#0073ea'};
  text-align: center;
  text-decoration: none;
  font-size: ${props => props.theme.typography.fontSize.sm || '0.875rem'};

  &:hover {
    text-decoration: underline;
  }
`;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Mock registration for development when backend is not available
      const mockRegistration = async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for duplicate email (just as an example)
        if (formData.email === 'test@test.com') {
          throw new Error('Email already in use');
        }
        
        return { success: true };
      };
      
      let data;
      
      try {
        // Try to connect to the real backend first
        const response = await fetch('http://localhost:3001/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          }),
        });
        
        data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
      } catch (err) {
        console.log('Backend connection failed, using mock registration');
        // If connecting to the backend fails, use mock registration
        data = await mockRegistration();
      }

      // Registration successful
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in.' 
        } 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>Create Account</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <Input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </Button>
        
        <LinkText to="/login">
          Already have an account? Log in
        </LinkText>
      </Form>
    </Container>
  );
};

export default RegisterPage; 