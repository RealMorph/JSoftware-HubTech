import React, { useRef, useState, useCallback, ChangeEvent, DragEvent } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../core/theme/theme-context';
import { getThemeValue } from '../../core/theme/styled';

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
  validator?: (file: File) => { valid: boolean; message?: string };
  
  /**
   * Called when files are added
   */
  onFilesAdded: (files: File[]) => void;
  
  /**
   * Called when a file is rejected
   */
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Theme helper function
const themeValue = (props: any, path: string) => {
  return props.theme?.currentTheme
    ? getThemeValue(props.theme.currentTheme, path)
    : '';
};

const Container = styled.div<{ disabled?: boolean; hasError?: boolean; size: FileUploadSize; variant: FileUploadVariant }>`
  display: flex;
  flex-direction: column;
  font-family: ${props => themeValue(props, 'typography.family.primary') || 'sans-serif'};
  color: ${props => 
    props.disabled 
      ? themeValue(props, 'colors.gray.400') 
      : themeValue(props, 'colors.gray.900')};

  ${({ size }) => {
    switch (size) {
      case 'sm': return 'font-size: 0.875rem;';
      case 'lg': return 'font-size: 1.125rem;';
      default: return 'font-size: 1rem;';
    }
  }}
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const Required = styled.span`
  color: ${props => themeValue(props, 'colors.error.500')};
  margin-left: 0.25rem;
`;

const DropZone = styled.div<{ isDragActive: boolean; disabled?: boolean; hasError?: boolean; size: FileUploadSize; variant: FileUploadVariant }>`
  border: 2px dashed ${props => {
    if (props.disabled) return themeValue(props, 'colors.gray.300');
    if (props.hasError) return themeValue(props, 'colors.error.500');
    if (props.isDragActive) return themeValue(props, 'colors.primary.500');
    return themeValue(props, 'colors.gray.300');
  }};
  border-radius: ${props => themeValue(props, 'borderRadius.md') || '4px'};
  background-color: ${props => {
    if (props.disabled) return themeValue(props, 'colors.gray.100');
    if (props.isDragActive) return themeValue(props, 'colors.primary.50');
    return themeValue(props, 'colors.gray.50');
  }};
  padding: ${({ variant, size }) => {
    if (variant === 'inline') return '0.5rem';
    if (size === 'sm') return '1rem';
    if (size === 'lg') return '2.5rem';
    return '1.5rem';
  }};
  text-align: center;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: ${({ variant }) => variant === 'inline' ? 'row' : 'column'};
  align-items: center;
  justify-content: center;
  gap: 1rem;

  &:hover {
    ${props => !props.disabled && !props.hasError && `
      border-color: ${themeValue(props, 'colors.primary.500')};
      background-color: ${themeValue(props, 'colors.primary.50')}10;
    `}
  }

  ${({ variant }) => variant === 'card' && `
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `}
`;

const UploadIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${props => themeValue(props, 'colors.primary.500')};
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  
  &:before {
    content: "↑";
  }
`;

const BrowseButton = styled.button<{ disabled?: boolean; size: FileUploadSize }>`
  background-color: ${props => themeValue(props, 'colors.primary.500')};
  color: #ffffff;
  border: none;
  border-radius: ${props => themeValue(props, 'borderRadius.sm') || '2px'};
  padding: ${({ size }) => {
    if (size === 'sm') return '0.25rem 0.5rem';
    if (size === 'lg') return '0.5rem 1.5rem';
    return '0.375rem 1rem';
  }};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  font-size: inherit;
  opacity: ${({ disabled }) => disabled ? 0.7 : 1};
  transition: background-color 0.2s ease-in-out;
  font-family: inherit;
  
  &:hover {
    ${props => !props.disabled && `
      background-color: ${themeValue(props, 'colors.primary.600')};
    `}
  }
`;

const FileInput = styled.input`
  display: none;
`;

const HelperText = styled.div<{ hasError?: boolean }>`
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: ${props => 
    props.hasError 
      ? themeValue(props, 'colors.error.500') 
      : themeValue(props, 'colors.gray.500')};
`;

const PreviewContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PreviewItem = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: ${props => themeValue(props, 'borderRadius.sm') || '2px'};
  overflow: hidden;
  border: 1px solid ${props => themeValue(props, 'colors.gray.200')};
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PreviewFile = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 0.75rem;
  padding: 0.5rem;
  background-color: ${props => themeValue(props, 'colors.gray.50')};
  color: ${props => themeValue(props, 'colors.gray.900')};
`;

const FileExt = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: ${props => themeValue(props, 'colors.primary.500')};
  text-transform: uppercase;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
  
  &:before {
    content: "×";
  }
`;

