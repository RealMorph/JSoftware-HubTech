import { BehaviorSubject, Observable } from 'rxjs';
import { ITabManager, Tab, TabManager } from '../tabs/TabManager';
import { parsePathParams, parseQueryString, createUrlWithParams } from '../utils/urlUtils';

export interface Route {
  path: string;
  title: string;
  component: React.ComponentType<any>;
  params?: Record<string, string>;
  exact?: boolean;
  children?: Route[];
}

export interface RouteMatch {
  route: Route;
  params: Record<string, string>;
  query: Record<string, string>;
  path: string;
}

export interface BreadcrumbItem {
  title: string;
  path: string;
  active: boolean;
}

/**
 * Interface for deep link router navigation options
 */
export interface NavigationOptions {
  // Whether to preserve the current URL in history
  preserveHistory?: boolean;
  // Source of the navigation (for analytics)
  source?: string;
  // State to pass to the new route
  state?: Record<string, any>;
  // Additional parameters to include in the URL
  params?: Record<string, string | number | boolean>;
}

/**
 * Options for opening a path in a new tab
 */
export interface OpenInTabOptions {
  // Path to navigate to
  path: string;
  // Title for the tab
  title?: string;
  // Custom tab ID (optional)
  tabId?: string;
  // Additional tab data
  data?: Record<string, any>;
  // Whether the tab is closable
  closable?: boolean;
}

/**
 * Interface for DeepLinkRouter implementation
 */
export interface IDeepLinkRouter {
  // Navigate to a path with options
  navigate(path: string, options?: NavigationOptions): void;
  
  // Open a path in a new tab
  openInTab(options: OpenInTabOptions): void;
  
  // Go back in navigation history
  goBack(): void;
  
  // Go forward in navigation history
  goForward(): void;
  
  // Get the current breadcrumb trail
  getBreadcrumbs(): any[]; // Replace with proper Breadcrumb type
  
  // Generate a deep link URL with parameters
  createDeepLink(path: string, options?: NavigationOptions): string;
}

export class DeepLinkRouter implements IDeepLinkRouter {
  private _routes: Route[] = [];
  private _history: string[] = [];
  private _historyIndex = -1;
  private _currentPath = new BehaviorSubject<string>('');
  private _currentRoute = new BehaviorSubject<RouteMatch | null>(null);
  private _breadcrumbs = new BehaviorSubject<BreadcrumbItem[]>([]);
  
  public currentPath$ = this._currentPath.asObservable();
  public currentRoute$ = this._currentRoute.asObservable();
  public breadcrumbs$ = this._breadcrumbs.asObservable();
  
  constructor(
    routes: Route[],
    private _tabManager: ITabManager = new TabManager()
  ) {
    this._routes = routes;
    
    // Initialize with default route
    this.navigate('/', { preserveHistory: true });
    
    // Listen for tab changes to update the router
    this._tabManager.activeTab$.subscribe(tab => {
      if (tab && this._currentPath.getValue() !== tab.route) {
        this.navigateInternal(tab.route, { preserveHistory: true });
      }
    });
  }
  
  /**
   * Navigate to the specified path
   * @param path The path to navigate to
   * @param options Navigation options
   */
  public navigate(path: string, options: NavigationOptions = {}): void {
    const { preserveHistory, source, state, params } = options;
    
    // Handle tab navigation
    const route = this.matchRoute(path);
    if (route) {
      const title = route.route.title || 'New Tab';
      this.openInTab({ path, title, data: params, closable: true });
      return;
    }
    
    // Regular navigation
    this.navigateInternal(path, { preserveHistory, source, state });
  }
  
  /**
   * Go back in the navigation history
   */
  public goBack(): void {
    if (this._historyIndex > 0) {
      this._historyIndex--;
      const previousPath = this._history[this._historyIndex];
      this.navigateInternal(previousPath, { preserveHistory: true });
    }
  }
  
