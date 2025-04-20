import { FirestoreService } from './firebase-db-service';
import { FirebaseAuthService } from './firebase-auth-service';
import { Contact, ContactActivity } from '../types/contact';
import { where } from 'firebase/firestore';
import { WebSocketService } from './websocket-service';

export class ContactService {
  private static instance: ContactService;
  private readonly CONTACTS_COLLECTION = 'contacts';
  private readonly CONTACT_ACTIVITIES_COLLECTION = 'contact_activities';
  private readonly COMPANIES_COLLECTION = 'companies';
  
  private firestoreService: FirestoreService;
  private authService: FirebaseAuthService;
  private webSocketService: WebSocketService;
  
  private constructor() {
    this.firestoreService = FirestoreService.getInstance();
    this.authService = FirebaseAuthService.getInstance();
    this.webSocketService = WebSocketService.getInstance();
  }
  
  public static getInstance(): ContactService {
    if (!ContactService.instance) {
      ContactService.instance = new ContactService();
    }
    return ContactService.instance;
  }
  
  /**
   * Get all contacts for the current user
   */
  public async getContacts(): Promise<Contact[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    return await this.firestoreService.queryDocuments<Contact>(
      this.CONTACTS_COLLECTION,
      [this.firestoreService.whereEqual('ownerId', currentUser.uid)]
    );
  }
  
  /**
   * Get contacts by status
   * @param status The status to filter by
   */
  public async getContactsByStatus(status: Contact['status']): Promise<Contact[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    return await this.firestoreService.queryDocuments<Contact>(
      this.CONTACTS_COLLECTION,
      [
        this.firestoreService.whereEqual('ownerId', currentUser.uid),
        this.firestoreService.whereEqual('status', status)
      ]
    );
  }
  
  /**
   * Get contacts by tag
   * @param tag The tag to filter by
   */
  public async getContactsByTag(tag: string): Promise<Contact[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    return await this.firestoreService.queryDocuments<Contact>(
      this.CONTACTS_COLLECTION,
      [
        this.firestoreService.whereEqual('ownerId', currentUser.uid),
        where('tags', 'array-contains', tag)
      ]
    );
  }
  
  /**
   * Get a contact by ID
   * @param contactId The contact ID
   */
  public async getContact(contactId: string): Promise<Contact | null> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return null;
    
    const contact = await this.firestoreService.getDocumentData<Contact>(
      this.CONTACTS_COLLECTION,
      contactId
    );
    
    // Ensure the user owns the contact
    if (contact && contact.ownerId === currentUser.uid) {
      return contact;
    }
    
