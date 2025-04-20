export type DealStage = 
  'lead' | 
  'qualified' | 
  'proposal' | 
  'negotiation' | 
  'closed_won' | 
  'closed_lost';

export type DealPriority = 'low' | 'medium' | 'high';

export interface Deal {
  id: string;
  ownerId: string;
  contactId: string;  // Associated contact
  name: string;
  description?: string;
  stage: DealStage;
  amount: number;
  currency: string;
  probability: number;  // 0-100%
  priority: DealPriority;
  expectedCloseDate?: number;  // timestamp
  actualCloseDate?: number;  // timestamp
  createdAt: number;  // timestamp
  updatedAt: number;  // timestamp
  tags: string[];
  customFields?: Record<string, any>;
}

export interface DealActivity {
  id: string;
  dealId: string;
  userId: string;
  type: 'note' | 'stage_change' | 'amount_change' | 'task' | 'file';
  title: string;
  description?: string;
  previousValue?: any;
  newValue?: any;
  timestamp: number;  // timestamp
  metadata?: Record<string, any>;
}

export interface DealTask {
  id: string;
  dealId: string;
  assignedTo: string;
  title: string;
  description?: string;
  dueDate: number;  // timestamp
  isCompleted: boolean;
  completedAt?: number;  // timestamp
  priority: DealPriority;
  createdAt: number;  // timestamp
  updatedAt: number;  // timestamp
}

export interface DealPipeline {
  id: string;
  name: string;
  description?: string;
  stages: {
    id: DealStage;
    name: string;
    order: number;
  }[];
  createdAt: number;  // timestamp
  updatedAt: number;  // timestamp
} 