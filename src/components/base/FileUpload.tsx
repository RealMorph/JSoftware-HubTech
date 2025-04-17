import React, { useRef, useState, useCallback, ChangeEvent, DragEvent } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

export type FileUploadVariant = 'default' | 'inline' | 'card';
export type FileUploadSize = 'sm' | 'md' | 'lg';

export interface FileUploadProps {
  /**
   * Accepted file types
   * @example ['image/*', '.pdf', 'application/msword']
   */
  accept?: string;

  /**
   * Allow multiple file selection
   */
  multiple?: boolean;

  /**
   * Maximum file size in bytes
   */
  maxSize?: number;

  /**
   * Minimum file size in bytes
   */
  minSize?: number;

  /**
   * Maximum number of files allowed
   */
  maxFiles?: number;

  /**
   * Custom validation function
   */
  /* eslint-disable-next-line no-unused-vars */
  validator?: (file: File) => { valid: boolean; message?: string };

  /**
   * Called when files are added
   */
  /* eslint-disable-next-line no-unused-vars */
  onFilesAdded: (files: File[]) => void;

  /**
   * Called when a file is rejected
   */
  /* eslint-disable-next-line no-unused-vars */
  onFileRejected?: (file: File, reason: string) => void;

  /**
   * Custom drop zone text
   */
  dropZoneText?: string;

  /**
   * Custom button text
   */
  buttonText?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Error message
   */
  error?: string | boolean;

  /**
   * Whether the component is disabled
   */
  disabled?: boolean;

  /**
   * Component visual variant
   */
  variant?: FileUploadVariant;

  /**
   * Component size
   */
  size?: FileUploadSize;

  /**
   * Show file preview (for images)
   */
  showPreview?: boolean;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Label for the file input
   */
  label?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;
}

/**
 * Helper function to format file size
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * ThemeStyles interface for FileUpload component
 */
interface ThemeStyles {
  colors: {
    primary: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    textDisabled: string;
    border: string;
    error: string;
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
    fontWeight: {
      medium: string;
      bold: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
  };
}

/**
 * Function to create ThemeStyles from DirectThemeProvider
 */
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getSpacing, getBorderRadius } = themeContext;

  return {
    colors: {
      primary: getColor('primary', '#1976d2'),
      background: getColor('background', '#ffffff'),
      backgroundSecondary: getColor('background.secondary', '#f5f5f5'),
      text: getColor('text.primary', '#333333'),
      textSecondary: getColor('text.secondary', '#666666'),
      textDisabled: getColor('text.disabled', '#999999'),
      border: getColor('border', '#e0e0e0'),
      error: getColor('error', '#f44336'),
    },
    spacing: {
      xs: getSpacing('2', '0.5rem'),
      sm: getSpacing('3', '0.75rem'),
      md: getSpacing('4', '1rem'),
      lg: getSpacing('6', '1.5rem'),
    },
    borderRadius: {
      sm: getBorderRadius('sm', '4px'),
      md: getBorderRadius('md', '8px'),
    },
    typography: {
      fontFamily: getTypography('fontFamily.base', 'sans-serif') as string,
      fontWeight: {
        medium: '500',
        bold: '700',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
      },
    },
  };
}

// Styled components
const Container = styled.div<{ $themeStyles: ThemeStyles; $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  font-family: ${props => props.$themeStyles.typography.fontFamily};
  color: ${props =>
    props.$disabled ? props.$themeStyles.colors.textDisabled : props.$themeStyles.colors.text};
`;

const Label = styled.label<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.xs};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  display: flex;
  align-items: center;
`;

const RequiredIndicator = styled.span<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.error};
  margin-left: ${props => props.$themeStyles.spacing.xs};
`;

const DropZone = styled.div<{
  $themeStyles: ThemeStyles;
  $isDragActive: boolean;
  $hasError: boolean;
  $disabled: boolean;
  $variant: FileUploadVariant;
  $size: FileUploadSize;
}>`
  border: 2px dashed
    ${props => {
      if (props.$disabled) return props.$themeStyles.colors.border;
      if (props.$hasError) return props.$themeStyles.colors.error;
      if (props.$isDragActive) return props.$themeStyles.colors.primary;
      return props.$themeStyles.colors.border;
    }};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  background-color: ${props => props.$themeStyles.colors.background};
  padding: ${props => {
    if (props.$variant === 'inline') return '0.5rem 1rem';
    else if (props.$size === 'sm') return '1rem';
    else if (props.$size === 'lg') return '2rem';
    else return '1.5rem';
  }};
  display: flex;
  flex-direction: ${props => (props.$variant === 'inline' ? 'row' : 'column')};
  align-items: center;
  justify-content: center;
  gap: ${props => props.$themeStyles.spacing.xs};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease-in-out;
`;

const UploadIcon = styled.div<{ $themeStyles: ThemeStyles }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${props => props.$themeStyles.colors.primary};
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: ${props => props.$themeStyles.spacing.xs};
`;

