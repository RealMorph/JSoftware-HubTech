import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FileUpload } from './FileUpload';

const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
  font-size: 2rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#000000'};
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#000000'};
`;

const Description = styled.p`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666666'};
`;

const ExampleContainer = styled.div`
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.border?.primary || '#e0e0e0'};
  border-radius: ${({ theme }) => theme.borderRadius?.md || '0.375rem'};
  margin-bottom: 1.5rem;
  background-color: ${({ theme }) => theme.colors?.background?.primary || '#ffffff'};
`;

const ExampleTitle = styled.h3`
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#000000'};
`;

const Note = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors?.info?.[100] || '#e3f2fd'};
  border-radius: ${({ theme }) => theme.borderRadius?.sm || '0.125rem'};
  font-style: italic;
  color: ${({ theme }) => theme.colors?.info?.[500] || '#2196f3'};
`;

const RowContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CodeBlock = styled.pre`
  background-color: ${({ theme }) => theme.colors?.background?.secondary || '#f5f5f5'};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius?.sm || '0.125rem'};
  overflow-x: auto;
  font-family: monospace;
  margin-top: 1rem;
  font-size: 0.875rem;
`;

export const FileUploadDemo: React.FC = () => {
  const [files, setFiles] = useState<Record<string, File[]>>({
    basic: [],
    images: [],
    documents: [],
    size: [],
    multiple: [],
    validation: [],
    form: [],
    disabled: []
  });

  const handleFilesAdded = (demoKey: string) => (newFiles: File[]) => {
    setFiles(prev => ({
      ...prev,
      [demoKey]: newFiles
    }));
    
    console.log(`Files added to ${demoKey}:`, newFiles);
  };
  
  const handleFileRejected = (demoKey: string) => (file: File, reason: string) => {
    console.warn(`File rejected in ${demoKey}:`, file.name, reason);
    alert(`File rejected: ${reason}`);
  };

  return (
    <DemoContainer>
      <Title>FileUpload Component</Title>
      
      <Description>
        The FileUpload component allows users to select files either by dragging and dropping them onto a designated area 
        or by using a traditional file input. It supports various configurations and variants to suit different use cases.
      </Description>
      
      <Section>
        <SectionTitle>Basic Usage</SectionTitle>
        <Description>
          The basic FileUpload component provides a drag-and-drop area and a button to browse files.
        </Description>
        
        <ExampleContainer>
          <ExampleTitle>Default FileUpload</ExampleTitle>
          <FileUpload
            label="Upload File"
            onFilesAdded={handleFilesAdded('basic')}
            helperText="Click or drag a file to upload"
          />
          
          <CodeBlock>{`<FileUpload
  label="Upload File"
  onFilesAdded={(files) => console.log(files)}
  helperText="Click or drag a file to upload"
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>
      
      <Section>
        <SectionTitle>File Type Restrictions</SectionTitle>
        <Description>
          You can restrict the types of files that can be uploaded using the 'accept' prop.
        </Description>
        
        <RowContainer>
          <ExampleContainer>
            <ExampleTitle>Images Only</ExampleTitle>
            <FileUpload
              label="Upload Image"
              accept="image/*"
              onFilesAdded={handleFilesAdded('images')}
              onFileRejected={handleFileRejected('images')}
              helperText="Only image files are accepted"
            />
            
            <CodeBlock>{`<FileUpload
  label="Upload Image"
  accept="image/*"
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="Only image files are accepted"
/>`}</CodeBlock>
          </ExampleContainer>
          
          <ExampleContainer>
            <ExampleTitle>Documents Only</ExampleTitle>
            <FileUpload
              label="Upload Document"
              accept=".pdf,.doc,.docx,.txt"
              onFilesAdded={handleFilesAdded('documents')}
              onFileRejected={handleFileRejected('documents')}
              helperText="PDF, DOC, DOCX, and TXT files are accepted"
            />
            
            <CodeBlock>{`<FileUpload
  label="Upload Document"
  accept=".pdf,.doc,.docx,.txt"
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="PDF, DOC, DOCX, and TXT files are accepted"
/>`}</CodeBlock>
          </ExampleContainer>
        </RowContainer>
      </Section>
      
      <Section>
        <SectionTitle>File Size Restrictions</SectionTitle>
        <Description>
          You can set minimum and maximum file size limits with the 'minSize' and 'maxSize' props.
        </Description>
        
        <ExampleContainer>
          <ExampleTitle>Size Limits</ExampleTitle>
          <FileUpload
            label="Upload File (Size Limited)"
            maxSize={1024 * 1024 * 5} // 5MB
            minSize={1024 * 10} // 10KB
            onFilesAdded={handleFilesAdded('size')}
            onFileRejected={handleFileRejected('size')}
            helperText="Files must be between 10KB and 5MB"
          />
          
          <CodeBlock>{`<FileUpload
  label="Upload File (Size Limited)"
  maxSize={1024 * 1024 * 5} // 5MB
  minSize={1024 * 10} // 10KB
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="Files must be between 10KB and 5MB"
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>
      
      <Section>
        <SectionTitle>Multiple File Upload</SectionTitle>
        <Description>
          Enable multiple file selection with the 'multiple' prop and limit the number of files with 'maxFiles'.
        </Description>
        
        <ExampleContainer>
          <ExampleTitle>Multiple Files (Max 3)</ExampleTitle>
          <FileUpload
            label="Upload Multiple Files"
            multiple
            maxFiles={3}
            onFilesAdded={handleFilesAdded('multiple')}
            onFileRejected={handleFileRejected('multiple')}
            helperText="You can select up to 3 files"
          />
          
          <CodeBlock>{`<FileUpload
  label="Upload Multiple Files"
  multiple
  maxFiles={3}
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="You can select up to 3 files"
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>
      
      <Section>
        <SectionTitle>Custom Validation</SectionTitle>
        <Description>
          You can implement custom validation logic using the 'validator' prop.
        </Description>
        
        <ExampleContainer>
          <ExampleTitle>Custom Validation</ExampleTitle>
          <FileUpload
            label="Upload with Custom Validation"
            validator={(file) => {
              // Example: Only allow files with names longer than 5 characters
              if (file.name.length <= 5) {
                return { valid: false, message: `File name "${file.name}" is too short (must be > 5 characters)` };
              }
              return { valid: true };
            }}
            onFilesAdded={handleFilesAdded('validation')}
            onFileRejected={handleFileRejected('validation')}
            helperText="Files must have names longer than 5 characters"
          />
          
          <CodeBlock>{`<FileUpload
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
      
      <Section>
        <SectionTitle>Variants</SectionTitle>
        <Description>
          The FileUpload component comes in different variants: default, inline, and card.
        </Description>
        
        <RowContainer>
          <ExampleContainer>
            <ExampleTitle>Default Variant</ExampleTitle>
            <FileUpload
              label="Default Variant"
              variant="default"
              onFilesAdded={handleFilesAdded('default')}
              helperText="Standard drop zone"
            />
          </ExampleContainer>
          
          <ExampleContainer>
            <ExampleTitle>Inline Variant</ExampleTitle>
            <FileUpload
              label="Inline Variant"
              variant="inline"
              onFilesAdded={handleFilesAdded('inline')}
              helperText="Compact horizontal layout"
            />
          </ExampleContainer>
          
          <ExampleContainer>
            <ExampleTitle>Card Variant</ExampleTitle>
            <FileUpload
              label="Card Variant"
              variant="card"
              onFilesAdded={handleFilesAdded('card')}
              helperText="Card-style with shadow"
            />
          </ExampleContainer>
        </RowContainer>
      </Section>
      
      <Section>
        <SectionTitle>Sizes</SectionTitle>
        <Description>
          The FileUpload component supports different sizes: sm, md, and lg.
        </Description>
        
        <RowContainer>
          <ExampleContainer>
            <ExampleTitle>Small Size</ExampleTitle>
            <FileUpload
              label="Small Size"
              size="sm"
              onFilesAdded={handleFilesAdded('sm')}
            />
          </ExampleContainer>
          
          <ExampleContainer>
            <ExampleTitle>Medium Size (Default)</ExampleTitle>
            <FileUpload
              label="Medium Size"
              size="md"
              onFilesAdded={handleFilesAdded('md')}
            />
          </ExampleContainer>
          
          <ExampleContainer>
            <ExampleTitle>Large Size</ExampleTitle>
            <FileUpload
              label="Large Size"
              size="lg"
              onFilesAdded={handleFilesAdded('lg')}
            />
          </ExampleContainer>
        </RowContainer>
      </Section>
      
      <Section>
        <SectionTitle>Error State</SectionTitle>
        <Description>
          Demonstrate how the component looks in an error state.
        </Description>
        
        <ExampleContainer>
          <ExampleTitle>Error State</ExampleTitle>
          <FileUpload
            label="Upload with Error"
            error="There was an error with your upload"
            onFilesAdded={handleFilesAdded('error')}
          />
          
          <CodeBlock>{`<FileUpload
  label="Upload with Error"
  error="There was an error with your upload"
  onFilesAdded={(files) => console.log(files)}
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>
      
      <Section>
        <SectionTitle>Disabled State</SectionTitle>
        <Description>
          The FileUpload component can be disabled when needed.
        </Description>
        
        <ExampleContainer>
          <ExampleTitle>Disabled FileUpload</ExampleTitle>
          <FileUpload
            label="Disabled Upload"
            disabled
            onFilesAdded={handleFilesAdded('disabled')}
            helperText="This upload field is disabled"
          />
          
          <CodeBlock>{`<FileUpload
  label="Disabled Upload"
  disabled
  onFilesAdded={(files) => console.log(files)}
  helperText="This upload field is disabled"
/>`}</CodeBlock>
        </ExampleContainer>
      </Section>
      
      <Section>
        <SectionTitle>Preview Options</SectionTitle>
        <Description>
          Control how file previews are displayed with the 'showPreview' prop.
        </Description>
        
        <RowContainer>
          <ExampleContainer>
            <ExampleTitle>With Preview (Default)</ExampleTitle>
            <FileUpload
              label="With Preview"
              showPreview={true}
              onFilesAdded={handleFilesAdded('preview')}
              helperText="Files will display with thumbnails when possible"
            />
          </ExampleContainer>
          
          <ExampleContainer>
            <ExampleTitle>Without Preview</ExampleTitle>
            <FileUpload
              label="Without Preview"
              showPreview={false}
              onFilesAdded={handleFilesAdded('nopreview')}
              helperText="Files will display in a list without thumbnails"
            />
          </ExampleContainer>
        </RowContainer>
      </Section>
      
      <Note>
        Note: The FileUpload component is designed to be fully integrated with the theme system, respecting color schemes, typography, and spacing.
        It also follows accessibility best practices, providing keyboard navigation support and proper ARIA attributes.
      </Note>
    </DemoContainer>
  );
}; 