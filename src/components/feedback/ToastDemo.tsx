import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Toast } from './Toast';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

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
  const { getColor, getBorderRadius, getSpacing } = themeContext;

  return {
    spacing4: getSpacing('4', '1rem'),
    spacing8: getSpacing('8', '2rem'),
    primaryColor: getColor('primary', '#2196f3'),
    successColor: getColor('success', '#4caf50'),
    errorColor: getColor('error', '#f44336'),
    textLight: getColor('text.light', '#ffffff'),
    borderRadius: getBorderRadius('md', '4px'),
  };
}

const Container = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacing4};
`;

const ButtonsContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  gap: ${props => props.$themeStyles.spacing4};
`;

const Button = styled.button<{
  $themeStyles: ThemeStyles;
  $variant?: 'success' | 'error' | 'primary';
}>`
  padding: 0.5rem 1rem;
  background-color: ${({ $themeStyles, $variant }) =>
    $variant === 'success'
      ? $themeStyles.successColor
      : $variant === 'error'
        ? $themeStyles.errorColor
        : $themeStyles.primaryColor};
  color: ${props => props.$themeStyles.textLight};
  border: none;
  border-radius: ${props => props.$themeStyles.borderRadius};
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
const DemoSection = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing8};
`;

const Title = styled.h3<{ $themeStyles: ThemeStyles }>`
  font-size: 1.2rem;
  margin-bottom: ${props => props.$themeStyles.spacing4};
`;

export const ToastDemo: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  return (
    <Container $themeStyles={themeStyles}>
      <Title $themeStyles={themeStyles}>Toast Notifications</Title>
      <ButtonsContainer $themeStyles={themeStyles}>
        <Button $variant="success" $themeStyles={themeStyles} onClick={() => setShowSuccess(true)}>
          Show Success Toast
        </Button>
        <Button $variant="error" $themeStyles={themeStyles} onClick={() => setShowError(true)}>
          Show Error Toast
        </Button>
        <Button $themeStyles={themeStyles} onClick={() => setShowInfo(true)}>
          Show Info Toast
        </Button>
      </ButtonsContainer>

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
