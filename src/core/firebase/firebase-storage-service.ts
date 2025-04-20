import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
  UploadMetadata
} from 'firebase/storage';
import { storage } from './firebase-config';

export class FirebaseStorageService {
  private static instance: FirebaseStorageService;

  private constructor() {}

  public static getInstance(): FirebaseStorageService {
    if (!FirebaseStorageService.instance) {
      FirebaseStorageService.instance = new FirebaseStorageService();
    }
    return FirebaseStorageService.instance;
  }

  private getStorageRef(path: string): StorageReference {
    return ref(storage, path);
  }

  /**
   * Upload a file to Firebase Storage
   * @param file The file to upload
   * @param path The path in storage where the file should be stored
   * @param metadata Optional metadata for the file
   * @returns The download URL of the uploaded file
   */
  public async uploadFile(
    file: File | Blob, 
    path: string, 
    metadata?: UploadMetadata
  ): Promise<string> {
    const storageRef = this.getStorageRef(path);
    
    // Upload the file
    await uploadBytes(storageRef, file, metadata);
    
    // Get and return the download URL
    return await getDownloadURL(storageRef);
  }

  /**
   * Get the download URL for a file
   * @param path The path to the file in storage
   * @returns The download URL
   */
  public async getFileUrl(path: string): Promise<string> {
    const storageRef = this.getStorageRef(path);
    return await getDownloadURL(storageRef);
  }

  /**
   * Delete a file from storage
   * @param path The path to the file in storage
   */
  public async deleteFile(path: string): Promise<void> {
    const storageRef = this.getStorageRef(path);
    await deleteObject(storageRef);
  }

  /**
   * List all files in a storage directory
   * @param path The path to the directory in storage
   * @returns An array of file references
   */
  public async listFiles(path: string): Promise<StorageReference[]> {
    const storageRef = this.getStorageRef(path);
    const result = await listAll(storageRef);
    return result.items;
  }

  /**
   * Upload an image with proper metadata and sizing
   * @param file The image file to upload
   * @param path The path in storage where the image should be stored
   * @returns The download URL of the uploaded image
   */
  public async uploadImage(file: File, path: string): Promise<string> {
    const metadata: UploadMetadata = {
      contentType: file.type,
      customMetadata: {
        'originalName': file.name,
        'uploadedAt': new Date().toISOString()
      }
    };
    
    return await this.uploadFile(file, path, metadata);
  }

  /**
   * Get the base storage URL for a path
   * @param path The path in storage
   * @returns The storage reference
   */
  public getStorageReference(path: string): StorageReference {
    return this.getStorageRef(path);
  }
} 