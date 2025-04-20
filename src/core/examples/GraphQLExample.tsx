import React from 'react';
import { useGraphQLQuery, useGraphQLMutation } from '../hooks/useGraphQL';
import { GET_CONTACTS, GET_CONTACT, CREATE_CONTACT } from '../graphql/queries/contacts';

// Define GraphQL response types
interface ContactsResponse {
  contacts: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: {
      name: string;
    };
    status: string;
  }[];
}

interface ContactResponse {
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: {
      name: string;
    };
    status: string;
  };
}

interface ContactInputData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
}

interface CreateContactInput {
  input: ContactInputData;
}

interface CreateContactResponse {
  createContact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    createdAt: number;
  };
}

// Example component using GraphQL queries with React Query
const GraphQLContactsExample: React.FC = () => {
  const { data, isLoading, error } = useGraphQLQuery<ContactsResponse, Record<string, never>>(
    GET_CONTACTS.loc?.source.body || ""
  );
  
  if (isLoading) return <div>Loading contacts...</div>;
  if (error) return <div>Error loading contacts: {error.message}</div>;
  
  return (
    <div>
      <h2>Contacts (GraphQL)</h2>
      <ul>
        {data?.contacts.map(contact => (
          <li key={contact.id}>
            {contact.firstName} {contact.lastName} ({contact.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

interface ContactDetailProps {
  contactId: string;
}

// Example component using GraphQL query with variables
const GraphQLContactDetailExample: React.FC<ContactDetailProps> = ({ contactId }) => {
  const { data, isLoading, error } = useGraphQLQuery<ContactResponse, { id: string }>(
    GET_CONTACT.loc?.source.body || "",
    { id: contactId }
  );
  
  if (isLoading) return <div>Loading contact details...</div>;
  if (error) return <div>Error loading contact: {error.message}</div>;
  if (!data?.contact) return <div>Contact not found</div>;
  
  const contact = data.contact;
  
  return (
    <div>
      <h2>Contact Details</h2>
      <p><strong>Name:</strong> {contact.firstName} {contact.lastName}</p>
      <p><strong>Email:</strong> {contact.email}</p>
      <p><strong>Phone:</strong> {contact.phone || 'N/A'}</p>
      {contact.company && (
        <p><strong>Company:</strong> {contact.company.name}</p>
      )}
      <p><strong>Status:</strong> {contact.status}</p>
    </div>
  );
};

interface CreateContactFormProps {
  onSuccess?: () => void;
}

// Example component using GraphQL mutation
const GraphQLCreateContactExample: React.FC<CreateContactFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = React.useState<ContactInputData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'LEAD'
  });
  
  const { mutate, isPending, error } = useGraphQLMutation<CreateContactResponse, Record<string, any>>(
    CREATE_CONTACT.loc?.source.body || ""
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    mutate(
      { input: formData } as any,
      {
        onSuccess: () => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            status: 'LEAD'
          });
          
          if (onSuccess) onSuccess();
        }
      }
    );
  };
  
  return (
    <div>
      <h2>Create Contact</h2>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        
        <div>
          <label>
            Last Name:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        
        <div>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        
        <div>
          <label>
            Phone:
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>
        </div>
        
        <button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Contact'}
        </button>
      </form>
    </div>
  );
};

export { GraphQLContactsExample, GraphQLContactDetailExample, GraphQLCreateContactExample }; 