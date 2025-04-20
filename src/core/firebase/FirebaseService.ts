import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getFunctions, Functions } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { runMigrations, rollbackMigration } from './migration-runner';

// Firebase config should be in .env
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

/**
 * Firebase service singleton for managing Firebase connections
 */
export class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private db: Firestore;
  private auth: Auth;
  private functions: Functions;
  private storage: FirebaseStorage;

  private constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
    this.functions = getFunctions(this.app);
    this.storage = getStorage(this.app);
  }

  /**
   * Get the singleton instance of FirebaseService
   */
  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Get the Firestore database instance
   */
  public getDb(): Firestore {
    return this.db;
  }

  /**
   * Get the Firebase Auth instance
   */
  public getAuth(): Auth {
    return this.auth;
  }

  /**
   * Get the Firebase Functions instance
   */
  public getFunctions(): Functions {
    return this.functions;
  }

  /**
   * Get the Firebase Storage instance
   */
  public getStorage(): FirebaseStorage {
    return this.storage;
  }

  /**
   * Run all pending database migrations
   * @param targetVersion Optional target version to migrate to
   */
  public async runMigrations(targetVersion?: string): Promise<string[]> {
    return runMigrations();
  }

  /**
   * Rollback a specific migration
   * @param migrationId ID of the migration to rollback
   */
  public async rollbackMigration(migrationId: string): Promise<boolean> {
    return rollbackMigration(migrationId);
  }
} 