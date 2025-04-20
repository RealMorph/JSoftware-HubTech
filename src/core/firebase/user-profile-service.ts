import { User } from 'firebase/auth';
import { FirebaseAuthService } from './firebase-auth-service';
import { FirestoreService } from './firebase-db-service';
import { FirebaseStorageService } from './firebase-storage-service';
import { UserProfile } from '../types/user-profile';
import { auth, isInitialized } from './firebase-config';

// Mock user profile for development
const MOCK_PROFILE: UserProfile = {
  id: 'mock-uid-123',
  displayName: 'Demo User',
  email: 'demo@example.com',
  photoURL: 'https://via.placeholder.com/150',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  preferences: {
    theme: 'system',
    emailNotifications: true,
    pushNotifications: false
  }
};

export class UserProfileService {
  private static instance: UserProfileService;
  private readonly USERS_COLLECTION = 'users';
  private readonly PROFILE_IMAGES_PATH = 'profile-images';
  
  private firestoreService: FirestoreService;
  private storageService: FirebaseStorageService;
  
  // Flag to check if Firebase is properly initialized
  private isFirebaseInitialized: boolean;
  
  private constructor() {
    // Don't initialize authService in the constructor to avoid circular dependency
    this.firestoreService = FirestoreService.getInstance();
    this.storageService = FirebaseStorageService.getInstance();
    
    // Check if Firebase is properly initialized using the isInitialized flag
    this.isFirebaseInitialized = isInitialized;
    
    if (!this.isFirebaseInitialized) {
      console.log('Using mock UserProfileService for development');
    }
  }
  
  // Get the auth service on-demand to avoid circular dependency
  private getAuthService(): FirebaseAuthService {
    return FirebaseAuthService.getInstance();
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
    if (!this.isFirebaseInitialized) {
      console.log('Mock profile creation for:', user.email);
      return {
        ...MOCK_PROFILE,
        id: user.uid || MOCK_PROFILE.id,
        email: user.email || MOCK_PROFILE.email,
        displayName: user.displayName || MOCK_PROFILE.displayName,
        photoURL: user.photoURL || MOCK_PROFILE.photoURL
      };
    }
    
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
    if (!this.isFirebaseInitialized) {
      console.log('Mock profile lookup for ID:', userId);
      if (userId === MOCK_PROFILE.id) {
        return MOCK_PROFILE;
      }
      return null;
    }
    
    return await this.firestoreService.getDocumentData<UserProfile>(this.USERS_COLLECTION, userId);
  }
  
  /**
   * Get the current user's profile
   * @returns Current user profile or null if not authenticated
   */
  public async getCurrentUserProfile(): Promise<UserProfile | null> {
    if (!this.isFirebaseInitialized) {
      console.log('Mock current user profile lookup');
      return MOCK_PROFILE;
    }
    
    // Get auth service on-demand instead of using a stored reference
    const authService = this.getAuthService();
    const currentUser = authService.getCurrentUser();
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
    if (!this.isFirebaseInitialized) {
      console.log('Mock profile update for:', userId);
      return {
        ...MOCK_PROFILE,
        ...profileData,
        updatedAt: Date.now()
      };
    }
    
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
    if (!this.isFirebaseInitialized) {
      console.log('Mock profile image upload for:', userId);
      const mockURL = 'https://via.placeholder.com/150?text=MockImage';
      return {
        ...MOCK_PROFILE,
        photoURL: mockURL,
        updatedAt: Date.now()
      };
    }
    
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
    if (!this.isFirebaseInitialized) {
      console.log('Mock profile deletion for:', userId);
      return;
    }
    
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
    if (!this.isFirebaseInitialized) {
      console.log('Mock profile listener for:', userId);
      // Immediately call with mock data and return a no-op unsubscribe
      setTimeout(() => callback(MOCK_PROFILE), 0);
      return () => {};
    }
    
    return this.firestoreService.listenToDocument<UserProfile>(
      this.USERS_COLLECTION,
      userId,
      callback
    );
  }
} 