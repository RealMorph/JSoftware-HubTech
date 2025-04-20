import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { useDirectTheme } from '../core/theme/DirectThemeProvider';
import { AuthService } from '../core/auth/auth-service';
import { useAuth } from '../core/auth/AuthProvider';
import { LoginCredentials } from '../core/auth/auth-service';
import { 
  Container, 
  Logo, 
  LoginCard, 
  Title, 
  Subtitle, 
  Form, 
  InputLabel, 
  Input, 
  Button, 
  ErrorMessage, 
  HelpSection,
  StyledLink,
  HelpText
} from './styles/LoginStyles';

interface ThemeStyles {
  colors: {
    primary: string;
    error: string;
    background: string;
    text: {
      primary: string;
      secondary: string;
    };
    border: string;
    buttonBg: string;
    buttonHover: string;
    googleButton: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: {
    sm: string;
    md: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      sm: string;
      md: string;
      lg: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
    };
  };
  shadows: {
    input: string;
    button: string;
  };
}

const Divider = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: ${props => props.$themeStyles.colors.text.secondary};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${props => props.$themeStyles.colors.border};
  }

  &::before {
    margin-right: 16px;
  }

  &::after {
    margin-left: 16px;
  }
`;

const LoginPage: React.FC = () => {
  const theme = useDirectTheme();
  const themeStyles = {
    colors: {
      primary: theme.getColor('primary'),
      error: theme.getColor('error'),
      background: theme.getColor('background'),
      text: {
        primary: theme.getColor('text.primary'),
        secondary: theme.getColor('text.secondary'),
      },
      border: theme.getColor('border'),
      buttonBg: theme.getColor('private.buttonBg'),
      buttonHover: theme.getColor('private.buttonHover'),
      googleButton: theme.getColor('private.googleButton'),
    },
    spacing: {
      xs: theme.getSpacing('xs'),
      sm: theme.getSpacing('sm'),
      md: theme.getSpacing('md'),
      lg: theme.getSpacing('lg'),
    },
    borderRadius: {
      sm: theme.getBorderRadius('sm'),
      md: theme.getBorderRadius('md'),
    },
    typography: {
      fontFamily: String(theme.getTypography('fontFamily.base')),
      fontSize: {
        sm: String(theme.getTypography('fontSize.sm')),
        md: String(theme.getTypography('fontSize.md')),
        lg: String(theme.getTypography('fontSize.lg')),
      },
      fontWeight: {
        normal: Number(theme.getTypography('fontWeight.normal')),
        medium: Number(theme.getTypography('fontWeight.medium')),
        semibold: Number(theme.getTypography('fontWeight.semibold')),
      },
    },
    shadows: {
      input: String(theme.getShadow('input')),
      button: String(theme.getShadow('button')),
    },
  };
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const credentials: LoginCredentials = {
        email,
        password,
        rememberMe
      };
      
      await login(credentials);

      // Get the redirect path from location state or default to '/'
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    }
  };

  return (
    <Container $themeStyles={themeStyles}>
      <Logo>
        <img src="/PLACEHOLDERLOGO" alt="Logo" />
      </Logo>
      <LoginCard $themeStyles={themeStyles}>
        <Title $themeStyles={themeStyles}>Welcome Back</Title>
        <Subtitle $themeStyles={themeStyles}>
          Sign in to continue to the application
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage $themeStyles={themeStyles}>
              {error}
            </ErrorMessage>
          )}
          
          <div>
            <InputLabel $themeStyles={themeStyles}>Email</InputLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              $themeStyles={themeStyles}
            />
          </div>

          <div>
            <InputLabel $themeStyles={themeStyles}>Password</InputLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              $themeStyles={themeStyles}
            />
          </div>
          
          <div>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            $themeStyles={themeStyles}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>
      </LoginCard>
      <HelpSection $themeStyles={themeStyles}>
        <StyledLink href="/register" $themeStyles={themeStyles}>
          Create an account
        </StyledLink>
        <StyledLink href="/forgot-password" $themeStyles={themeStyles}>
          Forgot your password?
        </StyledLink>
        <HelpText $themeStyles={themeStyles}>
          Need help? <StyledLink as="a" href="/help" $themeStyles={themeStyles}>Visit our help center</StyledLink>
        </HelpText>
      </HelpSection>
    </Container>
  );
};

export default LoginPage; 