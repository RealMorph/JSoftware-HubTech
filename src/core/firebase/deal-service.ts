import { FirestoreService } from './firebase-db-service';
import { FirebaseAuthService } from './firebase-auth-service';
import { Deal, DealActivity, DealTask, DealPipeline, DealStage } from '../types/deal';
import { WebSocketService } from './websocket-service';

export class DealService {
  private static instance: DealService;
  private readonly DEALS_COLLECTION = 'deals';
  private readonly DEAL_ACTIVITIES_COLLECTION = 'deal_activities';
  private readonly DEAL_TASKS_COLLECTION = 'deal_tasks';
  private readonly DEAL_PIPELINES_COLLECTION = 'deal_pipelines';
  
  private firestoreService: FirestoreService;
  private authService: FirebaseAuthService;
  private webSocketService: WebSocketService;
  
  private constructor() {
    this.firestoreService = FirestoreService.getInstance();
    this.authService = FirebaseAuthService.getInstance();
    this.webSocketService = WebSocketService.getInstance();
  }
  
  public static getInstance(): DealService {
    if (!DealService.instance) {
      DealService.instance = new DealService();
    }
    return DealService.instance;
  }
  
  /**
   * Get all deals for the current user
   */
  public async getDeals(): Promise<Deal[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    return await this.firestoreService.queryDocuments<Deal>(
      this.DEALS_COLLECTION,
      [this.firestoreService.whereEqual('ownerId', currentUser.uid)]
    );
  }
  
  /**
   * Get deals by stage
   * @param stage The stage to filter by
   */
  public async getDealsByStage(stage: DealStage): Promise<Deal[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    return await this.firestoreService.queryDocuments<Deal>(
      this.DEALS_COLLECTION,
      [
        this.firestoreService.whereEqual('ownerId', currentUser.uid),
        this.firestoreService.whereEqual('stage', stage)
      ]
    );
  }
  
  /**
   * Get deals by contact
   * @param contactId The contact ID to filter by
   */
  public async getDealsByContact(contactId: string): Promise<Deal[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    return await this.firestoreService.queryDocuments<Deal>(
      this.DEALS_COLLECTION,
      [
        this.firestoreService.whereEqual('ownerId', currentUser.uid),
        this.firestoreService.whereEqual('contactId', contactId)
      ]
    );
  }
  
  /**
   * Get a deal by ID
   * @param dealId The deal ID
   */
  public async getDeal(dealId: string): Promise<Deal | null> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return null;
    
    const deal = await this.firestoreService.getDocumentData<Deal>(
      this.DEALS_COLLECTION,
      dealId
    );
    
    // Ensure the user owns the deal
    if (deal && deal.ownerId === currentUser.uid) {
      return deal;
    }
    
