import { useFetch, useDataMutation, useQueryInvalidation } from './useReactQuery';
import { queryKeys } from '../query/queryKeys';
import { ContactService } from '../firebase/contact-service';
import { Contact, ContactActivity } from '../types/contact';
import { useAuth } from './useAuth';

/**
 * Custom React Query hook for contacts
 */
export function useContactQuery() {
  const { currentUser } = useAuth();
  const contactService = ContactService.getInstance();
  const { invalidateQueries } = useQueryInvalidation();
  const userId = currentUser?.uid;

  // Contact queries
  const useContacts = (enabled = true) => {
    return useFetch<Contact[]>(
      queryKeys.contacts.all,
      () => contactService.getContacts(),
      {
        enabled: !!userId && enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    );
  };

  const useContactsByStatus = (status: Contact['status'], enabled = true) => {
    return useFetch<Contact[]>(
      [...queryKeys.contacts.all, 'status', status],
      () => contactService.getContactsByStatus(status),
      {
        enabled: !!userId && enabled,
      }
    );
  };

  const useContactsByTag = (tag: string, enabled = true) => {
    return useFetch<Contact[]>(
      [...queryKeys.contacts.all, 'tag', tag],
      () => contactService.getContactsByTag(tag),
      {
        enabled: !!userId && enabled,
      }
    );
  };

  const useContact = (contactId: string | undefined, enabled = true) => {
    return useFetch<Contact | null>(
      contactId ? queryKeys.contacts.details(contactId) : [],
      () => (contactId ? contactService.getContact(contactId) : Promise.resolve(null)),
      {
        enabled: !!userId && !!contactId && enabled,
      }
    );
  };

  const useContactActivities = (contactId: string | undefined, enabled = true) => {
    return useFetch<ContactActivity[]>(
      contactId ? [...queryKeys.contacts.details(contactId), 'activities'] : [],
      () => (contactId ? contactService.getContactActivities(contactId) : Promise.resolve([])),
      {
        enabled: !!userId && !!contactId && enabled,
      }
    );
  };

  // Contact mutations
  const useCreateContact = () => {
    return useDataMutation<
      Contact, 
      Omit<Contact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
    >(
      (contactData) => contactService.createContact(contactData),
      {},
      [queryKeys.contacts.all]
    );
  };

  const useUpdateContact = () => {
    return useDataMutation<
      Contact,
      {
        contactId: string;
        data: Partial<Omit<Contact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>;
      }
    >(
      ({ contactId, data }) => contactService.updateContact(contactId, data),
      {
        onSuccess: (updatedContact) => {
          invalidateQueries([
            queryKeys.contacts.details(updatedContact.id),
            [...queryKeys.contacts.details(updatedContact.id), 'activities']
          ]);
        },
      },
      [queryKeys.contacts.all]
    );
  };

  const useDeleteContact = () => {
    return useDataMutation<void, string>(
      (contactId) => contactService.deleteContact(contactId),
      {},
      [queryKeys.contacts.all]
    );
  };

  const useAddContactActivity = () => {
    return useDataMutation<
      ContactActivity,
      Omit<ContactActivity, 'id' | 'userId' | 'timestamp'>
    >(
      (activityData) => contactService.addContactActivity(activityData),
      {
        onSuccess: (activity) => {
          invalidateQueries([
            [...queryKeys.contacts.details(activity.contactId), 'activities'],
            queryKeys.contacts.details(activity.contactId)
          ]);
        },
      }
    );
  };

  const useDeleteContactActivity = () => {
    return useDataMutation<
      void,
      { activityId: string; contactId: string }
    >(
      ({ activityId }) => contactService.deleteContactActivity(activityId),
      {
        onSuccess: (_, { contactId }) => {
          invalidateQueries([
            [...queryKeys.contacts.details(contactId), 'activities']
          ]);
        },
      }
    );
  };

  const useSearchContacts = (query: string, enabled = true) => {
    return useFetch<Contact[]>(
      [...queryKeys.contacts.all, 'search', query],
      () => contactService.searchContacts(query),
      {
        enabled: !!userId && query.length > 0 && enabled,
        staleTime: 1 * 60 * 1000, // 1 minute
      }
    );
  };

  return {
    useContacts,
    useContactsByStatus,
    useContactsByTag,
    useContact,
    useContactActivities,
    useCreateContact,
    useUpdateContact,
    useDeleteContact,
    useAddContactActivity,
    useDeleteContactActivity,
    useSearchContacts,
  };
} 