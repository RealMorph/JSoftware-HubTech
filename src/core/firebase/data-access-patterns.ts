import { FirestoreService } from './firebase-db-service';
import { UserProfile } from '../types/user-profile';

/**
 * Data Access Layer for Firestore
 * This centralizes all Firestore query patterns to ensure consistent data access
 */
export class DataAccessPatterns {
  private static instance: DataAccessPatterns;
  private firestoreService: FirestoreService;
  
  // Collection names
  private readonly USERS_COLLECTION = 'users';
  
  private constructor() {
    this.firestoreService = FirestoreService.getInstance();
  }
  
  public static getInstance(): DataAccessPatterns {
    if (!DataAccessPatterns.instance) {
      DataAccessPatterns.instance = new DataAccessPatterns();
    }
    return DataAccessPatterns.instance;
  }
  
  // User profile access patterns
  
  /**
   * Get a user profile by ID
   * @param userId User ID
   * @returns User profile or null if not found
   */
  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    return await this.firestoreService.getDocumentData<UserProfile>(this.USERS_COLLECTION, userId);
  }
  
  /**
   * Get multiple user profiles by IDs
   * @param userIds Array of user IDs
   * @returns Map of user IDs to user profiles
   */
  public async getUserProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
    const profiles = new Map<string, UserProfile>();
    
    // Get profiles in batches of 10 to avoid too many parallel requests
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(userId => this.getUserProfile(userId))
      );
      
      batch.forEach((userId, index) => {
        const profile = batchResults[index];
        if (profile) {
          profiles.set(userId, profile);
        }
      });
    }
    
    return profiles;
  }
  
  /**
   * Get users with specific roles
   * @param role Role to search for
   * @returns Array of user profiles with the specified role
   */
  public async getUsersByRole(role: string): Promise<UserProfile[]> {
    return await this.firestoreService.queryDocuments<UserProfile>(
      this.USERS_COLLECTION,
      [this.firestoreService.whereEqual('role', role)]
    );
  }
  
  /**
   * Search for users by display name (case insensitive)
   * This requires a compound index on displayName and email
   * @param searchTerm Search term
   * @param limit Maximum number of results to return
   * @returns Array of user profiles matching the search term
   */
  public async searchUsersByName(searchTerm: string, limit = 10): Promise<UserProfile[]> {
    // Convert to lowercase for case-insensitive search
    const term = searchTerm.toLowerCase();
    
    // Firebase doesn't support full text search, so we're using a simple prefix query
    // For real full-text search, consider using Algolia or ElasticSearch
    return await this.firestoreService.queryDocuments<UserProfile>(
      this.USERS_COLLECTION,
      [
        this.firestoreService.whereEqual('displayNameLower', term),
        this.firestoreService.limitResults(limit)
      ]
    );
  }
  
  // Add more data access patterns as needed for your application
  
  /**
   * Listen to user profile changes
   * @param userId User ID to listen for
   * @param callback Callback function when profile changes
   * @returns Unsubscribe function
   */
  public listenToUserProfile(
    userId: string,
    callback: (profile: UserProfile | null) => void
  ): () => void {
    return this.firestoreService.listenToDocument<UserProfile>(
      this.USERS_COLLECTION,
      userId,
      callback
    );
  }
} 