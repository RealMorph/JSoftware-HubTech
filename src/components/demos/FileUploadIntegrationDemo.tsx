import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FileUpload } from '../base/FileUpload';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { FirebaseStorageService } from '../../core/firebase/firebase-storage-service';
import { useAuth } from '../../core/auth/AuthProvider';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../core/firebase/firebase-config';

// Define theme styles interface for consistent theming
interface ThemeStyles {
  colors: {
    background: string;
    text: string;
    border: string;
    secondary: string;
    success: string;
    error: string;
    info: string;
    primary: string;
  };
  spacing: {
    page: string;
    section: string;
    item: string;
    inner: string;
    sm: string;
    xs: string;
  };
  typography: {
    title: {
      fontSize: string;
      fontWeight: string;
    };
    heading: {
      fontSize: string;
      fontWeight: string;
    };
    subheading: {
      fontSize: string;
      fontWeight: string;
    };
    code: {
      fontSize: string;
    };
    fontWeight: {
      medium: number;
    };
  };
  borderRadius: string;
  shadows: {
    card: string;
  };
}

// Interface for upload status tracking
interface UploadStatus {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

// Styled components
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacing.page};
  color: ${props => props.$themeStyles.colors.text};
  background-color: ${props => props.$themeStyles.colors.background};
`;

const Title = styled.h1<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  font-size: ${props => props.$themeStyles.typography.title.fontSize};
  font-weight: ${props => props.$themeStyles.typography.title.fontWeight};
`;

const Description = styled.p<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  line-height: 1.5;
`;

const Section = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.section};
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border};
  padding-bottom: ${props => props.$themeStyles.spacing.section};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  font-size: ${props => props.$themeStyles.typography.heading.fontSize};
  font-weight: ${props => props.$themeStyles.typography.heading.fontWeight};
`;

const ExampleContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  padding: ${props => props.$themeStyles.spacing.inner};
  border: 1px solid ${props => props.$themeStyles.colors.border};
  border-radius: ${props => props.$themeStyles.borderRadius};
`;

const ExampleTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.item};
  font-size: ${props => props.$themeStyles.typography.subheading.fontSize};
  font-weight: ${props => props.$themeStyles.typography.subheading.fontWeight};
`;

const Button = styled.button<{ $themeStyles: ThemeStyles; $variant?: 'primary' | 'success' | 'error' }>`
  padding: ${props => `${props.$themeStyles.spacing.xs} ${props.$themeStyles.spacing.sm}`};
  background-color: ${props => props.$themeStyles.colors[props.$variant || 'primary']};
  color: white;
  border: none;
  border-radius: ${props => props.$themeStyles.borderRadius};
  cursor: pointer;
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  margin-top: ${props => props.$themeStyles.spacing.sm};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.sm};
  width: 100%;
  background-color: ${props => props.$themeStyles.colors.secondary};
  border-radius: ${props => props.$themeStyles.borderRadius};
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $themeStyles: ThemeStyles; $progress: number; $status: string }>`
  height: 8px;
  width: ${props => `${props.$progress}%`};
  background-color: ${props => {
    if (props.$status === 'error') return props.$themeStyles.colors.error;
    if (props.$status === 'success') return props.$themeStyles.colors.success;
    return props.$themeStyles.colors.primary;
  }};
  transition: width 0.3s ease;
`;

const FileList = styled.ul<{ $themeStyles: ThemeStyles }>`
  list-style: none;
  padding: 0;
  margin: ${props => props.$themeStyles.spacing.sm} 0;
`;

const FileItem = styled.li<{ $themeStyles: ThemeStyles; $status: string }>`
  padding: ${props => props.$themeStyles.spacing.sm};
  border: 1px solid ${props => props.$themeStyles.colors.border};
  border-radius: ${props => props.$themeStyles.borderRadius};
  margin-bottom: ${props => props.$themeStyles.spacing.xs};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => {
    if (props.$status === 'error') return `${props.$themeStyles.colors.error}20`;
    if (props.$status === 'success') return `${props.$themeStyles.colors.success}20`;
    return props.$themeStyles.colors.background;
  }};
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div<{ $themeStyles: ThemeStyles }>`
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
`;