const BrowseButton = styled.button<{
  $themeStyles: ThemeStyles;
  $disabled: boolean;
  $size: FileUploadSize;
}>`
  background-color: ${props => props.$themeStyles.colors.primary};
  color: #ffffff;
  border: none;
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  padding: ${props => {
    if (props.$size === 'sm') return '0.25rem 0.5rem';
    else if (props.$size === 'lg') return '0.5rem 1.5rem';
    else return '0.375rem 1rem';
  }};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: inherit;
  opacity: ${props => (props.$disabled ? 0.7 : 1)};
  transition: background-color 0.2s ease-in-out;
  font-family: inherit;
`;

const HelperText = styled.div<{ $themeStyles: ThemeStyles; $hasError: boolean }>`
  margin-top: ${props => props.$themeStyles.spacing.xs};
  font-size: ${props => props.$themeStyles.typography.fontSize.xs};
  color: ${props =>
    props.$hasError ? props.$themeStyles.colors.error : props.$themeStyles.colors.textSecondary};
`;

const PreviewContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${props => props.$themeStyles.spacing.md};
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.$themeStyles.spacing.xs};
`;

const PreviewItem = styled.div<{ $themeStyles: ThemeStyles }>`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  overflow: hidden;
  border: 1px solid ${props => props.$themeStyles.colors.border};
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PreviewFile = styled.div<{ $themeStyles: ThemeStyles }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: ${props => props.$themeStyles.typography.fontSize.xs};
  padding: ${props => props.$themeStyles.spacing.xs};
  background-color: ${props => props.$themeStyles.colors.backgroundSecondary};
  color: ${props => props.$themeStyles.colors.text};
`;

const FileExtension = styled.div<{ $themeStyles: ThemeStyles }>`
  font-size: 1.5rem;
  font-weight: ${props => props.$themeStyles.typography.fontWeight.bold};
  margin-bottom: 0.25rem;
  color: ${props => props.$themeStyles.colors.primary};
  text-transform: uppercase;
`;

const FileName = styled.div`
  font-size: 0.7rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-align: center;
`;

const RemoveButton = styled.button<{ $themeStyles: ThemeStyles; $preview?: boolean }>`
  position: ${props => (props.$preview ? 'absolute' : 'static')};
  top: ${props => (props.$preview ? '0' : 'auto')};
  right: ${props => (props.$preview ? '0' : 'auto')};
  width: ${props => (props.$preview ? '20px' : 'auto')};
  height: ${props => (props.$preview ? '20px' : 'auto')};
  background-color: ${props => (props.$preview ? 'rgba(0, 0, 0, 0.5)' : 'transparent')};
  color: ${props => (props.$preview ? 'white' : props.$themeStyles.colors.textSecondary)};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => (props.$preview ? '0.75rem' : '1rem')};
`;

const FileList = styled.ul<{ $themeStyles: ThemeStyles }>`
  list-style: none;
  padding: 0;
  margin-top: ${props => props.$themeStyles.spacing.xs};
