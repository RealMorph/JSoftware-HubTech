import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Button } from '../base/Button';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { ConfirmationDialog, useConfirmationDialog } from './ConfirmationDialog';
import { DialogProvider, useDialog } from './DialogProvider';

// Create theme styles for consistent theming
interface ThemeStyles {
  colors: {
    background: string;
    border: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
  };
  spacing: {
    small: string | number;
    medium: string | number;
    large: string | number;
  };
  typography: {
    heading: {
      fontSize: string | number;
      fontWeight: string | number;
    };
    subheading: {
      fontSize: string | number;
      fontWeight: string | number;
    };
    body: {
      fontSize: string | number;
    };
  };
  borderRadius: string | number;
  shadows: {
    card: string;
  };
}

function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getSpacing, getBorderRadius, getShadow } = themeContext;
  
  return {
    colors: {
      background: getColor('background.default', '#ffffff'),
      border: getColor('border', '#e0e0e0'),
      text: getColor('text.primary', '#333333'),
      primary: getColor('primary.main', '#3f51b5'),
      secondary: getColor('secondary.main', '#f50057'),
      accent: getColor('error.main', '#f44336'),
    },
    spacing: {
      small: getSpacing('sm', '0.5rem'),
      medium: getSpacing('md', '1rem'),
      large: getSpacing('lg', '2rem'),
    },
    typography: {
      heading: {
        fontSize: getTypography('fontSize.xl', '1.5rem'),
        fontWeight: getTypography('fontWeight.bold', '700'),
      },
      subheading: {
        fontSize: getTypography('fontSize.lg', '1.25rem'),
        fontWeight: getTypography('fontWeight.semibold', '600'),
      },
      body: {
        fontSize: getTypography('fontSize.md', '1rem'),
      },
    },
    borderRadius: getBorderRadius('md', '0.375rem'),
    shadows: {
      card: getShadow('md', '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'),
    },
  };
}

const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacing.large};
`;

const DemoTitle = styled.h1<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.heading.fontSize};
  font-weight: ${props => props.$themeStyles.typography.heading.fontWeight};
  margin-bottom: ${props => props.$themeStyles.spacing.medium};
  color: ${props => props.$themeStyles.colors.text};
`;

const DemoDescription = styled.p<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.body.fontSize};
  margin-bottom: ${props => props.$themeStyles.spacing.large};
  color: ${props => props.$themeStyles.colors.text};
  line-height: 1.6;
`;

const Section = styled.section<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.large};
  padding: ${props => props.$themeStyles.spacing.medium};
  background-color: ${props => props.$themeStyles.colors.background};
  border-radius: ${props => props.$themeStyles.borderRadius};
  box-shadow: ${props => props.$themeStyles.shadows.card};
  border: 1px solid ${props => props.$themeStyles.colors.border};
`;

const SectionTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.subheading.fontSize};
  font-weight: ${props => props.$themeStyles.typography.subheading.fontWeight};
  margin-bottom: ${props => props.$themeStyles.spacing.medium};
  color: ${props => props.$themeStyles.colors.text};
`;

const SectionDescription = styled.p<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.body.fontSize};
  margin-bottom: ${props => props.$themeStyles.spacing.medium};
  color: ${props => props.$themeStyles.colors.text};
`;

const ButtonGroup = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.$themeStyles.spacing.medium};
  margin-top: ${props => props.$themeStyles.spacing.medium};
`;

const CodeBlock = styled.pre<{ $themeStyles: ThemeStyles }>`
  background-color: #f5f5f5;
  border-radius: ${props => props.$themeStyles.borderRadius};
  padding: ${props => props.$themeStyles.spacing.medium};
  overflow: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  margin-top: ${props => props.$themeStyles.spacing.medium};
  margin-bottom: ${props => props.$themeStyles.spacing.medium};
`;

const ResultBlock = styled.div<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => `${props.$themeStyles.colors.primary}10`};
  border-radius: ${props => props.$themeStyles.borderRadius};
  padding: ${props => props.$themeStyles.spacing.medium};
  margin-top: ${props => props.$themeStyles.spacing.medium};
`;

