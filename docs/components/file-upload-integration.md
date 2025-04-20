# FileUpload Integration with Firebase Storage

This document provides guidance on integrating the FileUpload component with Firebase Storage for real file uploads in your application.

## Overview

The FileUpload component provides a user interface for selecting files, but by itself, it doesn't handle the actual uploading to a server. This integration guide shows how to connect the component to Firebase Storage to provide complete file upload functionality.

## Requirements

- Firebase project with Storage enabled
- Firebase configuration integrated into your app
- Authentication setup (for user-specific uploads)

## Implementation Steps

### 1. Basic Integration

```tsx
import { FileUpload } from '../components/base/FileUpload';
import { FirebaseStorageService } from '../core/firebase/firebase-storage-service';
import { useAuth } from '../core/auth/AuthProvider';

const MyUploadComponent = () => {
  const { user } = useAuth();
  const storageService = FirebaseStorageService.getInstance();
  
  const handleFilesAdded = async (files: File[]) => {
    if (!user) return;
    
    // Upload each file
    for (const file of files) {
      try {
        const storagePath = `users/${user.id}/uploads/${Date.now()}_${file.name}`;
        const downloadUrl = await storageService.uploadFile(file, storagePath);
        console.log(`File uploaded successfully: ${downloadUrl}`);
      } catch (error) {
        console.error(`Error uploading file: ${file.name}`, error);
      }
    }
  };
  
  return (
    <FileUpload
      label="Upload Files"
      onFilesAdded={handleFilesAdded}
      multiple
      maxSize={5 * 1024 * 1024} // 5MB
    />
  );
};
```

### 2. Advanced Integration with Progress Tracking

For a better user experience, you can track upload progress using Firebase's upload task:

```tsx
// Import necessary Firebase Storage functions
import { uploadBytesResumable, getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../core/firebase/firebase-config';

// Inside your component
const uploadWithProgress = async (file: File) => {
  if (!user) return;
  
  const storagePath = `users/${user.id}/uploads/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, storagePath);
  
  // Create upload task
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  // Set up progress tracking
  uploadTask.on(
    'state_changed',
    (snapshot) => {
      // Calculate and update progress
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Upload progress: ${progress}%`);
      // Update your UI with this progress value
    },
    (error) => {
      // Handle errors
      console.error('Upload error:', error);
    },
    async () => {
      // Handle successful upload
      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
      console.log('File uploaded successfully:', downloadUrl);
      // Update your UI with the download URL
    }
  );
};
```

### 3. Handling Large Files

For large files, consider:

1. Adding chunked uploads
2. Implementing resume functionality
3. Adding file compression (for images)

## Security Considerations

1. **Storage Rules**: Ensure your Firebase Storage rules are properly configured:

```
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

2. **File Validation**: Always validate files on both client and server:
   - Check file size
   - Verify file type
   - Scan for malicious content if possible

3. **Authentication**: Ensure users are authenticated before allowing uploads

## Demo Application

A complete integration demo is available at `/demos/file-upload` which demonstrates:

- Integration with Firebase Storage
- Progress tracking
- Error handling
- File preview after upload

To run the demo:

1. Navigate to `/demos/file-upload` in your application
2. Sign in with a valid user account
3. Select files to upload
4. View upload progress and download URLs

## Extending the Solution

The current implementation can be extended with:

1. **File Management UI**: Add a UI for listing, downloading, and deleting uploaded files
2. **Metadata Storage**: Store file metadata in Firestore for better querying and management
3. **Image Processing**: Add server-side image processing for thumbnails and optimizations
4. **Public Sharing**: Add functionality to generate public sharing links
5. **Upload Queuing**: Implement a queue for handling multiple file uploads efficiently

## Troubleshooting

Common issues and solutions:

1. **Permission Denied**: Check Firebase Storage rules and authentication status
2. **Upload Errors**: Verify network connectivity and file size limits
3. **Missing Uploads**: Ensure correct storage paths and check Firebase console
4. **Performance Issues**: Consider optimizing large file uploads with compression

## Related Resources

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [FileUpload Component Documentation](./file-upload.md)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/storage/security) 