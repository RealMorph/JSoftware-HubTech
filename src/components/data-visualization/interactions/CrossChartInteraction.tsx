import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

/**
 * CrossChartInteraction System
 * 
 * This module provides centralized state management for interactions between multiple
 * visualization components, enabling:
 * - Cross-filtering between charts
 * - Linked brushing across visualizations
 * - Synchronized selection state
 * - Global highlight propagation
 */

// Types for interaction state
export interface DataSelection {
  chartId: string;
  pointIds: string[];
  dimensions?: string[];
  filterType?: 'include' | 'exclude';
}

export interface HighlightState {
  chartId: string;
  pointIds: string[];
  temporary?: boolean;
}

export interface BrushSelection {
  chartId: string;
  range: {
    x?: [number, number];
    y?: [number, number];
    categories?: string[];
  };
}

export interface ContextMenuState {
  visible: boolean;
  chartId: string;
  pointId?: string;
  position: { x: number; y: number };
  data?: any;
}

interface InteractionState {
  selections: DataSelection[];
  highlights: HighlightState[];
  brushes: BrushSelection[];
  contextMenu: ContextMenuState | null;
  interactionMode: 'filter' | 'highlight' | 'details' | 'none';
}

// Action types
type InteractionAction =
  | { type: 'SELECT_DATA'; payload: DataSelection }
  | { type: 'CLEAR_SELECTION'; payload?: { chartId?: string } }
  | { type: 'HIGHLIGHT_DATA'; payload: HighlightState }
  | { type: 'CLEAR_HIGHLIGHTS'; payload?: { chartId?: string } }
  | { type: 'SET_BRUSH'; payload: BrushSelection }
  | { type: 'CLEAR_BRUSH'; payload?: { chartId?: string } }
  | { type: 'SHOW_CONTEXT_MENU'; payload: ContextMenuState }
  | { type: 'HIDE_CONTEXT_MENU' }
  | { type: 'SET_INTERACTION_MODE'; payload: InteractionState['interactionMode'] }
  | { type: 'RESET_ALL' };

// Initial state
const initialState: InteractionState = {
  selections: [],
  highlights: [],
  brushes: [],
  contextMenu: null,
  interactionMode: 'none',
};

// Reducer function
function interactionReducer(state: InteractionState, action: InteractionAction): InteractionState {
  switch (action.type) {
    case 'SELECT_DATA':
      return {
        ...state,
        selections: [
          ...state.selections.filter(s => s.chartId !== action.payload.chartId),
          action.payload,
        ],
      };
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selections: action.payload?.chartId
          ? state.selections.filter(s => s.chartId !== action.payload?.chartId)
          : [],
      };
    case 'HIGHLIGHT_DATA':
      return {
        ...state,
        highlights: [
          ...state.highlights.filter(h => h.chartId !== action.payload.chartId || h.temporary),
          action.payload,
        ],
      };
    case 'CLEAR_HIGHLIGHTS':
      return {
        ...state,
        highlights: action.payload?.chartId
          ? state.highlights.filter(h => h.chartId !== action.payload?.chartId)
          : [],
      };
    case 'SET_BRUSH':
      return {
        ...state,
        brushes: [
          ...state.brushes.filter(b => b.chartId !== action.payload.chartId),
          action.payload,
        ],
      };
    case 'CLEAR_BRUSH':
      return {
        ...state,
        brushes: action.payload?.chartId
          ? state.brushes.filter(b => b.chartId !== action.payload?.chartId)
          : [],
      };
    case 'SHOW_CONTEXT_MENU':
      return {
        ...state,
        contextMenu: action.payload,
      };
    case 'HIDE_CONTEXT_MENU':
      return {
        ...state,
        contextMenu: null,
      };
    case 'SET_INTERACTION_MODE':
      return {
        ...state,
        interactionMode: action.payload,
      };
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
}

// Context
interface CrossChartInteractionContextType {
  state: InteractionState;
  selectData: (selection: DataSelection) => void;
  clearSelection: (chartId?: string) => void;
  highlightData: (highlight: HighlightState) => void;
  clearHighlights: (chartId?: string) => void;
  setBrush: (brush: BrushSelection) => void;
  clearBrush: (chartId?: string) => void;
  showContextMenu: (menu: Omit<ContextMenuState, 'visible'>) => void;
  hideContextMenu: () => void;
  setInteractionMode: (mode: InteractionState['interactionMode']) => void;
  resetAll: () => void;
}

