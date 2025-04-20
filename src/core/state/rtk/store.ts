import { 
  configureStore, 
  combineReducers, 
  Middleware
} from '@reduxjs/toolkit';
import { 
  useDispatch, 
  useSelector, 
  TypedUseSelectorHook 
} from 'react-redux';
import { 
  persistStore, 
  persistReducer, 
  FLUSH, 
  REHYDRATE, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER 
} from 'redux-persist';
import { PersistentStorage, StorageType } from '../PersistentStorage';

// Import slices here when created
import authReducer from './slices/authSlice';
// import uiReducer from './slices/uiSlice';

// Create storage wrapper for redux-persist
const createReduxPersistStorage = (storage: PersistentStorage) => {
  return {
    getItem: async (key: string) => {
      const value = await storage.getItem<string>(key);
      return value;
    },
    setItem: async (key: string, value: string) => {
      await storage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      await storage.removeItem(key);
    }
  };
};

// Create storage instance
const storage = new PersistentStorage({
  type: StorageType.LOCAL,
  prefix: 'app_state_',
  encrypt: process.env.NODE_ENV === 'production', // Only encrypt in production
});

// Redux persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage: createReduxPersistStorage(storage),
  whitelist: ['auth'], // Only persist auth state by default
};

// Combined root reducer
const rootReducer = combineReducers({
  // Add reducers here when created
  auth: authReducer,
  // ui: uiReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Middleware
const customMiddleware: Middleware[] = [
  // Add custom middleware here
];

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(customMiddleware as any);
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Create a function to enable refetchOnFocus/refetchOnReconnect features
// This will be used when we add RTK Query services
export const setupApiListeners = (dispatch: typeof store.dispatch) => {
  // When RTK Query is added, we'll use this function
  // setupListeners(dispatch);
};

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed versions of hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 