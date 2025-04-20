import { firestore } from 'firebase-admin';

export interface Migration {
  id: string;
  name: string;
  up: (db: firestore.Firestore) => Promise<void>;
  down: (db: firestore.Firestore) => Promise<void>;
} 