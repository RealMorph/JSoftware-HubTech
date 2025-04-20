import { 
  GET_CONTACTS, 
  GET_CONTACT, 
  CREATE_CONTACT, 
  UPDATE_CONTACT, 
  DELETE_CONTACT 
} from '../graphql/queries/contacts';
import { 
  GET_DEALS, 
  GET_DEAL, 
  CREATE_DEAL, 
  UPDATE_DEAL,
  DELETE_DEAL 
} from '../graphql/queries/deals';
import { createQueryHook, createMutationHook } from './useGraphQL';

// Contact Types
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: {
    id?: string;
    name: string;
  };
  status: string;
  tags?: string[];
  lastContacted?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  contacts: Contact[];
}

export interface ContactResponse {
  contact: Contact;
}

export interface ContactInputData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyId?: string;
  status?: string;
}

export interface CreateContactVariables extends Record<string, unknown> {
  input: ContactInputData;
}

export interface UpdateContactVariables extends Record<string, unknown> {
  id: string;
  input: Partial<ContactInputData>;
}

export interface CreateContactResponse {
  createContact: Contact;
}

export interface UpdateContactResponse {
  updateContact: Contact;
}

export interface DeleteContactResponse {
  deleteContact: {
    success: boolean;
    message?: string;
  };
}

// Deal Types
export interface Deal {
  id: string;
  name: string;
  description?: string;
  stage: string;
  amount: number;
  currency: string;
  probability?: number;
  priority?: string;
  contactId?: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DealsResponse {
  deals: Deal[];
}

export interface DealResponse {
  deal: Deal;
}

export interface DealInputData {
  name: string;
  description?: string;
  stage: string;
  amount: number;
  currency: string;
  contactId?: string;
  expectedCloseDate?: string;
}

export interface CreateDealVariables extends Record<string, unknown> {
  input: DealInputData;
}

export interface UpdateDealVariables extends Record<string, unknown> {
  id: string;
  input: Partial<DealInputData>;
}

export interface CreateDealResponse {
  createDeal: Deal;
}

export interface UpdateDealResponse {
  updateDeal: Deal;
}

export interface DeleteDealResponse {
  deleteDeal: {
    success: boolean;
    message?: string;
  };
}

// Contact Hooks
export const useContacts = createQueryHook<ContactsResponse>(GET_CONTACTS.loc?.source.body || "");

export const useContact = createQueryHook<ContactResponse, { id: string }>(GET_CONTACT.loc?.source.body || "");

export const useCreateContact = createMutationHook<CreateContactResponse, CreateContactVariables>(
  CREATE_CONTACT.loc?.source.body || ""
);

export const useUpdateContact = createMutationHook<UpdateContactResponse, UpdateContactVariables>(
  UPDATE_CONTACT.loc?.source.body || ""
);

export const useDeleteContact = createMutationHook<DeleteContactResponse, { id: string }>(
  DELETE_CONTACT.loc?.source.body || ""
);

// Deal Hooks
export const useDeals = createQueryHook<DealsResponse>(GET_DEALS.loc?.source.body || "");

export const useDeal = createQueryHook<DealResponse, { id: string }>(GET_DEAL.loc?.source.body || "");

export const useCreateDeal = createMutationHook<CreateDealResponse, CreateDealVariables>(
  CREATE_DEAL.loc?.source.body || ""
);

export const useUpdateDeal = createMutationHook<UpdateDealResponse, UpdateDealVariables>(
  UPDATE_DEAL.loc?.source.body || ""
);

export const useDeleteDeal = createMutationHook<DeleteDealResponse, { id: string }>(
  DELETE_DEAL.loc?.source.body || ""
); 