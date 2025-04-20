import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  DocumentReference,
  CollectionReference,
  addDoc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { firestore } from './firebase-config';

// Mock data for development
const MOCK_DATA = new Map<string, Map<string, any>>();

export class FirestoreService {
  private static instance: FirestoreService;
  private isFirestoreInitialized: boolean;

  private constructor() {
    // Check if Firestore is properly initialized
    this.isFirestoreInitialized = !!firestore && 
      typeof firestore === 'object' && 
      firestore !== null &&
      Object.keys(firestore).length > 0;
    
    if (!this.isFirestoreInitialized) {
      console.log('Using mock FirestoreService for development');
      // Initialize mock collections
      this.initializeMockData();
    } else {
      console.log('Firestore initialized properly');
    }
  }
  
  private initializeMockData() {
    // Create mock collections
    MOCK_DATA.set('users', new Map());
    
    // Add mock user
    MOCK_DATA.get('users')?.set('mock-uid-123', {
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
    });
  }

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  public getCollection(collectionPath: string): CollectionReference {
    if (!this.isFirestoreInitialized) {
      throw new Error('Firebase Firestore is not initialized');
    }
    
    try {
      if (!firestore || typeof firestore !== 'object') {
        throw new Error('Firestore instance is invalid');
      }
      return collection(firestore as Firestore, collectionPath);
    } catch (error: any) {
      console.error('Error getting collection:', error);
      throw new Error(`Failed to get collection ${collectionPath}: ${error.message}`);
    }
  }

  public getDocument(collectionPath: string, docId: string): DocumentReference {
    if (!this.isFirestoreInitialized) {
      throw new Error('Firebase Firestore is not initialized');
    }
    
    try {
      if (!firestore || typeof firestore !== 'object') {
        throw new Error('Firestore instance is invalid');
      }
      return doc(firestore as Firestore, collectionPath, docId);
    } catch (error: any) {
      console.error('Error getting document:', error);
      throw new Error(`Failed to get document ${collectionPath}/${docId}: ${error.message}`);
    }
  }

  public async getDocumentData<T>(collectionPath: string, docId: string): Promise<T | null> {
    if (!this.isFirestoreInitialized) {
      console.log(`Mock getDocumentData for ${collectionPath}/${docId}`);
      const collection = MOCK_DATA.get(collectionPath);
      const document = collection?.get(docId);
      return document ? { ...document } as T : null;
    }
    
    const docRef = this.getDocument(collectionPath, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as T;
    } else {
      return null;
    }
  }

  public async getAllDocuments<T>(collectionPath: string): Promise<T[]> {
    if (!this.isFirestoreInitialized) {
      console.log(`Mock getAllDocuments for ${collectionPath}`);
      const collection = MOCK_DATA.get(collectionPath);
      if (!collection) return [];
      return Array.from(collection.values()).map(doc => ({ ...doc }) as T);
    }
    
    try {
      if (!firestore || typeof firestore !== 'object') {
        console.warn('Firestore instance is invalid, returning empty array');
        return [];
      }
      const querySnapshot = await getDocs(collection(firestore as Firestore, collectionPath));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    } catch (error: any) {
      console.error(`Error getting all documents from ${collectionPath}:`, error);
      return [];
    }
  }

