import { firestore } from 'firebase-admin';
import { Migration } from '../../types/migration';

export const addDealTagsMigration: Migration = {
  id: '002-add-deal-tags',
  name: 'Add Tags Field to Deals',
  
  async up(db: firestore.Firestore): Promise<void> {
    console.log('Running migration to add tags field to deals');
    
    // Get all deals
    const dealsSnapshot = await db.collection('deals').get();
    
    if (dealsSnapshot.empty) {
      console.log('No deals found, nothing to update');
      return;
    }
    
    // Update each deal to add the tags field
    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH_SIZE = 500; // Firestore limitation
    
    for (const doc of dealsSnapshot.docs) {
      batch.update(doc.ref, {
        tags: [], // Add empty tags array
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
      
      batchCount++;
      
      // If we reach the batch limit, commit and create a new batch
      if (batchCount >= MAX_BATCH_SIZE) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} deal updates`);
        batchCount = 0;
      }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} deal updates`);
    }
    
    console.log('Successfully added tags field to all deals');
  },
  
  async down(db: firestore.Firestore): Promise<void> {
    console.log('Rolling back the addition of tags field to deals');
    
    // Get all deals
    const dealsSnapshot = await db.collection('deals').get();
    
    if (dealsSnapshot.empty) {
      console.log('No deals found, nothing to roll back');
      return;
    }
    
    // Remove the tags field from each deal
    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH_SIZE = 500; // Firestore limitation
    
    for (const doc of dealsSnapshot.docs) {
      // Create a FieldPath for the tags field and remove it
      batch.update(doc.ref, {
        tags: firestore.FieldValue.delete(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
      
      batchCount++;
      
      // If we reach the batch limit, commit and create a new batch
      if (batchCount >= MAX_BATCH_SIZE) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} deal updates for rollback`);
        batchCount = 0;
      }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} deal updates for rollback`);
    }
    
    console.log('Successfully removed tags field from all deals');
  }
}; 