const FileList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
`;

const FileItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid ${props => themeValue(props, 'colors.gray.200')};
  
  &:last-child {
    border-bottom: none;
  }
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileName = styled.span`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.span`
  color: ${props => themeValue(props, 'colors.gray.500')};
  font-size: 0.75rem;
`;

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>((props, ref) => {
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

  const { currentTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ownRef = useRef<HTMLInputElement>(null);
  const inputRef = ref || ownRef;

  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const validateFile = useCallback((file: File): { valid: boolean; message?: string } => {
    // Check file size
    if (maxSize && file.size > maxSize) {
      return { valid: false, message: `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.` };
    }
    
    if (minSize && file.size < minSize) {
      return { valid: false, message: `File "${file.name}" is too small. Minimum size is ${formatFileSize(minSize)}.` };
    }
    
    // Check file type
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      
      const fileType = file.type;
      const fileExtension = `.${file.name.split('.').pop()}`;
      
      const isAcceptedType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          // Extension check
          return type.toLowerCase() === fileExtension.toLowerCase();
        } else if (type.endsWith('/*')) {
          // Mime type group check (e.g., image/*)
          const typeGroup = type.split('/')[0];
          return fileType.startsWith(`${typeGroup}/`);
        } else {
          // Exact mime type check
          return type === fileType;
        }
      });
      
      if (!isAcceptedType) {
        return { valid: false, message: `File "${file.name}" has an invalid file type. Accepted types: ${accept}.` };
      }
    }
    
    // Custom validation
    if (validator) {
      return validator(file);
    }
    
    return { valid: true };
  }, [accept, maxSize, minSize, validator]);

  const handleFileChange = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;
    
    const newValidFiles: File[] = [];
    const currentFilesCount = multiple ? files.length : 0;
    
    // Check max files constraint
    if (maxFiles && currentFilesCount + selectedFiles.length > maxFiles) {
      const message = `Maximum number of files (${maxFiles}) exceeded.`;
      console.warn(message);
      onFileRejected?.(new File([], "max-files-exceeded"), message);
      return;
    }
    
    Array.from(selectedFiles).forEach(file => {
      const { valid, message } = validateFile(file);
      
      if (valid) {
        newValidFiles.push(file);
      } else if (onFileRejected && message) {
        onFileRejected(file, message);
      }
    });
    
    if (newValidFiles.length > 0) {
      const updatedFiles = multiple 
        ? [...files, ...newValidFiles]
        : newValidFiles;
      
      setFiles(updatedFiles);
      onFilesAdded(updatedFiles);
    }
  }, [disabled, files, maxFiles, multiple, onFileRejected, onFilesAdded, validateFile]);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event.target.files);
    // Reset the input value so the same file can be selected again
    if (event.target.value) event.target.value = '';
  }, [handleFileChange]);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    
    if (disabled) return;
    handleFileChange(event.dataTransfer.files);
  }, [handleFileChange, disabled]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragActive && !disabled) {
      setIsDragActive(true);
    }
  }, [isDragActive, disabled]);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const removeFile = useCallback((index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesAdded(newFiles);
  }, [files, onFilesAdded]);

  const getFilePreview = useCallback((file: File, index: number) => {
    const isImage = file.type.startsWith('image/');
    
    return (
      <PreviewItem key={`${file.name}-${index}`}>
        {isImage ? (
          <PreviewImage src={URL.createObjectURL(file)} alt={file.name} />
        ) : (
          <PreviewFile>
            <FileExt>{file.name.split('.').pop()}</FileExt>
            <span>{file.name.length > 10 ? `${file.name.slice(0, 10)}...` : file.name}</span>
          </PreviewFile>
        )}
        <RemoveButton onClick={() => removeFile(index)} />
      </PreviewItem>
    );
  }, [removeFile]);

  const renderFileList = useCallback(() => {
    if (!files.length) return null;
    
    return (
      <FileList>
        {files.map((file, index) => (
          <FileItem key={`${file.name}-${index}`}>
            <FileInfo>
              <FileName>{file.name}</FileName>
              <FileSize>{formatFileSize(file.size)}</FileSize>
            </FileInfo>
            <RemoveButton onClick={() => removeFile(index)} />
          </FileItem>
        ))}
      </FileList>
    );
  }, [files, removeFile]);

  return (
    <Container
      className={className}
      disabled={disabled}
      hasError={!!error}
      size={size}
      variant={variant}
    >
      {label && (
        <Label htmlFor={fileInputRef.current?.id}>
          {label}
          {required && <Required>*</Required>}
        </Label>
      )}
      
      <DropZone
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        isDragActive={isDragActive}
        disabled={disabled}
        hasError={!!error}
        size={size}
        variant={variant}
      >
        {variant !== 'inline' && <UploadIcon />}
        
        <div>
          {dropZoneText}
          {' '}
          <BrowseButton
            type="button"
            onClick={handleClick}
            disabled={disabled}
            size={size}
          >
            {buttonText}
          </BrowseButton>
        </div>
      </DropZone>
      
      <FileInput
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        {...rest}
      />
      
      {(helperText || error) && (
        <HelperText hasError={!!error}>
          {typeof error === 'string' ? error : helperText}
        </HelperText>
      )}
      
      {showPreview && files.length > 0 && (
        <PreviewContainer>
          {files.map((file, index) => getFilePreview(file, index))}
        </PreviewContainer>
      )}
      
      {!showPreview && renderFileList()}
    </Container>
  );
});

FileUpload.displayName = 'FileUpload'; 