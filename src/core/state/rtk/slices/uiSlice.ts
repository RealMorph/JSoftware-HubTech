import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Toast notification type
export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  autoClose?: boolean;
  duration?: number;
}

// Modal types
export type ModalType = 
  | 'settings' 
  | 'userProfile' 
  | 'createItem' 
  | 'deleteConfirmation' 
  | 'share'
  | null;

// UI State interface
export interface UiState {
  sidebarOpen: boolean;
  activeModal: ModalType;
  modalData: Record<string, any> | null;
  toasts: ToastNotification[];
  isMobileView: boolean;
  darkMode: boolean;
  loadingStates: Record<string, boolean>;
}

// Initial state
const initialState: UiState = {
  sidebarOpen: true, 
  activeModal: null,
  modalData: null,
  toasts: [],
  isMobileView: false,
  darkMode: false,
  loadingStates: {},
};

// Create the slice
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Modal actions
    openModal: (state, action: PayloadAction<{ type: ModalType; data?: Record<string, any> }>) => {
      state.activeModal = action.payload.type;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    
    // Toast actions
    addToast: (state, action: PayloadAction<ToastNotification>) => {
      state.toasts.push(action.payload);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Responsive design actions
    setMobileView: (state, action: PayloadAction<boolean>) => {
      state.isMobileView = action.payload;
      // Automatically close sidebar on mobile
      if (action.payload && state.sidebarOpen) {
        state.sidebarOpen = false;
      }
    },
    
    // Theme actions
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    
    // Loading state actions
    setLoadingState: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loadingStates[action.payload.key] = action.payload.isLoading;
    },
    clearLoadingStates: (state) => {
      state.loadingStates = {};
    },
  },
});

// Export actions
export const { 
  toggleSidebar, 
  setSidebarOpen, 
  openModal, 
  closeModal, 
  addToast, 
  removeToast, 
  clearToasts,
  setMobileView,
  toggleDarkMode,
  setDarkMode,
  setLoadingState,
  clearLoadingStates,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectActiveModal = (state: RootState) => state.ui.activeModal;
export const selectModalData = (state: RootState) => state.ui.modalData;
export const selectToasts = (state: RootState) => state.ui.toasts;
export const selectIsMobileView = (state: RootState) => state.ui.isMobileView;
export const selectDarkMode = (state: RootState) => state.ui.darkMode;
export const selectLoadingState = (key: string) => (state: RootState) => 
  state.ui.loadingStates[key] || false;

export default uiSlice.reducer; 