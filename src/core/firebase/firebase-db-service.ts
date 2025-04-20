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
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from './firebase-config';

export class FirestoreService {
  private static instance: FirestoreService;

  private constructor() {}

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  public getCollection(collectionPath: string): CollectionReference {
    return collection(firestore, collectionPath);
  }

  public getDocument(collectionPath: string, docId: string): DocumentReference {
    return doc(firestore, collectionPath, docId);
  }

  public async getDocumentData<T>(collectionPath: string, docId: string): Promise<T | null> {
    const docRef = this.getDocument(collectionPath, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as T;
    } else {
      return null;
    }
  }

  public async getAllDocuments<T>(collectionPath: string): Promise<T[]> {
    const querySnapshot = await getDocs(collection(firestore, collectionPath));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  }

  public async queryDocuments<T>(
    collectionPath: string, 
    constraints: QueryConstraint[]
  ): Promise<T[]> {
    const q = query(collection(firestore, collectionPath), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  }

  public async setDocument(collectionPath: string, docId: string, data: DocumentData): Promise<void> {
    const docRef = this.getDocument(collectionPath, docId);
    await setDoc(docRef, data);
  }

  public async updateDocument(collectionPath: string, docId: string, data: DocumentData): Promise<void> {
    const docRef = this.getDocument(collectionPath, docId);
    await updateDoc(docRef, data);
  }

  public async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    const docRef = this.getDocument(collectionPath, docId);
    await deleteDoc(docRef);
  }

  public listenToDocument<T>(
    collectionPath: string, 
    docId: string, 
    callback: (data: T | null) => void
  ): () => void {
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
    const q = constraints.length > 0
      ? query(collection(firestore, collectionPath), ...constraints)
      : collection(firestore, collectionPath);
    
    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
      callback(documents);
    });
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
    try {
      const collectionRef = collection(firestore, collectionName);
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