const FileStatus = styled.div<{ $themeStyles: ThemeStyles; $status: string }>`
  color: ${props => {
    if (props.$status === 'error') return props.$themeStyles.colors.error;
    if (props.$status === 'success') return props.$themeStyles.colors.success;
    if (props.$status === 'uploading') return props.$themeStyles.colors.primary;
    return props.$themeStyles.colors.text;
  }};
  font-size: 0.875rem;
`;

const FileActions = styled.div`
  display: flex;
  gap: 8px;
`;

// Create theme styles based on DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getSpacing, getTypography, getBorderRadius, getShadow } = themeContext;

  return {
    colors: {
      background: getColor('background', '#ffffff'),
      text: getColor('text.primary', '#333333'),
      border: getColor('border', '#e0e0e0'),
      secondary: getColor('background.secondary', '#f5f7fa'),
      success: getColor('success.main', '#4caf50'),
      error: getColor('error.main', '#f44336'),
      info: getColor('info.light', '#e3f2fd'),
      primary: getColor('primary.main', '#2196f3'),
    },
    spacing: {
      page: getSpacing('8', '2rem'),
      section: getSpacing('6', '1.5rem'),
      item: getSpacing('4', '1rem'),
      inner: getSpacing('3', '0.75rem'),
      sm: getSpacing('2', '0.5rem'),
      xs: getSpacing('1', '0.25rem'),
    },
    typography: {
      title: {
        fontSize: getTypography('fontSize.2xl', '1.5rem') as string,
        fontWeight: getTypography('fontWeight.bold', '700') as string,
      },
      heading: {
        fontSize: getTypography('fontSize.xl', '1.25rem') as string,
        fontWeight: getTypography('fontWeight.semibold', '600') as string,
      },
      subheading: {
        fontSize: getTypography('fontSize.lg', '1.125rem') as string,
        fontWeight: getTypography('fontWeight.medium', '500') as string,
      },
      code: {
        fontSize: getTypography('fontSize.sm', '0.875rem') as string,
      },
      fontWeight: {
        medium: Number(getTypography('fontWeight.medium', '500')),
      },
    },
    borderRadius: getBorderRadius('md', '0.375rem'),
    shadows: {
      card: getShadow(
        'md',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      ),
    },
  };
}

