import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { Toast } from './Toast';

// Define theme style interface
interface ThemeStyles {
  spacing4: string;
  spacing8: string;
  primaryColor: string;
  successColor: string;
  errorColor: string;
  textLight: string;
  borderRadius: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getSpacing, getBorderRadius } = themeContext;
  
  return {
    spacing4: getSpacing('4', '1rem'),
    spacing8: getSpacing('8', '2rem'),
    primaryColor: getColor('primary.500', '#3b82f6'),
    successColor: getColor('success.500', '#10b981'),
    errorColor: getColor('error.500', '#ef4444'),
    textLight: getColor('text.light', '#ffffff'),
    borderRadius: getBorderRadius('md', '0.375rem'),
  };
}

const Container = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacing4};
  padding: ${props => props.$themeStyles.spacing8};
`;

const Button = styled.button<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing4};
  background-color: ${props => props.$themeStyles.primaryColor};
  color: ${props => props.$themeStyles.textLight};
  border: none;
  border-radius: ${props => props.$themeStyles.borderRadius};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

export const ToastDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleShowSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleShowError = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  const handleShowInfo = () => {
    setShowInfo(true);
    setTimeout(() => setShowInfo(false), 3000);
  };

  return (
    <Container $themeStyles={themeStyles}>
      <Button $themeStyles={themeStyles} onClick={handleShowSuccess}>
        Show Success Toast
      </Button>
      <Button $themeStyles={themeStyles} onClick={handleShowError}>
        Show Error Toast
      </Button>
      <Button $themeStyles={themeStyles} onClick={handleShowInfo}>
        Show Info Toast
      </Button>

      {showSuccess && (
        <Toast
          type="success"
          message="Operation completed successfully!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showError && (
        <Toast
          type="error"
          message="An error occurred. Please try again."
          onClose={() => setShowError(false)}
        />
      )}

      {showInfo && (
        <Toast
          type="info"
          message="This is an informational message."
          onClose={() => setShowInfo(false)}
        />
      )}
    </Container>
  );
};

export default ToastDemo;
