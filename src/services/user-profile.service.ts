import { doc, getDoc, setDoc, updateDoc, collection, Firestore } from 'firebase/firestore';
import { firestore } from '../core/firebase/firebase-config';
import { UserProfile } from '../models/user-profile.model';

export class UserProfileService {
  private static instance: UserProfileService;
  private db: Firestore;

  private constructor() {
    this.db = firestore;
  }

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return userDoc.data() as UserProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  public async createUserProfile(userId: string, userProfile: Partial<UserProfile>): Promise<void> {
    try {
      const userDocRef = doc(this.db, 'users', userId);
      const newUserProfile: UserProfile = {
        id: userId,
        email: userProfile.email || '',
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL,
        phoneNumber: userProfile.phoneNumber,
        emailVerified: userProfile.emailVerified || false,
        createdAt: new Date(),
        roles: userProfile.roles || ['user']
      };
      
      await setDoc(userDocRef, newUserProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  public async updateUserProfile(userId: string, userData: Partial<UserProfile>): Promise<void> {
    try {
      const userDocRef = doc(this.db, 'users', userId);
      await updateDoc(userDocRef, userData as any);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
} 