import { firestore } from '../firebase-config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { DatabaseMigrationService } from '../database-migration';

const MIGRATION_ID = '001-add-contact-custom-fields';
const MIGRATION_VERSION = '1.0.0';
const CONTACTS_COLLECTION = 'contacts';

/**
 * Migration to add customFields object to all contacts
 */
export const addContactCustomFieldsMigration = {
  id: MIGRATION_ID,
  name: 'Add customFields to contacts',
  description: 'Adds a customFields object to all existing contacts',
  timestamp: Date.now(),
  version: MIGRATION_VERSION,
  
  /**
   * Apply the migration
   */
  apply: async () => {
    console.log('Applying migration: Add customFields to contacts');
    
    // Get all contacts
    const contactsCollection = collection(firestore, CONTACTS_COLLECTION);
    const contactsSnapshot = await getDocs(contactsCollection);
    
    // Create a batch for bulk updates
    const migrationService = DatabaseMigrationService.getInstance();
    const batch = migrationService.createBatch();
    
    // Add customFields to each contact
    contactsSnapshot.forEach(contactDoc => {
      const contactRef = doc(firestore, CONTACTS_COLLECTION, contactDoc.id);
      
      // Only update if customFields doesn't exist
      if (!contactDoc.data().customFields) {
        batch.update(contactRef, {
          customFields: {},
          updatedAt: Date.now()
        });
      }
    });
    
    // Commit the batch
    await batch.commit();
    console.log(`Updated ${contactsSnapshot.size} contacts with customFields`);
  },
  
  /**
   * Rollback the migration
   */
  rollback: async () => {
    console.log('Rolling back migration: Add customFields to contacts');
    
    // Get all contacts
    const contactsCollection = collection(firestore, CONTACTS_COLLECTION);
    const contactsSnapshot = await getDocs(contactsCollection);
    
    // Create a batch for bulk updates
    const migrationService = DatabaseMigrationService.getInstance();
    const batch = migrationService.createBatch();
    
    // Remove customFields from each contact
    contactsSnapshot.forEach(contactDoc => {
      const contactRef = doc(firestore, CONTACTS_COLLECTION, contactDoc.id);
      
      // Only update if customFields exists
      if (contactDoc.data().customFields) {
        batch.update(contactRef, {
          customFields: null,
          updatedAt: Date.now()
        });
      }
    });
    
    // Commit the batch
    await batch.commit();
    console.log(`Removed customFields from ${contactsSnapshot.size} contacts`);
  }
}; 