// Component that demonstrates the basic usage of ConfirmationDialog
const BasicConfirmationDemo = ({ themeStyles }: { themeStyles: ThemeStyles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const handleConfirm = () => {
    setResult('Action confirmed!');
    setIsOpen(false);
  };
  
  const handleCancel = () => {
    setResult('Action cancelled');
    setIsOpen(false);
  };
  
  return (
    <Section $themeStyles={themeStyles}>
      <SectionTitle $themeStyles={themeStyles}>Basic Confirmation Dialog</SectionTitle>
      <SectionDescription $themeStyles={themeStyles}>
        The most basic usage of the confirmation dialog component. Shows a simple confirmation message with confirm/cancel buttons.
      </SectionDescription>
      
      <Button variant="primary" onClick={() => setIsOpen(true)}>Open Basic Dialog</Button>
      
      {result && (
        <ResultBlock $themeStyles={themeStyles}>
          Result: {result}
        </ResultBlock>
      )}
      
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="Are you sure you want to continue with this action?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Confirm Action"
      />
      
      <CodeBlock $themeStyles={themeStyles}>
{`// Basic usage of ConfirmationDialog
<ConfirmationDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  message="Are you sure you want to continue with this action?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  title="Confirm Action"
/>`}
      </CodeBlock>
    </Section>
  );
};

// Component that demonstrates different confirmation types
const ConfirmationTypesDemo = ({ themeStyles }: { themeStyles: ThemeStyles }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isDangerOpen, setIsDangerOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const handleConfirm = (type: string) => {
    setResult(`${type} action confirmed!`);
  };
  
  return (
    <Section $themeStyles={themeStyles}>
      <SectionTitle $themeStyles={themeStyles}>Confirmation Types</SectionTitle>
      <SectionDescription $themeStyles={themeStyles}>
        ConfirmationDialog supports different types for different scenarios: info (default), warning, and danger.
        Each type has different styling and button variants.
      </SectionDescription>
      
      <ButtonGroup $themeStyles={themeStyles}>
        <Button variant="primary" onClick={() => setIsInfoOpen(true)}>Info Dialog</Button>
        <Button variant="secondary" onClick={() => setIsWarningOpen(true)}>Warning Dialog</Button>
        <Button variant="accent" onClick={() => setIsDangerOpen(true)}>Danger Dialog</Button>
      </ButtonGroup>
      
      {result && (
        <ResultBlock $themeStyles={themeStyles}>
          Result: {result}
        </ResultBlock>
      )}
      
      <ConfirmationDialog
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        message="This is an informational confirmation dialog."
        onConfirm={() => {
          handleConfirm('Info');
          setIsInfoOpen(false);
        }}
        confirmationType="info"
        title="Information"
      />
      
      <ConfirmationDialog
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        message="This action may have consequences. Are you sure you want to continue?"
        onConfirm={() => {
          handleConfirm('Warning');
          setIsWarningOpen(false);
        }}
        confirmationType="warning"
        title="Warning"
      />
      
      <ConfirmationDialog
        isOpen={isDangerOpen}
        onClose={() => setIsDangerOpen(false)}
        message="This action is irreversible and will permanently delete this data. Are you absolutely sure?"
        onConfirm={() => {
          handleConfirm('Danger');
          setIsDangerOpen(false);
        }}
        confirmationType="danger"
        title="Danger"
        confirmText="Delete"
      />
      
      <CodeBlock $themeStyles={themeStyles}>
{`// Different confirmation types
<ConfirmationDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  message="This action is irreversible."
  onConfirm={handleConfirm}
  confirmationType="danger" // 'info' | 'warning' | 'danger'
  title="Danger"
  confirmText="Delete"
/>`}
      </CodeBlock>
    </Section>
  );
};

// Component that demonstrates the hook usage
const HookUsageDemo = ({ themeStyles }: { themeStyles: ThemeStyles }) => {
  const { openConfirmationDialog, closeConfirmationDialog, ConfirmationDialog: ConfirmationDialogComponent } = useConfirmationDialog();
  const [result, setResult] = useState<string | null>(null);
  
  const handleDialogOpen = () => {
    openConfirmationDialog({
      message: "This dialog is managed with the useConfirmationDialog hook.",
      onConfirm: () => {
        setResult('Confirmed through hook!');
        closeConfirmationDialog();
      },
      title: "Hook Demo",
      confirmText: "I Understand",
    });
  };
  
  return (
    <Section $themeStyles={themeStyles}>
      <SectionTitle $themeStyles={themeStyles}>useConfirmationDialog Hook</SectionTitle>
      <SectionDescription $themeStyles={themeStyles}>
        The useConfirmationDialog hook provides a simpler way to manage a confirmation dialog without having to
        manually track the open state.
      </SectionDescription>
      
      <Button variant="primary" onClick={handleDialogOpen}>Open Dialog with Hook</Button>
      
      {result && (
        <ResultBlock $themeStyles={themeStyles}>
          Result: {result}
        </ResultBlock>
      )}
      
      <ConfirmationDialogComponent />
      
      <CodeBlock $themeStyles={themeStyles}>
{`// Using the useConfirmationDialog hook
const { 
  openConfirmationDialog, 
  closeConfirmationDialog, 
  ConfirmationDialog 
} = useConfirmationDialog();

// Open dialog with configuration
openConfirmationDialog({
  message: "This dialog is managed with the hook.",
  onConfirm: () => {
    // Handle confirmation
    closeConfirmationDialog();
  },
  title: "Hook Demo",
  confirmText: "I Understand",
});

// Render the dialog component
<ConfirmationDialog />`}
      </CodeBlock>
    </Section>
  );
};

// Component that demonstrates the dialog provider usage
const DialogProviderDemo = ({ themeStyles }: { themeStyles: ThemeStyles }) => {
  const dialog = useDialog();
  const [result, setResult] = useState<string | null>(null);
  
  const handleOpenDialog = () => {
    dialog.confirm({
      message: "This dialog is opened through the DialogProvider.",
      onConfirm: () => {
        setResult('Confirmed through DialogProvider!');
      },
      title: "Provider Demo",
    });
  };
  
  // Create a promise-based confirmation since confirmAsync doesn't exist
  const confirmAsync = (message: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      dialog.confirm({
        message,
        onConfirm: () => resolve(),
        onCancel: () => reject(new Error('User cancelled')),
        title: "Promise Confirmation",
      });
    });
  };
  
  const handleWithPromise = async () => {
    try {
      await confirmAsync("This is using a promise-based confirmation. Click Confirm or Cancel.");
      setResult('Promise resolved: Confirmed');
    } catch (error) {
      setResult('Promise rejected: Cancelled');
    }
  };
  
  return (
    <Section $themeStyles={themeStyles}>
      <SectionTitle $themeStyles={themeStyles}>DialogProvider Integration</SectionTitle>
      <SectionDescription $themeStyles={themeStyles}>
        The DialogProvider allows for even simpler usage. You can access dialog functions anywhere
        in your application with the useDialog hook.
      </SectionDescription>
      
      <ButtonGroup $themeStyles={themeStyles}>
        <Button variant="primary" onClick={handleOpenDialog}>Open with DialogProvider</Button>
        <Button variant="secondary" onClick={handleWithPromise}>Promise-based Confirmation</Button>
      </ButtonGroup>
      
      {result && (
        <ResultBlock $themeStyles={themeStyles}>
          Result: {result}
        </ResultBlock>
      )}
      
      <CodeBlock $themeStyles={themeStyles}>
{`// Using the DialogProvider and useDialog hook
const dialog = useDialog();

// Simple approach
dialog.confirm({
  message: "Confirmation message",
  onConfirm: () => {
    // Handle confirmation
  },
  title: "Confirmation",
});

// Promise-based approach (custom implementation)
const confirmAsync = (message) => {
  return new Promise((resolve, reject) => {
    dialog.confirm({
      message,
      onConfirm: () => resolve(),
      onCancel: () => reject(),
      title: "Promise Confirmation",
    });
  });
};

try {
  await confirmAsync("Are you sure?");
  // User confirmed
} catch (error) {
  // User cancelled
}`}
      </CodeBlock>
    </Section>
  );
};

