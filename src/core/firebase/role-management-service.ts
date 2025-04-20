import { FirestoreService } from './firebase-db-service';
import { FirebaseAuthService } from './firebase-auth-service';
import { 
  Role, 
  UserRoles, 
  PERMISSIONS, 
  ROLE_DEFINITIONS 
} from '../types/user-roles';
import { httpsCallable, getFunctions } from 'firebase/functions';

export class RoleManagementService {
  private static instance: RoleManagementService;
  private readonly ROLES_COLLECTION = 'user_roles';
  private readonly ROLE_ASSIGNMENTS_COLLECTION = 'role_assignments';
  
  private firestoreService: FirestoreService;
  private authService: FirebaseAuthService;
  private functions = getFunctions();
  
  private constructor() {
    this.firestoreService = FirestoreService.getInstance();
    this.authService = FirebaseAuthService.getInstance();
  }
  
  public static getInstance(): RoleManagementService {
    if (!RoleManagementService.instance) {
      RoleManagementService.instance = new RoleManagementService();
    }
    return RoleManagementService.instance;
  }
  
  /**
   * Get user roles for a specific user
   * @param userId The user ID
   */
  public async getUserRoles(userId: string): Promise<UserRoles> {
    const rolesDoc = await this.firestoreService.getDocumentData<UserRoles>(
      this.ROLE_ASSIGNMENTS_COLLECTION,
      userId
    );
    
    // Default to basic user role if no roles assigned
    if (!rolesDoc) {
      return { roles: ['user'] };
    }
    
    return rolesDoc;
  }
  
  /**
   * Get current user's roles
   */
  public async getCurrentUserRoles(): Promise<UserRoles> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    return await this.getUserRoles(currentUser.uid);
  }
  
  /**
   * Assign roles to a user
   * @param userId The user ID
   * @param roles Array of roles to assign
   */
  public async assignRolesToUser(userId: string, roles: Role[]): Promise<void> {
    // Validate roles
    const validRoles = roles.filter(role => 
      ROLE_DEFINITIONS.some(def => def.id === role)
    );
    
    // Create or update role assignments
    await this.firestoreService.setDocument(
      this.ROLE_ASSIGNMENTS_COLLECTION,
      userId,
      { 
        roles: validRoles,
        updatedAt: Date.now() 
      }
    );
    
    // Set custom claims in Firebase Auth (requires Firebase Admin SDK via Functions)
    const setCustomClaims = httpsCallable(this.functions, 'setUserCustomClaims');
    await setCustomClaims({ 
      userId, 
      claims: { roles: validRoles } 
    });
  }
  
  /**
   * Remove roles from a user
   * @param userId The user ID
   * @param roles Array of roles to remove
   */
  public async removeRolesFromUser(userId: string, roles: Role[]): Promise<void> {
    const userRoles = await this.getUserRoles(userId);
    
    // Filter out roles to remove
    const updatedRoles = userRoles.roles.filter(role => !roles.includes(role));
    
    // Update role assignments
    await this.firestoreService.updateDocument(
      this.ROLE_ASSIGNMENTS_COLLECTION,
      userId,
      { 
        roles: updatedRoles,
        updatedAt: Date.now() 
      }
    );
    
    // Update custom claims in Firebase Auth
    const setCustomClaims = httpsCallable(this.functions, 'setUserCustomClaims');
    await setCustomClaims({ 
      userId, 
      claims: { roles: updatedRoles } 
    });
  }
  
  /**
   * Check if user has a specific role
   * @param userId The user ID
   * @param role The role to check
   */
  public async userHasRole(userId: string, role: Role): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.roles.includes(role);
  }
  
  /**
   * Check if current user has a specific role
   * @param role The role to check
   */
  public async currentUserHasRole(role: Role): Promise<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return false;
    }
    
    return await this.userHasRole(currentUser.uid, role);
  }
  
  /**
   * Check if user has a specific permission
   * @param userId The user ID
   * @param permissionId The permission ID to check
   */
  public async userHasPermission(userId: string, permissionId: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    // Get all permissions for the user's roles
    const userPermissions = new Set<string>();
    
    userRoles.roles.forEach(role => {
      const roleDefinition = ROLE_DEFINITIONS.find(def => def.id === role);
      if (roleDefinition) {
        roleDefinition.permissions.forEach(permission => userPermissions.add(permission));
      }
    });
    
    return userPermissions.has(permissionId);
  }
  
  /**
   * Check if current user has a specific permission
   * @param permissionId The permission ID to check
   */
  public async currentUserHasPermission(permissionId: string): Promise<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return false;
    }
    
    return await this.userHasPermission(currentUser.uid, permissionId);
  }
  
  /**
   * Get all permissions for a user based on their roles
   * @param userId The user ID
   */
  public async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId);
    
    // Get all permissions for the user's roles
    const userPermissions = new Set<string>();
    
    userRoles.roles.forEach(role => {
      const roleDefinition = ROLE_DEFINITIONS.find(def => def.id === role);
      if (roleDefinition) {
        roleDefinition.permissions.forEach(permission => userPermissions.add(permission));
      }
    });
    
    return Array.from(userPermissions);
  }
} 