import { useState, useEffect, useCallback } from 'react';
import { ContactService } from '../firebase';
import { Contact, ContactActivity } from '../types/contact';

interface UseContactsReturn {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  getContacts: () => Promise<void>;
  getContactsByStatus: (status: Contact['status']) => Promise<Contact[]>;
  getContactsByTag: (tag: string) => Promise<Contact[]>;
  getContact: (id: string) => Promise<Contact | null>;
  createContact: (contactData: Omit<Contact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<Contact>;
  updateContact: (id: string, contactData: Partial<Omit<Contact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  searchContacts: (query: string) => Promise<Contact[]>;
  getContactActivities: (contactId: string) => Promise<ContactActivity[]>;
  addContactActivity: (activity: Omit<ContactActivity, 'id' | 'userId' | 'timestamp'>) => Promise<ContactActivity>;
  deleteContactActivity: (activityId: string) => Promise<void>;
}

/**
 * Hook for contact management
 */
export const useContacts = (): UseContactsReturn => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const contactService = ContactService.getInstance();
  
  // Load contacts initially
  useEffect(() => {
    getContacts();
  }, []);
  
  // Get all contacts
  const getContacts = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await contactService.getContacts();
      setContacts(result);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Get contacts by status
  const getContactsByStatus = useCallback(async (status: Contact['status']): Promise<Contact[]> => {
    try {
      return await contactService.getContactsByStatus(status);
    } catch (err) {
      console.error(`Error fetching contacts with status ${status}:`, err);
      setError(`Failed to load contacts with status ${status}`);
      return [];
    }
  }, []);
  
  // Get contacts by tag
  const getContactsByTag = useCallback(async (tag: string): Promise<Contact[]> => {
    try {
      return await contactService.getContactsByTag(tag);
    } catch (err) {
      console.error(`Error fetching contacts with tag ${tag}:`, err);
      setError(`Failed to load contacts with tag ${tag}`);
      return [];
    }
  }, []);
  
  // Get a contact by ID
  const getContact = useCallback(async (id: string): Promise<Contact | null> => {
    try {
      return await contactService.getContact(id);
    } catch (err) {
      console.error(`Error fetching contact ${id}:`, err);
      setError(`Failed to load contact`);
      return null;
    }
  }, []);
  
  // Create a new contact
  const createContact = useCallback(async (
    contactData: Omit<Contact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ): Promise<Contact> => {
    try {
      const newContact = await contactService.createContact(contactData);
      
      // Update local state
      setContacts(prevContacts => [...prevContacts, newContact]);
      
      return newContact;
    } catch (err) {
      console.error('Error creating contact:', err);
      setError('Failed to create contact');
      throw err;
    }
  }, []);
  
  // Update a contact
  const updateContact = useCallback(async (
    id: string,
    contactData: Partial<Omit<Contact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Contact> => {
    try {
      const updatedContact = await contactService.updateContact(id, contactData);
      
      // Update local state
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === id ? updatedContact : contact
        )
      );
      
      return updatedContact;
    } catch (err) {
      console.error(`Error updating contact ${id}:`, err);
      setError('Failed to update contact');
      throw err;
    }
  }, []);
  
  // Delete a contact
  const deleteContact = useCallback(async (id: string): Promise<void> => {
    try {
      await contactService.deleteContact(id);
      
      // Update local state
      setContacts(prevContacts => 
        prevContacts.filter(contact => contact.id !== id)
      );
    } catch (err) {
      console.error(`Error deleting contact ${id}:`, err);
      setError('Failed to delete contact');
      throw err;
    }
  }, []);
  
  // Search contacts
  const searchContacts = useCallback(async (query: string): Promise<Contact[]> => {
    try {
      return await contactService.searchContacts(query);
    } catch (err) {
      console.error(`Error searching contacts with query "${query}":`, err);
      setError('Failed to search contacts');
      return [];
    }
  }, []);
  
  // Get activities for a contact
  const getContactActivities = useCallback(async (contactId: string): Promise<ContactActivity[]> => {
    try {
      return await contactService.getContactActivities(contactId);
    } catch (err) {
      console.error(`Error fetching activities for contact ${contactId}:`, err);
      setError('Failed to load contact activities');
      return [];
    }
  }, []);
  
  // Add an activity to a contact
  const addContactActivity = useCallback(async (
    activity: Omit<ContactActivity, 'id' | 'userId' | 'timestamp'>
  ): Promise<ContactActivity> => {
    try {
      return await contactService.addContactActivity(activity);
    } catch (err) {
      console.error('Error adding contact activity:', err);
      setError('Failed to add contact activity');
      throw err;
    }
  }, []);
  
  // Delete a contact activity
  const deleteContactActivity = useCallback(async (activityId: string): Promise<void> => {
    try {
      await contactService.deleteContactActivity(activityId);
    } catch (err) {
      console.error(`Error deleting contact activity ${activityId}:`, err);
      setError('Failed to delete contact activity');
      throw err;
    }
  }, []);
  
  return {
    contacts,
    isLoading,
    error,
    getContacts,
    getContactsByStatus,
    getContactsByTag,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    searchContacts,
    getContactActivities,
    addContactActivity,
    deleteContactActivity
  };
}; 