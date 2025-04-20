import { User } from 'firebase/auth';
import { FirebaseAuthService } from './firebase-auth-service';
import { FirestoreService } from './firebase-db-service';
import { FirebaseStorageService } from './firebase-storage-service';
import { UserProfile } from '../types/user-profile';

export class UserProfileService {
  private static instance: UserProfileService;
  private readonly USERS_COLLECTION = 'users';
  private readonly PROFILE_IMAGES_PATH = 'profile-images';
  
  private authService: FirebaseAuthService;
  private firestoreService: FirestoreService;
  private storageService: FirebaseStorageService;
  
  private constructor() {
    this.authService = FirebaseAuthService.getInstance();
    this.firestoreService = FirestoreService.getInstance();
    this.storageService = FirebaseStorageService.getInstance();
  }
  
  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }
  
  /**
   * Create a new user profile after registration
   * @param user Firebase Auth user
   * @returns The created user profile
   */
  public async createUserProfile(user: User): Promise<UserProfile> {
    const now = Date.now();
    
    const newProfile: UserProfile = {
      id: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      createdAt: now,
      updatedAt: now,
      preferences: {
        theme: 'system',
        emailNotifications: true,
        pushNotifications: false
      }
    };
    
    await this.firestoreService.setDocument(this.USERS_COLLECTION, user.uid, newProfile);
    return newProfile;
  }
  
  /**
   * Get a user profile by ID
   * @param userId User ID
   * @returns User profile or null if not found
   */
  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    return await this.firestoreService.getDocumentData<UserProfile>(this.USERS_COLLECTION, userId);
  }
  
  /**
   * Get the current user's profile
   * @returns Current user profile or null if not authenticated
   */
  public async getCurrentUserProfile(): Promise<UserProfile | null> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return null;
    
    return await this.getUserProfile(currentUser.uid);
  }
  
  /**
   * Update user profile data
   * @param userId User ID
   * @param profileData Profile data to update
   * @returns Updated user profile
   */
  public async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const updateData = {
      ...profileData,
      updatedAt: Date.now()
    };
    
    await this.firestoreService.updateDocument(this.USERS_COLLECTION, userId, updateData);
    const updatedProfile = await this.getUserProfile(userId);
    
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated profile');
    }
    
    return updatedProfile;
  }
  
  /**
   * Upload a profile image and update the user profile
   * @param userId User ID
   * @param imageFile Image file to upload
   * @returns Updated user profile with new photo URL
   */
  public async uploadProfileImage(userId: string, imageFile: File): Promise<UserProfile> {
    const imagePath = `${this.PROFILE_IMAGES_PATH}/${userId}_${Date.now()}`;
    const photoURL = await this.storageService.uploadImage(imageFile, imagePath);
    
    return await this.updateUserProfile(userId, { photoURL });
  }
  
  /**
   * Update user preferences
   * @param userId User ID
   * @param preferences Preferences to update
   * @returns Updated user profile
   */
  public async updateUserPreferences(
    userId: string, 
    preferences: UserProfile['preferences']
  ): Promise<UserProfile> {
    return await this.updateUserProfile(userId, { preferences });
  }
  
  /**
   * Delete a user profile
   * @param userId User ID to delete
   */
  public async deleteUserProfile(userId: string): Promise<void> {
    await this.firestoreService.deleteDocument(this.USERS_COLLECTION, userId);
  }
  
  /**
   * Set up a listener for profile changes
   * @param userId User ID to listen for
   * @param callback Callback function when profile changes
   * @returns Unsubscribe function
   */
  public listenToProfileChanges(
    userId: string,
    callback: (profile: UserProfile | null) => void
  ): () => void {
    return this.firestoreService.listenToDocument<UserProfile>(
      this.USERS_COLLECTION,
      userId,
      callback
    );
  }
} 