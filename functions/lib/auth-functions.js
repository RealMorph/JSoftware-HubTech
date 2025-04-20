"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignUserRole = exports.createInitialAdmin = exports.setUserCustomClaims = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
/**
 * Set custom claims for a user (for role-based access control)
 */
exports.setUserCustomClaims = functions.https.onCall(async (request) => {
    var _a;
    const data = request.data;
    // Only allow admin users to set custom claims
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if the caller is an admin
    const callerUid = request.auth.uid;
    const callerSnap = await admin.firestore().collection('user_roles').doc(callerUid).get();
    const callerRoles = callerSnap.exists ? ((_a = callerSnap.data()) === null || _a === void 0 ? void 0 : _a.roles) || [] : [];
    if (!callerRoles.includes('admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Only administrators can set user roles');
    }
    const { userId, claims } = data;
    if (!userId || !claims) {
        throw new functions.https.HttpsError('invalid-argument', 'User ID and claims must be provided');
    }
    try {
        // Set custom claims
        await admin.auth().setCustomUserClaims(userId, claims);
        // Force token refresh
        await admin.firestore().collection('users').doc(userId).update({
            customClaimsUpdated: Date.now()
        });
        return { success: true };
    }
    catch (error) {
        console.error('Error setting custom claims:', error);
        throw new functions.https.HttpsError('internal', 'Error setting custom claims');
    }
});
/**
 * Make a user an admin (only for initial setup)
 * This function should be secured properly in production
 */
exports.createInitialAdmin = functions.https.onCall(async (request) => {
    var _a;
    const data = request.data;
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { userId, secretKey } = data;
    // Validate secret key (should be stored in environment variables)
    const correctSecretKey = (_a = functions.config().app) === null || _a === void 0 ? void 0 : _a.admin_secret_key;
    if (!correctSecretKey || secretKey !== correctSecretKey) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid secret key');
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
    }
    catch (error) {
        console.error('Error creating initial admin:', error);
        throw new functions.https.HttpsError('internal', 'Error creating initial admin');
    }
});
/**
 * Assign a role to a user
 */
exports.assignUserRole = functions.https.onCall(async (request) => {
    var _a;
    const data = request.data;
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if the caller is an admin
    const callerUid = request.auth.uid;
    const callerSnap = await admin.firestore().collection('user_roles').doc(callerUid).get();
    const callerRoles = callerSnap.exists ? ((_a = callerSnap.data()) === null || _a === void 0 ? void 0 : _a.roles) || [] : [];
    if (!callerRoles.includes('admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Only administrators can assign roles');
    }
    const { userId, role } = data;
    if (!userId || !role) {
        throw new functions.https.HttpsError('invalid-argument', 'User ID and role must be provided');
    }
    try {
        // Get existing role assignments
        const userRolesDoc = await admin.firestore().collection('user_roles').doc(userId).get();
        let currentRoles = [];
        if (userRolesDoc.exists) {
            const userData = userRolesDoc.data();
            currentRoles = (userData === null || userData === void 0 ? void 0 : userData.roles) || [];
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
    }
    catch (error) {
        console.error('Error assigning user role:', error);
        throw new functions.https.HttpsError('internal', 'Error assigning user role');
    }
});
//# sourceMappingURL=auth-functions.js.map