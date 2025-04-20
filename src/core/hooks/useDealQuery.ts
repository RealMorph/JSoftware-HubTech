import { useFetch, useDataMutation, useQueryInvalidation } from './useReactQuery';
import { queryKeys } from '../query/queryKeys';
import { DealService } from '../firebase/deal-service';
import { Deal, DealActivity, DealTask, DealPipeline, DealStage } from '../types/deal';
import { useAuth } from './useAuth';

/**
 * Custom React Query hook for deals
 */
export function useDealQuery() {
  const { currentUser } = useAuth();
  const dealService = DealService.getInstance();
  const { invalidateQueries } = useQueryInvalidation();
  const userId = currentUser?.uid;

  // Deal queries
  const useDeals = (enabled = true) => {
    return useFetch<Deal[]>(
      queryKeys.deals.all,
      () => dealService.getDeals(),
      {
        enabled: !!userId && enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    );
  };

  const useDealsByStage = (stage: DealStage, enabled = true) => {
    return useFetch<Deal[]>(
      [...queryKeys.deals.all, 'stage', stage],
      () => dealService.getDealsByStage(stage),
      {
        enabled: !!userId && enabled,
      }
    );
  };

  const useDealsByContact = (contactId: string | undefined, enabled = true) => {
    return useFetch<Deal[]>(
      contactId ? queryKeys.deals.byContact(contactId) : [],
      () => (contactId ? dealService.getDealsByContact(contactId) : Promise.resolve([])),
      {
        enabled: !!userId && !!contactId && enabled,
      }
    );
  };

  const useDeal = (dealId: string | undefined, enabled = true) => {
    return useFetch<Deal | null>(
      dealId ? queryKeys.deals.details(dealId) : [],
      () => (dealId ? dealService.getDeal(dealId) : Promise.resolve(null)),
      {
        enabled: !!userId && !!dealId && enabled,
      }
    );
  };

  // Deal activity queries
  const useDealActivities = (dealId: string | undefined, enabled = true) => {
    return useFetch<DealActivity[]>(
      dealId ? [...queryKeys.deals.details(dealId), 'activities'] : [],
      () => (dealId ? dealService.getDealActivities(dealId) : Promise.resolve([])),
      {
        enabled: !!userId && !!dealId && enabled,
      }
    );
  };

  // Deal task queries
  const useDealTasks = (dealId: string | undefined, enabled = true) => {
    return useFetch<DealTask[]>(
      dealId ? [...queryKeys.deals.details(dealId), 'tasks'] : [],
      () => (dealId ? dealService.getDealTasks(dealId) : Promise.resolve([])),
      {
        enabled: !!userId && !!dealId && enabled,
      }
    );
  };

  // Pipeline queries
  const usePipelines = (enabled = true) => {
    return useFetch<DealPipeline[]>(
      ['pipelines'],
      () => dealService.getPipelines(),
      {
        enabled: !!userId && enabled,
        staleTime: 10 * 60 * 1000, // 10 minutes
      }
    );
  };

  const usePipeline = (pipelineId: string | undefined, enabled = true) => {
    return useFetch<DealPipeline | null>(
      pipelineId ? ['pipelines', pipelineId] : [],
      () => (pipelineId ? dealService.getPipeline(pipelineId) : Promise.resolve(null)),
      {
        enabled: !!userId && !!pipelineId && enabled,
      }
    );
  };

  // Deal mutations
  const useCreateDeal = () => {
    return useDataMutation<
      Deal, 
      Omit<Deal, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
    >(
      (dealData) => dealService.createDeal(dealData),
      {
        onSuccess: (createdDeal) => {
          // If the deal is associated with a contact, invalidate that contact's deals
          if (createdDeal.contactId) {
            invalidateQueries([queryKeys.deals.byContact(createdDeal.contactId)]);
          }
        },
      },
      [queryKeys.deals.all]
    );
  };

  const useUpdateDeal = () => {
    return useDataMutation<
      Deal,
      {
        dealId: string;
        data: Partial<Omit<Deal, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>;
        trackChanges?: boolean;
      }
    >(
      ({ dealId, data, trackChanges = true }) => dealService.updateDeal(dealId, data, trackChanges),
      {
        onSuccess: (updatedDeal) => {
          invalidateQueries([
            queryKeys.deals.details(updatedDeal.id),
            [...queryKeys.deals.details(updatedDeal.id), 'activities']
          ]);
          // If the deal is associated with a contact, invalidate that contact's deals
          if (updatedDeal.contactId) {
            invalidateQueries([queryKeys.deals.byContact(updatedDeal.contactId)]);
          }
        },
      },
      [queryKeys.deals.all]
    );
  };

  const useDeleteDeal = () => {
    return useDataMutation<void, { dealId: string; contactId?: string }>(
      ({ dealId }) => dealService.deleteDeal(dealId),
      {
        onSuccess: (_, { contactId }) => {
          // If the deal is associated with a contact, invalidate that contact's deals
          if (contactId) {
            invalidateQueries([queryKeys.deals.byContact(contactId)]);
          }
        },
      },
      [queryKeys.deals.all]
    );
  };

  // Deal activity mutations
  const useAddDealActivity = () => {
    return useDataMutation<
      DealActivity,
      Omit<DealActivity, 'id' | 'userId' | 'timestamp'>
    >(
      (activityData) => dealService.addDealActivity(activityData),
      {
        onSuccess: (activity) => {
          invalidateQueries([
            [...queryKeys.deals.details(activity.dealId), 'activities']
          ]);
        },
      }
    );
  };

  // Deal task mutations
  const useCreateDealTask = () => {
    return useDataMutation<
      DealTask,
      Omit<DealTask, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'completedAt'>
    >(
      (taskData) => dealService.createDealTask(taskData),
      {
        onSuccess: (task) => {
          invalidateQueries([
            [...queryKeys.deals.details(task.dealId), 'tasks']
          ]);
        },
      }
    );
  };

  const useUpdateDealTask = () => {
    return useDataMutation<
      DealTask,
      {
        taskId: string;
        data: Partial<Omit<DealTask, 'id' | 'dealId' | 'createdAt' | 'updatedAt'>>;
      }
    >(
      ({ taskId, data }) => dealService.updateDealTask(taskId, data),
      {
        onSuccess: (task) => {
          invalidateQueries([
            [...queryKeys.deals.details(task.dealId), 'tasks']
          ]);
        },
      }
    );
  };

  const useDeleteDealTask = () => {
    return useDataMutation<
      void,
      { taskId: string; dealId: string }
    >(
      ({ taskId }) => dealService.deleteDealTask(taskId),
      {
        onSuccess: (_, { dealId }) => {
          invalidateQueries([
            [...queryKeys.deals.details(dealId), 'tasks']
          ]);
        },
      }
    );
  };

  return {
    // Queries
    useDeals,
    useDealsByStage,
    useDealsByContact,
    useDeal,
    useDealActivities,
    useDealTasks,
    usePipelines,
    usePipeline,
    
    // Mutations
    useCreateDeal,
    useUpdateDeal,
    useDeleteDeal,
    useAddDealActivity,
    useCreateDealTask,
    useUpdateDealTask,
    useDeleteDealTask,
  };
} 