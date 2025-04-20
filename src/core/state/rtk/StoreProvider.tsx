import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { setCredentials } from './slices/authSlice';
import { TokenService } from '../../auth/token-service';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Redux store provider component that wraps the application
 * with Redux Provider and PersistGate
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Check for stored tokens on mount and set credentials if available
  useEffect(() => {
    const loadStoredAuth = async () => {
      const token = TokenService.getAccessToken();
      const refreshToken = TokenService.getRefreshToken();
      
      if (token && refreshToken) {
        try {
          // In a real app, you would validate the token here or fetch the user profile
          // This is just a placeholder for demonstration
          store.dispatch(
            setCredentials({
              user: {
                id: 'stored_user_id',
                email: 'stored@example.com',
                username: 'stored_user',
                role: 'user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              token,
              refreshToken,
            })
          );
        } catch (error) {
          console.error('Failed to restore authentication state:', error);
          TokenService.clearTokens();
        }
      }
    };

    loadStoredAuth();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default StoreProvider; 