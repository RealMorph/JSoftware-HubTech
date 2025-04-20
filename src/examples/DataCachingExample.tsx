import React, { useState, useEffect } from 'react';
import { useCachedAdapter } from '../core/hooks/useCachedAdapter';
import { useOfflineStorage } from '../core/hooks/useOfflineStorage';
import { createCachedModelAdapter } from '../core/hooks/useCachedAdapter';

// Example user interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// DTO for creating a user
interface CreateUserDto {
  name: string;
  email: string;
  role: string;
}

// Create a type-safe cached model adapter for the User entity
const useUserModel = createCachedModelAdapter<User, CreateUserDto>(
  'users',
  'users', // use the predefined 'users' cache config
  { type: 'firebase' } // use Firebase adapter
);

/**
 * Example component showing data caching and offline capabilities
 */
export const DataCachingExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<CreateUserDto>({
    name: '',
    email: '',
    role: 'user'
  });
  
  // Use the model adapter for users
  const userModel = useUserModel();
  
  // Use offline storage for form data
  const offlineStorage = useOfflineStorage({
    namespace: 'user-forms',
    autoSync: true,
    storage: 'indexedDB'
  });
  
  // Get cache stats
  const [cacheStats, setCacheStats] = useState<any>(null);
  
  // Load users on component mount
  useEffect(() => {
    fetchUsers();
    
    // Load draft form if it exists in offline storage
    const loadDraft = async () => {
      const draft = await offlineStorage.getOfflineData<CreateUserDto>('new-user-draft');
      if (draft) {
        setNewUser(draft);
      }
    };
    
    loadDraft();
    
    // Set up interval to update cache stats
    const statsInterval = setInterval(() => {
      setCacheStats(userModel.getCacheStats());
    }, 2000);
    
    return () => clearInterval(statsInterval);
  }, []);
  
  // Fetch users from the API with caching
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userModel.getAll();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users. ' + 
        (offlineStorage.state.isOnline 
          ? 'Please try again.' 
          : 'You are currently offline.'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save form data as user works
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedUser = { ...newUser, [name]: value };
    setNewUser(updatedUser);
    
    // Save draft to offline storage
    offlineStorage.storeOfflineData('new-user-draft', updatedUser);
  };
  
  // Create a new user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email) {
      setError('Name and email are required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (offlineStorage.state.isOnline) {
        // We're online, save directly
        await userModel.create(newUser);
        
        // Clear the form
        setNewUser({ name: '', email: '', role: 'user' });
        offlineStorage.removeOfflineData('new-user-draft');
        
        // Refresh the user list
        fetchUsers();
      } else {
        // We're offline, queue for later
        await offlineStorage.queueOperation('create', 'users', newUser);
        
        // Show success message
        alert('User will be created when you are back online');
        
        // Clear the form
        setNewUser({ name: '', email: '', role: 'user' });
        offlineStorage.removeOfflineData('new-user-draft');
      }
    } catch (err) {
      setError('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Force a refresh of data from the server
  const handleRefresh = async () => {
    // Clear the cache first
    await userModel.clearCache();
    
    // Refetch users (will go to the server now)
    fetchUsers();
  };
  
  // Force sync of pending operations
  const handleSync = () => {
    if (!offlineStorage.state.isOnline) {
      alert('You are currently offline. Sync will happen automatically when you come back online.');
      return;
    }
    
    offlineStorage.syncPendingOperations(async (operations) => {
      // Here you would implement custom sync logic
      // For this example, we'll just simulate a successful sync for all operations
      console.log('Syncing operations:', operations);
      
      // In a real app, you would process each operation with actual API calls
      // For now, we'll just return all operation IDs as successful
      return operations.map(op => op.id);
    });
  };
  
  return (
    <div className="data-caching-example">
      <h1>Data Caching & Offline Example</h1>
      
      {/* Network status indicator */}
      <div className={`status-indicator ${offlineStorage.state.isOnline ? 'online' : 'offline'}`}>
        {offlineStorage.state.isOnline ? 'Online' : 'Offline'}
      </div>
      
      {/* Pending operations indicator */}
      {offlineStorage.state.hasPendingOperations && (
        <div className="pending-operations">
          {offlineStorage.state.pendingOperationsCount} operations pending sync
          <button onClick={handleSync} disabled={!offlineStorage.state.isOnline}>
            Sync Now
          </button>
        </div>
      )}
      
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      
      {/* User form */}
      <div className="form-container">
        <h2>Create New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newUser.name}
              onChange={handleFormChange}
              placeholder="User name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={newUser.email}
              onChange={handleFormChange}
              placeholder="user@example.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={newUser.role}
              onChange={handleFormChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Create User'}
          </button>
        </form>
      </div>
      
      {/* User list */}
      <div className="user-list-container">
        <div className="list-header">
          <h2>Users</h2>
          <div className="actions">
            <button onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button onClick={() => userModel.clearCache()}>
              Clear Cache
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading">Loading users...</div>
        ) : users.length > 0 ? (
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No users found</div>
        )}
      </div>
      
      {/* Cache stats */}
      {cacheStats && (
        <div className="cache-stats">
          <h3>Cache Statistics</h3>
          <ul>
            <li>Hits: {cacheStats.hits}</li>
            <li>Misses: {cacheStats.misses}</li>
            <li>Size: {cacheStats.size} items</li>
          </ul>
        </div>
      )}
      
      {/* Some CSS to make it look nice */}
      <style jsx>{`
        .data-caching-example {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .status-indicator {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .online {
          background-color: #d4edda;
          color: #155724;
        }
        
        .offline {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .pending-operations {
          background-color: #fff3cd;
          color: #856404;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .form-container {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        input, select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 16px;
        }
        
        button {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 15px;
          cursor: pointer;
          font-size: 16px;
        }
        
        button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .actions button {
          margin-left: 10px;
        }
        
        .user-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .user-table th, .user-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }
        
        .user-table th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        .cache-stats {
          margin-top: 30px;
          background-color: #e9ecef;
          padding: 15px;
          border-radius: 8px;
        }
        
        .cache-stats ul {
          list-style-type: none;
          padding: 0;
        }
        
        .cache-stats li {
          margin-bottom: 5px;
        }
        
        .loading, .no-data {
          padding: 20px;
          text-align: center;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}; 