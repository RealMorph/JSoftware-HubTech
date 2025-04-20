import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification
} from 'firebase/auth';
import { auth, firestore } from './firebase-config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../../models/user-profile.model';
import { UserProfileService } from '../../services/user-profile.service';

// Extended user interface to include methods needed for security settings
export interface ExtendedUser extends FirebaseUser {
  updatePassword: (newPassword: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
}

export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private userProfileService: UserProfileService;

  private constructor() {
    this.userProfileService = UserProfileService.getInstance();
  }

  public static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  public async registerWithEmailAndPassword(email: string, password: string): Promise<ExtendedUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user as ExtendedUser;
  }

  public async loginWithEmailAndPassword(email: string, password: string): Promise<ExtendedUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user as ExtendedUser;
  }

  public async loginWithGoogle(): Promise<ExtendedUser> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user as ExtendedUser;
  }

  public async logout(): Promise<void> {
    await signOut(auth);
  }

  public getCurrentUser(): ExtendedUser | null {
    return auth.currentUser as ExtendedUser | null;
  }

  public onAuthStateChanged(callback: (user: ExtendedUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback as (user: FirebaseUser | null) => void);
  }

  public isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
  
  public async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }
  
  public async updateUserPassword(newPassword: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    await updatePassword(auth.currentUser, newPassword);
  }
  
  public async sendVerificationEmail(): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    await sendEmailVerification(auth.currentUser);
  }

  /**
   * Get user by ID
   * @param userId The user ID
   */
  public async getUserById(userId: string): Promise<ExtendedUser | null> {
    try {
      const userDoc = await this.userProfileService.getUserProfile(userId);
      if (!userDoc) {
        return null;
      }
      
      // Get current authenticated user - if no user is authenticated or the ID doesn't match, return null
      const currentUser = this.getCurrentUser();
      if (!currentUser || currentUser.uid !== userId) {
        return null;
      }
      
      // Create extended user from current user
      return this.createExtendedUser(currentUser, userDoc);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Get user by email
   * @param email The user email
   */
  public async getUserByEmail(email: string): Promise<ExtendedUser | null> {
    try {
      // Query Firestore for user with this email
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      // Get the first matching user
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      
      // Get current authenticated user - if no user is authenticated or the ID doesn't match, return null
      const currentUser = this.getCurrentUser();
      if (!currentUser || currentUser.uid !== userId) {
        return null;
      }
      
      // Create extended user
      return this.createExtendedUser(currentUser, userDoc.data() as UserProfile);
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  private createExtendedUser(user: FirebaseUser, userProfile: UserProfile): ExtendedUser {
    // Merge Firebase user with user profile data
    const extendedUser = user as ExtendedUser;
    
    // Add any additional methods or properties needed
    // The ExtendedUser interface already includes the Firebase User methods
    
    return extendedUser;
  }
} 