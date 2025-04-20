import { useFirestoreQuery, useFirestoreDocument, useCreateDocument, useUpdateDocument, useDeleteDocument } from './useFirestoreQuery';
import { Contact, ContactActivity } from '../types/contact';

// Collection names
const CONTACTS_COLLECTION = 'contacts';
const CONTACT_ACTIVITIES_COLLECTION = 'contact_activities';

// Query keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: any) => [...contactKeys.lists(), { filters }] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  activities: (contactId: string) => [...contactKeys.detail(contactId), 'activities'] as const,
};

/**
 * Hook for getting all contacts
 */
export function useContacts() {
  return useFirestoreQuery<Contact>(
    CONTACTS_COLLECTION, 
    contactKeys.lists()
  );
}

/**
 * Hook for getting contacts by status
 */
export function useContactsByStatus(status: Contact['status']) {
  const { whereEqual } = useFirestoreService();
  
  return useFirestoreQuery<Contact>(
    CONTACTS_COLLECTION,
    contactKeys.list({ status }),
    [whereEqual('status', status)]
  );
}

/**
 * Hook for getting contacts by tag
 */
export function useContactsByTag(tag: string) {
  const { whereEqual } = useFirestoreService();
  
  return useFirestoreQuery<Contact>(
    CONTACTS_COLLECTION,
    contactKeys.list({ tag }),
    [whereEqual('tags', tag)]
  );
}

/**
 * Hook for getting a single contact
 */
export function useContact(contactId: string) {
  return useFirestoreDocument<Contact>(
    CONTACTS_COLLECTION,
    contactId,
    contactKeys.detail(contactId)
  );
}

/**
 * Hook for creating a contact
 */
export function useCreateContact() {
  return useCreateDocument<Contact>(
    CONTACTS_COLLECTION,
    contactKeys.lists()
  );
}

/**
 * Hook for updating a contact
 */
export function useUpdateContact() {
  return useUpdateDocument<Contact>(
    CONTACTS_COLLECTION,
    contactKeys.lists()
  );
}

/**
 * Hook for deleting a contact
 */
export function useDeleteContact() {
  return useDeleteDocument(
    CONTACTS_COLLECTION,
    contactKeys.lists()
  );
}

/**
 * Hook for getting contact activities
 */
export function useContactActivities(contactId: string) {
  const { whereEqual, orderByField } = useFirestoreService();
  
  return useFirestoreQuery<ContactActivity>(
    CONTACT_ACTIVITIES_COLLECTION,
    contactKeys.activities(contactId),
    [
      whereEqual('contactId', contactId),
      orderByField('timestamp', 'desc')
    ],
    {
      enabled: !!contactId
    }
  );
}

/**
 * Hook for adding a contact activity
 */
export function useAddContactActivity() {
  return useCreateDocument<ContactActivity>(
    CONTACT_ACTIVITIES_COLLECTION,
    contactKeys.all // We'll invalidate all contact queries
  );
}

/**
 * Hook for deleting a contact activity
 */
export function useDeleteContactActivity() {
  return useDeleteDocument(
    CONTACT_ACTIVITIES_COLLECTION,
    contactKeys.all
  );
}

/**
 * Helper function to get FirestoreService instance
 */
function useFirestoreService() {
  const { FirestoreService } = require('../firebase');
  return FirestoreService.getInstance();
} 