  /**
   * Go forward in the navigation history
   */
  public goForward(): void {
    if (this._historyIndex < this._history.length - 1) {
      this._historyIndex++;
      const nextPath = this._history[this._historyIndex];
      this.navigateInternal(nextPath, { preserveHistory: true });
    }
  }
  
  /**
   * Open a route in a new tab
   * @param options The options for opening the tab
   */
  public openInTab(options: OpenInTabOptions): void {
    const { path, title, tabId, data, closable } = options;
    
    // Check if a tab with this route already exists
    const existingTab = this._tabManager.findTabByRoute(path);
    if (existingTab) {
      this._tabManager.activateTab(existingTab.id);
      return;
    }
    
    // Create a new tab
    const newTab = this._tabManager.openTab({
      id: tabId || `tab-${Date.now()}`,
      title: title || 'New Tab',
      route: path,
      data,
      closable,
    });
  }
  
  /**
   * Match a path to a route definition
   * @param path The path to match
   * @returns The matched route or null if no match found
   */
  public matchRoute(path: string): RouteMatch | null {
    const [pathPart, queryPart] = path.split('?');
    const query = queryPart ? parseQueryString(queryPart) : {};
    
    // Try to match the route
    for (const route of this._routes) {
      const match = this.matchRoutePath(pathPart, route);
      if (match) {
        return {
          route: match.route,
          params: match.params,
          query,
          path,
        };
      }
    }
    
    return null;
  }
  
  /**
   * Internal navigation method
   * @param path The path to navigate to
   * @param options Navigation options
   */
  private navigateInternal(path: string, options: { preserveHistory?: boolean, source?: string, state?: any } = {}): void {
    const { preserveHistory, source, state } = options;
    
    // Don't navigate to the same route twice
    if (path === this._currentPath.getValue()) {
      return;
    }
    
    // Match the route
    const routeMatch = this.matchRoute(path);
    if (!routeMatch) {
      console.warn(`No route found for path: ${path}`);
      return;
    }
    
    // Update history
    if (preserveHistory) {
      // Replace current entry in history
      if (this._historyIndex >= 0) {
        this._history[this._historyIndex] = path;
      } else {
        this._history.push(path);
        this._historyIndex = 0;
      }
    } else {
      // Add new entry to history
      if (this._historyIndex < this._history.length - 1) {
        // Remove future history if navigating from a past point
        this._history = this._history.slice(0, this._historyIndex + 1);
      }
      
      this._history.push(path);
      this._historyIndex = this._history.length - 1;
    }
    
    // Update state
    this._currentPath.next(path);
    this._currentRoute.next(routeMatch);
    
    // Update breadcrumbs
    this.updateBreadcrumbs(routeMatch);
  }
  
