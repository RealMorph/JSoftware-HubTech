import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme style interface
interface ThemeStyles {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  borderColor: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor } = themeContext;

  return {
    backgroundColor: getColor('background', '#ffffff'),
    textColor: getColor('text.primary', '#333333'),
    primaryColor: getColor('primary', '#3366CC'),
    borderColor: getColor('border', '#e0e0e0'),
  };
}

// Styled components
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: 1rem;
  background-color: ${props => props.$themeStyles.backgroundColor};
  color: ${props => props.$themeStyles.textColor};
  border: 1px solid ${props => props.$themeStyles.borderColor};
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Title = styled.h3<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.textColor};
  margin-top: 0;
  margin-bottom: 1rem;
`;

const ProgressContainer = styled.div`
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div<{ value: number; $themeStyles: ThemeStyles }>`
  height: 8px;
  background-color: ${props => props.$themeStyles.primaryColor};
  width: ${props => `${props.value}%`};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressTrack = styled.div<{ $themeStyles: ThemeStyles }>`
  height: 8px;
  background-color: ${props => props.$themeStyles.borderColor};
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const Label = styled.div<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.textColor};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

interface ProgressDemoProps {
  title?: string;
}

// Export the ProgressDemo component
export const ProgressDemo: React.FC<ProgressDemoProps> = ({ title = 'Progress Demo' }) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <Title $themeStyles={themeStyles}>{title}</Title>

      <ProgressContainer>
        <Label $themeStyles={themeStyles}>Determinate Progress (25%)</Label>
        <ProgressTrack $themeStyles={themeStyles}>
          <ProgressBar value={25} $themeStyles={themeStyles} />
        </ProgressTrack>
      </ProgressContainer>

      <ProgressContainer>
        <Label $themeStyles={themeStyles}>Determinate Progress (50%)</Label>
        <ProgressTrack $themeStyles={themeStyles}>
          <ProgressBar value={50} $themeStyles={themeStyles} />
        </ProgressTrack>
      </ProgressContainer>

      <ProgressContainer>
        <Label $themeStyles={themeStyles}>Determinate Progress (75%)</Label>
        <ProgressTrack $themeStyles={themeStyles}>
          <ProgressBar value={75} $themeStyles={themeStyles} />
        </ProgressTrack>
      </ProgressContainer>

      <ProgressContainer>
        <Label $themeStyles={themeStyles}>Determinate Progress (100%)</Label>
        <ProgressTrack $themeStyles={themeStyles}>
          <ProgressBar value={100} $themeStyles={themeStyles} />
        </ProgressTrack>
      </ProgressContainer>
    </DemoContainer>
  );
};

// Add default export
export default ProgressDemo;
