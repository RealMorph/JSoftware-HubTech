import { useState, useEffect, useCallback } from 'react';
import { DealService } from '../firebase';
import { Deal, DealActivity, DealTask, DealPipeline, DealStage } from '../types/deal';

interface UseDealsReturn {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  getDeals: () => Promise<void>;
  getDealsByStage: (stage: DealStage) => Promise<Deal[]>;
  getDealsByContact: (contactId: string) => Promise<Deal[]>;
  getDeal: (id: string) => Promise<Deal | null>;
  createDeal: (dealData: Omit<Deal, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<Deal>;
  updateDeal: (
    id: string, 
    dealData: Partial<Omit<Deal, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>,
    trackChanges?: boolean
  ) => Promise<Deal>;
  deleteDeal: (id: string) => Promise<void>;
  getDealActivities: (dealId: string) => Promise<DealActivity[]>;
  addDealActivity: (activity: Omit<DealActivity, 'id' | 'userId' | 'timestamp'>) => Promise<DealActivity>;
  getDealTasks: (dealId: string) => Promise<DealTask[]>;
  createDealTask: (task: Omit<DealTask, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'completedAt'>) => Promise<DealTask>;
  updateDealTask: (
    taskId: string, 
    taskData: Partial<Omit<DealTask, 'id' | 'dealId' | 'createdAt' | 'updatedAt'>>
  ) => Promise<DealTask>;
  deleteDealTask: (taskId: string) => Promise<void>;
  getPipelines: () => Promise<DealPipeline[]>;
  ensureDefaultPipeline: () => Promise<DealPipeline>;
}

/**
 * Hook for deal management
 */
export const useDeals = (): UseDealsReturn => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const dealService = DealService.getInstance();
  
  // Load deals initially
  useEffect(() => {
    getDeals();
  }, []);
  
  // Get all deals
  const getDeals = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await dealService.getDeals();
      setDeals(result);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Get deals by stage
  const getDealsByStage = useCallback(async (stage: DealStage): Promise<Deal[]> => {
    try {
      return await dealService.getDealsByStage(stage);
    } catch (err) {
      console.error(`Error fetching deals with stage ${stage}:`, err);
      setError(`Failed to load deals with stage ${stage}`);
      return [];
    }
  }, []);
  
  // Get deals by contact
  const getDealsByContact = useCallback(async (contactId: string): Promise<Deal[]> => {
    try {
      return await dealService.getDealsByContact(contactId);
    } catch (err) {
      console.error(`Error fetching deals for contact ${contactId}:`, err);
      setError(`Failed to load deals for contact`);
      return [];
    }
  }, []);
  
  // Get a deal by ID
  const getDeal = useCallback(async (id: string): Promise<Deal | null> => {
    try {
      return await dealService.getDeal(id);
    } catch (err) {
      console.error(`Error fetching deal ${id}:`, err);
      setError(`Failed to load deal`);
      return null;
    }
  }, []);
  
  // Create a new deal
  const createDeal = useCallback(async (
    dealData: Omit<Deal, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ): Promise<Deal> => {
    try {
      const newDeal = await dealService.createDeal(dealData);
      
      // Update local state
      setDeals(prevDeals => [...prevDeals, newDeal]);
      
      return newDeal;
    } catch (err) {
      console.error('Error creating deal:', err);
      setError('Failed to create deal');
      throw err;
    }
  }, []);
  
  // Update a deal
  const updateDeal = useCallback(async (
    id: string,
    dealData: Partial<Omit<Deal, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>,
    trackChanges: boolean = true
  ): Promise<Deal> => {
    try {
      const updatedDeal = await dealService.updateDeal(id, dealData, trackChanges);
      
      // Update local state
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === id ? updatedDeal : deal
        )
      );
      
      return updatedDeal;
    } catch (err) {
      console.error(`Error updating deal ${id}:`, err);
      setError('Failed to update deal');
      throw err;
    }
  }, []);
  
  // Delete a deal
  const deleteDeal = useCallback(async (id: string): Promise<void> => {
    try {
      await dealService.deleteDeal(id);
      
      // Update local state
      setDeals(prevDeals => 
        prevDeals.filter(deal => deal.id !== id)
      );
    } catch (err) {
      console.error(`Error deleting deal ${id}:`, err);
      setError('Failed to delete deal');
      throw err;
    }
  }, []);
  
  // Get activities for a deal
  const getDealActivities = useCallback(async (dealId: string): Promise<DealActivity[]> => {
    try {
      return await dealService.getDealActivities(dealId);
    } catch (err) {
      console.error(`Error fetching activities for deal ${dealId}:`, err);
      setError('Failed to load deal activities');
      return [];
    }
  }, []);
  
  // Add an activity to a deal
  const addDealActivity = useCallback(async (
    activity: Omit<DealActivity, 'id' | 'userId' | 'timestamp'>
  ): Promise<DealActivity> => {
    try {
      return await dealService.addDealActivity(activity);
    } catch (err) {
      console.error('Error adding deal activity:', err);
      setError('Failed to add deal activity');
      throw err;
    }
  }, []);
  
  // Get tasks for a deal
  const getDealTasks = useCallback(async (dealId: string): Promise<DealTask[]> => {
    try {
      return await dealService.getDealTasks(dealId);
    } catch (err) {
      console.error(`Error fetching tasks for deal ${dealId}:`, err);
      setError('Failed to load deal tasks');
      return [];
    }
  }, []);
  
  // Create a new task for a deal
  const createDealTask = useCallback(async (
    task: Omit<DealTask, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'completedAt'>
  ): Promise<DealTask> => {
    try {
      return await dealService.createDealTask(task);
    } catch (err) {
      console.error('Error creating deal task:', err);
      setError('Failed to create deal task');
      throw err;
    }
  }, []);
  
  // Update a deal task
  const updateDealTask = useCallback(async (
    taskId: string, 
    taskData: Partial<Omit<DealTask, 'id' | 'dealId' | 'createdAt' | 'updatedAt'>>
  ): Promise<DealTask> => {
    try {
      return await dealService.updateDealTask(taskId, taskData);
    } catch (err) {
      console.error(`Error updating deal task ${taskId}:`, err);
      setError('Failed to update deal task');
      throw err;
    }
  }, []);
  
  // Delete a deal task
  const deleteDealTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      await dealService.deleteDealTask(taskId);
    } catch (err) {
      console.error(`Error deleting deal task ${taskId}:`, err);
      setError('Failed to delete deal task');
      throw err;
    }
  }, []);
  
  // Get all pipelines
  const getPipelines = useCallback(async (): Promise<DealPipeline[]> => {
    try {
      return await dealService.getPipelines();
    } catch (err) {
      console.error('Error fetching deal pipelines:', err);
      setError('Failed to load deal pipelines');
      return [];
    }
  }, []);
  
  // Ensure default pipeline exists
  const ensureDefaultPipeline = useCallback(async (): Promise<DealPipeline> => {
    try {
      return await dealService.ensureDefaultPipeline();
    } catch (err) {
      console.error('Error ensuring default pipeline:', err);
      setError('Failed to create default pipeline');
      throw err;
    }
  }, []);
  
  return {
    deals,
    isLoading,
    error,
    getDeals,
    getDealsByStage,
    getDealsByContact,
    getDeal,
    createDeal,
    updateDeal,
    deleteDeal,
    getDealActivities,
    addDealActivity,
    getDealTasks,
    createDealTask,
    updateDealTask,
    deleteDealTask,
    getPipelines,
    ensureDefaultPipeline
  };
}; 