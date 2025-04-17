import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FileUpload } from './FileUpload';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define a theme styles interface for consistent theming
interface ThemeStyles {
  colors: {
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    border: string;
    info: string;
  };
  spacing: {
    container: string;
    section: string;
    subsection: string;
    item: string;
    gap: string;
  };
  typography: {
    title: {
      fontSize: string;
      fontWeight: string;
    };
    sectionTitle: {
      fontSize: string;
      fontWeight: string;
    };
    exampleTitle: {
      fontSize: string;
      fontWeight: string;
    };
    code: {
      fontSize: string;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
  };
}

// Theme-based styled components
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacing.container};
`;

const Title = styled.h1<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  font-size: ${props => props.$themeStyles.typography.title.fontSize};
  font-weight: ${props => props.$themeStyles.typography.title.fontWeight};
  color: ${props => props.$themeStyles.colors.text};
`;

const Section = styled.section<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
`;

const SectionTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  font-size: ${props => props.$themeStyles.typography.sectionTitle.fontSize};
  font-weight: ${props => props.$themeStyles.typography.sectionTitle.fontWeight};
  color: ${props => props.$themeStyles.colors.text};
`;

const Description = styled.p<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.subsection};
  color: ${props => props.$themeStyles.colors.textSecondary};
`;

const ExampleContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.subsection};
  border: 1px solid ${props => props.$themeStyles.colors.border};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  margin-bottom: ${props => props.$themeStyles.spacing.subsection};
  background-color: ${props => props.$themeStyles.colors.background};
`;

const ExampleTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  font-size: ${props => props.$themeStyles.typography.exampleTitle.fontSize};
  font-weight: ${props => props.$themeStyles.typography.exampleTitle.fontWeight};
  color: ${props => props.$themeStyles.colors.text};
`;

const Note = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.item};
  padding: ${props => props.$themeStyles.spacing.item};
  background-color: ${props => props.$themeStyles.colors.info};
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  font-style: italic;
  color: ${props => props.$themeStyles.colors.text};
`;

const RowContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  gap: ${props => props.$themeStyles.spacing.gap};
  margin-bottom: ${props => props.$themeStyles.spacing.subsection};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CodeBlock = styled.pre<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.colors.backgroundSecondary};
  padding: ${props => props.$themeStyles.spacing.item};
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  overflow-x: auto;
  font-family: monospace;
  margin-top: ${props => props.$themeStyles.spacing.item};
  font-size: ${props => props.$themeStyles.typography.code.fontSize};
`;

const ResultDisplay = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.item};
  padding: ${props => props.$themeStyles.spacing.item};
  background-color: ${props => props.$themeStyles.colors.backgroundSecondary};
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  font-style: italic;
  color: ${props => props.$themeStyles.colors.textSecondary};
`;

// Create theme styles based on DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getSpacing, getBorderRadius } = themeContext;

  return {
    colors: {
      background: getColor('background.primary', '#ffffff'),
      backgroundSecondary: getColor('background.secondary', '#f5f5f5'),
      text: getColor('text.primary', '#000000'),
      textSecondary: getColor('text.secondary', '#666666'),
      border: getColor('border.primary', '#e0e0e0'),
      info: getColor('info.100', '#e3f2fd'),
    },
    spacing: {
      container: getSpacing('6', '2rem'),
      section: getSpacing('8', '3rem'),
      subsection: getSpacing('4', '1.5rem'),
      item: getSpacing('3', '1rem'),
      gap: getSpacing('4', '1.5rem'),
    },
    typography: {
      title: {
        fontSize: getTypography('fontSize.xl', '2rem') as string,
        fontWeight: getTypography('fontWeight.bold', '700') as string,
      },
      sectionTitle: {
        fontSize: getTypography('fontSize.lg', '1.5rem') as string,
        fontWeight: getTypography('fontWeight.semibold', '600') as string,
      },
      exampleTitle: {
        fontSize: getTypography('fontSize.md', '1.25rem') as string,
        fontWeight: getTypography('fontWeight.medium', '500') as string,
      },
      code: {
        fontSize: getTypography('fontSize.sm', '0.875rem') as string,
      },
    },
    borderRadius: {
      sm: getBorderRadius('sm', '0.125rem'),
      md: getBorderRadius('md', '0.375rem'),
    },
  };
}

