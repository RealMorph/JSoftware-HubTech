import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { useDirectTheme } from '../core/theme/DirectThemeProvider';
import { AuthService } from '../core/auth/auth-service';

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

const createThemeStyles = (theme: ReturnType<typeof useDirectTheme>): ThemeStyles => ({
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
});

const Container = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${props => props.$themeStyles.colors.background};
  font-family: ${props => props.$themeStyles.typography.fontFamily};
`;

const Logo = styled.div`
  margin-bottom: 32px;
  img {
    height: 36px;
  }
`;

const LoginCard = styled.div<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.colors.background};
  padding: ${props => props.$themeStyles.spacing.lg};
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.primary};
  font-size: 32px;
  font-weight: ${props => props.$themeStyles.typography.fontWeight.semibold};
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.div<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.secondary};
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
  text-align: center;
  margin-bottom: ${props => props.$themeStyles.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputLabel = styled.div<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.primary};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  margin-bottom: 4px;
`;

const Input = styled.input<{ $themeStyles: ThemeStyles }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$themeStyles.colors.border};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
  width: 100%;
  height: 40px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$themeStyles.colors.primary};
    box-shadow: ${props => props.$themeStyles.shadows.input};
  }

  &::placeholder {
    color: ${props => props.$themeStyles.colors.text.secondary};
  }
`;

const Button = styled.button<{ $themeStyles: ThemeStyles; $variant?: 'primary' | 'google' }>`
  padding: 8px 16px;
  background-color: ${props => 
    props.$variant === 'google' 
      ? props.$themeStyles.colors.googleButton 
      : props.$themeStyles.colors.buttonBg};
  color: ${props => 
    props.$variant === 'google' 
      ? props.$themeStyles.colors.text.primary 
      : 'white'};
  border: 1px solid ${props => 
    props.$variant === 'google' 
      ? props.$themeStyles.colors.border 
      : 'transparent'};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  height: 40px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: ${props => props.$themeStyles.shadows.button};

  &:hover {
    background-color: ${props => 
      props.$variant === 'google' 
        ? props.$themeStyles.colors.background 
        : props.$themeStyles.colors.buttonHover};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

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

const ErrorMessage = styled.div<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.error};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  text-align: center;
  margin-top: ${props => props.$themeStyles.spacing.sm};
  padding: 8px;
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  background-color: ${props => `${props.$themeStyles.colors.error}10`};
`;

const HelpSection = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.md};
  text-align: center;
`;

const StyledLink = styled.a<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.primary};
  text-decoration: none;
  display: block;
  margin-bottom: ${props => props.$themeStyles.spacing.sm};
  
  &:hover {
    text-decoration: underline;
  }
`;

const HelpText = styled.div<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.secondary};
`;

const LoginPage: React.FC = () => {
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const authService = new AuthService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({
        username,
        password
      });

      // Get the redirect path from location state or default to '/'
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid username or password');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
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
            <InputLabel $themeStyles={themeStyles}>Username</InputLabel>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

          <Button 
            type="submit" 
            disabled={loading}
            $themeStyles={themeStyles}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>
      </LoginCard>
      <HelpSection $themeStyles={themeStyles}>
        <StyledLink href="/login" $themeStyles={themeStyles}>
          Login to another account
        </StyledLink>
        <HelpText $themeStyles={themeStyles}>
          Can't log in? <StyledLink as="a" href="/help" $themeStyles={themeStyles}>Visit our help center</StyledLink>
        </HelpText>
      </HelpSection>
    </Container>
  );
};

export default LoginPage; 