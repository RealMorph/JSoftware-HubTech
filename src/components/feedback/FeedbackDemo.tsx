import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { useLocation } from 'react-router-dom';
import FormDialogDemo from '../demos/FormDialogDemo';

import { ToastDemo } from './ToastDemo';
import { ProgressDemo } from './ProgressDemo';
import { ModalDemo } from './ModalDemo';

// Define theme style interface
interface ThemeStyles {
  backgroundColor: string;
  borderColor: string;
  spacing: {
    md: string;
    lg: string;
  };
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getSpacing } = themeContext;
  
  return {
    backgroundColor: getColor('background', '#ffffff'),
    borderColor: getColor('border', '#e0e0e0'),
    spacing: {
      md: getSpacing('4', '1rem'),
      lg: getSpacing('6', '1.5rem')
    }
  };
}

const Container = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacing.md};
  padding: ${props => props.$themeStyles.spacing.lg};
`;

export const FeedbackDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const location = useLocation();
  const path = location.pathname;

  // Check if we're on the form-dialog route
  if (path.includes('/form-dialog')) {
    return <FormDialogDemo />;
  }

  return (
    <Container $themeStyles={themeStyles}>
      <ToastDemo />
      <ProgressDemo />
      <ModalDemo />
    </Container>
  );
};

export default FeedbackDemo;
