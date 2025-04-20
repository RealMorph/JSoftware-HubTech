import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Define type for the setUserCustomClaims function data
interface SetUserCustomClaimsData {
  userId: string;
  claims: { [key: string]: any };
}

// Define type for the createInitialAdmin function data
interface CreateInitialAdminData {
  userId: string;
  secretKey: string;
}

// Define type for the assignUserRole function data
interface AssignUserRoleData {
  userId: string;
  role: string;
}

/**
 * Set custom claims for a user (for role-based access control)
 */
export const setUserCustomClaims = functions.https.onCall(
  async (request) => {
    const data = request.data as SetUserCustomClaimsData;
    
    // Only allow admin users to set custom claims
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }
    
    // Check if the caller is an admin
    const callerUid = request.auth.uid;
    const callerSnap = await admin.firestore().collection('user_roles').doc(callerUid).get();
    const callerRoles = callerSnap.exists ? callerSnap.data()?.roles || [] : [];
    
    if (!callerRoles.includes('admin')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can set user roles'
      );
    }
    
    const { userId, claims } = data;
    
    if (!userId || !claims) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'User ID and claims must be provided'
      );
    }
    
    try {
      // Set custom claims
      await admin.auth().setCustomUserClaims(userId, claims);
      
      // Force token refresh
      await admin.firestore().collection('users').doc(userId).update({
        customClaimsUpdated: Date.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error setting custom claims:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error setting custom claims'
      );
    }
  }
);

/**
 * Make a user an admin (only for initial setup)
 * This function should be secured properly in production
 */
export const createInitialAdmin = functions.https.onCall(
  async (request) => {
    const data = request.data as CreateInitialAdminData;
    
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }
    
    const { userId, secretKey } = data;
    
    // Validate secret key (should be stored in environment variables)
    const correctSecretKey = functions.config().app?.admin_secret_key;
    if (!correctSecretKey || secretKey !== correctSecretKey) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Invalid secret key'
      );
    }
    
    try {
      // Set admin role in Firestore
      await admin.firestore().collection('user_roles').doc(userId).set({
        roles: ['admin'],
        updatedAt: Date.now()
      });
      
      // Set admin custom claim
      await admin.auth().setCustomUserClaims(userId, { 
        roles: ['admin'] 
      });
      
      // Force token refresh
      await admin.firestore().collection('users').doc(userId).update({
        customClaimsUpdated: Date.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error creating initial admin:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error creating initial admin'
      );
    }
  }
);

/**
 * Assign a role to a user
 */
export const assignUserRole = functions.https.onCall(
  async (request) => {
    const data = request.data as AssignUserRoleData;
    
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }
    
    // Check if the caller is an admin
    const callerUid = request.auth.uid;
    const callerSnap = await admin.firestore().collection('user_roles').doc(callerUid).get();
    const callerRoles = callerSnap.exists ? callerSnap.data()?.roles || [] : [];
    
    if (!callerRoles.includes('admin')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can assign roles'
      );
    }
    
    const { userId, role } = data;
    
    if (!userId || !role) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'User ID and role must be provided'
      );
    }
    
    try {
      // Get existing role assignments
      const userRolesDoc = await admin.firestore().collection('user_roles').doc(userId).get();
      let currentRoles: string[] = [];
      
      if (userRolesDoc.exists) {
        const userData = userRolesDoc.data();
        currentRoles = userData?.roles as string[] || [];
      }
      
      // Add new role if not already assigned
      if (!currentRoles.includes(role)) {
        currentRoles.push(role);
      }
      
      // Update Firestore
      await admin.firestore().collection('user_roles').doc(userId).set({
        roles: currentRoles,
        updatedAt: Date.now()
      });
      
      // Update custom claims
      await admin.auth().setCustomUserClaims(userId, { roles: currentRoles });
      
      // Force token refresh
      await admin.firestore().collection('users').doc(userId).update({
        customClaimsUpdated: Date.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error assigning user role:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error assigning user role'
      );
    }
  }
); 