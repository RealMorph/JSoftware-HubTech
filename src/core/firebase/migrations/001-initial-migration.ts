import { firestore } from 'firebase-admin';
import { Migration } from '../../types/migration';

export const initialMigration: Migration = {
  id: '001-initial-migration',
  name: 'Initial Firebase Schema Setup',
  
  async up(db: firestore.Firestore): Promise<void> {
    console.log('Running initial migration to setup Firebase schema');
    
    // Create initial collections and documents
    const batch = db.batch();
    
    // Create settings document
    const settingsRef = db.collection('system').doc('settings');
    batch.set(settingsRef, {
      appName: 'CRM App',
      version: '1.0.0',
      initialized: true,
      createdAt: firestore.FieldValue.serverTimestamp()
    });
    
    // Create default roles
    const rolesCollection = db.collection('roles');
    
    batch.set(rolesCollection.doc('admin'), {
      name: 'Administrator',
      permissions: ['*'],
      description: 'Full system access',
      createdAt: firestore.FieldValue.serverTimestamp()
    });
    
    batch.set(rolesCollection.doc('manager'), {
      name: 'Manager',
      permissions: [
        'contacts:read', 'contacts:write',
        'deals:read', 'deals:write',
        'reports:read'
      ],
      description: 'Can manage contacts, deals and view reports',
      createdAt: firestore.FieldValue.serverTimestamp()
    });
    
    batch.set(rolesCollection.doc('user'), {
      name: 'User',
      permissions: [
        'contacts:read', 'contacts:write',
        'deals:read', 'deals:write'
      ],
      description: 'Basic user access',
      createdAt: firestore.FieldValue.serverTimestamp()
    });
    
    // Commit all changes
    await batch.commit();
    
    console.log('Initial migration completed successfully');
  },
  
  async down(db: firestore.Firestore): Promise<void> {
    console.log('Rolling back initial migration');
    
    // Delete the collections and documents created in the up migration
    const batch = db.batch();
    
    // Delete settings document
    const settingsRef = db.collection('system').doc('settings');
    batch.delete(settingsRef);
    
    // Delete roles
    const roleRefs = [
      db.collection('roles').doc('admin'),
      db.collection('roles').doc('manager'),
      db.collection('roles').doc('user')
    ];
    
    roleRefs.forEach(ref => batch.delete(ref));
    
    // Commit all changes
    await batch.commit();
    
    console.log('Initial migration rollback completed successfully');
  }
}; 