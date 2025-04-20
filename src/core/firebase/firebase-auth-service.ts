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
import { UserProfile } from '../types/user-profile';

// Extended user interface to include methods needed for security settings
export interface ExtendedUser extends FirebaseUser {
  updatePassword: (newPassword: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
}

// Mock user for development
const MOCK_USER: Partial<ExtendedUser> = {
  uid: 'mock-uid-123',
  email: 'demo@example.com',
  displayName: 'Demo User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: Date.now().toString(),
    lastSignInTime: Date.now().toString()
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-id-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    signInProvider: 'password',
    expirationTime: new Date(Date.now() + 3600000).toString(),
    issuedAtTime: new Date().toString(),
    authTime: new Date().toString(),
    claims: {},
    signInSecondFactor: null
  }),
  reload: async () => {},
  toJSON: () => ({}),
  updatePassword: async () => {},
  sendEmailVerification: async () => {},
  // Add other required methods as needed
};

export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private mockCallbacks: Array<(user: ExtendedUser | null) => void> = [];
  private currentUser: ExtendedUser | null = null;
  
  // Check if we have a properly initialized Firebase
  private isFirebaseInitialized: boolean;
  // Cached UserProfileService to avoid recreating it each time
  private _userProfileService: any = null;

  private constructor() {
    // Don't initialize userProfileService here to avoid circular dependency
    
    // Check if Firebase auth is properly initialized
    this.isFirebaseInitialized = auth && typeof auth.onAuthStateChanged === 'function';
    
    if (this.isFirebaseInitialized) {
      console.log('Firebase Auth initialized properly');
    } else {
      console.log('Using mock Firebase Auth for development');
      // Initialize with mock user for development
      this.currentUser = MOCK_USER as ExtendedUser;
    }
  }

  // Get UserProfileService on demand to avoid circular dependency
  private getUserProfileService() {
    // Lazy initialization of UserProfileService
    if (!this._userProfileService) {
      // Use dynamic import to break circular dependency
      const { UserProfileService } = require('./user-profile-service');
      this._userProfileService = UserProfileService.getInstance();
    }
    return this._userProfileService;
  }

  public static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  public async registerWithEmailAndPassword(email: string, password: string): Promise<ExtendedUser> {
    if (!this.isFirebaseInitialized) {
      console.log('Mock registration with:', email);
      return MOCK_USER as ExtendedUser;
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user as ExtendedUser;
  }

  public async loginWithEmailAndPassword(email: string, password: string): Promise<ExtendedUser> {
    if (!this.isFirebaseInitialized) {
      console.log('Mock login with:', email);
      return MOCK_USER as ExtendedUser;
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user as ExtendedUser;
  }

  public async loginWithGoogle(): Promise<ExtendedUser> {
    if (!this.isFirebaseInitialized) {
      console.log('Mock Google login');
      return MOCK_USER as ExtendedUser;
    }
    
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user as ExtendedUser;
  }

  public async logout(): Promise<void> {
    if (!this.isFirebaseInitialized) {
      console.log('Mock logout');
      this.currentUser = null;
      // Notify mock callbacks
      this.mockCallbacks.forEach(callback => callback(null));
      return;
    }
    
    await signOut(auth);
  }

  public getCurrentUser(): ExtendedUser | null {
    if (!this.isFirebaseInitialized) {
      return this.currentUser;
    }
    
    return auth.currentUser as ExtendedUser | null;
  }

  public onAuthStateChanged(callback: (user: ExtendedUser | null) => void): () => void {
    if (!this.isFirebaseInitialized) {
      // For mock implementation, store callback and immediately invoke it with current user
      this.mockCallbacks.push(callback);
      setTimeout(() => callback(this.currentUser), 0);
      
      // Return unsubscribe function
      return () => {
        this.mockCallbacks = this.mockCallbacks.filter(cb => cb !== callback);
      };
    }
    
    return onAuthStateChanged(auth, callback as (user: FirebaseUser | null) => void);
  }

  public isAuthenticated(): boolean {
    if (!this.isFirebaseInitialized) {
      return !!this.currentUser;
    }
    
    return !!auth.currentUser;
  }
  
  public async resetPassword(email: string): Promise<void> {
    if (!this.isFirebaseInitialized) {
      console.log('Mock password reset for:', email);
      return;
    }
    
    await sendPasswordResetEmail(auth, email);
  }
  
  public async updateUserPassword(newPassword: string): Promise<void> {
    if (!this.isFirebaseInitialized) {
      console.log('Mock password update');
      return;
    }
    
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    await updatePassword(auth.currentUser, newPassword);
  }
  
  public async sendVerificationEmail(): Promise<void> {
    if (!this.isFirebaseInitialized) {
      console.log('Mock verification email sent');
      return;
    }
    
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
    if (!this.isFirebaseInitialized) {
      console.log('Mock get user by ID:', userId);
      if (userId === MOCK_USER.uid) {
        return MOCK_USER as ExtendedUser;
      }
      return null;
    }
    
    try {
      const userDoc = await this.getUserProfileService().getUserProfile(userId);
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
    if (!this.isFirebaseInitialized) {
      console.log('Mock get user by email:', email);
      if (email === MOCK_USER.email) {
        return MOCK_USER as ExtendedUser;
      }
      return null;
    }
    
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
      
      // Use the UserProfileService to get the complete user profile
      const userProfileService = this.getUserProfileService();
      const userProfile = await userProfileService.getUserProfile(userId);
      
      if (!userProfile) {
        return null;
      }
      
      // Create extended user with profile data
      return this.createExtendedUser(currentUser, userProfile);
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Create an extended user from an auth user and profile
   * @param authUser The authenticated user
   * @param userProfile The user profile
   * @returns The extended user
   */
  private createExtendedUser(authUser: FirebaseUser, userProfile: UserProfile): ExtendedUser {
    return {
      uid: authUser.uid,
      email: authUser.email || '',
      displayName: authUser.displayName || userProfile.displayName || '',
      emailVerified: authUser.emailVerified,
      photoURL: authUser.photoURL || userProfile.photoURL || '',
      ...userProfile
    };
  }
} 