// Loading state demo
const LoadingStateDemo = ({ themeStyles }: { themeStyles: ThemeStyles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const handleConfirm = async () => {
    setIsLoading(true);
    setResult('Processing...');
    
    // Simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResult('Action completed successfully!');
    setIsLoading(false);
    setIsOpen(false);
  };
  
  return (
    <Section $themeStyles={themeStyles}>
      <SectionTitle $themeStyles={themeStyles}>Loading State</SectionTitle>
      <SectionDescription $themeStyles={themeStyles}>
        ConfirmationDialog supports a loading state for async operations. This prevents users from
        clicking multiple times or dismissing the dialog during processing.
      </SectionDescription>
      
      <Button variant="primary" onClick={() => setIsOpen(true)}>Open Dialog with Loading</Button>
      
      {result && (
        <ResultBlock $themeStyles={themeStyles}>
          Result: {result}
        </ResultBlock>
      )}
      
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={() => !isLoading && setIsOpen(false)}
        message="This will simulate a 2-second operation when confirmed."
        onConfirm={handleConfirm}
        title="Async Operation"
        loading={isLoading}
        confirmText={isLoading ? "Processing..." : "Continue"}
      />
      
      <CodeBlock $themeStyles={themeStyles}>
{`// Using loading state for async operations
const [isLoading, setIsLoading] = useState(false);

const handleConfirm = async () => {
  setIsLoading(true);
  
  try {
    // Perform async operation
    await someAsyncFunction();
    
    // Success handling
  } catch (error) {
    // Error handling
  } finally {
    setIsLoading(false);
    setIsOpen(false);
  }
};

<ConfirmationDialog
  isOpen={isOpen}
  onClose={() => !isLoading && setIsOpen(false)}
  message="Confirmation message"
  onConfirm={handleConfirm}
  loading={isLoading}
  confirmText={isLoading ? "Processing..." : "Continue"}
/>`}
      </CodeBlock>
    </Section>
  );
};

const ConfirmationDialogDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  
  return (
    <DialogProvider>
      <DemoContainer $themeStyles={themeStyles}>
        <DemoTitle $themeStyles={themeStyles}>Confirmation Dialog</DemoTitle>
        <DemoDescription $themeStyles={themeStyles}>
          Confirmation dialogs prompt users to confirm their actions before proceeding. 
          They provide a clear message about what will happen if they continue, and offer 
          options to either confirm or cancel the action.
        </DemoDescription>
        
        <BasicConfirmationDemo themeStyles={themeStyles} />
        <ConfirmationTypesDemo themeStyles={themeStyles} />
        <HookUsageDemo themeStyles={themeStyles} />
        <DialogProviderDemo themeStyles={themeStyles} />
        <LoadingStateDemo themeStyles={themeStyles} />
      </DemoContainer>
    </DialogProvider>
  );
};

export default ConfirmationDialogDemo; 