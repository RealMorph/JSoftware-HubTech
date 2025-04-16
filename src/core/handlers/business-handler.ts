import { BusinessStateManager, BusinessState } from '../state/business-state-manager';
import { AIService } from '../services/ai-service';

export class BusinessHandler {
  private static instance: BusinessHandler;
  private stateManager: BusinessStateManager;
  private aiService: AIService;

  private constructor() {
    this.stateManager = BusinessStateManager.getInstance();
    this.aiService = AIService.getInstance();
  }

  public static getInstance(): BusinessHandler {
    if (!BusinessHandler.instance) {
      BusinessHandler.instance = new BusinessHandler();
    }
    return BusinessHandler.instance;
  }

  public async initialize(aiApiKey: string): Promise<void> {
    await this.stateManager.initialize();
    this.aiService.setApiKey(aiApiKey);
  }

  public getBusinessState(): BusinessState {
    return this.stateManager.getBusinessState();
  }

  public async updateCompanyInfo(info: Partial<BusinessState['companyInfo']>): Promise<void> {
    await this.stateManager.updateCompanyInfo(info);
    await this.performAIAnalysis();
  }

  public async updateFinancials(financials: Partial<BusinessState['financials']>): Promise<void> {
    await this.stateManager.updateFinancials(financials);
    await this.performAIAnalysis();
  }

  public async updateOperations(operations: Partial<BusinessState['operations']>): Promise<void> {
    await this.stateManager.updateOperations(operations);
    await this.performAIAnalysis();
  }

  private async performAIAnalysis(): Promise<void> {
    try {
      const currentState = this.stateManager.getBusinessState();
      const analysis = await this.aiService.analyzeBusinessState(currentState);

      await this.stateManager.updateAIInsights({
        lastAnalysis: analysis.analysis,
        recommendations: analysis.recommendations,
        riskFactors: analysis.riskFactors,
      });
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      // In a real implementation, you might want to handle this error differently
      // For example, by showing a notification to the user
    }
  }

  public async generateFinancialForecast(): Promise<{
    projectedRevenue: number;
    projectedExpenses: number;
    projectedProfit: number;
    confidence: number;
  }> {
    const currentState = this.stateManager.getBusinessState();
    return await this.aiService.generateFinancialForecast(currentState);
  }

  public async optimizeOperations(): Promise<{
    suggestedChanges: string[];
    expectedImpact: string;
  }> {
    const currentState = this.stateManager.getBusinessState();
    return await this.aiService.optimizeOperations(currentState);
  }

  public subscribeToStateChanges(callback: (state: BusinessState) => void): () => void {
    return this.stateManager.subscribe(callback);
  }
}
