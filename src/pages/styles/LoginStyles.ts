import styled from 'styled-components';

// Define ThemeStyles interface locally to avoid dependency on missing module
export interface ThemeStyles {
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

export const Container = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${props => props.$themeStyles.colors.background};
  font-family: ${props => props.$themeStyles.typography.fontFamily};
`;

export const Logo = styled.div`
  margin-bottom: 32px;
  img {
    height: 36px;
  }
`;

export const LoginCard = styled.div<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.colors.background};
  padding: ${props => props.$themeStyles.spacing.lg};
  width: 100%;
  max-width: 400px;
`;

export const Title = styled.h1<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.primary};
  font-size: 32px;
  font-weight: ${props => props.$themeStyles.typography.fontWeight.semibold};
  margin-bottom: 8px;
  text-align: center;
`;

export const Subtitle = styled.div<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.secondary};
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
  text-align: center;
  margin-bottom: ${props => props.$themeStyles.spacing.lg};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const InputLabel = styled.div<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.primary};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  margin-bottom: 4px;
`;

export const Input = styled.input<{ $themeStyles: ThemeStyles }>`
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

export const Button = styled.button<{ $themeStyles: ThemeStyles; $variant?: 'primary' | 'google' }>`
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

export const Divider = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 16px 0;
  color: ${props => props.$themeStyles.colors.text.secondary};
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${props => props.$themeStyles.colors.border};
  }
  
  &::before {
    margin-right: 10px;
  }
  
  &::after {
    margin-left: 10px;
  }
`;

export const ErrorMessage = styled.div<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.error};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  text-align: center;
  margin-top: ${props => props.$themeStyles.spacing.sm};
  padding: 8px;
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  background-color: ${props => `${props.$themeStyles.colors.error}10`};
`;

export const HelpSection = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.md};
  text-align: center;
`;

export const StyledLink = styled.a<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.primary};
  text-decoration: none;
  display: block;
  margin-bottom: ${props => props.$themeStyles.spacing.sm};
  
  &:hover {
    text-decoration: underline;
  }
`;

export const HelpText = styled.div<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.secondary};
`; 