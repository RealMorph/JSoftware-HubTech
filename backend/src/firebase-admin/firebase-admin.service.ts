import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  private firebaseApp: admin.app.App;

  constructor() {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      try {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          // You can add your Firebase configuration here if needed
          // databaseURL: 'https://your-project-id.firebaseio.com',
        });
      } catch (error) {
        console.error('Firebase admin initialization error:', error);
      }
    } else {
      this.firebaseApp = admin.apps[0];
    }
  }

  /**
   * Verify a Firebase ID token
   * @param idToken The ID token to verify
   * @returns The decoded token if verification is successful
   */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.firebaseApp.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying auth token:', error);
      throw error;
    }
  }

  /**
   * Get a user by UID
   * @param uid The user ID
   * @returns The user record
   */
  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.firebaseApp.auth().getUser(uid);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Create a custom token for a user
   * @param uid The user ID
   * @param additionalClaims Additional claims to include in the token
   * @returns The custom token
   */
  async createCustomToken(uid: string, additionalClaims?: object): Promise<string> {
    try {
      return await this.firebaseApp.auth().createCustomToken(uid, additionalClaims);
    } catch (error) {
      console.error('Error creating custom token:', error);
      throw error;
    }
  }

  /**
   * Get the Firebase Admin app instance
   * @returns The Firebase Admin app instance
   */
  getApp(): admin.app.App {
    return this.firebaseApp;
  }
} 