const CrossChartInteractionContext = createContext<CrossChartInteractionContextType | undefined>(undefined);

// Provider
export const CrossChartInteractionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(interactionReducer, initialState);

  const selectData = useCallback((selection: DataSelection) => {
    dispatch({ type: 'SELECT_DATA', payload: selection });
  }, []);

  const clearSelection = useCallback((chartId?: string) => {
    dispatch({ type: 'CLEAR_SELECTION', payload: chartId ? { chartId } : undefined });
  }, []);

  const highlightData = useCallback((highlight: HighlightState) => {
    dispatch({ type: 'HIGHLIGHT_DATA', payload: highlight });
  }, []);

  const clearHighlights = useCallback((chartId?: string) => {
    dispatch({ type: 'CLEAR_HIGHLIGHTS', payload: chartId ? { chartId } : undefined });
  }, []);

  const setBrush = useCallback((brush: BrushSelection) => {
    dispatch({ type: 'SET_BRUSH', payload: brush });
  }, []);

  const clearBrush = useCallback((chartId?: string) => {
    dispatch({ type: 'CLEAR_BRUSH', payload: chartId ? { chartId } : undefined });
  }, []);

  const showContextMenu = useCallback((menu: Omit<ContextMenuState, 'visible'>) => {
    dispatch({ type: 'SHOW_CONTEXT_MENU', payload: { ...menu, visible: true } });
  }, []);

  const hideContextMenu = useCallback(() => {
    dispatch({ type: 'HIDE_CONTEXT_MENU' });
  }, []);

  const setInteractionMode = useCallback((mode: InteractionState['interactionMode']) => {
    dispatch({ type: 'SET_INTERACTION_MODE', payload: mode });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  return (
    <CrossChartInteractionContext.Provider
      value={{
        state,
        selectData,
        clearSelection,
        highlightData,
        clearHighlights,
        setBrush,
        clearBrush,
        showContextMenu,
        hideContextMenu,
        setInteractionMode,
        resetAll,
      }}
    >
      {children}
    </CrossChartInteractionContext.Provider>
  );
};

// Custom hook for using the context
export const useCrossChartInteraction = () => {
  const context = useContext(CrossChartInteractionContext);
  if (context === undefined) {
    throw new Error('useCrossChartInteraction must be used within a CrossChartInteractionProvider');
  }
  return context;
};

// Utility hook for filtering data based on cross-chart selections
export const useFilteredData = <T extends { id: string; [key: string]: any }>(
  chartId: string,
  data: T[],
  dimensionMapping: Record<string, keyof T> = {}
) => {
  const { state } = useCrossChartInteraction();
  
  // Find selections that might affect this chart (not from this chart)
  const relevantSelections = state.selections.filter(s => s.chartId !== chartId);
  
  if (relevantSelections.length === 0) {
    return data;
  }
  
  // Apply filters from all relevant selections
  return data.filter(item => {
    return relevantSelections.every(selection => {
      // If no dimensions specified, just check point IDs
      if (!selection.dimensions || selection.dimensions.length === 0) {
        const isIncluded = selection.pointIds.includes(item.id);
        return selection.filterType === 'exclude' ? !isIncluded : isIncluded;
      }
      
      // Check each dimension
      return selection.dimensions.some(dimension => {
        const mappedDimension = dimensionMapping[dimension] || dimension as keyof T;
        // Find points that match this dimension value
        const matchingValue = selection.pointIds.some(pointId => {
          return item[mappedDimension] === pointId;
        });
        
        return selection.filterType === 'exclude' ? !matchingValue : matchingValue;
      });
    });
  });
};

// Hook to check if a data point is highlighted
export const useHighlightStatus = (chartId: string, pointId: string) => {
  const { state } = useCrossChartInteraction();
  
  // Check direct highlights for this chart
  const directHighlight = state.highlights.some(
    h => h.chartId === chartId && h.pointIds.includes(pointId)
  );
  
  // Check highlights from other charts (by ID matching)
  const crossHighlight = state.highlights.some(
    h => h.chartId !== chartId && h.pointIds.includes(pointId)
  );
  
  return {
    isHighlighted: directHighlight || crossHighlight,
    isDirectlyHighlighted: directHighlight,
    isCrossHighlighted: crossHighlight,
  };
}; 