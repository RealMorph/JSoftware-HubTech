import { Migration } from '../services/database-migration-service';
import { firestore } from '../firebase/firebase-config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

/**
 * Migration to add default user roles to existing users
 */
export const addUserRolesMigration: Migration = {
  id: 'add-user-roles-20231001',
  name: 'Add User Roles',
  description: 'Adds default user role to all existing users',
  version: '1.0.0',
  
  async up(): Promise<void> {
    const db = firestore;
    const usersRef = collection(db, 'users');
    const userDocs = await getDocs(usersRef);
    
    console.log(`Updating ${userDocs.size} users with default role...`);
    
    const batch: Promise<void>[] = [];
    userDocs.forEach(userDoc => {
      const userData = userDoc.data();
      
      // Skip users who already have roles defined
      if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
        return;
      }
      
      // Add default role
      const userRef = doc(db, 'users', userDoc.id);
      batch.push(updateDoc(userRef, {
        roles: ['user'],
        updated_at: new Date()
      }));
    });
    
    // Execute all updates
    await Promise.all(batch);
    console.log(`Updated ${batch.length} users with default role.`);
  },
  
  async down(): Promise<void> {
    const db = firestore;
    const usersRef = collection(db, 'users');
    const userDocs = await getDocs(usersRef);
    
    console.log(`Removing roles from ${userDocs.size} users...`);
    
    const batch: Promise<void>[] = [];
    userDocs.forEach(userDoc => {
      const userData = userDoc.data();
      
      // Only modify users who have exactly the default role
      if (
        userData.roles && 
        Array.isArray(userData.roles) && 
        userData.roles.length === 1 && 
        userData.roles[0] === 'user'
      ) {
        const userRef = doc(db, 'users', userDoc.id);
        batch.push(updateDoc(userRef, {
          roles: [],
          updated_at: new Date()
        }));
      }
    });
    
    // Execute all updates
    await Promise.all(batch);
    console.log(`Removed roles from ${batch.length} users.`);
  }
}; 