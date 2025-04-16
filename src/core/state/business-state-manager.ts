import { StateManager, DefaultStateManager, StateValue } from './state-manager';

export interface BusinessState extends Record<string, StateValue> {
  companyInfo: {
    name: string;
    industry: string;
    size: string;
    location: string;
  };
  financials: {
    revenue: number;
    expenses: number;
    profit: number;
    cashFlow: number;
  };
  operations: {
    employees: number;
    departments: string[];
    projects: Array<{
      id: string;
      name: string;
      status: 'active' | 'completed' | 'on-hold';
      budget: number;
    }>;
  };
  aiInsights: {
    lastAnalysis: string;
    recommendations: string[];
    riskFactors: string[];
  };
}

export class BusinessStateManager extends DefaultStateManager<BusinessState> {
  private static instance: BusinessStateManager;
  private businessState: BusinessState;

  private constructor() {
    super();
    this.businessState = {
      companyInfo: {
        name: '',
        industry: '',
        size: '',
        location: '',
      },
      financials: {
        revenue: 0,
        expenses: 0,
        profit: 0,
        cashFlow: 0,
      },
      operations: {
        employees: 0,
        departments: [],
        projects: [],
      },
      aiInsights: {
        lastAnalysis: '',
        recommendations: [],
        riskFactors: [],
      },
    };
    this._state = this.businessState;
  }

  public static getInstance(): BusinessStateManager {
    if (!BusinessStateManager.instance) {
      BusinessStateManager.instance = new BusinessStateManager();
    }
    return BusinessStateManager.instance;
  }

  async initialize(): Promise<void> {
    await super.initialize();
    // Load business state from storage
    const savedState = await this.loadBusinessState();
    if (savedState) {
      this.businessState = savedState;
      this._state = this.businessState;
    }
  }

  private async loadBusinessState(): Promise<BusinessState | null> {
    try {
      const savedState = localStorage.getItem('businessState');
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error('Error loading business state:', error);
      return null;
    }
  }

  private async saveBusinessState(): Promise<void> {
    try {
      localStorage.setItem('businessState', JSON.stringify(this.businessState));
    } catch (error) {
      console.error('Error saving business state:', error);
    }
  }

  getBusinessState(): BusinessState {
    return { ...this.businessState };
  }

  async updateCompanyInfo(info: Partial<BusinessState['companyInfo']>): Promise<void> {
    this.businessState.companyInfo = {
      ...this.businessState.companyInfo,
      ...info,
    };
    this._state = this.businessState;
    await this.saveBusinessState();
    this._notifySubscribers();
  }

  async updateFinancials(financials: Partial<BusinessState['financials']>): Promise<void> {
    this.businessState.financials = {
      ...this.businessState.financials,
      ...financials,
    };
    this._state = this.businessState;
    await this.saveBusinessState();
    this._notifySubscribers();
  }

  async updateOperations(operations: Partial<BusinessState['operations']>): Promise<void> {
    this.businessState.operations = {
      ...this.businessState.operations,
      ...operations,
    };
    this._state = this.businessState;
    await this.saveBusinessState();
    this._notifySubscribers();
  }

  async updateAIInsights(insights: Partial<BusinessState['aiInsights']>): Promise<void> {
    this.businessState.aiInsights = {
      ...this.businessState.aiInsights,
      ...insights,
    };
    this._state = this.businessState;
    await this.saveBusinessState();
    this._notifySubscribers();
  }
}
