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
  const authService = new AuthService();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await authService.login({ username, password });
      const from = location.state?.from?.pathname || '/demos';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Container $themeStyles={themeStyles}>
      <Logo>
        <img src="/PLACEHOLDERLOGO" alt="Logo" />
      </Logo>
      <LoginCard $themeStyles={themeStyles}>
        <Title $themeStyles={themeStyles}>Log in</Title>
        <Subtitle $themeStyles={themeStyles}>
          Enter your work email address
        </Subtitle>
        <Form onSubmit={handleSubmit}>
          <div>
            <InputLabel $themeStyles={themeStyles}>Email</InputLabel>
            <Input
              $themeStyles={themeStyles}
              type="email"
              placeholder="Example@company.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <InputLabel $themeStyles={themeStyles}>Password</InputLabel>
            <Input
              $themeStyles={themeStyles}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Button $themeStyles={themeStyles} type="submit">
            Log in
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Button>
          {error && <ErrorMessage $themeStyles={themeStyles}>{error}</ErrorMessage>}
          <Divider $themeStyles={themeStyles}>Or Sign in with</Divider>
          <Button $themeStyles={themeStyles} $variant="google" type="button">
            <svg viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
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