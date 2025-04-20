/**
 * Demo Registry Hook
 * 
 * Custom React hooks for accessing the demo registry from components.
 * Provides functionality for searching, filtering, and organizing demos.
 */

import { useState, useCallback, useMemo } from 'react';
import demoRegistry, { DemoComponent, DemoCategory, DemoStatus } from './demoRegistry';

/**
 * Hook for accessing demo registry data
 */
export const useDemoRegistry = () => {
  // Get all demos
  const allDemos = useMemo(() => demoRegistry.getAllDemos(), []);
  
  // Group demos by category
  const demosByCategory = useMemo(() => {
    const grouped = new Map<DemoCategory, DemoComponent[]>();
    
    // Initialize all categories with empty arrays
    Object.values(DemoCategory).forEach(category => {
      grouped.set(category, []);
    });
    
    // Add demos to their respective categories
    allDemos.forEach(demo => {
      const categoryDemos = grouped.get(demo.category) || [];
      categoryDemos.push(demo);
      grouped.set(demo.category, categoryDemos);
    });
    
    // Sort demos within each category by menuOrder
    grouped.forEach((demos, category) => {
      grouped.set(
        category,
        demos.sort((a, b) => (a.menuOrder || 100) - (b.menuOrder || 100))
      );
    });
    
    return grouped;
  }, [allDemos]);
  
  // Get demos for a specific category
  const getDemosByCategory = useCallback(
    (category: DemoCategory) => demoRegistry.getDemosByCategory(category),
    []
  );
  
  // Get demos by status
  const getDemosByStatus = useCallback(
    (status: DemoStatus) => demoRegistry.getDemosByStatus(status),
    []
  );
  
  return {
    allDemos,
    demosByCategory,
    getDemosByCategory,
    getDemosByStatus,
    getDemoById: demoRegistry.getDemoById.bind(demoRegistry)
  };
};

/**
 * Hook for searching demos
 */
export const useDemoSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DemoComponent[]>([]);
  
  // Perform search when query changes
  const searchDemos = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = demoRegistry.searchDemos(query);
    setSearchResults(results);
    setSearchQuery(query);
  }, []);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);
  
  return {
    searchQuery,
    searchResults,
    searchDemos,
    clearSearch,
    isSearching: searchQuery.length > 0
  };
};

export default useDemoRegistry; 