export const FileUploadDemo: React.FC = () => {
  // Initialize theme context and styles
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Track files for each demo example
  const [files, setFiles] = useState<Record<string, File[]>>({
    basic: [],
    images: [],
    documents: [],
    size: [],
    multiple: [],
    validation: [],
    form: [],
    disabled: [],
  });

  const handleFilesAdded = (demoKey: string) => (newFiles: File[]) => {
    // Update files state
    setFiles(prev => ({
      ...prev,
      [demoKey]: newFiles,
    }));
  };

  const handleFileRejected = (demoKey: string) => (file: File, reason: string) => {
    // Show rejection message and clear files for this demo
    window.alert(`File rejected: ${reason}`);

    // Clear files for this specific demo
    setFiles(prev => ({
      ...prev,
      [demoKey]: [],
    }));
  };

  // Helper to display file info
  const getFileInfo = (demoKey: string): string => {
    const demoFiles = files[demoKey] || [];
    if (demoFiles.length === 0) return 'No files selected';

    return `${demoFiles.length} file(s) selected: ${demoFiles.map(f => f.name).join(', ')}`;
  };

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <Title $themeStyles={themeStyles}>FileUpload Component</Title>

      <Description $themeStyles={themeStyles}>
        The FileUpload component allows users to select files either by dragging and dropping them
        onto a designated area or by using a traditional file input. It supports various
        configurations and variants to suit different use cases.
      </Description>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Basic Usage</SectionTitle>
        <Description $themeStyles={themeStyles}>
          The basic FileUpload component provides a drag-and-drop area and a button to browse files.
        </Description>

        <ExampleContainer $themeStyles={themeStyles}>
          <ExampleTitle $themeStyles={themeStyles}>Default FileUpload</ExampleTitle>
          <FileUpload
            label="Upload File"
            onFilesAdded={handleFilesAdded('basic')}
            helperText="Click or drag a file to upload"
          />

          <ResultDisplay $themeStyles={themeStyles}>{getFileInfo('basic')}</ResultDisplay>

          <CodeBlock $themeStyles={themeStyles}>{`<FileUpload
  label="Upload File"
  onFilesAdded={(files) => console.log(files)}
  helperText="Click or drag a file to upload"
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>File Type Restrictions</SectionTitle>
        <Description $themeStyles={themeStyles}>
          You can restrict the types of files that can be uploaded using the 'accept' prop.
        </Description>

        <RowContainer $themeStyles={themeStyles}>
          <ExampleContainer $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Images Only</ExampleTitle>
            <FileUpload
              label="Upload Image"
              accept="image/*"
              onFilesAdded={handleFilesAdded('images')}
              onFileRejected={handleFileRejected('images')}
              helperText="Only image files are accepted"
            />

            <ResultDisplay $themeStyles={themeStyles}>{getFileInfo('images')}</ResultDisplay>

            <CodeBlock $themeStyles={themeStyles}>{`<FileUpload
  label="Upload Image"
  accept="image/*"
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="Only image files are accepted"
/>`}</CodeBlock>
          </ExampleContainer>

          <ExampleContainer $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Documents Only</ExampleTitle>
            <FileUpload
              label="Upload Document"
              accept=".pdf,.doc,.docx,.txt"
              onFilesAdded={handleFilesAdded('documents')}
              onFileRejected={handleFileRejected('documents')}
              helperText="PDF, DOC, DOCX, and TXT files are accepted"
            />

            <ResultDisplay $themeStyles={themeStyles}>{getFileInfo('documents')}</ResultDisplay>

            <CodeBlock $themeStyles={themeStyles}>{`<FileUpload
  label="Upload Document"
  accept=".pdf,.doc,.docx,.txt"
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="PDF, DOC, DOCX, and TXT files are accepted"
/>`}</CodeBlock>
          </ExampleContainer>
        </RowContainer>
      </Section>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>File Size Restrictions</SectionTitle>
        <Description $themeStyles={themeStyles}>
          You can set minimum and maximum file size limits with the 'minSize' and 'maxSize' props.
        </Description>

        <ExampleContainer $themeStyles={themeStyles}>
          <ExampleTitle $themeStyles={themeStyles}>Size Limits</ExampleTitle>
          <FileUpload
            label="Upload File (Size Limited)"
            maxSize={1024 * 1024 * 5} // 5MB
            minSize={1024 * 10} // 10KB
            onFilesAdded={handleFilesAdded('size')}
            onFileRejected={handleFileRejected('size')}
            helperText="Files must be between 10KB and 5MB"
          />

          <CodeBlock $themeStyles={themeStyles}>{`<FileUpload
  label="Upload File (Size Limited)"
  maxSize={1024 * 1024 * 5} // 5MB
  minSize={1024 * 10} // 10KB
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="Files must be between 10KB and 5MB"
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Multiple File Upload</SectionTitle>
        <Description $themeStyles={themeStyles}>
          Enable multiple file selection with the 'multiple' prop and limit the number of files with
          'maxFiles'.
        </Description>

        <ExampleContainer $themeStyles={themeStyles}>
          <ExampleTitle $themeStyles={themeStyles}>Multiple Files (Max 3)</ExampleTitle>
          <FileUpload
            label="Upload Multiple Files"
            multiple
            maxFiles={3}
            onFilesAdded={handleFilesAdded('multiple')}
            onFileRejected={handleFileRejected('multiple')}
            helperText="You can select up to 3 files"
          />

          <CodeBlock $themeStyles={themeStyles}>{`<FileUpload
  label="Upload Multiple Files"
  multiple
  maxFiles={3}
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="You can select up to 3 files"
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Custom Validation</SectionTitle>
        <Description $themeStyles={themeStyles}>
          You can implement custom validation logic using the 'validator' prop.
        </Description>

        <ExampleContainer $themeStyles={themeStyles}>
          <ExampleTitle $themeStyles={themeStyles}>Custom Validation</ExampleTitle>
          <FileUpload
            label="Upload with Custom Validation"
            validator={file => {
              // Example: Only allow files with names longer than 5 characters
              if (file.name.length <= 5) {
                return {
                  valid: false,
                  message: `File name "${file.name}" is too short (must be > 5 characters)`,
                };
              }
              return { valid: true };
            }}
            onFilesAdded={handleFilesAdded('validation')}
            onFileRejected={handleFileRejected('validation')}
            helperText="Files must have names longer than 5 characters"
          />

          <CodeBlock $themeStyles={themeStyles}>{`<FileUpload
  label="Upload with Custom Validation"
  validator={(file) => {
    // Only allow files with names longer than 5 characters
    if (file.name.length <= 5) {
      return { valid: false, message: \`File name "\${file.name}" is too short (must be > 5 characters)\` };
    }
    return { valid: true };
  }}
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="Files must have names longer than 5 characters"
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Variants</SectionTitle>
        <Description $themeStyles={themeStyles}>
          The FileUpload component comes in different variants: default, inline, and card.
        </Description>

        <RowContainer $themeStyles={themeStyles}>
          <ExampleContainer $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Default Variant</ExampleTitle>
            <FileUpload
              label="Default Variant"
              variant="default"
              onFilesAdded={handleFilesAdded('default')}
              helperText="Standard drop zone"
            />
          </ExampleContainer>

          <ExampleContainer $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Inline Variant</ExampleTitle>
            <FileUpload
              label="Inline Variant"
              variant="inline"
              onFilesAdded={handleFilesAdded('inline')}
              helperText="Compact horizontal layout"
            />
          </ExampleContainer>

          <ExampleContainer $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Card Variant</ExampleTitle>
            <FileUpload
              label="Card Variant"
              variant="card"
              onFilesAdded={handleFilesAdded('card')}
              helperText="Card-style with shadow"
            />
          </ExampleContainer>
        </RowContainer>
      </Section>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Sizes</SectionTitle>
        <Description $themeStyles={themeStyles}>
          The FileUpload component supports different sizes: sm, md, and lg.
        </Description>

        <RowContainer $themeStyles={themeStyles}>
          <ExampleContainer $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Small Size</ExampleTitle>
            <FileUpload label="Small Size" size="sm" onFilesAdded={handleFilesAdded('sm')} />
          </ExampleContainer>

          <ExampleContainer $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Medium Size (Default)</ExampleTitle>
            <FileUpload label="Medium Size" size="md" onFilesAdded={handleFilesAdded('md')} />
          </ExampleContainer>

          <ExampleContainer $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Large Size</ExampleTitle>
            <FileUpload label="Large Size" size="lg" onFilesAdded={handleFilesAdded('lg')} />
          </ExampleContainer>
        </RowContainer>
      </Section>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Error State</SectionTitle>
        <Description $themeStyles={themeStyles}>
          Demonstrate how the component looks in an error state.
        </Description>

        <ExampleContainer $themeStyles={themeStyles}>
          <ExampleTitle $themeStyles={themeStyles}>Error State</ExampleTitle>
          <FileUpload
            label="Upload with Error"
            error="There was an error with your upload"
            onFilesAdded={handleFilesAdded('error')}
          />

          <CodeBlock $themeStyles={themeStyles}>{`<FileUpload
  label="Upload with Error"
  error="There was an error with your upload"
  onFilesAdded={(files) => console.log(files)}
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Disabled State</SectionTitle>
        <Description $themeStyles={themeStyles}>
          The FileUpload component can be disabled when needed.
        </Description>

        <ExampleContainer $themeStyles={themeStyles}>
          <ExampleTitle $themeStyles={themeStyles}>Disabled FileUpload</ExampleTitle>
          <FileUpload
            label="Disabled Upload"
            disabled
            onFilesAdded={handleFilesAdded('disabled')}
            helperText="This upload field is disabled"
          />

          <CodeBlock $themeStyles={themeStyles}>{`<FileUpload
  label="Disabled Upload"
  disabled
  onFilesAdded={(files) => console.log(files)}
  helperText="This upload field is disabled"
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Preview Options</SectionTitle>
        <Description $themeStyles={themeStyles}>
          Control how file previews are displayed with the 'showPreview' prop.
        </Description>

        <RowContainer $themeStyles={themeStyles}>
          <ExampleContainer $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>With Preview (Default)</ExampleTitle>
            <FileUpload
              label="With Preview"
              showPreview={true}
              onFilesAdded={handleFilesAdded('preview')}
              helperText="Files will display with thumbnails when possible"
            />
          </ExampleContainer>

          <ExampleContainer $themeStyles={themeStyles}>
            <ExampleTitle $themeStyles={themeStyles}>Without Preview</ExampleTitle>
            <FileUpload
              label="Without Preview"
              showPreview={false}
              onFilesAdded={handleFilesAdded('nopreview')}
              helperText="Files will display in a list without thumbnails"
            />
          </ExampleContainer>
        </RowContainer>
      </Section>

      <Note $themeStyles={themeStyles}>
        Note: The FileUpload component is designed to be fully integrated with the theme system,
        respecting color schemes, typography, and spacing. It also follows accessibility best
        practices, providing keyboard navigation support and proper ARIA attributes.
      </Note>
    </DemoContainer>
  );
};