  public async queryDocuments<T>(
    collectionPath: string, 
    constraints: QueryConstraint[]
  ): Promise<T[]> {
    if (!this.isFirestoreInitialized) {
      console.log(`Mock queryDocuments for ${collectionPath}`);
      return this.getAllDocuments<T>(collectionPath);
    }
    
    try {
      if (!firestore || typeof firestore !== 'object') {
        console.warn('Firestore instance is invalid, returning empty array');
        return [];
      }
      const q = query(collection(firestore as Firestore, collectionPath), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    } catch (error: any) {
      console.error(`Error querying documents from ${collectionPath}:`, error);
      return [];
    }
  }

  public async setDocument(collectionPath: string, docId: string, data: DocumentData): Promise<void> {
    if (!this.isFirestoreInitialized) {
      console.log(`Mock setDocument for ${collectionPath}/${docId}`);
      let collection = MOCK_DATA.get(collectionPath);
      if (!collection) {
        collection = new Map();
        MOCK_DATA.set(collectionPath, collection);
      }
      collection.set(docId, { ...data });
      return;
    }
    
    const docRef = this.getDocument(collectionPath, docId);
    await setDoc(docRef, data);
  }

  public async updateDocument(collectionPath: string, docId: string, data: DocumentData): Promise<void> {
    if (!this.isFirestoreInitialized) {
      console.log(`Mock updateDocument for ${collectionPath}/${docId}`);
      const collection = MOCK_DATA.get(collectionPath);
      if (!collection) return;
      
      const existingDoc = collection.get(docId);
      if (!existingDoc) return;
      
      collection.set(docId, { ...existingDoc, ...data, updatedAt: Date.now() });
      return;
    }
    
    const docRef = this.getDocument(collectionPath, docId);
    await updateDoc(docRef, data);
  }

  public async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    if (!this.isFirestoreInitialized) {
      console.log(`Mock deleteDocument for ${collectionPath}/${docId}`);
      const collection = MOCK_DATA.get(collectionPath);
      if (!collection) return;
      collection.delete(docId);
      return;
    }
    
    const docRef = this.getDocument(collectionPath, docId);
    await deleteDoc(docRef);
  }

  public listenToDocument<T>(
    collectionPath: string, 
    docId: string, 
    callback: (data: T | null) => void
  ): () => void {
    if (!this.isFirestoreInitialized) {
      console.log(`Mock listenToDocument for ${collectionPath}/${docId}`);
      // Immediately invoke callback with mock data
      const collection = MOCK_DATA.get(collectionPath);
      const document = collection?.get(docId);
      setTimeout(() => callback(document ? { ...document } as T : null), 0);
      
      // Return no-op unsubscribe
      return () => {};
    }
    
    const docRef = this.getDocument(collectionPath, docId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    });
  }

  public listenToCollection<T>(
    collectionPath: string,
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = []
  ): () => void {
    if (!this.isFirestoreInitialized) {
      console.log(`Mock listenToCollection for ${collectionPath}`);
      const collection = MOCK_DATA.get(collectionPath);
      const documents = collection ? Array.from(collection.values()) : [];
      setTimeout(() => callback(documents.map(doc => ({ ...doc }) as T)), 0);
      
      // Return no-op unsubscribe
      return () => {};
    }
    
    try {
      if (!firestore || typeof firestore !== 'object') {
        console.warn('Firestore instance is invalid, using mock data');
        const documents: T[] = [];
        setTimeout(() => callback(documents), 0);
        return () => {};
      }
      
      const q = constraints.length > 0
        ? query(collection(firestore as Firestore, collectionPath), ...constraints)
        : collection(firestore as Firestore, collectionPath);
      
      return onSnapshot(q, (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
        callback(documents);
      }, (error) => {
        console.error(`Error listening to collection ${collectionPath}:`, error);
        callback([]);
      });
    } catch (error: any) {
      console.error(`Error setting up listener for ${collectionPath}:`, error);
      setTimeout(() => callback([]), 0);
      return () => {};
    }
  }

  // Helper methods for common query constraints
  public whereEqual(field: string, value: any): QueryConstraint {
    return where(field, '==', value);
  }

  public orderByField(field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint {
    return orderBy(field, direction);
  }

  public limitResults(limitCount: number): QueryConstraint {
    return limit(limitCount);
  }

  /**
   * Add a document to a collection with auto-generated ID
   * @param collectionName The name of the collection
   * @param data The document data
   * @returns The created document with ID
   */
  public async addDocument<T extends { id?: string }, TInput extends Omit<T, 'id'>>(
    collectionName: string, 
    data: TInput
  ): Promise<T> {
    if (!this.isFirestoreInitialized) {
      console.log(`Mock addDocument for ${collectionName}`);
      const mockId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      let collection = MOCK_DATA.get(collectionName);
      if (!collection) {
        collection = new Map();
        MOCK_DATA.set(collectionName, collection);
      }
      
      const newDoc = {
        id: mockId,
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      collection.set(mockId, newDoc);
      
      return newDoc as unknown as T;
    }
    
    try {
      const collectionRef = collection(firestore as Firestore, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Get the newly created document
      const docSnap = await getDoc(docRef);
      
      return {
        id: docRef.id,
        ...docSnap.data()
      } as T;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }
} 