  /**
   * Match a path against a route definition
   * @param path The path to match
   * @param route The route to match against
   * @param basePath The base path for nested routes
   * @returns The matched route and params or null if no match
   */
  private matchRoutePath(
    path: string, 
    route: Route, 
    basePath: string = ''
  ): { route: Route, params: Record<string, string> } | null {
    const fullRoutePath = `${basePath}${route.path}`;
    
    // Try to match the current route
    const params = this.matchPathPattern(path, fullRoutePath);
    if (params) {
      // Check if exact matching is required
      if (route.exact && path !== fullRoutePath && !this.hasPathParams(fullRoutePath)) {
        return null;
      }
      
      return { route, params };
    }
    
    // Try to match child routes
    if (route.children) {
      for (const childRoute of route.children) {
        const childMatch = this.matchRoutePath(path, childRoute, fullRoutePath);
        if (childMatch) {
          return childMatch;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Match a path against a pattern with path parameters
   * @param path The path to match
   * @param pattern The pattern to match against
   * @returns The extracted parameters or null if no match
   */
  private matchPathPattern(path: string, pattern: string): Record<string, string> | null {
    // Normalize paths
    const normalizedPath = this.normalizePath(path);
    const normalizedPattern = this.normalizePath(pattern);
    
    // If the pattern doesn't have parameters, do a direct comparison
    if (!this.hasPathParams(pattern)) {
      if (normalizedPath === normalizedPattern) {
        return {};
      }
      return null;
    }
    
    // Otherwise, extract parameters
    try {
      return parsePathParams(normalizedPath, normalizedPattern);
    } catch (e) {
      return null;
    }
  }
  
  /**
   * Check if a pattern has path parameters
   * @param pattern The pattern to check
   * @returns True if the pattern has parameters, false otherwise
   */
  private hasPathParams(pattern: string): boolean {
    return pattern.includes(':');
  }
  
  /**
   * Normalize a path for comparison
   * @param path The path to normalize
   * @returns The normalized path
   */
  private normalizePath(path: string): string {
    // Ensure the path starts with '/'
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Remove trailing slash unless it's the root path
    if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    
    return normalizedPath;
  }
  
  /**
   * Update the breadcrumbs based on the current route
   * @param routeMatch The matched route
   */
  private updateBreadcrumbs(routeMatch: RouteMatch): void {
    if (!routeMatch) {
      this._breadcrumbs.next([]);
      return;
    }
    
    const { route, params, path } = routeMatch;
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Find the route path in the route hierarchy
    this.buildBreadcrumbsForRoute(
      this._routes,
      route,
      params,
      breadcrumbs,
      '',
      path
    );
    
    this._breadcrumbs.next(breadcrumbs);
  }
  
  /**
   * Recursively build breadcrumbs for a route
   * @param routes The available routes
   * @param targetRoute The route to find
   * @param params The route parameters
   * @param breadcrumbs The breadcrumbs array to fill
   * @param currentPath The current path
   * @param activePath The active path
   * @returns True if the target route was found, false otherwise
   */
  private buildBreadcrumbsForRoute(
    routes: Route[],
    targetRoute: Route,
    params: Record<string, string>,
    breadcrumbs: BreadcrumbItem[],
    currentPath: string,
    activePath: string
  ): boolean {
    for (const route of routes) {
      // Build the full path for this route
      const routePath = this.buildPathWithParams(route.path, params);
      const fullPath = `${currentPath}${routePath}`;
      
      // Add this route to breadcrumbs
      breadcrumbs.push({
        title: route.title,
        path: fullPath,
        active: fullPath === activePath
      });
      
      // Check if this is the target route
      if (route === targetRoute) {
        return true;
      }
      
      // Check child routes
      if (route.children && route.children.length > 0) {
        const found = this.buildBreadcrumbsForRoute(
          route.children,
          targetRoute,
          params,
          breadcrumbs,
          fullPath,
          activePath
        );
        
        if (found) {
          return true;
        }
      }
      
      // If not found, remove this route from breadcrumbs
      breadcrumbs.pop();
    }
    
    return false;
  }
  
  /**
   * Build a path with the provided parameters
   * @param path The path pattern
   * @param params The parameters to insert
   * @returns The path with parameters replaced
   */
  private buildPathWithParams(path: string, params: Record<string, string>): string {
    return path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      return params[paramName] || `:${paramName}`;
    });
  }

  /**
   * Get the current breadcrumb trail
   * @returns Array of breadcrumb items
   */
  public getBreadcrumbs(): BreadcrumbItem[] {
    return this._breadcrumbs.getValue();
  }

  /**
   * Generate a deep link URL with parameters
   * @param path Base path
   * @param options Navigation options
   * @returns URL with deep link parameters
   */
  public createDeepLink(path: string, options: NavigationOptions = {}): string {
    const params: Record<string, string | number | boolean> = {};
    
    if (options.preserveHistory) {
      params.preserveHistory = 'true';
    }
    
    if (options.source) {
      params.source = options.source;
    }
    
    if (options.state) {
      params.state = encodeURIComponent(JSON.stringify(options.state));
    }
    
    // Add any additional parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        params[key] = value;
      });
    }
    
    // Create URL with parameters
    return createUrlWithParams(path, params);
  }
} 