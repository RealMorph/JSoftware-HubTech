import React, { useRef, useState, useCallback, ChangeEvent, DragEvent } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { ThemeConfig, ThemeColors, TypographyConfig, BorderRadiusConfig } from '../../core/theme/consolidated-types';

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
 * Component-specific theme styles interface
 */
interface ThemeStyles {
  colors: {
    primary: string;
    error: string;
    border: string;
    background: {
      default: string;
      hover: string;
      active: string;
      disabled: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  typography: {
    fontSize: {
      xs: string;
      sm: string;
      md: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
    };
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
}

/**
 * Creates theme styles from DirectTheme context
 */
const createThemeStyles = (theme: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  const { getColor, getTypography, getSpacing, getBorderRadius } = theme;
  
  return {
    colors: {
      primary: getColor('primary.main'),
      error: getColor('error.main'),
      border: getColor('border'),
      background: {
        default: getColor('background.paper'),
        hover: getColor('action.hover'),
        active: getColor('action.active'),
        disabled: getColor('action.disabled')
      },
      text: {
        primary: getColor('text.primary'),
        secondary: getColor('text.secondary'),
        disabled: getColor('text.disabled')
      }
    },
    typography: {
      fontSize: {
        xs: String(getTypography('fontSize.xs')),
        sm: String(getTypography('fontSize.sm')),
        md: String(getTypography('fontSize.md'))
      },
      fontWeight: {
        normal: Number(getTypography('fontWeight.normal')),
        medium: Number(getTypography('fontWeight.medium'))
      }
    },
    spacing: {
      xs: getSpacing('1'),
      sm: getSpacing('2'),
      md: getSpacing('3'),
      lg: getSpacing('4')
    },
    borderRadius: {
      sm: getBorderRadius('sm'),
      md: getBorderRadius('md')
    }
  };
};

// Styled components
const Container = styled.div<{ $themeStyles: ThemeStyles; $disabled: boolean }>`
  width: 100%;
  opacity: ${props => (props.$disabled ? 0.7 : 1)};
`;

const Label = styled.label<{ $themeStyles: ThemeStyles }>`
  display: block;
  margin-bottom: ${props => props.$themeStyles.spacing.xs};
  color: ${props => props.$themeStyles.colors.text.primary};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
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
    ${props =>
      props.$hasError
        ? props.$themeStyles.colors.error
        : props.$isDragActive
        ? props.$themeStyles.colors.primary
        : props.$themeStyles.colors.border};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  background-color: ${props =>
    props.$isDragActive
      ? props.$themeStyles.colors.background.hover
      : props.$themeStyles.colors.background.default};
  padding: ${props => props.$themeStyles.spacing.lg};
  text-align: center;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease-in-out;
  color: ${props => props.$themeStyles.colors.text.primary};

  &:hover {
    background-color: ${props =>
      !props.$disabled && props.$themeStyles.colors.background.hover};
  }

  ${props =>
    props.$variant === 'inline' &&
    `
    padding: ${props.$themeStyles.spacing.sm};
    display: flex;
    align-items: center;
    justify-content: center;
  `}
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
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
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
    switch (props.$size) {
      case 'sm':
        return `${props.$themeStyles.spacing.xs} ${props.$themeStyles.spacing.sm}`;
      case 'lg':
        return `${props.$themeStyles.spacing.sm} ${props.$themeStyles.spacing.lg}`;
      default:
        return `${props.$themeStyles.spacing.sm} ${props.$themeStyles.spacing.md}`;
    }
  }};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  opacity: ${props => (props.$disabled ? 0.7 : 1)};
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${props =>
      !props.$disabled && props.$themeStyles.colors.background.hover};
  }
`;

const HelperText = styled.div<{ $themeStyles: ThemeStyles; $hasError: boolean }>`
  margin-top: ${props => props.$themeStyles.spacing.xs};
  font-size: ${props => props.$themeStyles.typography.fontSize.xs};
  color: ${props =>
    props.$hasError ? props.$themeStyles.colors.error : props.$themeStyles.colors.text.secondary};
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
  background-color: ${props => props.$themeStyles.colors.background.default};
  color: ${props => props.$themeStyles.colors.text};
`;

const FileExtension = styled.div<{ $themeStyles: ThemeStyles }>`
  font-size: 1.5rem;
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
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

const RemoveButton = styled.button<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  top: ${props => props.$themeStyles.spacing.xs};
  right: ${props => props.$themeStyles.spacing.xs};
  background-color: ${props => props.$themeStyles.colors.error};
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${props => props.$themeStyles.typography.fontSize.xs};
  opacity: 0;
  transition: opacity 0.2s ease-in-out;

  ${PreviewItem}:hover & {
    opacity: 1;
  }
`;

const FileList = styled.ul<{ $themeStyles: ThemeStyles }>`
  list-style: none;
  padding: 0;
  margin: ${props => props.$themeStyles.spacing.sm} 0 0;
`;

const FileListItem = styled.li<{ $themeStyles: ThemeStyles; $isLast: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.$themeStyles.spacing.sm};
  background-color: ${props => props.$themeStyles.colors.background.default};
  border: 1px solid ${props => props.$themeStyles.colors.border};
  margin-bottom: ${props => (!props.$isLast ? props.$themeStyles.spacing.xs : 0)};
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
`;

const FileInfo = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$themeStyles.spacing.xs};
`;

const FileNameText = styled.span<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.primary};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
`;

const FileSize = styled.span<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.secondary};
  font-size: ${props => props.$themeStyles.typography.fontSize.xs};
  margin-left: ${props => props.$themeStyles.spacing.sm};
`;

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
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

    // Render file list (non-preview mode)
    const renderFileList = () => {
      return (
        <FileList $themeStyles={themeStyles}>
          {files.map((file, index) => (
            <FileListItem
              key={file.name}
              $themeStyles={themeStyles}
              $isLast={index === files.length - 1}
            >
              <FileInfo $themeStyles={themeStyles}>
                <FileNameText $themeStyles={themeStyles}>{file.name}</FileNameText>
                <FileSize $themeStyles={themeStyles}>
                  {formatFileSize(file.size)}
                </FileSize>
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
    };

    const getFilePreview = (file: File, index: number) => {
      if (file.type.startsWith('image/')) {
        return (
          <PreviewItem key={file.name} $themeStyles={themeStyles}>
            <PreviewImage
              src={URL.createObjectURL(file)}
              alt={file.name}
              onLoad={() => URL.revokeObjectURL(file.name)}
            />
            <RemoveButton
              onClick={() => removeFile(index)}
              $themeStyles={themeStyles}
              type="button"
              aria-label="Remove file"
            >
              ×
            </RemoveButton>
          </PreviewItem>
        );
      }
      return null;
    };

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
