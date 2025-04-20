import {
  logEvent,
  setUserId,
  setUserProperties,
  setAnalyticsCollectionEnabled
} from 'firebase/analytics';
import { analytics } from './firebase-config';

export class FirebaseAnalyticsService {
  private static instance: FirebaseAnalyticsService;

  private constructor() {}

  public static getInstance(): FirebaseAnalyticsService {
    if (!FirebaseAnalyticsService.instance) {
      FirebaseAnalyticsService.instance = new FirebaseAnalyticsService();
    }
    return FirebaseAnalyticsService.instance;
  }

  /**
   * Log an event with the specified name and parameters
   * @param eventName The name of the event to log
   * @param eventParams Optional parameters for the event
   */
  public logEvent(eventName: string, eventParams?: Record<string, any>): void {
    logEvent(analytics, eventName, eventParams);
  }

  /**
   * Set the user ID for analytics
   * @param userId The user ID to set for analytics
   */
  public setUserId(userId: string): void {
    setUserId(analytics, userId);
  }

  /**
   * Set user properties for analytics
   * @param properties The user properties to set
   */
  public setUserProperties(properties: Record<string, any>): void {
    setUserProperties(analytics, properties);
  }

  /**
   * Enable or disable analytics collection
   * @param enabled Whether analytics collection should be enabled
   */
  public setAnalyticsCollectionEnabled(enabled: boolean): void {
    setAnalyticsCollectionEnabled(analytics, enabled);
  }

  /**
   * Log a page view event
   * @param pageName The name of the page viewed
   * @param pageParams Additional parameters for the page view
   */
  public logPageView(pageName: string, pageParams?: Record<string, any>): void {
    this.logEvent('page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...pageParams
    });
  }
  
  /**
   * Log a user login event
   * @param method The login method used
   */
  public logLogin(method: string): void {
    this.logEvent('login', { method });
  }
  
  /**
   * Log a user signup event
   * @param method The signup method used
   */
  public logSignUp(method: string): void {
    this.logEvent('sign_up', { method });
  }
  
  /**
   * Log a search event
   * @param searchTerm The search term used
   */
  public logSearch(searchTerm: string): void {
    this.logEvent('search', { search_term: searchTerm });
  }
} 