    return null;
  }
  
  /**
   * Create a new contact
   * @param contactData The contact data
   */
  public async createContact(contactData: Omit<Contact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const now = Date.now();
    
    const newContact: Omit<Contact, 'id'> = {
      ...contactData,
      ownerId: currentUser.uid,
      createdAt: now,
      updatedAt: now,
      tags: contactData.tags || []
    };
    
    const contactId = await this.firestoreService.addDocument(
      this.CONTACTS_COLLECTION,
      newContact
    );
    
    // Ensure we have a valid string ID
    const finalId = typeof contactId === 'string' 
      ? contactId 
      : (contactId.id || `generated-${Date.now()}`);
    
    const createdContact = {
      ...newContact,
      id: finalId
    };
    
    // Log the contact creation activity
    this.webSocketService.publishActivity({
      type: 'contact_created',
      entityType: 'contact',
      entityId: finalId,
      data: {
        name: `${contactData.firstName} ${contactData.lastName}`,
        email: contactData.email
      }
    });
    
    return createdContact;
  }
  
  /**
   * Update a contact
   * @param contactId The contact ID
   * @param contactData The contact data to update
   */
  public async updateContact(
    contactId: string, 
    contactData: Partial<Omit<Contact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Contact> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the contact first to verify ownership
    const contact = await this.getContact(contactId);
    if (!contact) {
      throw new Error('Contact not found or you do not have permission to update it');
    }
    
    const updateData = {
      ...contactData,
      updatedAt: Date.now()
    };
    
    await this.firestoreService.updateDocument(
      this.CONTACTS_COLLECTION,
      contactId,
      updateData
    );
    
    const updatedContact = await this.getContact(contactId);
    if (!updatedContact) {
      throw new Error('Failed to retrieve updated contact');
    }
    
    // Log the contact update activity
    this.webSocketService.publishActivity({
      type: 'contact_updated',
      entityType: 'contact',
      entityId: contactId,
      data: {
        name: `${updatedContact.firstName} ${updatedContact.lastName}`,
        email: updatedContact.email,
        changedFields: Object.keys(contactData)
      }
    });
    
    return updatedContact;
  }
  
  /**
   * Delete a contact
   * @param contactId The contact ID
   */
  public async deleteContact(contactId: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the contact first to verify ownership
    const contact = await this.getContact(contactId);
    if (!contact) {
      throw new Error('Contact not found or you do not have permission to delete it');
    }
    
    // Store contact info before deletion for the activity log
    const contactName = `${contact.firstName} ${contact.lastName}`;
    const contactEmail = contact.email;
    
    await this.firestoreService.deleteDocument(this.CONTACTS_COLLECTION, contactId);
    
    // Also delete all activities associated with this contact
    const activities = await this.getContactActivities(contactId);
    
    // Delete activities in batches
    const deletePromises = activities.map(activity => 
      this.firestoreService.deleteDocument(this.CONTACT_ACTIVITIES_COLLECTION, activity.id)
    );
    
    await Promise.all(deletePromises);
    
    // Log the contact deletion activity
    this.webSocketService.publishActivity({
      type: 'contact_deleted',
      entityType: 'contact',
      entityId: contactId,
      data: {
        name: contactName,
        email: contactEmail
      }
    });
  }
  
  /**
   * Get activities for a contact
   * @param contactId The contact ID
   */
  public async getContactActivities(contactId: string): Promise<ContactActivity[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    // Get the contact first to verify ownership
    const contact = await this.getContact(contactId);
    if (!contact) {
      return [];
    }
    
    return await this.firestoreService.queryDocuments<ContactActivity>(
      this.CONTACT_ACTIVITIES_COLLECTION,
      [this.firestoreService.whereEqual('contactId', contactId)]
    );
  }
  
  /**
   * Add an activity to a contact
   * @param activity The activity data
   */
  public async addContactActivity(
    activity: Omit<ContactActivity, 'id' | 'userId' | 'timestamp'>
  ): Promise<ContactActivity> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the contact first to verify ownership
    const contact = await this.getContact(activity.contactId);
    if (!contact) {
      throw new Error('Contact not found or you do not have permission to add activity');
    }
    
    const now = Date.now();
    
    const newActivity: Omit<ContactActivity, 'id'> = {
      ...activity,
      userId: currentUser.uid,
      timestamp: now
    };
    
    const activityId = await this.firestoreService.addDocument(
      this.CONTACT_ACTIVITIES_COLLECTION,
      newActivity
    );
    
    // Update the last contacted timestamp on the contact
    await this.updateContact(activity.contactId, {
      lastContacted: now
    });
    
    // Ensure we have a valid string ID
    const finalId = typeof activityId === 'string' 
      ? activityId 
      : (activityId.id || `activity-${Date.now()}`);
    
    return {
      ...newActivity,
      id: finalId
    };
  }
  
  /**
   * Delete a contact activity
   * @param activityId The activity ID
   */
  public async deleteContactActivity(activityId: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const activity = await this.firestoreService.getDocumentData<ContactActivity>(
      this.CONTACT_ACTIVITIES_COLLECTION,
      activityId
    );
    
    if (!activity) {
      throw new Error('Activity not found');
    }
    
    // Get the contact to verify ownership
    const contact = await this.getContact(activity.contactId);
    if (!contact) {
      throw new Error('Contact not found or you do not have permission to delete activity');
    }
    
    await this.firestoreService.deleteDocument(this.CONTACT_ACTIVITIES_COLLECTION, activityId);
  }
  
  /**
   * Search contacts
   * @param query The search query
   */
  public async searchContacts(query: string): Promise<Contact[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    // For simplicity, we're just getting all contacts and filtering in memory
    // In a real app, you would use a proper search engine like Algolia or Elasticsearch
    const contacts = await this.getContacts();
    
    if (!query.trim()) return contacts;
    
    const lowerQuery = query.toLowerCase();
    
    return contacts.filter(contact => 
      contact.firstName.toLowerCase().includes(lowerQuery) ||
      contact.lastName.toLowerCase().includes(lowerQuery) ||
      contact.email.toLowerCase().includes(lowerQuery) ||
      (contact.company?.name && contact.company.name.toLowerCase().includes(lowerQuery)) ||
      (contact.jobTitle && contact.jobTitle.toLowerCase().includes(lowerQuery)) ||
      contact.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
} 