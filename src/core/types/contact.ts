export interface ContactAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactCompany {
  id?: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  notes?: string;
}

export interface ContactLink {
  platform: string;
  url: string;
}

export interface Contact {
  id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: ContactCompany;
  jobTitle?: string;
  address?: ContactAddress;
  tags: string[];
  links?: ContactLink[];
  notes?: string;
  status: 'lead' | 'customer' | 'inactive';
  source?: string;
  lastContacted?: number;  // timestamp
  createdAt: number;  // timestamp
  updatedAt: number;  // timestamp
}

export interface ContactActivity {
  id: string;
  contactId: string;
  userId: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  title: string;
  description?: string;
  timestamp: number;
  metadata?: Record<string, any>;
} 