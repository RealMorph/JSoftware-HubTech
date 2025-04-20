/**
 * URL utility functions for parsing and manipulating URL parameters
 */

/**
 * Parse query string parameters from a URL query string
 * @param queryString The query string to parse (without the leading '?')
 * @returns Object containing the parsed query parameters
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Return empty object for empty query string
  if (!queryString || queryString.trim() === '') {
    return params;
  }
  
  // Remove leading '?' if present
  const cleanQuery = queryString.startsWith('?') ? queryString.substring(1) : queryString;
  
  // Split the query string by '&' and process each parameter
  const pairs = cleanQuery.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    
    // Skip invalid pairs
    if (!key) continue;
    
    // Decode the key and value
    const decodedKey = decodeURIComponent(key);
    const decodedValue = value ? decodeURIComponent(value) : '';
    
    params[decodedKey] = decodedValue;
  }
  
  return params;
}

/**
 * Parse path parameters from a URL path based on a pattern
 * @param path The actual URL path
 * @param pattern The route pattern with parameter placeholders (:paramName)
 * @returns Object containing the parsed path parameters
 * @throws Error if the path doesn't match the pattern
 */
export function parsePathParams(path: string, pattern: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Normalize paths by removing trailing slashes
  const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  const normalizedPattern = pattern.endsWith('/') && pattern.length > 1 ? pattern.slice(0, -1) : pattern;
  
  // Extract parameter names from the pattern
  const paramNames: string[] = [];
  const patternRegex = normalizedPattern.replace(/:[a-zA-Z0-9_]+/g, (match) => {
    const paramName = match.substring(1); // Remove the leading ':'
    paramNames.push(paramName);
    return '([^/]+)';
  });
  
  // Create a regex from the pattern and match against the path
  const regex = new RegExp(`^${patternRegex}$`);
  const match = normalizedPath.match(regex);
  
  if (!match) {
    throw new Error(`Path '${path}' does not match pattern '${pattern}'`);
  }
  
  // Extract parameter values from the match
  paramNames.forEach((name, index) => {
    params[name] = decodeURIComponent(match[index + 1]);
  });
  
  return params;
}

/**
 * Build a URL with the given path and query parameters
 * @param path The base path
 * @param params Query parameters to add
 * @returns Complete URL with query parameters
 */
export function buildUrl(path: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return path;
  }
  
  const url = new URL(path, window.location.origin);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  // Return just the pathname and search parts (without origin)
  return `${url.pathname}${url.search}`;
}

/**
 * Joins URL path segments properly handling slashes
 * @param segments URL path segments to join
 * @returns Joined URL path
 */
export function joinPaths(...segments: string[]): string {
  return segments
    .map(segment => segment.trim())
    .filter(Boolean)
    .map((segment, index) => {
      // Remove leading slash except for the first segment
      if (index > 0 && segment.startsWith('/')) {
        segment = segment.substring(1);
      }
      
      // Remove trailing slash except for the last segment if it ends with one
      if (index < segments.length - 1 && segment.endsWith('/')) {
        segment = segment.substring(0, segment.length - 1);
      }
      
      return segment;
    })
    .join('/');
}

/**
 * Extracts the pathname from a URL, removing query parameters and hash
 * @param url The URL to parse
 * @returns The pathname part of the URL
 */
export function getPathname(url: string): string {
  try {
    // Handle relative URLs
    const fullUrl = url.startsWith('http') ? url : `http://example.com${url.startsWith('/') ? '' : '/'}${url}`;
    return new URL(fullUrl).pathname;
  } catch (e) {
    // Fallback to manual parsing if URL parsing fails
    return url.split('?')[0].split('#')[0];
  }
}

/**
 * Combines a base URL with query parameters
 * @param baseUrl The base URL
 * @param params Query parameters to add
 * @returns The complete URL with query parameters
 */
export function buildUrlWithParams(baseUrl: string, params: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  
  if (!queryString) {
    return baseUrl;
  }
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}

/**
 * Extracts a specific parameter from a URL's query string
 * @param url The URL to extract from
 * @param paramName The name of the parameter to extract
 * @returns The parameter value or null if not found
 */
export function getQueryParam(url: string, paramName: string): string | null {
  const queryString = url.split('?')[1];
  
  if (!queryString) {
    return null;
  }
  
  const searchParams = new URLSearchParams(queryString);
  return searchParams.get(paramName);
}

/**
 * Builds a path with parameters replaced by their values
 * @param pattern The path pattern with placeholders (e.g., '/users/:id/profile')
 * @param params The parameter values
 * @returns The resolved path
 */
export function buildPath(pattern: string, params: Record<string, string>): string {
  let result = pattern;
  
  Object.entries(params).forEach(([key, value]) => {
    const placeholder = `:${key}`;
    result = result.replace(placeholder, encodeURIComponent(value));
  });
  
  return result;
}

/**
 * Normalizes a URL by removing trailing slashes and duplicate slashes
 * @param url The URL to normalize
 * @returns The normalized URL
 */
export function normalizeUrl(url: string): string {
  // Remove duplicate slashes (except after protocol)
  let normalized = url.replace(/([^:]\/)\/+/g, '$1');
  
  // Remove trailing slash
  if (normalized.endsWith('/') && normalized.length > 1) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
}

/**
 * Create a URL with query parameters
 * @param baseUrl The base URL or path
 * @param params Object containing query parameters
 * @returns A URL string with the query parameters
 */
export function createUrlWithParams(baseUrl: string, params: Record<string, string | number | boolean | null | undefined>): string {
  // Filter out null and undefined values
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {});
  
  // Return base URL if no parameters
  if (Object.keys(filteredParams).length === 0) {
    return baseUrl;
  }
  
  // Create query string
  const queryString = new URLSearchParams(filteredParams as Record<string, string>).toString();
  
  // Add query string to base URL
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}

/**
 * Create a deep link URL with parameters for advanced routing features
 * @param url The base URL to navigate to
 * @param options Deep link options
 * @returns A URL string with the deep link parameters
 */
export function createDeepLink(
  url: string, 
  options: {
    openInTab?: boolean,
    preserveHistory?: boolean,
    source?: string,
    state?: object,
    params?: Record<string, string | number | boolean>
  }
): string {
  const params: Record<string, string> = {};
  
  if (options.openInTab) {
    params.openInTab = 'true';
  }
  
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
      params[key] = String(value);
    });
  }
  
  return createUrlWithParams(url, params);
} 