    return null;
  }
  
  /**
   * Create a new deal
   * @param dealData The deal data
   */
  public async createDeal(dealData: Omit<Deal, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const now = Date.now();
    
    const newDeal: Omit<Deal, 'id'> = {
      ownerId: currentUser.uid,
      createdAt: now,
      updatedAt: now,
      ...dealData
    };
    
    const dealId = await this.firestoreService.addDocument(
      this.DEALS_COLLECTION,
      newDeal
    );
    
    const createdDeal: Deal = {
      id: dealId as string,
      ...newDeal
    };
    
    // Log activity for deal creation
    await this.addDealActivity({
      dealId: dealId as string,
      type: 'note',
      title: 'Deal created',
      description: `Deal "${dealData.name}" was created.`
    });
    
    // Log to WebSocketService for real-time updates
    this.webSocketService.publishActivity({
      type: 'deal_created',
      entityType: 'deal',
      entityId: dealId as string,
      data: {
        name: dealData.name,
        amount: dealData.amount,
        stage: dealData.stage
      }
    });
    
    return createdDeal;
  }
  
  /**
   * Update a deal
   * @param dealId The deal ID
   * @param dealData The deal data to update
   * @param trackChanges Whether to track changes as activities
   */
  public async updateDeal(
    dealId: string, 
    dealData: Partial<Omit<Deal, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>,
    trackChanges: boolean = true
  ): Promise<Deal> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the deal first to verify ownership and track changes
    const existingDeal = await this.getDeal(dealId);
    if (!existingDeal) {
      throw new Error('Deal not found or you do not have permission to update it');
    }
    
    const updateData = {
      ...dealData,
      updatedAt: Date.now()
    };
    
    await this.firestoreService.updateDocument(
      this.DEALS_COLLECTION,
      dealId,
      updateData
    );
    
    // Track changes if requested
    if (trackChanges) {
      // Check for stage change
      if (dealData.stage && dealData.stage !== existingDeal.stage) {
        await this.addDealActivity({
          dealId,
          type: 'stage_change',
          title: 'Deal stage changed',
          description: `Deal stage changed from "${existingDeal.stage}" to "${dealData.stage}".`,
          previousValue: existingDeal.stage,
          newValue: dealData.stage
        });
      }
      
      // Check for amount change
      if (dealData.amount !== undefined && dealData.amount !== existingDeal.amount) {
        await this.addDealActivity({
          dealId,
          type: 'amount_change',
          title: 'Deal amount changed',
          description: `Deal amount changed from ${existingDeal.amount} to ${dealData.amount}.`,
          previousValue: existingDeal.amount,
          newValue: dealData.amount
        });
      }
    }
    
    const updatedDeal = await this.getDeal(dealId);
    if (!updatedDeal) {
      throw new Error('Failed to retrieve updated deal');
    }
    
    // Log to WebSocketService for real-time updates
    this.webSocketService.publishActivity({
      type: 'deal_updated',
      entityType: 'deal',
      entityId: dealId,
      data: {
        name: updatedDeal.name,
        changedFields: Object.keys(dealData)
      }
    });
    
    return updatedDeal;
  }
  
  /**
   * Delete a deal
   * @param dealId The deal ID
   */
  public async deleteDeal(dealId: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the deal first to verify ownership
    const deal = await this.getDeal(dealId);
    if (!deal) {
      throw new Error('Deal not found or you do not have permission to delete it');
    }
    
    // Store deal info before deletion for the activity log
    const dealName = deal.name;
    
    await this.firestoreService.deleteDocument(this.DEALS_COLLECTION, dealId);
    
    // Delete all activities and tasks associated with this deal
    const [activities, tasks] = await Promise.all([
      this.getDealActivities(dealId),
      this.getDealTasks(dealId)
    ]);
    
    // Delete activities in batches
    const deleteActivityPromises = activities.map(activity => 
      this.firestoreService.deleteDocument(this.DEAL_ACTIVITIES_COLLECTION, activity.id)
    );
    
    // Delete tasks in batches
    const deleteTaskPromises = tasks.map(task => 
      this.firestoreService.deleteDocument(this.DEAL_TASKS_COLLECTION, task.id)
    );
    
    await Promise.all([...deleteActivityPromises, ...deleteTaskPromises]);
    
    // Log to WebSocketService for real-time updates
    this.webSocketService.publishActivity({
      type: 'deal_deleted',
      entityType: 'deal',
      entityId: dealId,
      data: {
        name: dealName
      }
    });
  }
  
  /**
   * Get activities for a deal
   * @param dealId The deal ID
   */
  public async getDealActivities(dealId: string): Promise<DealActivity[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    // Get the deal first to verify ownership
    const deal = await this.getDeal(dealId);
    if (!deal) {
      return [];
    }
    
    const activities = await this.firestoreService.queryDocuments<DealActivity>(
      this.DEAL_ACTIVITIES_COLLECTION,
      [this.firestoreService.whereEqual('dealId', dealId)]
    );
    
    // Sort by timestamp in descending order (newest first)
    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  /**
   * Add an activity to a deal
   * @param activity The activity data
   */
  public async addDealActivity(
    activity: Omit<DealActivity, 'id' | 'userId' | 'timestamp'>
  ): Promise<DealActivity> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the deal first to verify ownership
    const deal = await this.getDeal(activity.dealId);
    if (!deal) {
      throw new Error('Deal not found or you do not have permission to add activity');
    }
    
    const now = Date.now();
    
    const newActivity: Omit<DealActivity, 'id'> = {
      ...activity,
      userId: currentUser.uid,
      timestamp: now
    };
    
    const activityId = await this.firestoreService.addDocument(
      this.DEAL_ACTIVITIES_COLLECTION,
      newActivity
    );
    
    return {
      id: activityId as string,
      ...newActivity
    };
  }
  
  /**
   * Get tasks for a deal
   * @param dealId The deal ID
   */
  public async getDealTasks(dealId: string): Promise<DealTask[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    // Get the deal first to verify ownership
    const deal = await this.getDeal(dealId);
    if (!deal) {
      return [];
    }
    
    const tasks = await this.firestoreService.queryDocuments<DealTask>(
      this.DEAL_TASKS_COLLECTION,
      [this.firestoreService.whereEqual('dealId', dealId)]
    );
    
    // Sort by due date (upcoming first)
    return tasks.sort((a, b) => a.dueDate - b.dueDate);
  }
  
  /**
   * Create a new task for a deal
   * @param task The task data
   */
  public async createDealTask(
    task: Omit<DealTask, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'completedAt'>
  ): Promise<DealTask> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the deal first to verify ownership
    const deal = await this.getDeal(task.dealId);
    if (!deal) {
      throw new Error('Deal not found or you do not have permission to add task');
    }
    
    const now = Date.now();
    
    const newTask: Omit<DealTask, 'id'> = {
      ...task,
      createdAt: now,
      updatedAt: now,
      isCompleted: false
    };
    
    const taskId = await this.firestoreService.addDocument(
      this.DEAL_TASKS_COLLECTION,
      newTask
    );
    
    const createdTask: DealTask = {
      id: taskId as string,
      ...newTask
    };
    
    // Log activity for task creation
    await this.addDealActivity({
      dealId: task.dealId,
      type: 'task',
      title: 'Task created',
      description: `Task "${task.title}" was created.`
    });
    
    // Log to WebSocketService for real-time updates
    this.webSocketService.publishActivity({
      type: 'task_created',
      entityType: 'task',
      entityId: taskId as string,
      data: {
        title: task.title,
        dealId: task.dealId,
        dueDate: task.dueDate
      }
    });
    
    return createdTask;
  }
  
  /**
   * Update a deal task
   * @param taskId The task ID
   * @param taskData The task data to update
   */
  public async updateDealTask(
    taskId: string, 
    taskData: Partial<Omit<DealTask, 'id' | 'dealId' | 'createdAt' | 'updatedAt'>>
  ): Promise<DealTask> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the task first
    const task = await this.firestoreService.getDocumentData<DealTask>(
      this.DEAL_TASKS_COLLECTION,
      taskId
    );
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Get the deal to verify ownership
    const deal = await this.getDeal(task.dealId);
    if (!deal) {
      throw new Error('Deal not found or you do not have permission to update task');
    }
    
    const now = Date.now();
    let updatedFields: Partial<DealTask> = {
      ...taskData,
      updatedAt: now
    };
    
    // If task is being marked as completed, add completedAt timestamp
    if (taskData.isCompleted === true && !task.isCompleted) {
      updatedFields.completedAt = now;
      
      // Log activity for task completion
      await this.addDealActivity({
        dealId: task.dealId,
        type: 'task',
        title: 'Task completed',
        description: `Task "${task.title}" was completed.`
      });
      
      // Log to WebSocketService for real-time updates
      this.webSocketService.publishActivity({
        type: 'task_completed',
        entityType: 'task',
        entityId: taskId,
        data: {
          title: task.title,
          dealId: task.dealId,
          completedAt: now
        }
      });
    }
    
    await this.firestoreService.updateDocument(
      this.DEAL_TASKS_COLLECTION,
      taskId,
      updatedFields
    );
    
    const updatedTask = await this.firestoreService.getDocumentData<DealTask>(
      this.DEAL_TASKS_COLLECTION,
      taskId
    );
    
    if (!updatedTask) {
      throw new Error('Failed to retrieve updated task');
    }
    
    return updatedTask;
  }
  
  /**
   * Delete a deal task
   * @param taskId The task ID
   */
  public async deleteDealTask(taskId: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Get the task first
    const task = await this.firestoreService.getDocumentData<DealTask>(
      this.DEAL_TASKS_COLLECTION,
      taskId
    );
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Get the deal to verify ownership
    const deal = await this.getDeal(task.dealId);
    if (!deal) {
      throw new Error('Deal not found or you do not have permission to delete task');
    }
    
    await this.firestoreService.deleteDocument(this.DEAL_TASKS_COLLECTION, taskId);
    
    // Log activity for task deletion
    await this.addDealActivity({
      dealId: task.dealId,
      type: 'task',
      title: 'Task deleted',
      description: `Task "${task.title}" was deleted.`
    });
  }
  
  /**
   * Get all pipelines
   */
  public async getPipelines(): Promise<DealPipeline[]> {
    return await this.firestoreService.getAllDocuments<DealPipeline>(
      this.DEAL_PIPELINES_COLLECTION
    );
  }
  
  /**
   * Get a pipeline by ID
   * @param pipelineId The pipeline ID
   */
  public async getPipeline(pipelineId: string): Promise<DealPipeline | null> {
    return await this.firestoreService.getDocumentData<DealPipeline>(
      this.DEAL_PIPELINES_COLLECTION,
      pipelineId
    );
  }
  
  /**
   * Create a default pipeline if none exists
   */
  public async ensureDefaultPipeline(): Promise<DealPipeline> {
    const pipelines = await this.getPipelines();
    
    if (pipelines.length > 0) {
      return pipelines[0];
    }
    
    // Create default pipeline
    const now = Date.now();
    const defaultPipeline: Omit<DealPipeline, 'id'> = {
      name: 'Default Pipeline',
      description: 'Standard sales pipeline',
      stages: [
        { id: 'lead', name: 'Lead', order: 0 },
        { id: 'qualified', name: 'Qualified', order: 1 },
        { id: 'proposal', name: 'Proposal', order: 2 },
        { id: 'negotiation', name: 'Negotiation', order: 3 },
        { id: 'closed_won', name: 'Closed Won', order: 4 },
        { id: 'closed_lost', name: 'Closed Lost', order: 5 }
      ],
      createdAt: now,
      updatedAt: now
    };
    
    const pipelineId = await this.firestoreService.addDocument(
      this.DEAL_PIPELINES_COLLECTION,
      defaultPipeline
    );
    
    return {
      id: pipelineId as string,
      ...defaultPipeline
    };
  }
} 