const FileUploadIntegrationDemo: React.FC = () => {
  // Initialize theme context and styles
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const { user } = useAuth();
  
  // State to track files and upload status
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Storage service instance
  const storageService = FirebaseStorageService.getInstance();

  // Handle files added from FileUpload component
  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles);
    
    // Initialize upload statuses for new files
    setUploadStatuses(newFiles.map(file => ({
      id: generateId(),
      fileName: file.name,
      progress: 0,
      status: 'pending'
    })));
  };

  // Handle file rejection from FileUpload component
  const handleFileRejected = (file: File, reason: string) => {
    console.warn(`File rejected: ${file.name} - ${reason}`);
    // You could also add this to a UI error state if desired
  };

  // Generate a simple ID for tracking uploads
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Upload all files to Firebase Storage
  const uploadFiles = async () => {
    if (!user || files.length === 0) return;
    
    setIsUploading(true);
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const status = uploadStatuses[i];
      
      // Update status to uploading
      updateUploadStatus(status.id, {
        status: 'uploading',
        progress: 0
      });
      
      try {
        // Determine storage path based on file type
        const userId = user.id || 'anonymous';
        const timestamp = new Date().getTime();
        const storagePath = `users/${userId}/uploads/${timestamp}_${file.name}`;
        
        // Create storage reference
        const storageRef = ref(storage, storagePath);
        
        // Create upload task with real progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        // Monitor upload progress
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Calculate progress percentage
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            
            // Update progress in UI
            updateUploadStatus(status.id, { progress });
          },
          (error) => {
            // Handle upload error
            console.error(`Error uploading file: ${file.name}`, error);
            updateUploadStatus(status.id, {
              status: 'error',
              progress: 100,
              error: error.message || 'Upload failed'
            });
          },
          async () => {
            // Upload completed successfully
            try {
              // Get download URL
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Update status to success
              updateUploadStatus(status.id, {
                status: 'success',
                progress: 100,
                url
              });
            } catch (error) {
              // Handle error getting download URL
              console.error(`Error getting download URL: ${file.name}`, error);
              updateUploadStatus(status.id, {
                status: 'error',
                progress: 100,
                error: error instanceof Error ? error.message : 'Failed to get download URL'
              });
            }
          }
        );
      } catch (error) {
        console.error(`Error setting up upload for file: ${file.name}`, error);
        
        // Update status to error
        updateUploadStatus(status.id, {
          status: 'error',
          progress: 0,
          error: error instanceof Error ? error.message : 'Failed to start upload'
        });
      }
    }
    
    // Note: we don't set isUploading to false here because uploads are async
    // The UI will indicate which files are still uploading
  };

  // Update a specific upload status
  const updateUploadStatus = (id: string, updates: Partial<UploadStatus>) => {
    setUploadStatuses(prev => 
      prev.map(status => 
        status.id === id ? { ...status, ...updates } : status
      )
    );
  };

  // View a file if it has a URL
  const viewFile = (url: string) => {
    window.open(url, '_blank');
  };

  // Clear all files and reset state
  const clearFiles = () => {
    setFiles([]);
    setUploadStatuses([]);
  };

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <Title $themeStyles={themeStyles}>File Upload with Firebase Storage</Title>

      <Description $themeStyles={themeStyles}>
        This demo shows how to integrate the FileUpload component with Firebase Storage
        for real file uploads, including progress tracking and error handling.
      </Description>

      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Upload Files to Firebase Storage</SectionTitle>
        
        <ExampleContainer $themeStyles={themeStyles}>
          <ExampleTitle $themeStyles={themeStyles}>Select Files</ExampleTitle>
          
          <FileUpload
            label="Upload Files to Firebase"
            onFilesAdded={handleFilesAdded}
            onFileRejected={handleFileRejected}
            helperText="Select files to upload to Firebase Storage"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv"
            maxSize={5 * 1024 * 1024} // 5MB
            variant="default"
            size="md"
          />
          
          {files.length > 0 && (
            <>
              <Button 
                $themeStyles={themeStyles} 
                onClick={uploadFiles}
                disabled={isUploading || !user}
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </Button>
              
              <Button 
                $themeStyles={themeStyles} 
                $variant="error"
                onClick={clearFiles}
                disabled={isUploading}
                style={{ marginLeft: '8px' }}
              >
                Clear Files
              </Button>
              
              {!user && (
                <div style={{ color: themeStyles.colors.error, marginTop: '8px' }}>
                  You must be logged in to upload files.
                </div>
              )}
              
              <FileList $themeStyles={themeStyles}>
                {uploadStatuses.map((status, index) => (
                  <FileItem key={status.id} $themeStyles={themeStyles} $status={status.status}>
                    <FileInfo>
                      <FileName $themeStyles={themeStyles}>{status.fileName}</FileName>
                      <FileStatus $themeStyles={themeStyles} $status={status.status}>
                        {status.status === 'pending' && 'Ready to upload'}
                        {status.status === 'uploading' && `Uploading: ${status.progress}%`}
                        {status.status === 'success' && 'Upload complete'}
                        {status.status === 'error' && `Error: ${status.error || 'Upload failed'}`}
                      </FileStatus>
                      
                      <ProgressContainer $themeStyles={themeStyles}>
                        <ProgressBar 
                          $themeStyles={themeStyles} 
                          $progress={status.progress} 
                          $status={status.status} 
                        />
                      </ProgressContainer>
                    </FileInfo>
                    
                    <FileActions>
                      {status.status === 'success' && status.url && (
                        <Button 
                          $themeStyles={themeStyles} 
                          $variant="success"
                          onClick={() => viewFile(status.url!)}
                        >
                          View
                        </Button>
                      )}
                    </FileActions>
                  </FileItem>
                ))}
              </FileList>
            </>
          )}
        </ExampleContainer>
      </Section>
      
      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Implementation Notes</SectionTitle>
        <Description $themeStyles={themeStyles}>
          This implementation demonstrates:
          <ul>
            <li>Integration with Firebase Storage for file uploads</li>
            <li>Progress tracking for file uploads</li>
            <li>Error handling</li>
            <li>User authentication integration</li>
            <li>File management after upload</li>
          </ul>
          
          In a real application, you would:
          <ul>
            <li>Implement more robust progress tracking with Firebase uploadTask</li>
            <li>Add more sophisticated error handling and retry mechanisms</li>
            <li>Store file metadata in a database (Firestore) for better management</li>
            <li>Implement security rules for access control</li>
            <li>Add validation for file types and content</li>
          </ul>
        </Description>
      </Section>
    </DemoContainer>
  );
};

export default FileUploadIntegrationDemo; 