`;

const FileListItem = styled.li<{ $themeStyles: ThemeStyles; $isLast: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.$themeStyles.spacing.xs};
  border-bottom: ${props =>
    props.$isLast ? 'none' : `1px solid ${props.$themeStyles.colors.border}`};
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileNameText = styled.span<{ $themeStyles: ThemeStyles }>`
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  margin-bottom: 0.25rem;
`;

const FileSize = styled.span<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.textSecondary};
  font-size: ${props => props.$themeStyles.typography.fontSize.xs};
`;

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  /* eslint-disable-next-line no-unused-vars */
  (props, _ref) => {
  const {
    accept,
    multiple = false,
    maxSize,
    minSize,
    maxFiles,
    validator,
    onFilesAdded,
    onFileRejected,
    dropZoneText = 'Drag and drop files here, or',
    buttonText = 'Browse Files',
    helperText,
    error,
    disabled = false,
    variant = 'default',
    size = 'md',
    showPreview = true,
    className,
    label,
    required = false,
    ...rest
  } = props;

  const theme = useDirectTheme();
    const themeStyles = createThemeStyles(theme);

  const fileInputRef = useRef<HTMLInputElement>(null);
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  const ownRef = useRef<HTMLInputElement>(null);
    // Using forwardRef for any external ref handling

  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Validate a file based on props
  const validateFile = useCallback(
    (file: File): { valid: boolean; message?: string } => {
      // Check file size
      if (maxSize && file.size > maxSize) {
        return {
          valid: false,
          message: `File is too large. Maximum size is ${formatFileSize(maxSize)}.`,
        };
      }

      if (minSize && file.size < minSize) {
        return {
          valid: false,
          message: `File is too small. Minimum size is ${formatFileSize(minSize)}.`,
        };
      }

      // Check file type if accept is provided
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const fileExtension = '.' + file.name.split('.').pop();

        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            // Extension check
            return fileExtension.toLowerCase() === type.toLowerCase();
          } else if (type.endsWith('/*')) {
            // MIME type wildcard (e.g., image/*)
            const baseMimeType = type.split('/')[0];
            return fileType.startsWith(baseMimeType + '/');
          } else {
            // Exact MIME type
            return fileType === type;
          }
        });

        if (!isAccepted) {
          return { valid: false, message: `File type not accepted. Allowed types: ${accept}.` };
        }
      }

      // Custom validation if provided
      if (validator) {
        return validator(file);
      }

      return { valid: true };
    },
    [maxSize, minSize, accept, validator]
  );

    // Process selected files
    const handleFiles = useCallback(
      (selectedFiles: File[]) => {
        if (maxFiles && files.length + selectedFiles.length > maxFiles) {
          onFileRejected?.(selectedFiles[0], `Maximum number of files (${maxFiles}) exceeded.`);
          return;
        }

        const validFiles: File[] = [];

        selectedFiles.forEach(file => {
          const validationResult = validateFile(file);

          if (validationResult.valid) {
            validFiles.push(file);
          } else {
            onFileRejected?.(file, validationResult.message || 'File rejected.');
          }
        });

        if (validFiles.length > 0) {
          const newFiles = [...files, ...validFiles];
          setFiles(newFiles);
          onFilesAdded(newFiles);
        }
      },
      [files, maxFiles, onFileRejected, validateFile, onFilesAdded]
    );

  // Handle drag events
  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragActive(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  // Handle file drop
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    },
      [disabled, handleFiles]
  );

  // Handle file selection from input
    const handleInputChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
        }
      },
      [handleFiles]
  );

  // Handle click on drop zone
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Remove a file
  const removeFile = useCallback(
    (index: number) => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      setFiles(newFiles);
      onFilesAdded(newFiles);
    },
    [files, onFilesAdded]
  );

  // Get file preview component
  const getFilePreview = useCallback(
    (file: File, index: number) => {
      const isImage = file.type.startsWith('image/');

      return (
          <PreviewItem key={index} $themeStyles={themeStyles}>
          {isImage ? (
              <PreviewImage src={URL.createObjectURL(file)} alt={file.name} />
            ) : (
              <PreviewFile $themeStyles={themeStyles}>
                <FileExtension $themeStyles={themeStyles}>
                  {file.name.split('.').pop()?.substring(0, 3)}
                </FileExtension>
                <FileName>{file.name}</FileName>
              </PreviewFile>
            )}
            <RemoveButton
            onClick={() => removeFile(index)}
              $themeStyles={themeStyles}
              $preview={true}
            type="button"
            aria-label="Remove file"
          >
            ×
            </RemoveButton>
          </PreviewItem>
      );
    },
      [removeFile, themeStyles]
  );

  // Render file list (non-preview mode)
  const renderFileList = useCallback(() => {
    if (files.length === 0) return null;

    return (
        <FileList $themeStyles={themeStyles}>
        {files.map((file, index) => (
            <FileListItem
            key={index}
              $themeStyles={themeStyles}
              $isLast={index === files.length - 1}
            >
              <FileInfo>
                <FileNameText $themeStyles={themeStyles}>{file.name}</FileNameText>
                <FileSize $themeStyles={themeStyles}>{formatFileSize(file.size)}</FileSize>
              </FileInfo>
              <RemoveButton
              onClick={() => removeFile(index)}
                $themeStyles={themeStyles}
              type="button"
              aria-label="Remove file"
            >
              ×
              </RemoveButton>
            </FileListItem>
          ))}
        </FileList>
      );
    }, [files, removeFile, themeStyles]);

  return (
      <Container className={className} $themeStyles={themeStyles} $disabled={disabled}>
      {label && (
          <Label htmlFor={fileInputRef.current?.id} $themeStyles={themeStyles}>
          {label}
            {required && <RequiredIndicator $themeStyles={themeStyles}>*</RequiredIndicator>}
          </Label>
      )}

        <DropZone
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
          $themeStyles={themeStyles}
          $isDragActive={isDragActive}
          $hasError={!!error}
          $disabled={disabled}
          $variant={variant}
          $size={size}
        >
          {variant !== 'inline' && <UploadIcon $themeStyles={themeStyles}>↑</UploadIcon>}

        <div>
          {dropZoneText}{' '}
            <BrowseButton
            type="button"
              onClick={e => {
                e.stopPropagation();
                handleClick();
              }}
            disabled={disabled}
              $themeStyles={themeStyles}
              $disabled={disabled}
              $size={size}
          >
            {buttonText}
            </BrowseButton>
        </div>
        </DropZone>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        style={{ display: 'none' }}
        {...rest}
      />

      {(helperText || error) && (
          <HelperText $themeStyles={themeStyles} $hasError={!!error}>
            {typeof error === 'string' ? error : helperText}
          </HelperText>
      )}

      {showPreview && files.length > 0 && (
          <PreviewContainer $themeStyles={themeStyles}>
          {files.map((file, index) => getFilePreview(file, index))}
          </PreviewContainer>
      )}

      {!showPreview && renderFileList()}
      </Container>
    );
  }
  );

FileUpload.displayName = 'FileUpload';
