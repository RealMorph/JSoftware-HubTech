import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if we have valid Firebase credentials
const hasValidConfig = 
  import.meta.env.VITE_FIREBASE_API_KEY && 
  typeof import.meta.env.VITE_FIREBASE_API_KEY === 'string' &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes('AIzaSyDOCAbC123dEf456GhI789jKl01-MnO');

// Initialize Firebase only with valid config
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics;
let isInitialized = false;

if (hasValidConfig) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase services
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    analytics = getAnalytics(app);
    
    isInitialized = true;
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    createMockServices();
  }
} else {
  console.log('Firebase initialization skipped - using mock Firebase objects');
  createMockServices();
}

function createMockServices() {
  // Create mock Firebase objects for development
  app = { 
    name: 'mock-app',
    options: { ...firebaseConfig },
    automaticDataCollectionEnabled: false
  } as unknown as FirebaseApp;
  
  auth = {
    app,
    name: 'mock-auth',
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: async () => {}
  } as unknown as Auth;
  
  firestore = {
    app,
    type: 'firestore',
    toJSON: () => ({}),
  } as unknown as Firestore;
  
  storage = {
    app,
    maxUploadRetryTime: 0,
    maxOperationRetryTime: 0
  } as unknown as FirebaseStorage;
  
  analytics = {} as Analytics;
  
  isInitialized = false;
}

export { app, auth, firestore, storage, analytics, isInitialized }; 