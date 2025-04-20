import { useFirestoreQuery, useFirestoreDocument, useCreateDocument, useUpdateDocument, useDeleteDocument } from './useFirestoreQuery';
import { Deal, DealActivity, DealTask, DealStage, DealPipeline } from '../types/deal';

// Collection names
const DEALS_COLLECTION = 'deals';
const DEAL_ACTIVITIES_COLLECTION = 'deal_activities';
const DEAL_TASKS_COLLECTION = 'deal_tasks';
const DEAL_PIPELINES_COLLECTION = 'deal_pipelines';

// Query keys
export const dealKeys = {
  all: ['deals'] as const,
  lists: () => [...dealKeys.all, 'list'] as const,
  list: (filters: any) => [...dealKeys.lists(), { filters }] as const,
  details: () => [...dealKeys.all, 'detail'] as const,
  detail: (id: string) => [...dealKeys.details(), id] as const,
  activities: (dealId: string) => [...dealKeys.detail(dealId), 'activities'] as const,
  tasks: (dealId: string) => [...dealKeys.detail(dealId), 'tasks'] as const,
  pipelines: () => [...dealKeys.all, 'pipelines'] as const,
  pipeline: (id: string) => [...dealKeys.pipelines(), id] as const,
};

/**
 * Hook for getting all deals
 */
export function useDeals() {
  return useFirestoreQuery<Deal>(
    DEALS_COLLECTION, 
    dealKeys.lists()
  );
}

/**
 * Hook for getting deals by stage
 */
export function useDealsByStage(stage: DealStage) {
  const { whereEqual } = useFirestoreService();
  
  return useFirestoreQuery<Deal>(
    DEALS_COLLECTION,
    dealKeys.list({ stage }),
    [whereEqual('stage', stage)]
  );
}

/**
 * Hook for getting deals by contact
 */
export function useDealsByContact(contactId: string) {
  const { whereEqual } = useFirestoreService();
  
  return useFirestoreQuery<Deal>(
    DEALS_COLLECTION,
    dealKeys.list({ contactId }),
    [whereEqual('contactId', contactId)],
    {
      enabled: !!contactId
    }
  );
}

/**
 * Hook for getting a single deal
 */
export function useDeal(dealId: string) {
  return useFirestoreDocument<Deal>(
    DEALS_COLLECTION,
    dealId,
    dealKeys.detail(dealId)
  );
}

/**
 * Hook for creating a deal
 */
export function useCreateDeal() {
  return useCreateDocument<Deal>(
    DEALS_COLLECTION,
    dealKeys.lists()
  );
}

/**
 * Hook for updating a deal
 */
export function useUpdateDeal() {
  return useUpdateDocument<Deal>(
    DEALS_COLLECTION,
    dealKeys.lists()
  );
}

/**
 * Hook for deleting a deal
 */
export function useDeleteDeal() {
  return useDeleteDocument(
    DEALS_COLLECTION,
    dealKeys.lists()
  );
}

/**
 * Hook for getting deal activities
 */
export function useDealActivities(dealId: string) {
  const { whereEqual, orderByField } = useFirestoreService();
  
  return useFirestoreQuery<DealActivity>(
    DEAL_ACTIVITIES_COLLECTION,
    dealKeys.activities(dealId),
    [
      whereEqual('dealId', dealId),
      orderByField('timestamp', 'desc')
    ],
    {
      enabled: !!dealId
    }
  );
}

/**
 * Hook for adding a deal activity
 */
export function useAddDealActivity() {
  return useCreateDocument<DealActivity>(
    DEAL_ACTIVITIES_COLLECTION,
    dealKeys.all // We'll invalidate all deal queries
  );
}

/**
 * Hook for getting deal tasks
 */
export function useDealTasks(dealId: string) {
  const { whereEqual, orderByField } = useFirestoreService();
  
  return useFirestoreQuery<DealTask>(
    DEAL_TASKS_COLLECTION,
    dealKeys.tasks(dealId),
    [
      whereEqual('dealId', dealId),
      orderByField('dueDate', 'asc')
    ],
    {
      enabled: !!dealId
    }
  );
}

/**
 * Hook for creating a deal task
 */
export function useCreateDealTask() {
  return useCreateDocument<DealTask>(
    DEAL_TASKS_COLLECTION,
    dealKeys.all // We'll invalidate all deal queries
  );
}

/**
 * Hook for updating a deal task
 */
export function useUpdateDealTask() {
  return useUpdateDocument<DealTask>(
    DEAL_TASKS_COLLECTION,
    dealKeys.all // We'll invalidate all deal queries
  );
}

/**
 * Hook for deleting a deal task
 */
export function useDeleteDealTask() {
  return useDeleteDocument(
    DEAL_TASKS_COLLECTION,
    dealKeys.all // We'll invalidate all deal queries
  );
}

/**
 * Hook for getting all pipelines
 */
export function usePipelines() {
  return useFirestoreQuery<DealPipeline>(
    DEAL_PIPELINES_COLLECTION,
    dealKeys.pipelines()
  );
}

/**
 * Hook for getting a single pipeline
 */
export function usePipeline(pipelineId: string) {
  return useFirestoreDocument<DealPipeline>(
    DEAL_PIPELINES_COLLECTION,
    pipelineId,
    dealKeys.pipeline(pipelineId)
  );
}

/**
 * Helper function to get FirestoreService instance
 */
function useFirestoreService() {
  const { FirestoreService } = require('../firebase');
  return FirestoreService.getInstance();
} 